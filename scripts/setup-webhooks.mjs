#!/usr/bin/env node
/**
 * Скрипт регистрации вебхуков МойСклад для Real-Time синхронизации товаров.
 *
 * Использование:
 *   node scripts/setup-webhooks.mjs
 *   node scripts/setup-webhooks.mjs --url=https://orangemsk.ru
 *   node scripts/setup-webhooks.mjs --delete-all
 */

import fs from "node:fs"
import path from "node:path"

function loadEnv() {
  const envFiles = [
    ".env.production.local",
    ".env.local",
    ".env.production",
    ".env",
  ]
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
const deleteAll = args.includes("--delete-all")
const urlArg = args.find((a) => a.startsWith("--url="))?.split("=")[1]
const tokenArg = args.find((a) => a.startsWith("--token="))?.split("=")[1]

const TOKEN = tokenArg || process.env.MOYSKLAD_API_TOKEN
const SITE_URL = urlArg || process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
const WEBHOOK_URL = `${SITE_URL.replace(/\/$/, "")}/api/moysklad/webhook`

const API = "https://api.moysklad.ru/api/remap/1.2"

console.log("==================================================")
console.log(" МойСклад ──> Настройка Real-Time Webhooks")
console.log("==================================================")

if (!TOKEN) {
  console.error("❌ ОШИБКА: Не задан MOYSKLAD_API_TOKEN в .env.local")
  process.exit(1)
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
      ...(options.headers || {}),
    },
  })

  if (res.status === 204) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[${res.status}]: ${text}`)
  }
  return res.json()
}

async function main() {
  console.log(`Целевой URL вебхука: ${WEBHOOK_URL}\n`)

  // 1. Получаем текущие вебхуки
  const existing = await request("/entity/webhook")
  const currentWebhooks = existing.rows || []
  console.log(`Текущих вебхуков в МойСклад: ${currentWebhooks.length}`)

  if (deleteAll) {
    console.log(`\nУдаление всех существующих вебхуков...`)
    for (const wh of currentWebhooks) {
      await request(`/entity/webhook/${wh.id}`, { method: "DELETE" })
      console.log(`  ✓ Удален: ${wh.entityType} [${wh.action}] -> ${wh.url}`)
    }
    console.log("Готово.")
    return
  }

  // Необходимые вебхуки для товаров
  const requiredActions = ["CREATE", "UPDATE", "DELETE"]

  for (const action of requiredActions) {
    const found = currentWebhooks.find(
      (w) => w.entityType === "product" && w.action === action && w.url === WEBHOOK_URL
    )

    if (found) {
      console.log(`  ✓ Уже активен: product [${action}] -> ${WEBHOOK_URL}`)
    } else {
      try {
        await request("/entity/webhook", {
          method: "POST",
          body: JSON.stringify({
            url: WEBHOOK_URL,
            action,
            entityType: "product",
            enabled: true,
          }),
        })
        console.log(`  ✨ Зарегистрирован: product [${action}] -> ${WEBHOOK_URL}`)
      } catch (err) {
        console.error(`  ❌ Ошибка создания вебхука ${action}:`, err.message)
      }
    }
  }

  console.log("\n==================================================")
  console.log(" Настройка завершена!")
  console.log(" Теперь при любом создании, изменении или удалении")
  console.log(" товара в Моем Складе изменения мгновенно попадут")
  console.log(" в базу и отобразятся в админке сайта.")
  console.log("==================================================\n")
}

main().catch((err) => {
  console.error("Критическая ошибка:", err)
  process.exit(1)
})
