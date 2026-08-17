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
    <div className="flex flex-col gap-5 rounded-card border border-border p-5">
      <div className="flex flex-wrap items-end gap-3">
        <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <>
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
            <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              −{discount}%
            </span>
          </>
        )}
      </div>

      {product.colors.length > 1 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold">
            Цвет: <span className="font-normal text-muted-foreground">{color}</span>
          </legend>
          <div className="flex items-center gap-2.5">
            {product.colors.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setColor(option.name)}
                aria-label={option.name}
                aria-pressed={color === option.name}
                className={`h-9 w-9 rounded-full border-2 transition-colors ${
                  color === option.name ? "border-primary" : "border-border"
                }`}
              >
                <span
                  className="block h-full w-full rounded-full border border-border/60"
                  style={{ backgroundColor: option.hex }}
                />
              </button>
            ))}
          </div>
        </fieldset>
      )}

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
