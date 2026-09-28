import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const envContent = fs.readFileSync(".env.local", "utf-8")
const env = {}
envContent.split("\n").forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "")
})

const supabase = createClient("https://db.orangemsk.ru", env.SUPABASE_SERVICE_ROLE_KEY)

console.log("1. Получение всех товаров с изображениями из Supabase...")
const { data: products, error } = await supabase
  .from("products")
  .select("id, name, slug, category, series, images")
  .not("images", "eq", "{}")
  .limit(5000)

if (error || !products) {
  console.error("Ошибка загрузки товаров:", error)
  process.exit(1)
}

// Фильтруем товары, исключая iPhone 18 (они уже нормализованы и имеют свой бэкап)
// А также исключаем чисто квадратные 1300x1300 (iPhone 15/16)
const targetProducts = products.filter(p => {
  const hasSquare18 = p.images?.some(img => img.includes("iphone-18-square"))
  return !hasSquare18
})

console.log(`Найдено ${targetProducts.length} целевых товаров для бэкапа.`)

const backupDir = path.resolve("scripts/backups")
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })

const backupPath = path.join(backupDir, "products-images-backup-all.json")
fs.writeFileSync(backupPath, JSON.stringify(targetProducts, null, 2), "utf-8")

console.log(`Резервная копия успешно сохранена: ${backupPath}`)
console.log(`Товаров в бэкапе: ${targetProducts.length}`)
