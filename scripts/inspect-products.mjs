#!/usr/bin/env node
/**
 * Быстрый просмотр структуры products без MCP.
 * Запуск на сервере (где есть доступ к Supabase):
 *
 *   SUPABASE_URL=https://db.orangemsk.ru \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/inspect-products.mjs
 */

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

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
  console.log("=== Orange MSK — inspect products ===\n")
  console.log("URL:", url)

  const sample = await rest(
    "products?select=slug,name,brand,series,variant_group,colors,specs,price&limit=5&order=created_at.desc",
  )

  console.log("\n--- 5 последних товаров ---")
  console.log(JSON.stringify(sample, null, 2))

  const all = await rest(
    "products?select=slug,series,variant_group,colors,specs&limit=1000",
  )

  const total = all.length
  const withSeries = all.filter((p) => p.series).length
  const withVariantGroup = all.filter((p) => p.variant_group).length
  const withColors = all.filter((p) => Array.isArray(p.colors) && p.colors.length > 0).length
  const withSpecs = all.filter((p) => Array.isArray(p.specs) && p.specs.length > 0).length
  const multiColor = all.filter((p) => Array.isArray(p.colors) && p.colors.length > 1).length

  console.log("\n--- Статистика (до 1000 строк) ---")
  console.log({
    fetched: total,
    with_series: withSeries,
    with_variant_group: withVariantGroup,
    with_colors: withColors,
    with_specs: withSpecs,
    multi_color_per_sku: multiColor,
  })

  const seriesCounts = {}
  for (const p of all) {
    if (!p.series) continue
    seriesCounts[p.series] = (seriesCounts[p.series] || 0) + 1
  }

  const topSeries = Object.entries(seriesCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)

  console.log("\n--- Топ серий ---")
  for (const [name, count] of topSeries) {
    console.log(`  ${count}\t${name}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
