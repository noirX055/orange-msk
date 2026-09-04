"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState, Suspense } from "react"
import { ShieldCheck, CreditCard, Lock } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/products"

declare global {
  interface Window {
    YooMoneyCheckoutWidget: new (config: {
      confirmation_token: string
      return_url?: string
      error_callback?: (error: unknown) => void
      customization?: {
        modal?: boolean
      }
    }) => {
      render: (containerId: string) => void
      destroy: () => void
    }
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { totalPrice, items } = useCart()
  const token = searchParams.get("token")
  const orderId = searchParams.get("orderId")
  const widgetRef = useRef<ReturnType<Window["YooMoneyCheckoutWidget"]["prototype"]["render"]> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const mountedRef = useRef(false)

  useEffect(() => {
    if (!token || !orderId || mountedRef.current) return
    mountedRef.current = true

    const script = document.createElement("script")
    script.src = "https://yookassa.ru/checkout-widget/v1/checkout-widget.js"
    script.async = true

    script.onload = () => {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

        const checkout = new window.YooMoneyCheckoutWidget({
          confirmation_token: token,
          return_url: `${siteUrl}/checkout/success?orderId=${orderId}`,
          error_callback: (err) => {
            console.error("[YooKassa Widget] Ошибка:", err)
            setError("Произошла ошибка при оплате. Попробуйте ещё раз.")
          },
        })

        checkout.render("yookassa-payment-widget")
        setLoading(false)
      } catch (err) {
        console.error("[YooKassa Widget] Ошибка инициализации:", err)
        setError("Не удалось загрузить форму оплаты")
        setLoading(false)
      }
    }

    script.onerror = () => {
      setError("Не удалось загрузить скрипт оплаты")
      setLoading(false)
    }

    document.head.appendChild(script)

    return () => {
      // Не удаляем скрипт при unmount, чтобы виджет работал
    }
  }, [token, orderId, router])

  if (!token || !orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Ошибка оплаты</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Недостаточно данных для оплаты. Вернитесь в корзину и попробуйте снова.
        </p>
        <button
          onClick={() => router.push("/cart")}
          className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Вернуться в корзину
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Оплата заказа</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Заказ № {orderId.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Виджет оплаты */}
        <div className="flex-1">
          <div className="rounded-card border border-border bg-card p-5">
            {loading && (
              <div className="flex flex-col items-center gap-3 py-12">
                <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
                <p className="text-sm text-muted-foreground">Загрузка формы оплаты...</p>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm font-medium text-red-700">{error}</p>
                <button
                  onClick={() => router.push("/cart")}
                  className="mt-3 text-sm font-semibold text-red-700 underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  Вернуться в корзину
                </button>
              </div>
            )}

            <div id="yookassa-payment-widget" />
          </div>

          {/* Безопасность */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lock size={14} />
            <span>Платёж защищён шифрованием SSL. Данные карты не хранятся на нашем сервере.</span>
          </div>
        </div>

        {/* Сайдбар с итогом */}
        <aside className="h-fit w-full shrink-0 lg:w-72">
          <div className="rounded-card border border-border p-5">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight">
              <CreditCard size={18} />
              Итого
            </h2>

            {items.length > 0 && (
              <ul className="mb-4 flex flex-col gap-2">
                {items.slice(0, 5).map((item) => (
                  <li
                    key={`${item.id}-${item.color ?? ""}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="line-clamp-1 text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
                {items.length > 5 && (
                  <li className="text-xs text-muted-foreground">
                    и ещё {items.length - 5} товаров...
                  </li>
                )}
              </ul>
            )}

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">К оплате</span>
                <span className="text-xl font-bold">
                  {totalPrice > 0 ? formatPrice(totalPrice) : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 rounded-card bg-muted p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ShieldCheck size={14} className="text-green-600" />
              Безопасная оплата
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Оплата проходит через сертифицированный шлюз ЮKassa. Мы принимаем Visa, Mastercard,
              Мир, СБП, SberPay и T-Pay.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
