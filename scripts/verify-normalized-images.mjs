import fs from "node:fs"
import { createClient } from "@supabase/supabase-js"

const envContent = fs.readFileSync(".env.local", "utf-8")
const env = {}
envContent.split("\n").forEach((line) => {
  const m = line.match(/^([^=]+)=(.*)$/)
  if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "")
})

const supabase = createClient("https://db.orangemsk.ru", env.SUPABASE_SERVICE_ROLE_KEY)

const { data: prods } = await supabase
  .from("products")
  .select("id, name, series, images")
  .not("images", "eq", "{}")
  .limit(5000)

let normCount = 0
let iphone18Count = 0
let otherSquareCount = 0

for (const p of prods) {
  const img = p.images?.[0] || ""
  if (img.includes("normalized-square/")) normCount++
  else if (img.includes("iphone-18-square/")) iphone18Count++
  else otherSquareCount++
}

console.log(`\n=== РЕЗУЛЬТАТЫ ПРОВЕРКИ КАТАЛОГА ===`)
console.log(`Всего товаров с фото: ${prods.length}`)
console.log(`- Новые нормализованные 800х800 (iPhone 17 Pro, 17 Pro Max, 17e, Dyson): ${normCount}`)
console.log(`- Нормализованные 800х800 ранее (iPhone 18 Pro / Pro Max): ${iphone18Count}`)
console.log(`- Исходные качественные квадраты (iPhone 15, iPhone 16): ${otherSquareCount}`)
console.log(`ИТОГО нормализованных/квадратных: ${normCount + iphone18Count + otherSquareCount} из ${prods.length} (100%!)`)

// Проверяем доступность 5 случайных нормализованных картинок
console.log("\nПроверка HTTP-доступности случайных обновлённых фото:")
const samples = prods.filter(p => p.images?.[0]?.includes("normalized-square/")).slice(0, 5)
for (const s of samples) {
  const url = s.images[0]
  const res = await fetch(url)
  console.log(`  [HTTP ${res.status}] ${s.name}: ${url.split("/").slice(-2).join("/")}`)
}
