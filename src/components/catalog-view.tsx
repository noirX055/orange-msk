"use client"

import { useMemo, useState } from "react"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import { categories as fallbackCategories, type Product } from "@/lib/products"
import type { AdminCategory, AdminGroup } from "@/lib/admin/queries"
import { ProductCard } from "@/components/product-card"
import { BrandLogo } from "@/components/brand-logo"

const sortOptions = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешёвые" },
  { value: "price-desc", label: "Сначала дорогие" },
  { value: "rating", label: "По рейтингу" },
]

export function CatalogView({
  products,
  categories: categoriesProp,
  groups = [],
  initialCategory = "all",
  initialSaleOnly = false,
  initialBrand,
  initialQuery = "",
  initialSeries,
}: {
  products: Product[]
  categories?: AdminCategory[]
  groups?: AdminGroup[]
  initialCategory?: string
  initialSaleOnly?: boolean
  initialBrand?: string
  initialQuery?: string
  initialSeries?: string
}) {
  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products],
  )

  // Список категорий: только те, что из админки (или fallback при их отсутствии)
  const categoriesList = useMemo(() => {
    if (categoriesProp && categoriesProp.length > 0) {
      return categoriesProp
    }
    return fallbackCategories
  }, [categoriesProp])

  const [category, setCategory] = useState(initialCategory)
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand && brands.includes(initialBrand) ? [initialBrand] : [],
  )
  const [selectedSeries, setSelectedSeries] = useState<string[]>(
    initialSeries ? [initialSeries] : []
  )
  const [maxPrice, setMaxPrice] = useState(150000)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [saleOnly, setSaleOnly] = useState(initialSaleOnly)
  const [sort, setSort] = useState("popular")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [query, setQuery] = useState(initialQuery)

  // Раскрытые категории
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    if (initialCategory && initialCategory !== "all") {
      initial.add(initialCategory)
    }
    return initial
  })

  // Переход из поиска в уже открытый каталог меняет ?q= без размонтирования.
  // Синхронизируем во время рендера (без эффекта) — рекомендованный React-паттерн.
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery)
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery)
    setQuery(initialQuery)
  }

  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory)
  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory)
    setCategory(initialCategory)
    if (initialCategory && initialCategory !== "all") {
      setExpandedCategories((prev) => new Set(prev).add(initialCategory))
    }
  }

  const [prevInitialSeries, setPrevInitialSeries] = useState(initialSeries)
  if (initialSeries !== prevInitialSeries) {
    setPrevInitialSeries(initialSeries)
    setSelectedSeries(initialSeries ? [initialSeries] : [])
  }

  // Серии в рамках текущей категории и выбранных брендов — чтобы список был релевантным
  const seriesList = useMemo(() => {
    const values = products
      .filter((product) => {
        if (category === "all") return true
        return product.category?.trim().toLowerCase() === category.trim().toLowerCase()
      })
      .filter((product) => selectedBrands.length === 0 || selectedBrands.includes(product.brand))
      .map((product) => product.series)
      .filter((series): series is string => Boolean(series))
    return Array.from(new Set(values)).sort()
  }, [products, category, selectedBrands])

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      if (category !== "all") {
        const prodCat = product.category?.trim().toLowerCase()
        const targetCat = category.trim().toLowerCase()
        if (prodCat !== targetCat) return false
      }
      if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false
      if (selectedSeries.length > 0) {
        if (!product.series) return false
        const prodSeries = product.series.trim().toLowerCase()
        const matchesSeries = selectedSeries.some(
          (s) => s.trim().toLowerCase() === prodSeries
        )
        if (!matchesSeries) return false
      }
      if (product.price > maxPrice) return false
      if (inStockOnly && !product.inStock) return false
      if (saleOnly && !product.oldPrice) return false
      if (
        term &&
        !`${product.name} ${product.brand} ${product.series ?? ""}`.toLowerCase().includes(term)
      )
        return false
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
  }, [products, category, selectedBrands, selectedSeries, maxPrice, inStockOnly, saleOnly, sort, query])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((current) =>
      current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand],
    )
  }

  const toggleSeries = (series: string) => {
    setSelectedSeries((current) =>
      current.some((s) => s.trim().toLowerCase() === series.trim().toLowerCase())
        ? current.filter((item) => item.trim().toLowerCase() !== series.trim().toLowerCase())
        : [...current, series],
    )
  }

  const handleSelectAll = () => {
    setCategory("all")
    setSelectedSeries([])
  }

  const handleSelectCategory = (catSlug: string) => {
    const isCurrent = category.trim().toLowerCase() === catSlug.trim().toLowerCase()
    if (isCurrent && selectedSeries.length === 0) {
      toggleExpandCategory(catSlug)
    } else {
      setCategory(catSlug)
      setSelectedSeries([])
      setExpandedCategories((prev) => new Set(prev).add(catSlug))
    }
  }

  const toggleExpandCategory = (catSlug: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catSlug)) {
        next.delete(catSlug)
      } else {
        next.add(catSlug)
      }
      return next
    })
  }

  const handleSelectGroup = (catSlug: string, groupName: string) => {
    setCategory(catSlug)
    setExpandedCategories((prev) => new Set(prev).add(catSlug))
    setSelectedSeries((prev) => {
      const exists = prev.some((s) => s.trim().toLowerCase() === groupName.trim().toLowerCase())
      return exists ? [] : [groupName]
    })
  }

  const reset = () => {
    setCategory("all")
    setSelectedBrands([])
    setSelectedSeries([])
    setMaxPrice(150000)
    setInStockOnly(false)
    setSaleOnly(false)
    setQuery("")
  }

  const filters = (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Категория</legend>
        <div className="flex flex-col gap-1">
          {/* Все товары */}
          <button
            type="button"
            onClick={handleSelectAll}
            className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              category === "all"
                ? "bg-navy font-semibold text-navy-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Все товары
          </button>

          {/* Категории из админки */}
          {categoriesList.map((item) => {
            const catGroups = groups.filter(
              (g) => g.category_slug?.trim().toLowerCase() === item.slug.trim().toLowerCase()
            )
            const isExpanded = expandedCategories.has(item.slug)
            const isCurrentCategory = category.trim().toLowerCase() === item.slug.trim().toLowerCase()
            const hasSelectedSeries = isCurrentCategory && selectedSeries.length > 0

            // Разделяем группы на сгруппированные (parent_group) и одиночные
            const parentMap = new Map<string, AdminGroup[]>()
            const standalone: AdminGroup[] = []

            for (const g of catGroups) {
              const p = g.parent_group?.trim()
              if (p) {
                const list = parentMap.get(p) ?? []
                list.push(g)
                parentMap.set(p, list)
              } else {
                standalone.push(g)
              }
            }

            return (
              <div key={item.slug} className="flex flex-col">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(item.slug)}
                    className={`flex-1 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isCurrentCategory && !hasSelectedSeries
                        ? "bg-navy font-semibold text-navy-foreground"
                        : isCurrentCategory
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </button>

                  {catGroups.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpandCategory(item.slug, e)}
                      aria-label={isExpanded ? `Свернуть ${item.name}` : `Развернуть ${item.name}`}
                      aria-expanded={isExpanded}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Раскрывающийся список групп */}
                {isExpanded && catGroups.length > 0 && (
                  <div className="my-1 ml-3 flex flex-col gap-1 border-l-2 border-border/60 pl-2.5">
                    {parentMap.size > 0 ? (
                      <>
                        {Array.from(parentMap.entries()).map(([parentName, items]) => (
                          <div key={parentName} className="mt-1.5 first:mt-0.5">
                            <span className="block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                              {parentName}
                            </span>
                            <div className="mt-0.5 flex flex-col gap-0.5 pl-1">
                              {items.map((group) => {
                                const isGroupActive =
                                  isCurrentCategory &&
                                  selectedSeries.some(
                                    (s) => s.trim().toLowerCase() === group.name.trim().toLowerCase()
                                  )
                                return (
                                  <button
                                    key={group.id}
                                    type="button"
                                    onClick={() => handleSelectGroup(item.slug, group.name)}
                                    className={`rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                                      isGroupActive
                                        ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                  >
                                    {group.name}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}

                        {standalone.length > 0 && (
                          <div className="mt-1.5">
                            {parentMap.size > 0 && (
                              <span className="block px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                Другое
                              </span>
                            )}
                            <div className="mt-0.5 flex flex-col gap-0.5 pl-1">
                              {standalone.map((group) => {
                                const isGroupActive =
                                  isCurrentCategory &&
                                  selectedSeries.some(
                                    (s) => s.trim().toLowerCase() === group.name.trim().toLowerCase()
                                  )
                                return (
                                  <button
                                    key={group.id}
                                    type="button"
                                    onClick={() => handleSelectGroup(item.slug, group.name)}
                                    className={`rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                                      isGroupActive
                                        ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                  >
                                    {group.name}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {catGroups.map((group) => {
                          const isGroupActive =
                            isCurrentCategory &&
                            selectedSeries.some(
                              (s) => s.trim().toLowerCase() === group.name.trim().toLowerCase()
                            )
                          return (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => handleSelectGroup(item.slug, group.name)}
                              className={`rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                                isGroupActive
                                  ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {group.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Бренд</legend>
        <div className="grid grid-cols-3 gap-2">
          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => toggleBrand(brand)}
              aria-pressed={selectedBrands.includes(brand)}
              aria-label={brand}
              className={`flex h-14 items-center justify-center rounded-lg border bg-card px-2 transition-colors ${
                selectedBrands.includes(brand)
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary"
              }`}
            >
              <BrandLogo brand={brand} size={18} />
            </button>
          ))}
        </div>
      </fieldset>

      {seriesList.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">Серия</legend>
          <div className="flex flex-wrap gap-2">
            {seriesList.map((series) => {
              const isSelected = selectedSeries.some(
                (s) => s.trim().toLowerCase() === series.trim().toLowerCase()
              )
              return (
                <button
                  key={series}
                  type="button"
                  onClick={() => toggleSeries(series)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary"
                  }`}
                >
                  {series}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

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
          <h1 className="text-3xl font-bold tracking-tight">
            {query.trim() ? `Результаты: «${query.trim()}»` : "Каталог"}
          </h1>
          <div className="mt-1 flex items-center gap-3">
            <p className="text-sm text-muted-foreground">Найдено товаров: {visible.length}</p>
            {query.trim() && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                <X size={14} />
                Сбросить поиск
              </button>
            )}
          </div>
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
