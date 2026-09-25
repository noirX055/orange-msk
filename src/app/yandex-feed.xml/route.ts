import { NextResponse } from "next/server"
import { createPublicClient } from "@/lib/supabase/public"
import { categories as fallbackCategories } from "@/lib/products"

export const dynamic = "force-dynamic"
export const revalidate = 0

function escapeXml(val: unknown): string {
  if (val === null || val === undefined) return ""
  return String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function cleanCdata(val: unknown): string {
  if (val === null || val === undefined) return ""
  return String(val).replace(/]]>/g, "]]&gt;")
}

function formatYmlDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  const YYYY = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const DD = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${YYYY}-${MM}-${DD} ${HH}:${mm}`
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  try {
    const supabase = createPublicClient()

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, slug, name, brand, category, price, old_price, in_stock, is_visible, specs, images, description")
        .eq("is_visible", true)
        .order("sort", { ascending: true }),
      supabase
        .from("categories")
        .select("id, slug, name")
        .eq("is_visible", true)
        .order("name"),
    ])

    const products = productsRes.data || []
    const dbCategories = categoriesRes.data || []
    const knownCategories = dbCategories.length > 0 ? dbCategories : fallbackCategories

    const now = new Date()
    const dateStr = formatYmlDate(now)

    // Карта категорий: slug -> { id, name } для YML
    const categoryMap = new Map<string, { id: number; name: string }>()
    let currentId = 1

    for (const cat of knownCategories) {
      if (cat && cat.slug) {
        const slugKey = String(cat.slug).toLowerCase().trim()
        if (!categoryMap.has(slugKey)) {
          categoryMap.set(slugKey, {
            id: currentId++,
            name: cat.name || cat.slug,
          })
        }
      }
    }

    // Добавляем категории товаров, которых нет в списке
    for (const p of products) {
      if (p && p.category) {
        const slugKey = String(p.category).toLowerCase().trim()
        if (!categoryMap.has(slugKey)) {
          categoryMap.set(slugKey, {
            id: currentId++,
            name: p.category,
          })
        }
      }
    }

    const categoryEntries: string[] = []
    for (const item of categoryMap.values()) {
      categoryEntries.push(`      <category id="${item.id}">${escapeXml(item.name)}</category>`)
    }

    const offers: string[] = []

    for (const product of products) {
      if (!product || !product.id || !product.slug || !product.price) continue

      const productUrl = `${baseUrl}/product/${escapeXml(product.slug)}`
      const catSlug = String(product.category || "other").toLowerCase().trim()
      const catInfo = categoryMap.get(catSlug)
      const catId = catInfo ? catInfo.id : 1

      const rawImages = Array.isArray(product.images) ? product.images : []
      const pictures = rawImages
        .filter((img): img is string => typeof img === "string" && Boolean(img.trim()))
        .slice(0, 10)
        .map((img) => {
          const trimmed = img.trim()
          const full = trimmed.startsWith("/") ? `${baseUrl}${trimmed}` : trimmed
          return `        <picture>${escapeXml(full)}</picture>`
        })
        .join("\n")

      const rawSpecs = Array.isArray(product.specs) ? product.specs : []
      const params = rawSpecs
        .filter((s: any) => s && s.label && s.value !== undefined && s.value !== null)
        .map((s: any) => `        <param name="${escapeXml(s.label)}">${escapeXml(s.value)}</param>`)
        .join("\n")

      const desc = cleanCdata(
        product.description ||
          `Купить ${product.name} с официальной гарантией в интернет-магазине Orange MSK. Доставка по Москве.`
      )

      offers.push(`      <offer id="${escapeXml(product.id)}" available="${product.in_stock ? "true" : "false"}">
        <url>${productUrl}</url>
        <price>${Number(product.price)}</price>
${product.old_price ? `        <oldprice>${Number(product.old_price)}</oldprice>\n` : ""}        <currencyId>RUR</currencyId>
        <categoryId>${catId}</categoryId>
${pictures ? `${pictures}\n` : ""}        <name>${escapeXml(product.name)}</name>
        <vendor>${escapeXml(product.brand || "Orange MSK")}</vendor>
        <description><![CDATA[${desc}]]></description>
${params ? `${params}\n` : ""}      </offer>`)
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${dateStr}">
  <shop>
    <name>Orange MSK</name>
    <company>Orange MSK</company>
    <url>${baseUrl}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
${categoryEntries.join("\n")}
    </categories>
    <offers>
${offers.join("\n")}
    </offers>
  </shop>
</yml_catalog>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    })
  } catch (err) {
    console.error("Error generating Yandex YML feed:", err)
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${formatYmlDate(new Date())}">
  <shop>
    <name>Orange MSK</name>
    <company>Orange MSK</company>
    <url>${baseUrl}</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Электроника</category>
    </categories>
    <offers></offers>
  </shop>
</yml_catalog>`

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    })
  }
}
