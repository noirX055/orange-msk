import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { createClient } from "@supabase/supabase-js"

const backupPath = path.resolve("scripts/backups/products-images-backup-all.json")
if (!fs.existsSync(backupPath)) {
  console.error("Файл бэкапа не найден! Сначала запустите backup-all-shrunk-images.mjs")
  process.exit(1)
}

const backupProducts = JSON.parse(fs.readFileSync(backupPath, "utf-8"))
console.log(`Загружен список товаров для обработки (${backupProducts.length} шт.).`)

const envContent = fs.readFileSync(".env.local", "utf-8")
const env = {}
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "")
})

const SUPABASE_URL = "https://db.orangemsk.ru"
const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// 1. Собираем все уникальные URL картинок из целевых товаров
const uniqueUrls = new Set()
for (const p of backupProducts) {
  for (const img of p.images || []) {
    if (img && typeof img === "string") {
      uniqueUrls.add(img)
    }
  }
}

console.log(`Найдено уникальных URL изображений: ${uniqueUrls.size}`)

// Карта: originalUrl -> normalizedUrl
const urlMap = new Map()
let skippedCount = 0
let processedCount = 0
let errorCount = 0

console.log("\n--- Начало обработки изображений ---")

let idx = 0
for (const originalUrl of uniqueUrls) {
  idx++
  console.log(`[${idx}/${uniqueUrls.size}] Обработка: ${originalUrl}`)

  try {
    const res = await fetch(originalUrl)
    if (!res.ok) {
      console.warn(`  [ПРЕДУПРЕЖДЕНИЕ] Не удалось скачать (${res.status}): ${originalUrl}`)
      errorCount++
      urlMap.set(originalUrl, originalUrl)
      continue
    }

    const buf = Buffer.from(await res.arrayBuffer())
    const meta = await sharp(buf).metadata()
    const width = meta.width || 0
    const height = meta.height || 0
    const ratio = height / (width || 1)

    // Проверяем, если изображение уже идеально квадратное (например, 1300x1300 или 666x666)
    if (width === height && width >= 600) {
      console.log(`  -> Уже квадратное (${width}x${height}), пропускаем.`)
      skippedCount++
      urlMap.set(originalUrl, originalUrl)
      continue
    }

    // Определяем полезную область (bounding box контента на белом фоне)
    const { data: raw, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
    let minX = info.width, maxX = 0, minY = info.height, maxY = 0

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const i = (y * info.width + x) * info.channels
        const r = raw[i], g = raw[i + 1], b = raw[i + 2]
        if (r < 242 || g < 242 || b < 242) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    // Безопасный отступ 15px вокруг контента
    const pad = 15
    minX = Math.max(0, minX - pad)
    minY = Math.max(0, minY - pad)
    maxX = Math.min(info.width - 1, maxX + pad)
    maxY = Math.min(info.height - 1, maxY + pad)

    const cropW = Math.max(1, maxX - minX + 1)
    const cropH = Math.max(1, maxY - minY + 1)

    // Извлекаем полезный контент
    const extracted = await sharp(buf)
      .extract({ left: minX, top: minY, width: cropW, height: cropH })
      .toBuffer()

    // Вписываем в квадрат 700x700 внутри холста 800x800
    const resized = await sharp(extracted)
      .resize({ width: 700, height: 700, fit: "inside" })
      .toBuffer({ resolveWithObject: true })

    const topPad = Math.floor((800 - resized.info.height) / 2)
    const botPad = Math.ceil((800 - resized.info.height) / 2)
    const leftPad = Math.floor((800 - resized.info.width) / 2)
    const rightPad = Math.ceil((800 - resized.info.width) / 2)

    // Создаём итоговый холст 800x800 на чистом белом фоне
    const squareBuf = await sharp(resized.data)
      .extend({
        top: topPad,
        bottom: botPad,
        left: leftPad,
        right: rightPad,
        background: { r: 255, g: 255, b: 255 }
      })
      .jpeg({ quality: 92 })
      .toBuffer()

    // Определяем путь в Storage
    let storagePath
    const prefixMatch = originalUrl.match(/\/storage\/v1\/object\/public\/products\/(.+)$/)
    if (prefixMatch && prefixMatch[1]) {
      const originalPath = prefixMatch[1]
      // Заменяем расширение на .jpg если нужно
      const cleanPath = originalPath.replace(/\.(png|jpeg|webp)$/i, ".jpg")
      storagePath = `normalized-square/${cleanPath}`
    } else {
      const cleanUrlName = originalUrl.split("/").pop().replace(/\.(png|jpeg|webp)$/i, ".jpg")
      storagePath = `normalized-square/misc-${Date.now()}-${cleanUrlName}`
    }

    // Загрузка в Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from("products")
      .upload(storagePath, squareBuf, {
        contentType: "image/jpeg",
        upsert: true,
      })

    if (uploadErr) {
      console.error(`  [ОШИБКА ЗАГРУЗКИ В STORAGE]:`, uploadErr)
      errorCount++
      urlMap.set(originalUrl, originalUrl)
      continue
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`
    urlMap.set(originalUrl, publicUrl)
    processedCount++
    console.log(`  -> Успешно нормализовано: ${publicUrl}`)
  } catch (err) {
    console.error(`  [ИСКЛЮЧЕНИЕ] при обработке ${originalUrl}:`, err.message)
    errorCount++
    urlMap.set(originalUrl, originalUrl)
  }
}

console.log(`\nОбработка изображений завершена:`)
console.log(`- Нормализовано и загружено: ${processedCount}`)
console.log(`- Пропущено (уже квадратные): ${skippedCount}`)
console.log(`- Ошибок: ${errorCount}`)

// 2. Обновление базы данных Supabase
console.log("\n--- Обновление товаров в таблице products ---")
let updatedProductsCount = 0
let failedProductsCount = 0

for (const p of backupProducts) {
  const originalImages = p.images || []
  const newImages = originalImages.map((u) => urlMap.get(u) || u)

  // Проверяем, изменился ли массив картинок
  const hasChanges = JSON.stringify(originalImages) !== JSON.stringify(newImages)
  if (!hasChanges) {
    continue
  }

  const { error: updateErr } = await supabase
    .from("products")
    .update({ images: newImages })
    .eq("id", p.id)

  if (updateErr) {
    console.error(`Ошибка обновления товара #${p.id} (${p.name}):`, updateErr.message)
    failedProductsCount++
  } else {
    updatedProductsCount++
  }
}

console.log(`\n=== ИТОГ ОБНОВЛЕНИЯ БАЗЫ ДАННЫХ ===`)
console.log(`- Успешно обновлено товаров: ${updatedProductsCount}`)
console.log(`- Без изменений: ${backupProducts.length - updatedProductsCount - failedProductsCount}`)
console.log(`- Ошибок обновления: ${failedProductsCount}`)
