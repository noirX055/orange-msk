import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const backupPath = path.resolve("scripts/backups/products-images-backup-all.json")

if (!fs.existsSync(backupPath)) {
  console.error("Файл бэкапа не найден:", backupPath)
  process.exit(1)
}

const backupData = JSON.parse(fs.readFileSync(backupPath, "utf-8"))
console.log(`Загружен бэкап для ${backupData.length} товаров.`)

const envContent = fs.readFileSync(".env.local", "utf-8")
const env = {}
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, "")
})

const supabase = createClient("https://db.orangemsk.ru", env.SUPABASE_SERVICE_ROLE_KEY)

let successCount = 0
let errorCount = 0

console.log("Восстановление исходных изображений товаров из бэкапа...")

for (const item of backupData) {
  const { error } = await supabase
    .from("products")
    .update({ images: item.images })
    .eq("id", item.id)

  if (error) {
    console.error(`Ошибка при откате товара #${item.id} (${item.name}):`, error.message)
    errorCount++
  } else {
    successCount++
  }
}

console.log(`\nОткат завершён: успешно восстановлено ${successCount}, ошибок ${errorCount}`)
