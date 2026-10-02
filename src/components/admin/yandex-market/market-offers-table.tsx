"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle2, ExternalLink, Package, Search, XCircle } from "lucide-react"

interface ProductItem {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  old_price?: number | null
  in_stock: boolean
  is_visible: boolean
  images?: string[] | null
}

interface Props {
  products: ProductItem[]
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function MarketOffersTable({ products }: Props) {
  const [search, setSearch] = useState("")

  const filtered = products.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    )
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Search box */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию, бренду или артикулу..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2 text-xs transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <span className="text-xs text-muted-foreground">
          Показано: {filtered.length} из {products.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5 pl-5">Товар</th>
                <th className="p-3.5">Бренд / Категория</th>
                <th className="p-3.5">Цена в магазине</th>
                <th className="p-3.5">Наличие</th>
                <th className="p-3.5">Статус в фиде</th>
                <th className="p-3.5 pr-5 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 50).map((product) => {
                const img = Array.isArray(product.images) && product.images[0] ? product.images[0] : null

                return (
                  <tr key={product.id} className="transition hover:bg-muted/30">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          {img ? (
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col max-w-xs">
                          <span className="font-semibold text-foreground truncate">
                            {product.name}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground truncate">
                            ID: {product.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{product.brand || "—"}</span>
                        <span className="text-[11px] text-muted-foreground">{product.category}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {formatPrice(product.price)}
                        </span>
                        {product.old_price && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(product.old_price)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      {product.in_stock ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 size={13} /> В наличии
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <XCircle size={13} /> Нет в наличии
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {product.is_visible && product.price > 0 ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          Выгружается
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Скрыт
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:bg-muted"
                      >
                        <ExternalLink size={11} /> На сайт
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 50 && (
          <div className="border-t border-border p-3 text-center text-xs text-muted-foreground">
            Показаны первые 50 из {filtered.length} товаров. Используйте поиск для точного выбора.
          </div>
        )}
      </div>
    </div>
  )
}
