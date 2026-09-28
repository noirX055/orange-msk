import fs from "node:fs"
import sharp from "sharp"
import { createClient } from "@supabase/supabase-js"

const envContent = fs.readFileSync(".env.local", "utf-8")
const env = {}
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "")
})

const supabase = createClient("https://db.orangemsk.ru", env.SUPABASE_SERVICE_ROLE_KEY)

console.log("Загрузка всех товаров с фото из Supabase...")
const { data: products, error } = await supabase
  .from("products")
  .select("id, name, slug, category, series, images")
  .not("images", "eq", "{}")

if (error) {
  console.error("Ошибка загрузки:", error)
  process.exit(1)
}

console.log(`Всего товаров с фото: ${products.length}`)

// Собираем уникальные URL картинок
const urlToProducts = new Map()
for (const p of products) {
  for (const imgUrl of p.images || []) {
    if (!imgUrl || typeof imgUrl !== "string") continue
    if (!urlToProducts.has(imgUrl)) {
      urlToProducts.set(imgUrl, [])
    }
    urlToProducts.get(imgUrl).push(p)
  }
}

console.log(`Уникальных изображений: ${urlToProducts.size}`)

const needsFix = []
const alreadySquare = []
const errors = []

let count = 0
for (const [url, prods] of urlToProducts.entries()) {
  count++
  // Пропускаем уже нормализованные нами square-*.jpg
  if (url.includes("square-")) {
    alreadySquare.push({ url, prodsCount: prods.length })
    continue
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      errors.push({ url, error: `HTTP ${res.status}` })
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    const meta = await sharp(buf).metadata()

    const width = meta.width || 0
    const height = meta.height || 0
    const ratio = height / (width || 1)

    // Быстрый анализ: если высота значительно больше ширины (вытянутый баннер)
    // или если картинка не квадратная
    const isTall = ratio > 1.15
    const isVeryTall = ratio > 1.35

    if (isTall) {
      // Проверяем реальный bounding box контента
      const { data: raw, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
      let minX = info.width, maxX = 0, minY = info.height, maxY = 0
      for (let y = 0; y < info.height; y += 2) { // шаг 2 для скорости
        for (let x = 0; x < info.width; x += 2) {
          const idx = (y * info.width + x) * info.channels
          const r = raw[idx], g = raw[idx + 1], b = raw[idx + 2]
          if (r < 242 || g < 242 || b < 242) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }

      const contentHeight = Math.max(0, maxY - minY)
      const contentWidth = Math.max(0, maxX - minX)
      const contentRatio = contentHeight / (info.height || 1)
      const topPadding = minY
      const bottomPadding = info.height - maxY

      needsFix.push({
        url,
        dimensions: `${width}x${height}`,
        ratio: ratio.toFixed(2),
        contentSize: `${contentWidth}x${contentHeight}`,
        contentRatio: contentRatio.toFixed(2),
        topPadding,
        bottomPadding,
        prodsCount: prods.length,
        sampleProduct: prods[0].name,
        category: prods[0].category,
      })
    } else {
      alreadySquare.push({ url, dimensions: `${width}x${height}`, prodsCount: prods.length })
    }
  } catch (e) {
    errors.push({ url, error: e.message })
  }
}

console.log("\n=== РЕЗУЛЬТАТ АНАЛИЗА ===")
console.log(`Всего проверено изображений: ${urlToProducts.size}`)
console.log(`Уже квадратные / нормальные: ${alreadySquare.length}`)
console.log(`Требуют нормализации (вытянутые / сжатые): ${needsFix.length}`)
console.log(`Ошибок скачивания: ${errors.length}`)

console.log("\nСписок изображений, требующих исправления:")
console.log(JSON.stringify(needsFix, null, 2))

// Сохраняем в файл отчёта
fs.writeFileSync("scripts/backups/images-analysis.json", JSON.stringify({ needsFix, alreadySquare, errors }, null, 2))
