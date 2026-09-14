#!/usr/bin/env node
/**
 * Скрипт массового импорта товаров из МойСклад в Supabase.
 *
 * Использование:
 *   node scripts/sync-products-from-moysklad.mjs
 *   node scripts/sync-products-from-moysklad.mjs --clean
 *   node scripts/sync-products-from-moysklad.mjs --key=<SERVICE_ROLE_KEY> --url=<SUPABASE_URL>
 */

import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

function loadEnv() {
  const envFiles = [".env.local", ".env"]
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const [key, ...vals] = trimmed.split("=")
        const val = vals.join("=").trim().replace(/^["']|["']$/g, "")
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val
        }
      }
    }
  }
}

loadEnv()

const args = process.argv.slice(2)
const isClean = args.includes("--clean")
const tokenArg = args.find((a) => a.startsWith("--token="))?.split("=")[1]
const keyArg = args.find((a) => a.startsWith("--key="))?.split("=")[1]
const urlArg = args.find((a) => a.startsWith("--url="))?.split("=")[1]
const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1]

const TOKEN = tokenArg || process.env.MOYSKLAD_API_TOKEN
const SUPABASE_URL = urlArg || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = keyArg || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const MOYSKLAD_API = "https://api.moysklad.ru/api/remap/1.2"

console.log("==================================================")
console.log(" МойСклад ──> Импорт товаров в базу Supabase")
console.log("==================================================")

if (!TOKEN) {
  console.error("❌ Не задан токен Моего Склада (MOYSKLAD_API_TOKEN)")
  process.exit(1)
}

if (!SUPABASE_URL) {
  console.error("❌ Не задан NEXT_PUBLIC_SUPABASE_URL")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY || "")

async function msRequest(endpoint) {
  const res = await fetch(`${MOYSKLAD_API}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
    },
  })

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") || 2)
    console.log(`[429 Limit] Ожидание ${retryAfter} сек...`)
    await new Promise((r) => setTimeout(r, retryAfter * 1000))
    return msRequest(endpoint)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[${res.status}]: ${text}`)
  }

  return res.json()
}

// Транслитерация для слага
function slugify(text) {
  const map = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  }

  const translit = text
    .toLowerCase()
    .split("")
    .map((char) => map[char] || char)
    .join("")

  return translit
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

function detectBrand(product) {
  if (product.pathName) {
    const firstPart = product.pathName.split("/")[0]?.trim()
    if (firstPart) return firstPart
  }
  const name = product.name.toLowerCase()
  if (name.includes("apple") || name.includes("macbook") || name.includes("iphone") || name.includes("ipad")) return "Apple"
  if (name.includes("samsung") || name.includes("galaxy")) return "Samsung"
  if (name.includes("xiaomi") || name.includes("redmi") || name.includes("poco")) return "Xiaomi"
  if (name.includes("dyson")) return "Dyson"
  if (name.includes("sony") || name.includes("playstation")) return "Sony"
  if (name.includes("asus")) return "ASUS"
  return "Apple"
}

function detectCategory(product) {
  const path = (product.pathName || "").toLowerCase()
  const name = product.name.toLowerCase()

  if (path.includes("iphone") || name.includes("iphone") || name.includes("смартфон")) return "smartphones"
  if (
    path.includes("macbook") ||
    path.includes("mac mini") ||
    path.includes("mac studio") ||
    path.includes("imac") ||
    path.includes("ноутбук") ||
    name.includes("macbook") ||
    name.includes("ноутбук")
  ) {
    return "laptops"
  }
  if (path.includes("монитор") || path.includes("monitor") || name.includes("studio display") || name.includes("pro display")) {
    return "monitors"
  }
  if (path.includes("airpods") || path.includes("audio") || path.includes("наушники") || path.includes("homepod") || name.includes("airpods")) {
    return "audio"
  }
  if (path.includes("watch") || path.includes("ipad") || path.includes("часы") || name.includes("apple watch") || name.includes("ipad") || name.includes("vision pro")) {
    return "wearables"
  }
  if (path.includes("dyson") || name.includes("dyson") || path.includes("пылесос") || path.includes("фен")) return "home"

  return "smartphones"
}

async function main() {
  if (isClean) {
    console.log("\n1. Очистка старых товаров в базе Supabase...")
    const { error: delError } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000")
    if (delError) {
      console.warn("  ⚠️ Ошибка при очистке (возможно, нужен SERVICE_ROLE_KEY):", delError.message)
    } else {
      console.log("  ✓ Существующие товары успешно удалены.")
    }
  }

  console.log("\n2. Загрузка товаров из API МойСклад...")
  const allProducts = []
  const PAGE_SIZE = 1000
  let offset = 0
  let total = 0

  while (true) {
    process.stdout.write(`  Загрузка пакета offset=${offset}... `)
    const data = await msRequest(`/entity/product?limit=${PAGE_SIZE}&offset=${offset}`)
    const rows = data.rows || []
    total = data.meta?.size || 0

    if (rows.length === 0) {
      console.log("Завершено.")
      break
    }

    allProducts.push(...rows)
    console.log(`✓ Загружено ${allProducts.length} из ${total}`)

    if (limitArg && allProducts.length >= Number(limitArg)) {
      console.log(`  [Ограничение --limit=${limitArg} достигнуто]`)
      break
    }

    if (allProducts.length >= total) break
    offset += PAGE_SIZE
  }

  console.log(`\nВсего выгружено из МойСклад: ${allProducts.length} товаров`)

  // 3. Подготовка и маппинг
  console.log("\n3. Преобразование структуры для базы данных сайта...")
  const slugSet = new Set()
  const dbRows = []
  const categoryStats = {}

  for (const p of allProducts) {
    const brand = detectBrand(p)
    const category = detectCategory(p)
    categoryStats[category] = (categoryStats[category] || 0) + 1

    const salePriceKopecks = p.salePrices?.[0]?.value || 0
    const price = Math.round(salePriceKopecks / 100)

    let baseSlug = slugify(p.name)
    if (p.code) baseSlug += `-${slugify(p.code)}`
    let slug = baseSlug
    let counter = 2
    while (slugSet.has(slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }
    slugSet.add(slug)

    const isArchived = Boolean(p.archived)

    dbRows.push({
      moysklad_id: p.id,
      code: p.code || null,
      sku: p.article || null,
      path_name: p.pathName || null,
      name: p.name,
      slug,
      brand,
      category,
      price,
      in_stock: !isArchived,
      is_visible: !isArchived && price > 0,
      description: p.description || "",
      specs: [],
      colors: [],
      images: [],
    })
  }

  console.log("  Распределение по категориям:")
  for (const [cat, count] of Object.entries(categoryStats)) {
    console.log(`    - ${cat}: ${count} шт.`)
  }

  // 4. Пакетная вставка в Supabase
  console.log("\n4. Сохранение товаров в Supabase...")
  const BATCH_SIZE = 250
  let inserted = 0
  let errors = 0

  for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
    const batch = dbRows.slice(i, i + BATCH_SIZE)
    process.stdout.write(`  Вставка ${i + 1}–${Math.min(i + BATCH_SIZE, dbRows.length)} из ${dbRows.length}... `)

    const { error } = await supabase.from("products").upsert(batch, {
      onConflict: "moysklad_id",
    })

    if (error) {
      console.log(`❌ Ошибка: ${error.message}`)
      errors += batch.length
    } else {
      inserted += batch.length
      console.log(`✓`)
    }
  }

  console.log("\n==================================================")
  console.log(" Результаты импорта:")
  console.log(` Получено из МойСклад:  ${allProducts.length}`)
  console.log(` Сохранено в Supabase:  ${inserted}`)
  console.log(` Ошибок:                ${errors}`)
  console.log("==================================================\n")
}

main().catch((err) => {
  console.error("\nКритическая ошибка:", err)
  process.exit(1)
})
