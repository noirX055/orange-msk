"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, Clock, MapPin, Package, Phone, ShoppingBag, Truck, User, XCircle } from "lucide-react"
import type { YandexMarketOrder } from "@/lib/yandex-market/types"

interface Props {
  orders: YandexMarketOrder[]
  isConfigured: boolean
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PROCESSING":
      return {
        label: "В обработке",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Clock,
      }
    case "DELIVERY":
      return {
        label: "В доставке",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Truck,
      }
    case "PICKUP":
      return {
        label: "В пункте выдачи",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Package,
      }
    case "DELIVERED":
      return {
        label: "Доставлен",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      }
    case "CANCELLED":
      return {
        label: "Отменён",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      }
    default:
      return {
        label: status,
        className: "bg-muted text-muted-foreground border-border",
        icon: ShoppingBag,
      }
  }
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function MarketOrdersList({ orders, isConfigured }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "ALL") return true
    return o.status === filterStatus
  })

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
        <ShoppingBag size={40} className="text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">Интеграция не настроена</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Укажите API-ключ и ID кампании во вкладке «Настройки API», чтобы просматривать заказы из Яндекс.Маркета
        </p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
        <ShoppingBag size={40} className="text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">Заказов пока нет</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          Заказы, оформленные покупателями на Яндекс.Маркете, будут отображаться здесь
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">Фильтр по статусу:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "Все" },
              { id: "PROCESSING", label: "В обработке" },
              { id: "DELIVERY", label: "В доставке" },
              { id: "DELIVERED", label: "Доставлены" },
              { id: "CANCELLED", label: "Отменены" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  filterStatus === f.id
                    ? "bg-navy text-navy-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-muted-foreground">
          Заказов: {filteredOrders.length} из {orders.length}
        </span>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {filteredOrders.map((order) => {
          const badge = getStatusBadge(order.status)
          const StatusIcon = badge.icon

          return (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-foreground/20"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-foreground">
                    Заказ #{order.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge.className}`}
                  >
                    <StatusIcon size={12} />
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={13} />
                  <span>{formatDate(order.creationDate)}</span>
                </div>
              </div>

              {/* Order Info & Customer */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                {/* Buyer */}
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <User size={13} className="text-primary" /> Покупатель
                  </span>
                  <span>
                    {order.buyer
                      ? `${order.buyer.lastName || ""} ${order.buyer.firstName || ""}`.trim() || "Покупатель Маркета"
                      : "Покупатель Маркета"}
                  </span>
                  {order.buyer?.phone && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Phone size={11} /> {order.buyer.phone}
                    </span>
                  )}
                </div>

                {/* Delivery */}
                <div className="flex flex-col gap-1 text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Truck size={13} className="text-primary" /> Доставка
                  </span>
                  <span>{order.delivery?.serviceName || order.delivery?.type || "Стандартная"}</span>
                  {order.delivery?.address && (
                    <span className="flex items-start gap-1 text-[11px]">
                      <MapPin size={11} className="shrink-0 mt-0.5" />
                      {`${order.delivery.address.city || ""}, ${order.delivery.address.street || ""} ${order.delivery.address.house || ""}`}
                    </span>
                  )}
                </div>

                {/* Total */}
                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1 lg:items-end">
                  <span className="text-xs text-muted-foreground">Сумма заказа:</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Оплата: {order.paymentType === "PREPAID" ? "Предоплата" : "При получении"}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              {order.items && order.items.length > 0 && (
                <div className="mt-1 rounded-xl bg-muted/30 p-3">
                  <span className="text-[11px] font-semibold text-foreground mb-2 block">
                    Товары в заказе ({order.items.length}):
                  </span>
                  <div className="divide-y divide-border/60">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.offerName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            (SKU: {item.offerId})
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-muted-foreground">{item.count} шт.</span>
                          <span className="font-semibold text-foreground">
                            {formatPrice(item.price * item.count)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
