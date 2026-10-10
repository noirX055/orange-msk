import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"
import { calculateCardPrice, type Product } from "@/lib/products"

// Строка таблицы products (snake_case из БД)
export type ProductRow = {
  id: string
  slug: string
  name: string
  brand: string
  series: string | null
  variant_group: string | null
  category: string
  price: number
  card_price?: number | null
  old_price: number | null
  rating: number
  reviews: number
  in_stock: boolean
  is_visible: boolean
  badge: string | null
  colors: { name: string; hex: string }[] | null
  specs: { label: string; value: string }[] | null
  images: string[] | null
  description: string | null
  sort: number
  created_at?: string
}

export const PRODUCT_COLUMNS =
  "id, slug, name, brand, series, variant_group, category, price, card_price, old_price, rating, reviews, in_stock, is_visible, badge, colors, specs, images, description, sort, created_at"

export const PRODUCT_COLUMNS_LEGACY =
  "id, slug, name, brand, series, variant_group, category, price, old_price, rating, reviews, in_stock, is_visible, badge, colors, specs, images, description, sort, created_at"

let hasCardPriceSupport: boolean | null = null

export async function getProductColumns(supabase: any): Promise<any> {
  if (hasCardPriceSupport === true) return PRODUCT_COLUMNS
  if (hasCardPriceSupport === false) return PRODUCT_COLUMNS_LEGACY

  try {
    const { error } = await supabase.from("products").select("card_price").limit(1)
    if (error && error.code === "42703") {
      hasCardPriceSupport = false
      return PRODUCT_COLUMNS_LEGACY
    }
    hasCardPriceSupport = true
    return PRODUCT_COLUMNS
  } catch {
    return PRODUCT_COLUMNS_LEGACY
  }
}

export function mapProduct(row: ProductRow): Product {
  const cardPrice =
    row.card_price != null && row.card_price > 0
      ? row.card_price
      : row.price > 0
      ? calculateCardPrice(row.price)
      : undefined

  return {
    id: row.id,
    slug: row.slug,
    name: row.name ? row.name.normalize("NFKC") : "",
    brand: row.brand ? row.brand.normalize("NFKC") : "",
    series: row.series ? row.series.normalize("NFKC") : undefined,
    variantGroup: row.variant_group ?? undefined,
    category: row.category,
    price: row.price,
    cardPrice,
    oldPrice: row.old_price ?? undefined,
    rating: Number(row.rating),
    reviews: row.reviews,
    inStock: row.in_stock,
    isVisible: row.is_visible,
    badge: (row.badge as Product["badge"]) ?? undefined,
    colors: row.colors ?? [],
    description: row.description ?? "",
    specs: row.specs ?? [],
    images: row.images ?? [],
    createdAt: row.created_at ?? undefined,
  }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const columns = await getProductColumns(supabase)
  const { data } = await supabase
    .from("products")
    .select(columns as any)
    .eq("is_visible", true)
    .order("sort", { ascending: true })

  return ((data as unknown as ProductRow[] | null) ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const columns = await getProductColumns(supabase)
  const { data } = await supabase
    .from("products")
    .select(columns as any)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle()

  return data ? mapProduct(data as unknown as ProductRow) : null
}

/** Соседние варианты для переключения цвета (slug) и памяти */
export async function getProductVariantCandidates(product: Product): Promise<Product[]> {
  const supabase = await createClient()
  const columns = await getProductColumns(supabase)
  const ids = new Set<string>([product.id])
  const results: Product[] = [product]

  if (product.variantGroup) {
    const { data } = await supabase
      .from("products")
      .select(columns as any)
      .eq("variant_group", product.variantGroup)
      .eq("is_visible", true)

    for (const row of (data as unknown as ProductRow[] | null) ?? []) {
      const mapped = mapProduct(row)
      if (!ids.has(mapped.id)) {
        ids.add(mapped.id)
        results.push(mapped)
      }
    }
  }

  if (product.series) {
    const { data } = await supabase
      .from("products")
      .select(columns as any)
      .eq("series", product.series)
      .eq("brand", product.brand)
      .eq("is_visible", true)

    for (const row of (data as unknown as ProductRow[] | null) ?? []) {
      const mapped = mapProduct(row)
      if (!ids.has(mapped.id)) {
        ids.add(mapped.id)
        results.push(mapped)
      }
    }
  }

  // Если серия и группа не заданы или найден только 1 товар, пробуем найти по базовой модели в названии
  if (results.length === 1 && product.name) {
    const modelMatch = product.name.match(
      /(iPhone\s+\d+(?:\s+(?:Pro\s+Max|Pro|Plus|mini))?|Galaxy\s+S\d+(?:\s+(?:Ultra|Plus|\+|FE))?|Galaxy\s+Z\s+(?:Fold|Flip)\d*|MacBook\s+(?:Air|Pro)\s+\d+|Dyson\s+[a-zA-Z0-9\s]+)/i
    )
    if (modelMatch && modelMatch[1]) {
      const modelName = modelMatch[1].trim()
      const { data } = await supabase
        .from("products")
        .select(columns as any)
        .eq("category", product.category)
        .eq("is_visible", true)
        .ilike("name", `%${modelName}%`)

      for (const row of (data as unknown as ProductRow[] | null) ?? []) {
        const mapped = mapProduct(row)
        if (!ids.has(mapped.id)) {
          ids.add(mapped.id)
          results.push(mapped)
        }
      }
    }
  }

  return results
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const columns = await getProductColumns(supabase)
  const { data } = await supabase
    .from("products")
    .select(columns as any)
    .eq("id", id)
    .maybeSingle()

  return data ? mapProduct(data as unknown as ProductRow) : null
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return []
  const supabase = await createClient()
  const columns = await getProductColumns(supabase)
  const { data } = await supabase
    .from("products")
    .select(columns as any)
    .in("slug", slugs)
    .eq("is_visible", true)

  return ((data as unknown as ProductRow[] | null) ?? []).map(mapProduct)
}

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  // Разбиваем на значимые слова (токены), убирая знаки препинания
  const words = trimmed
    .split(/[\s,()\[\]\/\-_+]+/g)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0)

  if (words.length === 0) return []

  const supabase = createPublicClient()
  const columns = await getProductColumns(supabase)

  // 1. Сначала пробуем точный поиск подстроки
  const cleanPhrase = trimmed.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim()
  let products: ProductRow[] = []

  if (cleanPhrase.length >= 2) {
    const pattern = `%${cleanPhrase}%`
    const { data } = await supabase
      .from("products")
      .select(columns as any)
      .eq("is_visible", true)
      .or(`name.ilike.${pattern},brand.ilike.${pattern},series.ilike.${pattern}`)
      .limit(limit)

    if (data && data.length > 0) {
      products = data as unknown as ProductRow[]
    }
  }

  // 2. Если точная фраза ничего не нашла или нашла мало — ищем по ключевым словам (AND)
  if (products.length < limit) {
    let queryBuilder = supabase
      .from("products")
      .select(columns as any)
      .eq("is_visible", true)

    // Фильтруем по каждому слову (до 5 ключевых слов)
    const keywords = words.slice(0, 5)
    for (const word of keywords) {
      const p = `%${word}%`
      queryBuilder = queryBuilder.or(`name.ilike.${p},brand.ilike.${p},series.ilike.${p}`)
    }

    const { data: keywordData } = await queryBuilder.limit(limit * 2)

    if (keywordData && keywordData.length > 0) {
      const existingIds = new Set(products.map((p) => p.id))
      for (const item of keywordData as unknown as ProductRow[]) {
        if (!existingIds.has(item.id)) {
          existingIds.add(item.id)
          products.push(item)
        }
      }
    }
  }

  // Ранжирование по релевантности (сколько слов совпало в названии)
  products.sort((a, b) => {
    const aText = `${a.name} ${a.brand} ${a.series ?? ""}`.toLowerCase()
    const bText = `${b.name} ${b.brand} ${b.series ?? ""}`.toLowerCase()

    let aScore = 0
    let bScore = 0

    for (const w of words) {
      if (aText.includes(w)) aScore += 1
      if (bText.includes(w)) bScore += 1
    }

    // Бонус за совпадение начала названия
    if (a.name.toLowerCase().startsWith(trimmed.toLowerCase())) aScore += 2
    if (b.name.toLowerCase().startsWith(trimmed.toLowerCase())) bScore += 2

    return bScore - aScore
  })

  return products.slice(0, limit).map(mapProduct)
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts()
  return all
    .filter((item) => item.category === product.category && item.id !== product.id)
    .concat(all.filter((item) => item.category !== product.category && item.id !== product.id))
    .slice(0, limit)
}

export type NavigationTree = Record<string, Record<string, string[]>>

export async function getNavigationTree(): Promise<NavigationTree> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("category, brand, series")
    .eq("is_visible", true)

  const tree: NavigationTree = {}

  if (data) {
    for (const row of data) {
      const { category, brand, series } = row
      if (!category || !brand) continue

      if (!tree[category]) tree[category] = {}
      if (!tree[category][brand]) tree[category][brand] = []
      
      if (series && !tree[category][brand].includes(series)) {
        tree[category][brand].push(series)
      }
    }
  }

  // Сортировка для предсказуемого порядка
  for (const cat of Object.keys(tree)) {
    const sortedBrands: Record<string, string[]> = {}
    Object.keys(tree[cat])
      .sort()
      .forEach((brand) => {
        sortedBrands[brand] = tree[cat][brand].sort()
      })
    tree[cat] = sortedBrands
  }

  return tree
}
