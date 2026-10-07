import fs from "fs"
import { createClient } from "@supabase/supabase-js"

const envFile = fs.readFileSync(".env.local", "utf8")
const env = {}
for (const line of envFile.split("\n")) {
  const parts = line.split("=")
  if (parts.length >= 2) {
    const key = parts[0].trim()
    const val = parts.slice(1).join("=").trim().replace(/^["']|["']$/g, "")
    env[key] = val
  }
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testFullSearch() {
  const query = "Фен Dyson Supersonic HD07, Blue/Rose (с кейсом)"
  const trimmed = query.trim()
  const words = trimmed
    .split(/[\s,()\[\]\/\-_+]+/g)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0)

  console.log("Words:", words)

  let queryBuilder = supabase
    .from("products")
    .select("id, name, is_visible")
    .eq("is_visible", true)

  const keywords = words.slice(0, 5)
  for (const word of keywords) {
    const p = `%${word}%`
    queryBuilder = queryBuilder.or(`name.ilike.${p},brand.ilike.${p},series.ilike.${p}`)
  }

  const { data, error } = await queryBuilder.limit(10)
  console.log("Error:", error)
  console.log("Found:", data?.map((d) => d.name))
}

testFullSearch()
