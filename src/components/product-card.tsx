"use client"

import Link from "next/link"
import { Check, ShoppingCart, Star } from "lucide-react"
import { useState } from "react"
import { formatPrice, getProductImages, type Product } from "@/lib/products"
import { useCart } from "@/components/cart-provider"
import { ProductHoverGallery } from "@/components/product-hover-gallery"
import { BrandLogo } from "@/components/brand-logo"

const badgeStyles: Record<string, string> = {
  Хит: "bg-navy text-navy-foreground",
  Новинка: "bg-primary text-primary-foreground",
  Скидка: "bg-primary/15 text-primary",
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem(product)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-card transition-colors hover:border-primary/60">
      <Link href={`/product/${product.slug}`} className="relative block">
        <ProductHoverGallery
          images={getProductImages(product)}
          alt={product.name}
          category={product.category}
          className="h-44 w-full"
        />
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Нет в наличии
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <BrandLogo brand={product.brand} size={14} />
          <span className="ml-auto flex items-center gap-1 text-foreground">
            <Star size={13} className="fill-primary text-primary" />
            {product.rating}
          </span>
          <span>({product.reviews})</span>
        </div>

        <h3 className="text-sm font-semibold leading-relaxed text-pretty">
          <Link href={`/product/${product.slug}`} className="transition-colors hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex items-center justify-center rounded-full bg-primary p-2.5 text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            aria-label={added ? "Добавлено в корзину" : `Добавить ${product.name} в корзину`}
          >
            {added ? <Check size={18} /> : <ShoppingCart size={18} />}
          </button>
        </div>
      </div>
    </article>
  )
}
