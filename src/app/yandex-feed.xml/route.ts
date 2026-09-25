import { NextResponse } from "next/server"
import { getProducts } from "@/lib/products/queries"
import { getCategoriesWithGroups } from "@/lib/admin/queries"

export const revalidate = 3600

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function cleanCdata(str: string): string {
  return str.replace(/]]>/g, "]]&gt;")
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
  const [products, { categories }] = await Promise.all([
    getProducts(),
    getCategoriesWithGroups(),
  ])

  const now = new Date()
  const dateStr = formatYmlDate(now)

  // Карта категорий: slug -> числовой ID для YML
  const categoryMap = new Map<string, number>()
  categories.forEach((cat, idx) => {
    categoryMap.set(cat.slug.toLowerCase().trim(), idx + 1)
  })

  // Если у каких-то товаров категории нет в списке админки, добавим на лету
  let nextCatId = categories.length + 1
  for (const p of products) {
    const slug = (p.category || "other").toLowerCase().trim()
    if (!categoryMap.has(slug)) {
      categoryMap.set(slug, nextCatId++)
    }
  }

  const categoryEntries: string[] = []
  for (const [slug, id] of categoryMap.entries()) {
    const found = categories.find((c) => c.slug.toLowerCase().trim() === slug)
    const name = found ? found.name : slug
    categoryEntries.push(`      <category id="${id}">${escapeXml(name)}</category>`)
  }

  const offers = products.map((product) => {
    const productUrl = `${baseUrl}/product/${product.slug}`
    const catSlug = (product.category || "other").toLowerCase().trim()
    const catId = categoryMap.get(catSlug) || 1

    const pictures = (product.images || [])
      .slice(0, 10)
      .map((img) => {
        const full = img.startsWith("/") ? `${baseUrl}${img}` : img
        return `        <picture>${escapeXml(full)}</picture>`
      })
      .join("\n")

    const params = (product.specs || [])
      .filter((s) => s.label && s.value)
      .map((s) => `        <param name="${escapeXml(s.label)}">${escapeXml(s.value)}</param>`)
      .join("\n")

    const desc = cleanCdata(
      product.description ||
        `Купить ${product.name} с гарантией 1 год в интернет-магазине Orange MSK. Доставка по Москве.`
    )

    return `      <offer id="${escapeXml(product.id)}" available="${product.inStock}">
        <url>${productUrl}</url>
        <price>${product.price}</price>
${product.oldPrice ? `        <oldprice>${product.oldPrice}</oldprice>\n` : ""}        <currencyId>RUR</currencyId>
        <categoryId>${catId}</categoryId>
${pictures ? `${pictures}\n` : ""}        <name>${escapeXml(product.name)}</name>
        <vendor>${escapeXml(product.brand)}</vendor>
        <description><![CDATA[${desc}]]></description>
${params ? `${params}\n` : ""}      </offer>`
  })

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
}
