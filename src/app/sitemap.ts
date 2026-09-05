import type { MetadataRoute } from "next"
import { createClient } from "@/lib/supabase/server"
import { categories } from "@/lib/products"

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
  ]

  // 2. Страницы категорий
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/catalog?category=${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }))

  // 3. Динамические страницы товаров
  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at, created_at")
      .eq("is_visible", true)

    if (products && products.length > 0) {
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
  } catch {
    // Безопасный fallback в случае временной недоступности БД
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
