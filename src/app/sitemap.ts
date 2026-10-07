import type { MetadataRoute } from "next"
import { createPublicClient } from "@/lib/supabase/public"
import { buildCatalogHref } from "@/lib/catalog-urls"

// Без этого Next.js генерирует sitemap один раз при билде и кэширует навсегда,
// из-за чего в карту попадали удалённые товары (404). Обновляем раз в час.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
  const now = new Date()

  // 1. Статические разделы
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/catalog?sale=1`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/delivery`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/warranty`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  let categoryRoutes: MetadataRoute.Sitemap = []
  let seriesRoutes: MetadataRoute.Sitemap = []
  let productRoutes: MetadataRoute.Sitemap = []

  try {
    const supabase = createPublicClient()
    const { data: products } = await supabase
      .from("products")
      .select("slug, category, series, updated_at, created_at")
      .eq("is_visible", true)

    if (products && products.length > 0) {
      // 2. Реальные разделы категорий, где есть видимые товары
      const categoryMap = new Map<string, Date>()
      // 3. Реальные серии внутри категорий, где есть видимые товары
      const seriesMap = new Map<string, { category: string; series: string; lastMod: Date }>()

      for (const p of products) {
        const dateStr = p.updated_at || p.created_at
        const lastMod = dateStr ? new Date(dateStr) : now
        const validLastMod = isNaN(lastMod.getTime()) ? now : lastMod

        if (p.category) {
          const catKey = p.category.toLowerCase()
          const prevDate = categoryMap.get(catKey)
          if (!prevDate || validLastMod > prevDate) {
            categoryMap.set(catKey, validLastMod)
          }

          if (p.series && p.series.trim()) {
            const seriesKey = `${catKey}::${p.series.trim()}`
            const prevSeries = seriesMap.get(seriesKey)
            if (!prevSeries || validLastMod > prevSeries.lastMod) {
              seriesMap.set(seriesKey, {
                category: catKey,
                series: p.series.trim(),
                lastMod: validLastMod,
              })
            }
          }
        }
      }

      categoryRoutes = Array.from(categoryMap.entries()).map(([catSlug, lastMod]) => ({
        url: `${baseUrl}${buildCatalogHref(catSlug)}`,
        lastModified: lastMod,
        changeFrequency: "daily",
        priority: 0.85,
      }))

      seriesRoutes = Array.from(seriesMap.values()).map(({ category, series, lastMod }) => ({
        url: `${baseUrl}${buildCatalogHref(category, series)}`,
        lastModified: lastMod,
        changeFrequency: "daily",
        priority: 0.8,
      }))

      // 4. Карточки товаров
      productRoutes = products.map((p) => {
        const dateStr = p.updated_at || p.created_at
        const lastMod = dateStr ? new Date(dateStr) : now
        return {
          url: `${baseUrl}/product/${p.slug}`,
          lastModified: isNaN(lastMod.getTime()) ? now : lastMod,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }
      })
    }
  } catch (err) {
    console.error("Error generating sitemap:", err)
  }

  return [...staticRoutes, ...categoryRoutes, ...seriesRoutes, ...productRoutes]
}
