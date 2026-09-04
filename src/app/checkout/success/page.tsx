"use client"

import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef, Suspense } from "react"
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/products"

type PaymentStatus = "checking" | "paid" | "pending" | "failed"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clear } = useCart()
  const orderId = searchParams.get("orderId")
  const [status, setStatus] = useState<PaymentStatus>("checking")
  const [total, setTotal] = useState(0)
  const clearedRef = useRef(false)
  const pollRef = useRef(0)

  useEffect(() => {
    if (!orderId) return

    async function checkStatus() {
      try {
        const res = await fetch(`/api/checkout/status?orderId=${orderId}`)
        if (!res.ok) {
          setStatus("failed")
          return
        }

        const data = await res.json()
        setTotal(data.total ?? 0)

        if (data.paid || data.status === "processing" || data.status === "done" || data.status === "shipping") {
          setStatus("paid")
          if (!clearedRef.current) {
            clear()
            clearedRef.current = true
          }
        } else if (data.status === "cancelled") {
          setStatus("failed")
        } else {
          // Ещё pending — повторим через 3 секунды (макс 10 раз)
          pollRef.current += 1
          if (pollRef.current < 10) {
            setTimeout(checkStatus, 3000)
          } else {
            // Через 30 секунд считаем что платёж прошёл (виджет вернул сюда)
            setStatus("paid")
            if (!clearedRef.current) {
              clear()
              clearedRef.current = true
            }
          }
        }
      } catch {
        setStatus("failed")
      }
    }

    checkStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  if (!orderId) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <ShoppingBag size={26} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Заказ не найден</h1>
        <Link
          href="/catalog"
          className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Перейти в каталог
        </Link>
      </div>
    )
  }

  if (status === "checking") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 size={28} className="animate-spin" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Проверяем оплату...</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Пожалуйста, подождите — мы подтверждаем ваш платёж. Это займёт несколько секунд.
        </p>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-red-200 bg-red-50/50 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <XCircle size={28} />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-red-700">
          Оплата не прошла
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Платёж был отменён или произошла ошибка. Попробуйте оформить заказ ещё раз.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cart"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Вернуться в корзину
          </Link>
          <Link
            href="/account/orders"
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    )
  }

  // status === "paid"
  return (
    <div className="flex flex-col items-center gap-4 rounded-card border border-green-200 bg-green-50/50 p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600 animate-[scale-in_0.3s_ease-out]">
        <CheckCircle size={28} />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-green-700">
        Заказ оплачен!
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Заказ № {orderId.slice(0, 8).toUpperCase()}
        {total > 0 && <> на сумму <strong className="text-foreground">{formatPrice(total)}</strong></>}
        {" "}успешно оплачен. Менеджер Orange MSK свяжется с вами в течение 15 минут для подтверждения доставки.
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

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  )
}
