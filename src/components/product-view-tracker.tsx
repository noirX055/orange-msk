"use client"

import { useEffect } from "react"
import { trackProductView } from "@/lib/analytics"
import type { Product } from "@/lib/products"

export function ProductViewTracker({ product }: { product: Product }) {
  useEffect(() => {
    trackProductView({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand,
    })
  }, [product.id, product.name, product.price, product.category, product.brand])

  return null
}
