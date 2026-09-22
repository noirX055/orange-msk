#!/usr/bin/env node
/**
 * Быстрый просмотр структуры products без MCP.
 * Запуск на сервере (где есть доступ к Supabase):
 *
 *   SUPABASE_URL=https://db.orangemsk.ru \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/inspect-products.mjs
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

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error("Нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
}

async function rest(path, options = {}) {
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${path} → ${res.status}: ${body}`)
  }
  return res.json()
}

async function main() {
  console.log("=== Product Groups in DB ===")
  const groups = await rest("product_groups?select=*&order=name.asc")
  console.log("Total groups count:", groups.length)
  console.log(JSON.stringify(groups, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
