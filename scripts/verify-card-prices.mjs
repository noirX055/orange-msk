#!/usr/bin/env node
/**
 * Скрипт проверки состояния колонки card_price в Supabase.
 *
 * Запуск:
 *   node scripts/verify-card-prices.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

function loadEnv() {
  const envFiles = [".env.production.local", ".env.local", ".env.production", ".env"]
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  console.error("❌ Не заданы URL или ключ Supabase в .env файлах")
  process.exit(1)
}

const supabase = createClient(url, key)

async function verify() {
  console.log("==================================================")
  console.log(" Проверка card_price в таблице products")
  console.log("==================================================")

  const { data: sample, error } = await supabase
    .from("products")
    .select("id, name, price, card_price")
    .gt("price", 0)
    .limit(5)

  if (error) {
    if (error.code === "42703") {
      console.log("⚠️  Колонка card_price ещё не создана в базе данных.")
      console.log("👉 Выполните файл supabase/migration-add-card-price.sql в Supabase SQL Editor (db.orangemsk.ru).")
      console.log("   Сайт в это время автоматически считает +15% на лету.")
    } else {
      console.error("❌ Ошибка при запросе:", error.message)
    }
    return
  }

  console.log("✓ Колонка card_price успешно существует в базе данных!")
  console.log("\nПримеры товаров с ценой > 0:")
  for (const item of sample) {
    console.log(` • ID ${item.id}: "${item.name}"`)
    console.log(`   Наличные: ${item.price} ₽ | Картой: ${item.card_price ?? "не задано"} ₽`)
  }

  const { count: withCardPrice } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .not("card_price", "is", null)

  const { count: withPrice } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .gt("price", 0)

  console.log(`\nСтатистика:`)
  console.log(` • Товаров с базовой ценой > 0: ${withPrice ?? 0}`)
  console.log(` • Товаров с заполненным card_price: ${withCardPrice ?? 0}`)
}

verify().catch((err) => {
  console.error("Ошибка проверки:", err)
})
