"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import type { Product } from "@/lib/products"
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics"

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  category: string
  color?: string
  image?: string
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isLoaded: boolean
  addItem: (
    product: Product,
    options?: { color?: string; quantity?: number; image?: string }
  ) => void
  updateQuantity: (id: string, color: string | undefined, quantity: number) => void
  removeItem: (id: string, color?: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const keyOf = (id: string, color?: string) => `${id}__${color ?? ""}`
const STORAGE_KEY = "orange_cart_items_v1"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // 1. Загрузка сохранённой корзины из localStorage при монтировании
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch (e) {
      console.error("Ошибка загрузки корзины из localStorage:", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // 2. Синхронизация изменений корзины в localStorage
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.error("Ошибка сохранения корзины в localStorage:", e)
    }
  }, [items, isLoaded])

  // 3. Синхронизация между соседними вкладками браузера
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue)
            if (Array.isArray(parsed)) {
              setItems(parsed)
            }
          } catch {}
        } else {
          setItems([])
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

    return {
      items,
      totalItems,
      totalPrice,
      isLoaded,
      addItem: (product, options) => {
        const quantity = options?.quantity ?? 1
        const color = options?.color ?? product.colors[0]?.name
        const image =
          options?.image ??
          (product.images && product.images.length > 0 ? product.images[0] : undefined)

        trackAddToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          color,
          quantity,
        })

        setItems((current) => {
          const existing = current.find(
            (item) => keyOf(item.id, item.color) === keyOf(product.id, color),
          )
          if (existing) {
            return current.map((item) =>
              keyOf(item.id, item.color) === keyOf(product.id, color)
                ? {
                    ...item,
                    image: item.image ?? image,
                    quantity: item.quantity + quantity,
                  }
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
              image,
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
        const target = items.find((item) => keyOf(item.id, item.color) === keyOf(id, color))
        if (target) {
          trackRemoveFromCart({
            id: target.id,
            name: target.name,
            price: target.price,
            category: target.category,
            color: target.color,
            quantity: target.quantity,
          })
        }
        setItems((current) =>
          current.filter((item) => keyOf(item.id, item.color) !== keyOf(id, color)),
        )
      },
      clear: () => {
        setItems([])
        try {
          localStorage.removeItem(STORAGE_KEY)
        } catch {}
      },
    }
  }, [items, isLoaded])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart должен использоваться внутри CartProvider")
  }
  return context
}
