"use client"

import Link from "next/link"
import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { formatPrice, type Product } from "@/lib/products"
import { useCart } from "@/components/cart-provider"
import { FavoriteButton } from "@/components/favorite-button"

export function ProductBuyPanel({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [color, setColor] = useState(product.colors[0]?.name)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, { color, quantity })
    setAdded(true)
  }

  return (
    <div className="flex flex-col gap-6 pt-1">
      {product.colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="text-muted-foreground">Цвет — </span>
            <span className="font-medium text-foreground">{color || product.colors[0]?.name}</span>
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            {product.colors.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setColor(option.name)}
                aria-label={option.name}
                aria-pressed={color === option.name}
                className={`relative h-[34px] w-[34px] shrink-0 rounded-full transition-all ${
                  color === option.name ? "ring-2 ring-foreground ring-offset-2" : "ring-1 ring-border hover:ring-foreground/40"
                }`}
              >
                <span
                  className="absolute inset-1 rounded-full border border-black/10 dark:border-white/10 shadow-inner"
                  style={{ backgroundColor: option.hex }}
                />
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Pseudo-variants if we have memory in specs */}
      {product.specs.find((s) => s.label.toLowerCase().includes("память")) && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="font-medium text-foreground">Память. </span>
            <span className="text-muted-foreground">Сколько памяти вам нужно?</span>
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-xl border-2 border-foreground px-4 py-2.5 text-sm font-medium"
            >
              {product.specs.find((s) => s.label.toLowerCase().includes("память"))?.value}
            </button>
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-5 pt-2">
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold tracking-tight">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <>
              <span className="pb-1 text-base font-medium text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
              <span className="mb-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/20 dark:text-red-400">
                −{discount}%
              </span>
            </>
          )}
        </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border p-1">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Уменьшить количество"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(10, value + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Увеличить количество"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.inStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart size={18} />
          {product.inStock ? "Добавить в корзину" : "Нет в наличии"}
        </button>

        <FavoriteButton
          slug={product.slug}
          size={20}
          className="h-11 w-11 shrink-0 border border-border hover:border-primary/60"
        />
      </div>
      </div>

      {added && (
        <p className="flex flex-wrap items-center gap-2 rounded-lg bg-muted p-3 text-sm">
          Товар добавлен в корзину.
          <Link href="/cart" className="font-semibold text-primary hover:underline">
            Перейти в корзину
          </Link>
        </p>
      )}
    </div>
  )
}
