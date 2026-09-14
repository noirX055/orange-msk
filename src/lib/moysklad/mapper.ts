import type { MoySkladProduct } from "./types"

export function slugify(text: string): string {
  const map: Record<string, string> = {
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

export function detectBrand(product: MoySkladProduct): string {
  if (product.pathName) {
    const firstPart = product.pathName.split("/")[0]?.trim()
    if (firstPart) return firstPart
  }

  const name = product.name.toLowerCase()
  if (name.includes("apple") || name.includes("macbook") || name.includes("iphone") || name.includes("ipad")) {
    return "Apple"
  }
  if (name.includes("samsung") || name.includes("galaxy")) return "Samsung"
  if (name.includes("xiaomi") || name.includes("redmi") || name.includes("poco")) return "Xiaomi"
  if (name.includes("dyson")) return "Dyson"
  if (name.includes("sony") || name.includes("playstation")) return "Sony"
  if (name.includes("asus")) return "ASUS"

  return "Apple"
}

export function detectCategory(product: MoySkladProduct): string {
  const path = (product.pathName || "").toLowerCase()
  const name = product.name.toLowerCase()
  const fullText = path + " " + name

  if (fullText.includes("lego") || fullText.includes("лего")) return "lego"
  if (fullText.includes("dyson") || fullText.includes("дайсон")) return "dyson"
  if (fullText.includes("samsung") || fullText.includes("самсунг") || fullText.includes("galaxy")) return "samsung"
  if (fullText.includes("playstation") || fullText.includes("xbox") || fullText.includes("nintendo") || fullText.includes("консоль")) return "consoles"
  if (fullText.includes("airpods")) return "airpods"
  if (fullText.includes("apple watch") || fullText.includes("watch")) return "apple-watch"
  if (fullText.includes("ipad") || fullText.includes("айпад")) return "ipad"
  if (fullText.includes("macbook") || fullText.includes("mac mini") || fullText.includes("imac")) return "macbook"

  if (fullText.includes("iphone") || fullText.includes("айфон")) {
    if (fullText.includes("18")) return "iphone-18"
    if (fullText.includes("17")) return "iphone-17"
    if (fullText.includes("16")) return "iphone-16"
    if (fullText.includes("14")) return "iphone-14"
    return "iphone-15" // fallback default for old or generic iphones to the middle
  }

  // If it's a charger, cable, adapter, or unknown
  return "accessories"
}

/**
 * Преобразует товар из МойСклад в запись для таблицы public.products Supabase
 */
export function mapMoySkladProductToDb(product: MoySkladProduct) {
  const brand = detectBrand(product)
  const category = detectCategory(product)
  
  // Цена в копейках -> рубли
  const salePriceKopecks = product.salePrices?.[0]?.value || 0
  const price = Math.round(salePriceKopecks / 100)

  // Генерируем стабильный читаемый slug
  const baseSlug = slugify(product.name)
  const codePart = product.code ? `-${product.code}` : `-${product.id.slice(0, 6)}`
  const slug = `${baseSlug}${codePart}`.slice(0, 120)

  const isArchived = Boolean(product.archived)

  return {
    moysklad_id: product.id,
    code: product.code || null,
    sku: product.article || null,
    path_name: product.pathName || null,
    name: product.name,
    slug,
    brand,
    category,
    price,
    in_stock: !isArchived,
    is_visible: !isArchived && price > 0,
    description: product.description || "",
    specs: [] as { label: string; value: string }[],
    colors: [] as { name: string; hex: string }[],
    images: [] as string[],
    updated_at: new Date().toISOString(),
  }
}
