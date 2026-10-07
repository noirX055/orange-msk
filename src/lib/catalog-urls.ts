import { slugify } from "@/lib/slugify"

/**
 * Преобразует название серии / группы в ЧПУ-слаг:
 * "iPhone 17 Pro Max" -> "iphone-17-pro-max"
 * "AirPods Max 2" -> "airpods-max-2"
 * "Смартфон Samsung S25 FE" -> "smartfon-samsung-s25-fe"
 */
export function seriesToSlug(seriesName: string): string {
  return slugify(seriesName)
}

/**
 * Ищет исходное название серии по её ЧПУ-слагу среди списка доступных серий.
 */
export function findSeriesNameBySlug(
  seriesSlug: string,
  candidateNames: string[],
): string | undefined {
  if (!seriesSlug) return undefined
  const target = seriesSlug.toLowerCase()
  return candidateNames.find((name) => slugify(name).toLowerCase() === target)
}

/**
 * Генерирует ЧПУ-ссылку на категорию или серию:
 * buildCatalogHref("apple") -> "/catalog/apple"
 * buildCatalogHref("apple", "iPhone 17 Pro") -> "/catalog/apple/iphone-17-pro"
 * buildCatalogHref() -> "/catalog"
 */
export function buildCatalogHref(categorySlug?: string, seriesName?: string): string {
  if (!categorySlug || categorySlug === "all") {
    return "/catalog"
  }
  const cleanCat = categorySlug.toLowerCase()
  if (seriesName && seriesName.trim()) {
    return `/catalog/${cleanCat}/${seriesToSlug(seriesName)}`
  }
  return `/catalog/${cleanCat}`
}

/**
 * Таблица перенаправления устаревших псевдо-категорий на реальные ЧПУ-адреса.
 * Необходима для склейки ссылок из старого sitemap, старых сниппетов и внешних закладок.
 */
const LEGACY_CATEGORY_MAP: Record<string, { category: string; series?: string }> = {
  "iphone-17": { category: "apple", series: "iPhone 17" },
  "iphone-18": { category: "apple", series: "iPhone 18" },
  "iphone-16": { category: "apple", series: "iPhone 16" },
  "iphone-15": { category: "apple", series: "iPhone 15" },
  "iphone-14": { category: "apple", series: "iPhone 14" },
  "airpods": { category: "accessories" },
  "ipad": { category: "apple", series: "iPad" },
  "macbook": { category: "apple", series: "MacBook" },
  "apple-watch": { category: "apple", series: "Apple Watch" },
  "consoles": { category: "accessories" },
}

/**
 * Определяет, требуется ли 301-редирект со старых query-параметров (?category=...&series=...)
 * на новый ЧПУ-адрес.
 */
export function getLegacyCatalogRedirect(params: {
  category?: string
  series?: string
  [key: string]: string | undefined
}): string | null {
  const { category, series, ...restParams } = params
  if (!category && !series) return null

  let targetPath: string | null = null

  if (category) {
    const lowerCat = category.toLowerCase()
    const legacyTarget = LEGACY_CATEGORY_MAP[lowerCat]
    if (legacyTarget) {
      targetPath = buildCatalogHref(
        legacyTarget.category,
        series || legacyTarget.series,
      )
    } else {
      targetPath = buildCatalogHref(lowerCat, series)
    }
  }

  if (!targetPath) return null

  // Сохраняем дополнительные параметры фильтрации (например sort=price-asc, sale=1, q=...)
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(restParams)) {
    if (v !== undefined && v !== "") {
      query.set(k, v)
    }
  }
  const queryString = query.toString()
  return queryString ? `${targetPath}?${queryString}` : targetPath
}
