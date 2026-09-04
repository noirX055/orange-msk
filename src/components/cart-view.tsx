"use client"

import Link from "next/link"
import { useState } from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { ProductVisual } from "@/components/product-visual"
import { formatPrice } from "@/lib/products"

const DELIVERY_THRESHOLD = 5000
const DELIVERY_PRICE = 490

export function CartView() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clear } = useCart()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const delivery = totalPrice >= DELIVERY_THRESHOLD ? 0 : DELIVERY_PRICE

  async function handleCheckout() {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_slug: item.slug,
            name: item.name,
            category: item.category,
            color: item.color,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal: totalPrice,
          delivery,
          total: totalPrice + delivery,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          // Не авторизован — перенаправляем на логин
          window.location.href = "/login"
          return
        }
        setError(data.error ?? "Не удалось оформить заказ")
        setLoading(false)
        return
      }

      // Редирект на страницу оплаты с виджетом ЮКасса
      window.location.href = `/checkout?token=${data.confirmationToken}&orderId=${data.orderId}`
    } catch {
      setError("Ошибка сети. Проверьте подключение к интернету.")
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShoppingBag size={26} />
        </span>
        <h1 className="tracking-tight text-2xl font-bold">Заказ оформлен</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Менеджер Orange MSK свяжется с вами в течение 15 минут для подтверждения времени доставки.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/account/orders"
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-navy-foreground transition-opacity hover:opacity-90"
          >
            Мои заказы
          </Link>
          <Link
            href="/catalog"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            Вернуться в каталог
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag size={26} />
        </span>
        <h1 className="tracking-tight text-2xl font-bold">Корзина пуста</h1>
        <p className="text-sm text-muted-foreground">
          Добавьте товары из каталога, чтобы оформить заказ.
        </p>
        <Link
          href="/catalog"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="tracking-tight text-3xl font-bold">Корзина</h1>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Очистить
        </button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ul className="flex flex-1 flex-col gap-4">
          {items.map((item) => (
            <li
              key={`${item.id}-${item.color ?? ""}`}
              className="flex flex-col gap-4 rounded-card border border-border p-4 sm:flex-row sm:items-center"
            >
              <ProductVisual
                category={item.category}
                className="h-24 w-full shrink-0 rounded-lg sm:w-24"
              />

              <div className="flex flex-1 flex-col gap-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="text-sm font-semibold leading-relaxed transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
                {item.color && (
                  <span className="text-xs text-muted-foreground">Цвет: {item.color}</span>
                )}
                <span className="text-sm font-bold">{formatPrice(item.price)}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.color, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                    aria-label="Уменьшить количество"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.color, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                    aria-label="Увеличить количество"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id, item.color)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label={`Удалить ${item.name} из корзины`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit w-full shrink-0 rounded-card border border-border p-5 lg:w-80">
          <h2 className="mb-4 tracking-tight text-lg font-bold">Итого</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Товары ({totalItems})</dt>
              <dd className="font-medium">{formatPrice(totalPrice)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Доставка</dt>
              <dd className="font-medium">
                {delivery === 0 ? "Бесплатно" : formatPrice(delivery)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">К оплате</dt>
              <dd className="text-xl font-bold">{formatPrice(totalPrice + delivery)}</dd>
            </div>
          </dl>

          {delivery > 0 && (
            <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              Добавьте товаров на {formatPrice(DELIVERY_THRESHOLD - totalPrice)} для бесплатной
              доставки по Москве.
            </p>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
            ) : (
              "Перейти к оплате"
            )}
          </button>
          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-center text-xs text-red-700">
              {error}
            </p>
          )}
          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных.
          </p>
        </aside>
      </div>
    </div>
  )
}
