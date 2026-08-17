"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { Product } from "@/lib/products"

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  category: string
  color?: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  addItem: (product: Product, options?: { color?: string; quantity?: number }) => void
  updateQuantity: (id: string, color: string | undefined, quantity: number) => void
  removeItem: (id: string, color?: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const keyOf = (id: string, color?: string) => `${id}__${color ?? ""}`

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return {
      items,
      totalItems,
      totalPrice,
      addItem: (product, options) => {
        const quantity = options?.quantity ?? 1
        const color = options?.color ?? product.colors[0]?.name
        setItems((current) => {
          const existing = current.find(
            (item) => keyOf(item.id, item.color) === keyOf(product.id, color),
          )
          if (existing) {
            return current.map((item) =>
              keyOf(item.id, item.color) === keyOf(product.id, color)
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          }
          return [
            ...current,
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              category: product.category,
              color,
              quantity,
            },
          ]
        })
      },
      updateQuantity: (id, color, quantity) => {
        setItems((current) =>
          quantity <= 0
            ? current.filter((item) => keyOf(item.id, item.color) !== keyOf(id, color))
            : current.map((item) =>
                keyOf(item.id, item.color) === keyOf(id, color) ? { ...item, quantity } : item,
              ),
        )
      },
      removeItem: (id, color) => {
        setItems((current) =>
          current.filter((item) => keyOf(item.id, item.color) !== keyOf(id, color)),
        )
      },
      clear: () => setItems([]),
    }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider")
  }
  return context
}
