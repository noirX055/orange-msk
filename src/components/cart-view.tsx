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
  Clock,
  Phone,
  ShieldCheck,
  PackageCheck,
  Banknote,
  CreditCard,
  Mail,
  MessageSquare,
} from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { ProductVisual } from "@/components/product-visual"
import { calculateCardPrice, formatPrice } from "@/lib/products"
import { createClient } from "@/lib/supabase/client"
import { trackBeginCheckout, reachGoal } from "@/lib/analytics"

export type DeliveryMethod = "moscow" | "mo" | "cdek" | "pickup"

export interface DeliveryOption {
  id: DeliveryMethod
  title: string
  subtitle: string
  badge: string
  price: number
  priceDisplay: string
  description: string
  addressLabel: string
  addressPlaceholder: string
  helperText: string
}

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "moscow",
    title: "Москва",
    subtitle: "Курьером до двери",
    badge: "В день заказа",
    price: 1000,
    priceDisplay: "1 000 ₽",
    description:
      "Быстрая доставка курьерской службой по Москве. При оформлении заказа в первой половине дня привезём в этот же день.",
    addressLabel: "Адрес доставки в Москве *",
    addressPlaceholder: "г. Москва, ул. Тверская, д. 1, кв. 10",
    helperText: "Доставка в согласованный интервал. Оплата курьеру после проверки товара.",
  },
  {
    id: "mo",
    title: "Московская область",
    subtitle: "Курьером по Подмосковью",
    badge: "Москва и МО",
    price: 1500,
    priceDisplay: "1 500 ₽",
    description:
      "Доставка курьерской службой до двери по городам и населённым пунктам Московской области.",
    addressLabel: "Адрес доставки в Московской области *",
    addressPlaceholder: "г. Красногорск, ул. Ленина, д. 5, кв. 12",
    helperText: "В день заказа или на следующий день. Согласование времени с водителем, оплата при получении.",
  },
  {
    id: "cdek",
    title: "По России",
    subtitle: "В любой регион",
    badge: "Вся Россия",
    price: 0,
    priceDisplay: "СДЭК",
    description:
      "Отправка заказов проверенной транспортной компанией СДЭК до двери или в пункт выдачи в вашем городе.",
    addressLabel: "Город и адрес ПВЗ или доставки СДЭК *",
    addressPlaceholder: "г. Санкт-Петербург, Невский пр-т, д. 20 (или пункт выдачи СДЭК)",
    helperText: "Отправка при 100% предоплате. Полная страховка посылки и трек-номер для отслеживания.",
  },
  {
    id: "pickup",
    title: "Самовывоз",
    subtitle: "Из шоурума в Химках",
    badge: "Шоурум",
    price: 0,
    priceDisplay: "Бесплатно",
    description:
      "М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М. Возможность протестировать технику и получить консультацию.",
    addressLabel: "",
    addressPlaceholder: "",
    helperText: "Ежедневно с 10:00 до 19:00. Бесплатная парковка, проверка на месте перед оплатой.",
  },
]

export type PaymentMethodType = "cash_in_store" | "card_terminal_in_store" | "yookassa"

export function CartView() {
  const router = useRouter()
  const { items, totalItems, totalPrice, isLoaded, updateQuantity, removeItem, clear } =
    useCart()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Способ оплаты: наличными в магазине, картой в терминале, онлайн через ЮKassa
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("yookassa")
  // Способ получения
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup")
  const [recipientName, setRecipientName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [social, setSocial] = useState("")
  const [address, setAddress] = useState("")

  // 1. Восстановление данных оформления заказа из sessionStorage и профиля
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("orange_checkout_draft")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.deliveryMethod) {
          if (parsed.deliveryMethod === "courier") {
            setDeliveryMethod("moscow")
          } else if (DELIVERY_OPTIONS.some((o) => o.id === parsed.deliveryMethod)) {
            setDeliveryMethod(parsed.deliveryMethod)
          }
        }
        if (parsed.paymentMethod) {
          setPaymentMethod(parsed.paymentMethod)
        } else if (parsed.paymentType) {
          setPaymentMethod(parsed.paymentType === "cash_in_store" ? "cash_in_store" : "yookassa")
        }
        if (parsed.recipientName) setRecipientName(parsed.recipientName)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.social) setSocial(parsed.social)
        if (parsed.address) setAddress(parsed.address)
      }
    } catch {
      // ignore
    }

    // Если поля не заполнены пользователем, пробуем подставить из профиля
    const supabase = createClient()
    supabase.auth
      .getUser()
      .then(async (res) => {
        const user = res.data?.user
        if (!user) return
        if (user.email) {
          setEmail((curr) => curr || user.email || "")
        }
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
      .catch(() => {})
  }, [])

  // 2. Автоматическое сохранение черновика при изменении полей
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "orange_checkout_draft",
        JSON.stringify({ deliveryMethod, paymentMethod, recipientName, phone, email, social, address })
      )
    } catch {
      // ignore
    }
  }, [deliveryMethod, paymentMethod, recipientName, phone, email, social, address])

  // Отслеживание просмотра корзины с товарами
  useEffect(() => {
    if (items.length > 0) {
      reachGoal("view_cart", { count: items.length, total: totalPrice })
    }
  }, [items.length > 0]) // eslint-disable-line react-hooks/exhaustive-deps

  // Оплата картой (в терминале или онлайн через ЮKassa) или наличными
  const isCash = paymentMethod === "cash_in_store"

  // Оплата на кассе возможна только при самовывозе из магазина
  const isStorePayment = paymentMethod === "cash_in_store" || paymentMethod === "card_terminal_in_store"

  // При переключении на оплату в магазине доставка автоматически переключается на самовывоз
  const effectiveDeliveryMethod = isStorePayment ? "pickup" : deliveryMethod
  const isPickup = effectiveDeliveryMethod === "pickup"
  const isCdek = effectiveDeliveryMethod === "cdek"

  // Функция расчёта цены конкретного товара в зависимости от выбранного способа оплаты
  const getItemPrice = (item: (typeof items)[number]) => {
    if (isCash) return item.price
    return item.cardPrice && item.cardPrice > 0 ? item.cardPrice : calculateCardPrice(item.price)
  }

  // Расчёт промежуточных и итоговых сумм
  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0)
  const cashSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Выбранный тариф и расчёт стоимости доставки
  const selectedOption =
    DELIVERY_OPTIONS.find((opt) => opt.id === effectiveDeliveryMethod) || DELIVERY_OPTIONS[0]
  const delivery = selectedOption.price
  const finalTotal = subtotal + delivery

  // Валидация обязательных полей
  const isNameValid = recipientName.trim().length >= 2
  const isPhoneValid = phone.trim().length >= 6
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isAddressValid = isPickup || address.trim().length >= 3

  const isFormValid = isNameValid && isPhoneValid && isEmailValid && isAddressValid

  async function handleCheckout() {
    setError("")

    if (!isNameValid) {
      setError("Пожалуйста, укажите имя и фамилию")
      return
    }

    if (!isPhoneValid) {
      setError("Пожалуйста, укажите номер телефона для связи")
      return
    }

    if (!isEmailValid) {
      setError("Пожалуйста, укажите корректный email для отправки подтверждения")
      return
    }

    if (!isPickup && !address.trim()) {
      if (effectiveDeliveryMethod === "moscow") {
        setError("Пожалуйста, укажите адрес доставки в Москве")
      } else if (effectiveDeliveryMethod === "mo") {
        setError("Пожалуйста, укажите адрес доставки в Московской области")
      } else if (effectiveDeliveryMethod === "cdek") {
        setError("Пожалуйста, укажите город и адрес ПВЗ или доставки СДЭК")
      } else {
        setError("Пожалуйста, укажите адрес доставки")
      }
      return
    }

    setLoading(true)
    trackBeginCheckout(
      items.map((item) => ({ ...item, price: getItemPrice(item) })),
      finalTotal
    )

    try {
      let orderAddress: string
      if (isPickup) {
        orderAddress = "Самовывоз: М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М (шоурум)"
      } else if (effectiveDeliveryMethod === "moscow") {
        orderAddress = `Курьер (Москва): ${address.trim()}`
      } else if (effectiveDeliveryMethod === "mo") {
        orderAddress = `Курьер (МО): ${address.trim()}`
      } else if (effectiveDeliveryMethod === "cdek") {
        orderAddress = `СДЭК: ${address.trim()}`
      } else {
        orderAddress = address.trim()
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_slug: item.slug,
            name: item.name,
            category: item.category,
            color: item.color,
            price: getItemPrice(item),
            quantity: item.quantity,
          })),
          subtotal,
          delivery,
          delivery_method: effectiveDeliveryMethod,
          payment_type: paymentMethod,
          total: finalTotal,
          recipient_name: recipientName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          social: social.trim() || undefined,
          address: orderAddress,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          // Не авторизован — сохраняем черновик и направляем на логин с сохранением возврата
          try {
            sessionStorage.setItem(
              "orange_checkout_draft",
              JSON.stringify({
                deliveryMethod: effectiveDeliveryMethod,
                paymentMethod,
                recipientName,
                phone,
                email,
                social,
                address,
              })
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

      // Оплата наличными или картой в терминале на кассе — мгновенный переход к успеху
      if (data.isOfflinePayment) {
        clear()
        window.location.href = `/checkout/success?orderId=${data.orderId}&payment=cash&total=${data.total}`
        return
      }

      // Редирект на страницу онлайн-оплаты с виджетом ЮКасса
      window.location.href = `/checkout?token=${data.confirmationToken}&orderId=${data.orderId}&total=${data.total}&delivery=${data.delivery}&method=${effectiveDeliveryMethod}`
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
                {item.image ? (
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-muted/30 sm:w-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-contain p-1 transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <ProductVisual
                    category={item.category}
                    className="h-24 w-full shrink-0 rounded-lg sm:w-24"
                  />
                )}

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
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">{formatPrice(getItemPrice(item))}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {isCash ? "за наличные" : "оплата картой"}
                    </span>
                  </div>
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

          {/* 1. Блок способа оплаты (ПОДНЯТ НАД ДОСТАВКОЙ) */}
          <div className="rounded-card border border-border bg-card p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-base font-bold tracking-tight">
                Способ оплаты
              </h2>
              <p className="text-xs text-muted-foreground">
                Выберите способ расчёта: на кассе в магазине или онлайн через ЮKassa
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Способ 1: Оплата наличными в магазине */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("cash_in_store")
                  setError("")
                }}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "cash_in_store"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                    : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          paymentMethod === "cash_in_store"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Banknote size={16} />
                      </div>
                      <span className="text-xs font-semibold leading-tight text-foreground block">
                        Оплата наличными
                      </span>
                    </div>

                    <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                      Выгода
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Оплата наличными на кассе в шоуруме после личной проверки товара по базовой цене.
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-[11px] font-medium text-foreground">
                    На кассе
                  </span>
                  {paymentMethod === "cash_in_store" ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                </div>
              </button>

              {/* Способ 2: Оплата картой в терминале на кассе */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("card_terminal_in_store")
                  setError("")
                }}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "card_terminal_in_store"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                    : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          paymentMethod === "card_terminal_in_store"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <CreditCard size={16} />
                      </div>
                      <span className="text-xs font-semibold leading-tight text-foreground block">
                        Оплата картой
                      </span>
                    </div>

                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                      +15%
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Банковской картой через POS-терминал на кассе в шоуруме (+15% к базовой цене).
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-[11px] font-medium text-foreground">
                    На кассе
                  </span>
                  {paymentMethod === "card_terminal_in_store" ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                </div>
              </button>

              {/* Способ 3: Онлайн через ЮKassa */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("yookassa")
                  setError("")
                }}
                className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "yookassa"
                    ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                    : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          paymentMethod === "yookassa"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <CreditCard size={16} />
                      </div>
                      <span className="text-xs font-semibold leading-tight text-foreground block">
                        Онлайн ЮKassa
                      </span>
                    </div>

                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                      +15%
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Карты МИР, Visa, Mastercard, СБП, SberPay, T-Pay через шлюз ЮKassa (+15%).
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2">
                  <span className="text-[11px] font-medium text-foreground">
                    Чек на email
                  </span>
                  {paymentMethod === "yookassa" ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={11} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                </div>
              </button>
            </div>

            {isStorePayment && (
              <p className="mt-3 rounded-lg bg-primary/10 p-2.5 text-xs text-foreground">
                * При оплате на кассе (наличными или картой в терминале) доступен самовывоз из шоурума в Химках после личной проверки техники.
              </p>
            )}
          </div>

          {/* 2. Блок способа получения */}
          <div className="rounded-card border border-border bg-card p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight">
                  Способ получения
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isStorePayment
                    ? "Для оплаты на кассе выдача осуществляется в шоуруме Orange MSK"
                    : "Выберите подходящий способ получения вашего заказа"}
                </p>
              </div>
              <Link
                href="/delivery"
                target="_blank"
                className="text-xs text-primary transition-colors hover:underline"
              >
                Все условия доставки →
              </Link>
            </div>

            {/* Выбор тарифов доставки */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {DELIVERY_OPTIONS.map((opt) => {
                const isSelected = effectiveDeliveryMethod === opt.id
                // При оплате на кассе курьерская доставка недоступна
                const isDisabled = isStorePayment && opt.id !== "pickup"
                const Icon =
                  opt.id === "pickup"
                    ? Store
                    : opt.id === "cdek"
                    ? PackageCheck
                    : Truck

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled) {
                        setDeliveryMethod(opt.id)
                        setError("")
                      }
                    }}
                    className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      isDisabled
                        ? "cursor-not-allowed opacity-40 border-border bg-muted/20"
                        : isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <span className="text-sm font-semibold leading-tight text-foreground block">
                              {opt.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {opt.subtitle}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground shrink-0">
                          {opt.badge}
                        </span>
                      </div>

                      <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                        {opt.description}
                      </p>
                    </div>

                    <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2.5">
                      <span
                        className={`text-sm font-bold ${
                          opt.id === "pickup"
                            ? "text-green-600 dark:text-green-400"
                            : "text-foreground"
                        }`}
                      >
                        {opt.priceDisplay}
                      </span>
                      {isSelected ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="h-5 w-5 rounded-full border border-border" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Дополнительная информация для выбранного способа */}
            {isPickup ? (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">
                      Пункт выдачи и шоурум Orange MSK:
                    </div>
                    <div className="text-muted-foreground">
                      М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-border/60 sm:grid-cols-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary shrink-0" />
                    <span>Ежедневно с 10:00 до 19:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-primary shrink-0" />
                    <a
                      href="tel:+79892058377"
                      className="hover:text-primary transition-colors font-medium"
                    >
                      +7 (989) 205-83-77
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary shrink-0" />
                  <span>
                    Проверка и тест техники на месте перед оплатой • Бесплатная парковка
                  </span>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <a
                    href="https://yandex.ru/maps/-/CXqmFXmF"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    Посмотреть маршрут на Яндекс.Картах →
                  </a>
                </div>
              </div>
            ) : isCdek ? (
              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <PackageCheck size={15} className="text-primary shrink-0" />
                  <span>Доставка транспортной компанией СДЭК по всей России</span>
                </div>
                <p className="leading-relaxed">
                  Отправка заказов проверенной транспортной компанией СДЭК до двери или в пункт выдачи в вашем городе. Полная страховка посылки и трек-номер для отслеживания.
                </p>
                <p className="text-[11px] font-medium text-foreground/80">
                  * Отправка при 100% онлайн-оплате техники. Доставка оплачивается при получении по тарифам СДЭК.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck size={15} className="text-primary shrink-0" />
                <span>
                  {effectiveDeliveryMethod === "moscow"
                    ? "Доставка курьерской службой по Москве в согласованный интервал времени."
                    : "Доставка курьерской службой до двери по Подмосковью. Согласование времени с водителем."}
                </span>
              </div>
            )}
          </div>

          {/* 3. Блок контактных данных получателя */}
          <div className="rounded-card border border-border bg-card p-5">
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-base font-bold tracking-tight">
                Контактные данные
              </h2>
              <p className="text-xs text-muted-foreground">
                Укажите данные получателя для подтверждения заказа и оформления
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Имя и фамилия <span className="text-primary">*</span></span>
                  {!isNameValid && recipientName && (
                    <span className="text-[10px] text-red-500">Минимум 2 буквы</span>
                  )}
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Иван Иванов"
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm transition-colors focus:outline-none ${
                    !isNameValid && recipientName
                      ? "border-red-400 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Номер телефона <span className="text-primary">*</span></span>
                  {!isPhoneValid && phone && (
                    <span className="text-[10px] text-red-500">Укажите телефон</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 000-00-00"
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm transition-colors focus:outline-none ${
                    !isPhoneValid && phone
                      ? "border-red-400 focus:border-red-500"
                      : "border-border focus:border-primary"
                  }`}
                />
              </div>

              <div>
                <label className="mb-1 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Email (для подтверждения и чека) <span className="text-primary">*</span></span>
                  {!isEmailValid && email && (
                    <span className="text-[10px] text-red-500">Некорректный email</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ivanov@example.com"
                    className={`h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm transition-colors focus:outline-none ${
                      !isEmailValid && email
                        ? "border-red-400 focus:border-red-500"
                        : "border-border focus:border-primary"
                    }`}
                  />
                  <Mail
                    size={15}
                    className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Соцсеть / Telegram / WhatsApp <span className="text-[11px] font-normal text-muted-foreground">(опционально)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={social}
                    onChange={(e) => setSocial(e.target.value)}
                    placeholder="@telegram_handle или ссылка на соцсеть"
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm transition-colors focus:border-primary focus:outline-none"
                  />
                  <MessageSquare
                    size={15}
                    className="pointer-events-none absolute left-3 top-3 text-muted-foreground"
                  />
                </div>
              </div>

              {!isPickup && (
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    {selectedOption.addressLabel}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={selectedOption.addressPlaceholder}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {effectiveDeliveryMethod === "moscow" &&
                      "Укажите улицу, номер дома, подъезд и квартиру в Москве"}
                    {effectiveDeliveryMethod === "mo" &&
                      "Укажите город или населённый пункт Московской области, улицу, дом и квартиру"}
                    {effectiveDeliveryMethod === "cdek" &&
                      "Укажите город и адрес ПВЗ СДЭК (или адрес для курьерской доставки СДЭК)"}
                  </p>
                </div>
              )}
            </div>

            {/* Уведомление о связи менеджера */}
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <Clock size={16} className="text-primary shrink-0" />
              <span>
                Менеджер Orange MSK свяжется с вами в течение 15 минут для подтверждения заказа.
              </span>
            </div>
          </div>
        </div>

        {/* Сайдбар с итоговой суммой */}
        <aside className="h-fit w-full shrink-0 rounded-card border border-border p-5 lg:w-80">
          <h2 className="mb-4 tracking-tight text-lg font-bold">Итого</h2>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Товары ({totalItems})</dt>
              <dd className="font-medium">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Доставка</dt>
              <dd className="font-medium">
                {isPickup ? (
                  <span className="text-green-600 dark:text-green-400">
                    Бесплатно (0 ₽)
                  </span>
                ) : isCdek ? (
                  <span className="text-foreground">
                    По тарифам СДЭК
                  </span>
                ) : (
                  formatPrice(delivery)
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Оплата</dt>
              <dd className="font-medium text-xs text-foreground">
                {paymentMethod === "cash_in_store"
                  ? "Наличными в магазине"
                  : paymentMethod === "card_terminal_in_store"
                  ? "Картой в терминале (+15%)"
                  : "Онлайн через ЮKassa (+15%)"}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-base">
              <dt className="font-semibold">К оплате</dt>
              <dd className="text-xl font-bold">{formatPrice(finalTotal)}</dd>
            </div>
          </dl>

          {!isCash && cashSubtotal < subtotal && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs leading-relaxed text-emerald-900 dark:text-emerald-300">
              💡 За наличные в шоуруме сумма: <strong>{formatPrice(cashSubtotal + delivery)}</strong> (экономия {formatPrice(subtotal - cashSubtotal)})
            </div>
          )}

          <div className="mt-4 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">
              {selectedOption.title} ({selectedOption.subtitle})
            </div>
            <p>{selectedOption.helperText}</p>
            {isCdek && (
              <p className="mt-1 font-medium text-foreground">
                * Оплата доставки СДЭК производится при получении посылки.
              </p>
            )}
          </div>

          {!isFormValid && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <p className="font-semibold mb-1">Для оформления заказа заполните:</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {!isNameValid && <li>Имя и фамилию</li>}
                {!isPhoneValid && <li>Номер телефона</li>}
                {!isEmailValid && <li>Email</li>}
                {!isAddressValid && <li>Адрес доставки</li>}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading || !isFormValid}
            className="mt-5 flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
            ) : isStorePayment ? (
              "Оформить заказ"
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
