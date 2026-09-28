import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"
import { createClient } from "@supabase/supabase-js"

const envContent = fs.readFileSync(".env.local", "utf-8")
const env = {}
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "")
})

const SUPABASE_URL = "https://db.orangemsk.ru"
const supabase = createClient(SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

console.log("1. Получение товаров iPhone 18 из Supabase...")
const { data: products, error: fetchErr } = await supabase
  .from("products")
  .select("id, name, slug, images, series")
  .ilike("name", "%iPhone 18%")

if (fetchErr || !products) {
  console.error("Ошибка загрузки товаров:", fetchErr)
  process.exit(1)
}

console.log(`Найдено ${products.length} товаров iPhone 18.`)

// 2. Создание резервной копии
const backupDir = path.resolve("scripts/backups")
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
const backupPath = path.join(backupDir, "iphone18-images-backup.json")
fs.writeFileSync(backupPath, JSON.stringify(products, null, 2), "utf-8")
console.log(`Резервная копия сохранена в: ${backupPath}`)

// 3. Обработка 4 базовых фото цветов
const colorSources = [
  {
    color: "burgundy",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/iphone-18-pro-512gb-1sim-esim-burgundy-60136/0-24999.jpg",
  },
  {
    color: "black",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/iphone-18-pro-1tb-1sim-esim-black-60137/0-23158.jpg",
  },
  {
    color: "silver",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/iphone-18-pro-256gb-esim-silver-60118/0-25453.jpg",
  },
  {
    color: "blue",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/iphone-18-pro-512gb-1sim-esim-blue-60135/0-32051.jpg",
  },
]

const colorUrls = {}

console.log("\n2. Обработка изображений через sharp и загрузка в Supabase Storage...")
for (const item of colorSources) {
  console.log(`- Обработка цвета [${item.color}]...`)
  const res = await fetch(item.url)
  if (!res.ok) {
    throw new Error(`Не удалось скачать ${item.url}: ${res.statusText}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })

  // Поиск полезного содержимого (телефон + логотип OM)
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels
      const r = data[idx], g = data[idx + 1], b = data[idx + 2]
      if (r < 242 || g < 242 || b < 242) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // Безопасный отступ 10px вокруг границ
  minX = Math.max(0, minX - 10)
  minY = Math.max(0, minY - 10)
  maxX = Math.min(info.width - 1, maxX + 10)
  maxY = Math.min(info.height - 1, maxY + 10)

  const cropWidth = maxX - minX + 1
  const cropHeight = maxY - minY + 1

  const extracted = await sharp(buf)
    .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
    .toBuffer()

  // Вписываем в 700x700 внутри квадратного холста 800x800
  const resized = await sharp(extracted)
    .resize({ width: 700, height: 700, fit: "inside" })
    .toBuffer({ resolveWithObject: true })

  const squareBuf = await sharp(resized.data)
    .extend({
      top: Math.floor((800 - resized.info.height) / 2),
      bottom: Math.ceil((800 - resized.info.height) / 2),
      left: Math.floor((800 - resized.info.width) / 2),
      right: Math.ceil((800 - resized.info.width) / 2),
      background: { r: 255, g: 255, b: 255 },
    })
    .jpeg({ quality: 92 })
    .toBuffer()

  const storagePath = `iphone-18-square/square-${item.color}.jpg`
  const { error: uploadErr } = await supabase.storage
    .from("products")
    .upload(storagePath, squareBuf, {
      contentType: "image/jpeg",
      upsert: true,
    })

  if (uploadErr) {
    console.error(`Ошибка загрузки в storage для ${item.color}:`, uploadErr)
    throw uploadErr
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/products/${storagePath}`
  colorUrls[item.color] = publicUrl
  console.log(`  Загружено: ${publicUrl}`)
}

console.log("\n3. Обновление товаров в таблице products...")
let updatedCount = 0
const stats = { burgundy: 0, black: 0, silver: 0, blue: 0, unknown: 0 }

for (const product of products) {
  let matchedColor = null
  const lowerName = product.name.toLowerCase()

  if (lowerName.includes("burgundy")) matchedColor = "burgundy"
  else if (lowerName.includes("black")) matchedColor = "black"
  else if (lowerName.includes("silver")) matchedColor = "silver"
  else if (lowerName.includes("blue")) matchedColor = "blue"

  if (!matchedColor) {
    console.warn(`[ВНИМАНИЕ] Не удалось определить цвет для: "${product.name}" (#${product.id})`)
    stats.unknown++
    continue
  }

  const targetUrl = colorUrls[matchedColor]
  const { error: updErr } = await supabase
    .from("products")
    .update({ images: [targetUrl] })
    .eq("id", product.id)

  if (updErr) {
    console.error(`Ошибка обновления товара #${product.id}:`, updErr.message)
  } else {
    updatedCount++
    stats[matchedColor]++
  }
}

console.log("\n=== РЕЗУЛЬТАТ ОБНОВЛЕНИЯ ===")
console.log(`Всего обновлено товаров: ${updatedCount} из ${products.length}`)
console.log("Распределение по цветам:", stats)
console.log("Бэкап для отката сохранён в:", backupPath)
