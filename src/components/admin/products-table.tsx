"use client"

import { useMemo, useState, Fragment } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpDown, ChevronDown, ChevronUp, Pencil, Search } from "lucide-react"
import { formatPrice, getProductImages, getCategoryName, categories, type Product } from "@/lib/products"
import { deleteProduct } from "@/app/admin/actions"
import { DeleteButton } from "@/components/admin/delete-button"
import { VisibilityToggle } from "@/components/admin/visibility-toggle"

type SortKey = "name" | "category" | "price" | "stock" | "visible"

const controlBase =
  "h-10 rounded-xl border border-border bg-muted/50 px-3 text-sm outline-none transition-colors focus:border-primary"

export function ProductsTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [brand, setBrand] = useState("all")
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [groupByBrand, setGroupByBrand] = useState(false)

  const brands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort(),
    [products],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = products.filter((product) => {
      if (category !== "all" && product.category !== category) return false
      if (brand !== "all" && product.brand !== brand) return false
      if (q) {
        const haystack = [product.name, product.brand, product.slug, product.series ?? ""]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    if (sortKey) {
      list.sort((a, b) => {
        let result = 0
        switch (sortKey) {
          case "name":
            result = a.name.localeCompare(b.name, "ru")
            break
          case "category":
            result = getCategoryName(a.category).localeCompare(getCategoryName(b.category), "ru")
            break
          case "price":
            result = a.price - b.price
            break
          case "stock":
            result = Number(a.inStock) - Number(b.inStock)
            break
          case "visible":
            result = Number(a.isVisible) - Number(b.isVisible)
            break
        }
        return sortDir === "asc" ? result : -result
      })
    }

    return list
  }, [products, query, category, brand, sortKey, sortDir])

  // Группировка по бренду (когда включена) — секции с заголовками
  const groups = useMemo(() => {
    if (!groupByBrand) return [{ brand: null as string | null, items: filtered }]
    const map = new Map<string, Product[]>()
    for (const product of filtered) {
      const list = map.get(product.brand) ?? []
      list.push(product)
      map.set(product.brand, list)
    }
    return Array.from(map.keys())
      .sort((a, b) => a.localeCompare(b, "ru"))
      .map((name) => ({ brand: name, items: map.get(name)! }))
  }, [filtered, groupByBrand])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sortHeader = (label: string, key: SortKey, className = "") => (
    <th className={`px-4 py-3 font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => toggleSort(key)}
        className="flex items-center gap-1 transition-colors hover:text-foreground"
      >
        {label}
        {sortKey === key ? (
          sortDir === "asc" ? (
            <ChevronUp size={13} />
          ) : (
            <ChevronDown size={13} />
          )
        ) : (
          <ArrowUpDown size={12} className="opacity-40" />
        )}
      </button>
    </th>
  )

  const renderRow = (product: Product) => {
    const image = getProductImages(product)[0]
    return (
      <tr key={product.id} className="transition-colors hover:bg-muted/30">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              <Image src={image} alt="" fill sizes="44px" className="object-contain p-1" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{product.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {product.brand}
                {product.series ? ` · ${product.series}` : ""}
              </p>
            </div>
          </div>
        </td>
        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
          {getCategoryName(product.category)}
        </td>
        <td className="px-4 py-3 font-semibold">{formatPrice(product.price)}</td>
        <td className="hidden px-4 py-3 md:table-cell">
          {product.inStock ? (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              В наличии
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Нет
            </span>
          )}
        </td>
        <td className="px-4 py-3">
          <VisibilityToggle id={product.id} visible={product.isVisible} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              aria-label="Редактировать"
            >
              <Pencil size={16} />
            </Link>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <DeleteButton confirmText={`Удалить «${product.name}»?`} />
            </form>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Панель поиска и фильтров */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Поиск по названию, бренду, серии, slug…"
            className={`${controlBase} w-full pl-9`}
          />
        </div>

        <select value={category} onChange={(event) => setCategory(event.target.value)} className={controlBase}>
          <option value="all">Все категории</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        <select value={brand} onChange={(event) => setBrand(event.target.value)} className={controlBase}>
          <option value="all">Все бренды</option>
          {brands.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={groupByBrand}
            onChange={(event) => setGroupByBrand(event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          Группировать по бренду
        </label>
      </div>

      <p className="text-sm text-muted-foreground">Найдено: {filtered.length}</p>

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {sortHeader("Товар", "name")}
              {sortHeader("Категория", "category", "hidden sm:table-cell")}
              {sortHeader("Цена", "price")}
              {sortHeader("Наличие", "stock", "hidden md:table-cell")}
              {sortHeader("Показ", "visible")}
              <th className="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((group) => (
              <Fragment key={group.brand ?? "__all"}>
                {group.brand && (
                  <tr className="bg-muted/40">
                    <td colSpan={6} className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {group.brand} · {group.items.length}
                    </td>
                  </tr>
                )}
                {group.items.map(renderRow)}
              </Fragment>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">
            Ничего не найдено. Измените поиск или фильтры.
          </p>
        )}
      </div>
    </div>
  )
}
