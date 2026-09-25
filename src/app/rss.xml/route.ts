import { NextResponse } from "next/server"
import { getProducts } from "@/lib/products/queries"

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

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
  const products = await getProducts()
  const now = new Date().toUTCString()

  const items = products.map((product) => {
    const productUrl = `${baseUrl}/product/${product.slug}`
    const rawDesc =
      product.description ||
      `Купить ${product.name} в интернет-магазине Orange MSK с гарантией 1 год. Быстрая доставка по Москве.`
    const desc = cleanCdata(rawDesc)

    let imageTag = ""
    if (product.images && product.images.length > 0) {
      let imgUrl = product.images[0]
      if (imgUrl.startsWith("/")) {
        imgUrl = `${baseUrl}${imgUrl}`
      }
      imageTag = `\n      <enclosure url="${escapeXml(imgUrl)}" type="image/jpeg" />`
    }

    const priceFormatted = new Intl.NumberFormat("ru-RU").format(product.price)

    return `    <item turbo="true">
      <title><![CDATA[${cleanCdata(product.name)}]]></title>
      <link>${productUrl}</link>
      <pdalink>${productUrl}</pdalink>
      <guid isPermaLink="true">${productUrl}</guid>
      <pubDate>${now}</pubDate>
      <author>Orange MSK</author>
      <category><![CDATA[${cleanCdata(product.category)}]]></category>${imageTag}
      <description><![CDATA[${desc}]]></description>
      <yandex:full-text><![CDATA[
        <p>${desc}</p>
        <p><strong>Цена:</strong> ${priceFormatted} ₽</p>
        <p><strong>В наличии:</strong> ${product.inStock ? "Да" : "Под заказ"}</p>
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
}
