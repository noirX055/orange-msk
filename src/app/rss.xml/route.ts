import { NextResponse } from "next/server"
import { createPublicClient } from "@/lib/supabase/public"

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

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  try {
    const supabase = createPublicClient()
    const { data: products } = await supabase
      .from("products")
      .select("id, slug, name, brand, category, price, in_stock, is_visible, images, description")
      .eq("is_visible", true)
      .order("sort", { ascending: true })

    const list = products || []
    const now = new Date().toUTCString()

    const items = list.map((product) => {
      const productUrl = `${baseUrl}/product/${escapeXml(product.slug)}`
      const rawDesc =
        product.description ||
        `Купить ${product.name} в интернет-магазине Orange MSK с гарантией 1 год. Быстрая доставка по Москве.`
      const desc = cleanCdata(rawDesc)

      let imageTag = ""
      const rawImages = Array.isArray(product.images) ? product.images : []
      const firstImg = rawImages.find((img) => typeof img === "string" && Boolean(img.trim()))
      if (firstImg) {
        const trimmed = firstImg.trim()
        const fullImg = trimmed.startsWith("/") ? `${baseUrl}${trimmed}` : trimmed
        imageTag = `\n      <enclosure url="${escapeXml(fullImg)}" type="image/jpeg" />`
      }

      const priceFormatted = new Intl.NumberFormat("ru-RU").format(product.price)

      return `    <item turbo="true">
      <title><![CDATA[${cleanCdata(product.name)}]]></title>
      <link>${productUrl}</link>
      <pdalink>${productUrl}</pdalink>
      <guid isPermaLink="true">${productUrl}</guid>
      <pubDate>${now}</pubDate>
      <author>Orange MSK</author>
      <category><![CDATA[${cleanCdata(product.category || "Электроника")}]]></category>${imageTag}
      <description><![CDATA[${desc}]]></description>
      <yandex:full-text><![CDATA[
        <p>${desc}</p>
        <p><strong>Цена:</strong> ${priceFormatted} ₽</p>
        <p><strong>В наличии:</strong> ${product.in_stock ? "Да" : "Под заказ"}</p>
      ]]></yandex:full-text>
      <turbo:content><![CDATA[
        <header>
          <h1>${cleanCdata(product.name)}</h1>
        </header>
        <p>${desc}</p>
        <p><strong>Цена:</strong> ${priceFormatted} ₽</p>
      ]]></turbo:content>
    </item>`
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:yandex="http://news.yandex.ru"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:turbo="http://turbo.yandex.ru">
  <channel>
    <title>Orange MSK — магазин электроники в Москве</title>
    <link>${baseUrl}</link>
    <description>Оригинальная электроника Apple, Samsung, Dyson с официальной гарантией в Москве.</description>
    <language>ru</language>
    <lastBuildDate>${now}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    })
  } catch (err) {
    console.error("Error generating RSS feed:", err)
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Orange MSK</title>
    <link>${baseUrl}</link>
    <description>Магазин электроники Orange MSK</description>
  </channel>
</rss>`
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    })
  }
}
