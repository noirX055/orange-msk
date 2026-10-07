"use client"

import { useEffect, useState, useCallback } from "react"
import type { Product } from "@/lib/products"
import { ProductCard } from "@/components/product-card"
import { fetchProductsBySlugsAction } from "@/app/favorites/actions"

const STORAGE_KEY = "orange_recently_viewed_v1"
const MAX_STORED = 16

export function getRecentlyViewedSlugs(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    }
  } catch {
    // ignore parsing errors
  }
  return []
}

export function saveRecentlyViewedSlug(slug: string): string[] {
  if (typeof window === "undefined" || !slug) return []
  try {
    const current = getRecentlyViewedSlugs()
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, MAX_STORED)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    return []
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

type RecentlyViewedProps = {
  currentSlug?: string
  excludeSlug?: string
  title?: string
  limit?: number
  className?: string
}

export function RecentlyViewed({
  currentSlug,
  excludeSlug,
  title = "Вы недавно смотрели",
  limit = 4,
  className,
}: RecentlyViewedProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadProducts = useCallback(() => {
    // 1. Если передан текущий товар — добавляем его в историю
    let allSlugs = getRecentlyViewedSlugs()
    if (currentSlug) {
      allSlugs = saveRecentlyViewedSlug(currentSlug)
    }

    // 2. Исключаем товар, который пользователь просматривает прямо сейчас
    const filteredSlugs = allSlugs.filter((s) => s !== excludeSlug)

    if (filteredSlugs.length === 0) {
      setProducts([])
      setIsLoaded(true)
      return
    }

    const slugsToFetch = filteredSlugs.slice(0, limit)

    fetchProductsBySlugsAction(slugsToFetch)
      .then((items) => {
        // Сохраняем хронологический порядок просмотра (самые свежие первыми)
        const bySlug = new Map(items.map((it) => [it.slug, it]))
        const ordered = slugsToFetch
          .map((s) => bySlug.get(s))
          .filter((it): it is Product => it !== undefined)

        setProducts(ordered)
        setIsLoaded(true)
      })
      .catch((err) => {
        console.error("Ошибка загрузки недавно просмотренных товаров:", err)
        setIsLoaded(true)
      })
  }, [currentSlug, excludeSlug, limit])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleClear = () => {
    clearRecentlyViewed()
    setProducts([])
  }

  // Если список пуст или ещё не загрузился — ничего не рендерим, не создавая пустоты
  if (!isLoaded || products.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="recently-viewed-title" className={`pt-6 ${className ?? ""}`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 h-1 w-8 rounded-full bg-primary" />
          <h2 id="recently-viewed-title" className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  )
}
