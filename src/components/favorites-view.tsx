"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/products"
import { useFavorites } from "@/components/favorites-provider"
import { ProductCard } from "@/components/product-card"
import { FavoritesSkeleton } from "@/components/skeletons"
import { fetchProductsBySlugsAction } from "@/app/favorites/actions"

export function FavoritesView({
  initialProducts = [],
  inAccount = false,
}: {
  initialProducts?: Product[]
  inAccount?: boolean
}) {
  const { ready, favoriteSlugs } = useFavorites()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [initialLoaded, setInitialLoaded] = useState(initialProducts.length > 0)
  const isFetchingRef = useRef(false)

  useEffect(() => {
    if (!ready) return

    // 1. Если список избранных пуст — очищаем товары
    if (favoriteSlugs.length === 0) {
      setProducts([])
      setLoading(false)
      setInitialLoaded(true)
      return
    }

    // 2. Если какие-то товары были удалены из избранного — мгновенно убираем их из списка
    const slugSet = new Set(favoriteSlugs)
    setProducts((current) => current.filter((p) => slugSet.has(p.slug)))

    // 3. Проверяем, есть ли слаги, для которых товары еще не загружены
    const currentSlugs = new Set(products.map((p) => p.slug))
    const hasMissing = favoriteSlugs.some((slug) => !currentSlugs.has(slug))

    if (!hasMissing && initialLoaded) {
      setLoading(false)
      return
    }

    // 4. Загружаем недостающие / актуальные данные товаров
    let active = true
    isFetchingRef.current = true
    setLoading(true)

    fetchProductsBySlugsAction(favoriteSlugs)
      .then((items) => {
        if (!active) return
        // Сортируем в порядке добавления в избранное
        const bySlug = new Map(items.map((it) => [it.slug, it]))
        const ordered = favoriteSlugs
          .map((s) => bySlug.get(s))
          .filter((it): it is Product => it !== undefined)

        setProducts(ordered)
        setLoading(false)
        setInitialLoaded(true)
      })
      .catch((err) => {
        console.error("Ошибка загрузки избранных товаров:", err)
        if (active) {
          setLoading(false)
          setInitialLoaded(true)
        }
      })
      .finally(() => {
        isFetchingRef.current = false
      })

    return () => {
      active = false
    }
  }, [ready, favoriteSlugs, initialLoaded])

  // Показываем скелетон при первоначальной загрузке
  if (!ready || (loading && !initialLoaded && products.length === 0)) {
    return <FavoritesSkeleton inAccount={inAccount} />
  }

  const count = products.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Избранное</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {count > 0
            ? `Товаров в избранном: ${count}`
            : "Сохраняйте товары, чтобы вернуться к ним позже."}
        </p>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-border p-12 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Heart size={30} />
          </span>
          <div>
            <h2 className="text-lg font-semibold">В избранном пока пусто</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Нажимайте на сердечко у понравившихся товаров, чтобы сохранить их и вернуться к покупкам позже.
            </p>
          </div>
          <Link
            href="/catalog"
            className="mt-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div
          className={
            inAccount
              ? "grid grid-cols-2 gap-4 md:grid-cols-3"
              : "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
