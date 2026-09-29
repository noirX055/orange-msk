"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  Store,
  MapPin,
  Check,
  Loader2,
} from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { ProductVisual } from "@/components/product-visual"
import { formatPrice } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"

const DELIVERY_THRESHOLD = 5000
const DELIVERY_PRICE = 490

type DeliveryMethod = "courier" | "pickup"

export function CartView() {
  const router = useRouter()
  const { items, totalItems, totalPrice, isLoaded, updateQuantity, removeItem, clear } =
    useCart()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Способ получения
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("courier")
  const [recipientName, setRecipientName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  // 1. Восстановление данных оформления заказа из sessionStorage и профиля
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("orange_checkout_draft")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.deliveryMethod) setDeliveryMethod(parsed.deliveryMethod)
        if (parsed.recipientName) setRecipientName(parsed.recipientName)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.address) setAddress(parsed.address)
      }
    } catch {
      // ignore
    }

    // Если поля не заполнены пользователем, пробуем подставить из профиля
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single()

        if (profile) {
          setRecipientName((curr) => curr || profile.full_name || "")
          setPhone((curr) => curr || profile.phone || "")
        }

        const { data: addresses } = await supabase
          .from("addresses")
          .select("city, street, apartment")
          .order("is_default", { ascending: false })
          .limit(1)

        if (addresses && addresses[0]) {
          const addr = addresses[0]
          const fullAddr = [addr.city, addr.street, addr.apartment ? `кв./офис ${addr.apartment}` : ""]
            .filter(Boolean)
            .join(", ")
          setAddress((curr) => curr || fullAddr)
        }
      } catch {
        // ignore
      }
    })
  }, [])

  // 2. Автоматическое сохранение черновика при изменении полей
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "orange_checkout_draft",
        JSON.stringify({ deliveryMethod, recipientName, phone, address })
      )
    } catch {
      // ignore
    }
  }, [deliveryMethod, recipientName, phone, address])

  // Расчёт стоимости доставки
  const isPickup = deliveryMethod === "pickup"
  const delivery = isPickup
    ? 0
    : totalPrice >= DELIVERY_THRESHOLD
    ? 0
    : DELIVERY_PRICE
  const finalTotal = totalPrice + delivery

  async function handleCheckout() {
    setError("")

    if (deliveryMethod === "courier" && !address.trim()) {
      setError("Пожалуйста, укажите адрес доставки или выберите «Самовывоз»")
      return
    }

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
          total: finalTotal,
          recipient_name: recipientName.trim() || undefined,
          phone: phone.trim() || undefined,
          address: isPickup
            ? "Самовывоз: д. Чёрная Грязь, 7/1М"
            : address.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          // Не авторизован — сохраняем черновик и направляем на логин с сохранением возврата
          try {
            sessionStorage.setItem(
              "orange_checkout_draft",
              JSON.stringify({ deliveryMethod, recipientName, phone, address })
            )
          } catch {}
          router.push("/login?returnTo=/cart")
          return
        }
        setError(data.error ?? "Не удалось оформить заказ")
        setLoading(false)
        return
      }

      // Очищаем сохранённый черновик оформления
      try {
        sessionStorage.removeItem("orange_checkout_draft")
      } catch {}

      // Редирект на страницу оплаты с виджетом ЮКасса
      window.location.href = `/checkout?token=${data.confirmationToken}&orderId=${data.orderId}&total=${data.total}&delivery=${data.delivery}`
    } catch {
      setError("Ошибка сети. Проверьте подключение к интернету.")
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-card border border-border p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Загрузка корзины...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ShoppingBag size={26} />
        </span>
        <h1 className="tracking-tight text-2xl font-bold">Заказ оформлен</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Менеджер Orange MSK свяжется с вами в течение 15 минут для подтверждения времени получения.
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
        {/* Список товаров и параметры доставки */}
        <div className="flex flex-1 flex-col gap-6">
          <ul className="flex flex-col gap-4">
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
                    <span className="text-xs text-muted-foreground">
                      Цвет: {item.color}
                    </span>
                  )}
                  <span className="text-sm font-bold">{formatPrice(item.price)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-border p-1">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.color, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
                      aria-label="Уменьшить количество"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.color, item.quantity + 1)
                      }
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

          {/* Блок способа получения и контактов */}
          <div className="rounded-card border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-bold tracking-tight">
              Способ получения
            </h2>

            {/* Выбор: Доставка курьером или Самовывоз (без доставки) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod("courier")
                  setError("")
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  deliveryMethod === "courier"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Truck size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Доставка курьером</span>
                    {deliveryMethod === "courier" && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {totalPrice >= DELIVERY_THRESHOLD
                      ? "Бесплатно"
                      : `${formatPrice(DELIVERY_PRICE)}`} • по Москве
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeliveryMethod("pickup")
                  setError("")
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  deliveryMethod === "pickup"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Самовывоз (без доставки)
                    </span>
                    {deliveryMethod === "pickup" && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                    Бесплатно (0 ₽)
                  </p>
                </div>
              </button>
            </div>

            {/* Адрес пункта самовывоза */}
            {isPickup && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-muted/60 p-3.5 text-xs text-muted-foreground">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <span className="font-semibold text-foreground">
                    Пункт выдачи Orange MSK:
                  </span>{" "}
                  д. Чёрная Грязь, 7/1М, Пн — Вс: 10:00 – 19:00.
                </div>
              </div>
            )}

            {/* Контактные данные получателя */}
            <div className="mt-5 grid grid-cols-1 gap-3 pt-4 border-t border-border sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Имя получателя
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Иван Иванов"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Телефон для связи
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none"
                />
              </div>

              {deliveryMethod === "courier" && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Адрес доставки в Москве *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ул. Тверская, д. 1, кв. 10"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Сайдбар с итоговой суммой */}
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
                {isPickup ? (
                  <span className="text-green-600 dark:text-green-400">
                    Самовывоз (0 ₽)
                  </span>
                ) : delivery === 0 ? (
                  <span className="text-green-600 dark:text-green-400">
                    Бесплатно
                  </span>
                ) : (
                  formatPrice(delivery)
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">К оплате</dt>
              <dd className="text-xl font-bold">{formatPrice(finalTotal)}</dd>
            </div>
          </dl>

          {!isPickup && delivery > 0 && (
            <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              Добавьте товаров на {formatPrice(DELIVERY_THRESHOLD - totalPrice)} для бесплатной
              доставки или выберите <strong>«Самовывоз»</strong>, чтобы убрать стоимость доставки.
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
