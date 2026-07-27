"use client"

import { useMemo, useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { categories, products } from "@/lib/products"
import { ProductCard } from "@/components/product-card"

const sortOptions = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
  { value: "rating", label: "По рейтингу" },
]

const brands = Array.from(new Set(products.map((product) => product.brand))).sort()

export function CatalogView({
  initialCategory = "all",
  initialSaleOnly = false,
}: {
  initialCategory?: string
  initialSaleOnly?: boolean
}) {
  const [category, setCategory] = useState(initialCategory)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(150000)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [saleOnly, setSaleOnly] = useState(initialSaleOnly)
  const [sort, setSort] = useState("popular")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false
      if (product.price > maxPrice) return false
      if (inStockOnly && !product.inStock) return false
      if (saleOnly && !product.oldPrice) return false
      return true
    })

    switch (sort) {
      case "price-asc":
        return [...filtered].sort((a, b) => a.price - b.price)
      case "price-desc":
        return [...filtered].sort((a, b) => b.price - a.price)
      case "rating":
        return [...filtered].sort((a, b) => b.rating - a.rating)
      default:
        return [...filtered].sort((a, b) => b.reviews - a.reviews)
    }
  }, [category, selectedBrands, maxPrice, inStockOnly, saleOnly, sort])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    )
  }

  const reset = () => {
    setCategory("all")
    setSelectedBrands([])
    setMaxPrice(150000)
    setInStockOnly(false)
    setSaleOnly(false)
  }

  const filters = (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Категория</legend>
        <div className="flex flex-col gap-1">
          {[{ slug: "all", name: "Все товары" }, ...categories].map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setCategory(item.slug)}
              className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                category === item.slug
                  ? "bg-navy font-semibold text-navy-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Бренд</legend>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => toggleBrand(brand)}
              aria-pressed={selectedBrands.includes(brand)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedBrands.includes(brand)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="price" className="mb-3 block text-sm font-semibold">
          Цена до{" "}
          <span className="text-primary">
            {new Intl.NumberFormat("ru-RU").format(maxPrice)} ₽
          </span>
        </label>
        <input
          id="price"
          type="range"
          min={10000}
          max={150000}
          step={5000}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="w-full accent-[var(--primary)]"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Только в наличии
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={saleOnly}
            onChange={(event) => setSaleOnly(event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Со скидкой
        </label>
      </div>

      <button
        type="button"
        onClick={reset}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
      >
        Сбросить фильтры
      </button>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold">Каталог</h1>
          <p className="mt-1 text-sm text-muted-foreground">Найдено товаров: {visible.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium lg:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal size={16} />
            Фильтры
          </button>
          <label className="sr-only" htmlFor="sort">
            Сортировка
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium outline-none focus:border-primary"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">{filters}</aside>
        {filtersOpen && (
          <aside className="rounded-card border border-border p-4 lg:hidden">{filters}</aside>
        )}

        <div className="flex-1">
          {visible.length === 0 ? (
            <p className="rounded-card bg-muted p-8 text-center text-sm text-muted-foreground">
              По выбранным фильтрам ничего не найдено. Попробуйте изменить параметры.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
