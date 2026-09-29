#!/usr/bin/env node
/**
 * Скрипт полного резервного копирования данных базы Supabase.
 * Выгружает все таблицы, пользователей Auth и метаданные в scripts/backups/db-backup-<timestamp>/
 *
 * Запуск:
 *   npm run backup:db
 *   или
 *   node scripts/backup-database.mjs
 */

import fs from "node:fs"
import path from "node:path"

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

const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error("ОШИБКА: Не заданы SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
}

const TABLES = [
  "brands",
  "categories",
  "product_groups",
  "product_attributes",
  "product_attribute_values",
  "products",
  "banners",
  "home_categories",
  "profiles",
  "orders",
  "order_items",
  "addresses",
  "favorites",
]

function getTimestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

async function fetchAllRows(tableName) {
  const batchSize = 1000
  let from = 0
  let allRows = []

  while (true) {
    const to = from + batchSize - 1
    const res = await fetch(`${url}/rest/v1/${tableName}?select=*`, {
      headers: {
        ...headers,
        Range: `${from}-${to}`,
        "Range-Unit": "items",
        Prefer: "count=exact",
      },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Ошибка выгрузки таблицы ${tableName} (${res.status}): ${text}`)
    }

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break

    allRows = allRows.concat(data)

    const contentRange = res.headers.get("content-range") // e.g. "0-999/5759"
    if (contentRange) {
      const total = Number(contentRange.split("/")[1])
      if (!isNaN(total) && allRows.length >= total) break
    }

    if (data.length < batchSize) break
    from += batchSize
  }

  return allRows
}

async function fetchAuthUsers() {
  try {
    const res = await fetch(`${url}/auth/v1/admin/users`, { headers })
    if (res.ok) {
      const data = await res.json()
      return data.users || []
    }
  } catch (err) {
    console.warn("  Не удалось выгрузить auth.users:", err.message)
  }
  return null
}

async function fetchBuckets() {
  try {
    const res = await fetch(`${url}/storage/v1/bucket`, { headers })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn("  Не удалось получить список бакетов:", err.message)
  }
  return []
}

async function main() {
  const timestamp = getTimestamp()
  const backupDir = path.resolve(process.cwd(), "scripts", "backups", `backup-${timestamp}`)
  const tablesDir = path.join(backupDir, "tables")

  fs.mkdirSync(tablesDir, { recursive: true })

  console.log(`====================================================`)
  console.log(` Запуск резервного копирования базы данных Supabase`)
  console.log(` Хост: ${url}`)
  console.log(` Папка: ${backupDir}`)
  console.log(`====================================================\n`)

  const summary = {
    timestamp: new Date().toISOString(),
    host: url,
    tables: {},
    totalRows: 0,
    authUsersCount: 0,
    buckets: [],
  }

  const allData = {}

  for (const table of TABLES) {
    process.stdout.write(`Выгрузка таблицы ${table.padEnd(26)} ... `)
    try {
      const rows = await fetchAllRows(table)
      fs.writeFileSync(path.join(tablesDir, `${table}.json`), JSON.stringify(rows, null, 2), "utf-8")
      allData[table] = rows
      summary.tables[table] = rows.length
      summary.totalRows += rows.length
      console.log(`[OK] (${rows.length} строк)`)
    } catch (err) {
      console.log(`[ОШИБКА] ${err.message}`)
      summary.tables[table] = { error: err.message }
    }
  }

  // Auth Users
  process.stdout.write(`Выгрузка auth.users               ... `)
  const authUsers = await fetchAuthUsers()
  if (authUsers) {
    fs.writeFileSync(path.join(backupDir, "auth_users.json"), JSON.stringify(authUsers, null, 2), "utf-8")
    summary.authUsersCount = authUsers.length
    allData["auth_users"] = authUsers
    console.log(`[OK] (${authUsers.length} пользователей)`)
  } else {
    console.log(`[ПРОПУЩЕНО]`)
  }

  // Buckets info
  const buckets = await fetchBuckets()
  summary.buckets = buckets.map((b) => ({ id: b.id, name: b.name, public: b.public }))

  // Save all_data.json and summary.json
  fs.writeFileSync(path.join(backupDir, "all_data.json"), JSON.stringify(allData, null, 2), "utf-8")
  fs.writeFileSync(path.join(backupDir, "summary.json"), JSON.stringify(summary, null, 2), "utf-8")

  console.log(`\n====================================================`)
  console.log(` Резервная копия успешно создана!`)
  console.log(` Всего выгружено строк: ${summary.totalRows}`)
  console.log(` Сохранено в: ${backupDir}`)
  console.log(` Файлы:`)
  console.log(`   - tables/*.json  (каждая таблица отдельно)`)
  console.log(`   - all_data.json  (все данные в одном файле)`)
  console.log(`   - summary.json   (сводка по количеству записей)`)
  if (authUsers) console.log(`   - auth_users.json(аккаунты пользователей)`)
  console.log(`====================================================`)
}

main().catch((err) => {
  console.error("Критическая ошибка бэкапа:", err)
  process.exit(1)
})
