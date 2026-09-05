import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/products"

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
}

const PRODUCT_COLUMNS =
  "id, slug, name, brand, series, variant_group, category, price, old_price, rating, reviews, in_stock, is_visible, badge, colors, specs, images, description, sort"

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    series: row.series ?? undefined,
    variantGroup: row.variant_group ?? undefined,
    category: row.category,
    price: row.price,
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
  }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_visible", true)
    .order("sort", { ascending: true })

  return ((data as ProductRow[] | null) ?? []).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("is_visible", true)
    .maybeSingle()

  return data ? mapProduct(data as ProductRow) : null
}

/** Соседние варианты для переключения цвета (slug) и памяти */
export async function getProductVariantCandidates(product: Product): Promise<Product[]> {
  const supabase = await createClient()
  const ids = new Set<string>([product.id])
  const results: Product[] = [product]

  if (product.variantGroup) {
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("variant_group", product.variantGroup)
      .eq("is_visible", true)

    for (const row of (data as ProductRow[] | null) ?? []) {
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
      .select(PRODUCT_COLUMNS)
      .eq("series", product.series)
      .eq("brand", product.brand)
      .eq("is_visible", true)

    for (const row of (data as ProductRow[] | null) ?? []) {
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
        .select(PRODUCT_COLUMNS)
        .eq("category", product.category)
        .eq("is_visible", true)
        .ilike("name", `%${modelName}%`)

      for (const row of (data as ProductRow[] | null) ?? []) {
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
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  return data ? mapProduct(data as ProductRow) : null
}

export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("slug", slugs)
    .eq("is_visible", true)

  return ((data as ProductRow[] | null) ?? []).map(mapProduct)
}

export async function searchProducts(query: string, limit = 8): Promise<Product[]> {
  // Убираем спецсимволы фильтра PostgREST (запятая, скобки, %) — иначе .or() ломается
  const safe = query.trim().replace(/[%,()]/g, " ").trim()
  if (!safe) return []

  const supabase = await createClient()
  const pattern = `%${safe}%`
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_visible", true)
    .or(`name.ilike.${pattern},brand.ilike.${pattern},series.ilike.${pattern}`)
    .order("sort", { ascending: true })
    .limit(limit)

  return ((data as ProductRow[] | null) ?? []).map(mapProduct)
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
