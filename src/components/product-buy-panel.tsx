"use client"

import Link from "next/link"
import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { formatPrice, getEffectiveCardPrice, type Product } from "@/lib/products"
import { getPrimaryColor, type ProductVariants } from "@/lib/products/variants"
import { useCart } from "@/components/cart-provider"
import { FavoriteButton } from "@/components/favorite-button"
import { ProductVariantPicker } from "@/components/product-variant-picker"
import { PaymentBadges } from "@/components/payment-badges"

export function ProductBuyPanel({
  product,
  variants,
}: {
  product: Product
  variants: ProductVariants
}) {
  const { addItem } = useCart()
  const primaryColor = getPrimaryColor(product)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const cardPrice = getEffectiveCardPrice(product)

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, { color: primaryColor?.name, quantity })
    setAdded(true)
  }

  const showLegacyColors =
    variants.colors.length <= 1 && product.colors.length > 0 && !product.variantGroup

  return (
    <div className="flex flex-col gap-6 pt-1">
      <ProductVariantPicker product={product} variants={variants} />

      {showLegacyColors && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="text-muted-foreground">Цвет — </span>
            <span className="font-medium text-foreground">{primaryColor?.name ?? "—"}</span>
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            {product.colors.map((option) => (
              <span
                key={option.name}
                className="relative h-[34px] w-[34px] shrink-0 rounded-full ring-2 ring-foreground ring-offset-2"
                aria-label={option.name}
              >
                <span
                  className="absolute inset-1 rounded-full border border-black/10 shadow-inner dark:border-white/10"
                  style={{ backgroundColor: option.hex }}
                />
              </span>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col gap-2 rounded-2xl border border-border/80 bg-muted/20 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-extrabold tracking-tight text-foreground">
                {formatPrice(product.price)}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                за наличные
              </span>
            </div>
            {product.oldPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/20 dark:text-red-400">
                  −{discount}%
                </span>
              </div>
            )}
          </div>

          {cardPrice > 0 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
              <span className="text-muted-foreground">При оплате картой / онлайн:</span>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <span className="text-sm font-bold">{formatPrice(cardPrice)}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+15%</span>
              </div>
            </div>
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

      {/* Доступные способы оплаты через интеграцию ЮKassa */}
      <PaymentBadges />
    </div>
  )
}
