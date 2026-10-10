import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { getAllOrders } from "@/lib/admin/queries"
import { ORDER_STATUS, type OrderStatus } from "@/lib/account/queries"
import { formatPrice } from "@/lib/products"

const filters: { value: string; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "processing", label: "Оплачены (ЮKassa)" },
  { value: "new", label: "Новые (на кассе)" },
  { value: "pending_payment", label: "Ожидают оплаты" },
  { value: "shipping", label: "В доставке" },
  { value: "done", label: "Выданы / Доставлены" },
  { value: "refunded", label: "Возвращённые" },
  { value: "cancelled", label: "Отменённые" },
]

const VALID = new Set(Object.keys(ORDER_STATUS))

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const active = status && VALID.has(status) ? (status as OrderStatus) : undefined
  const orders = await getAllOrders(active)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Заказы</h1>
        <p className="mt-1 text-sm text-muted-foreground">Всего показано: {orders.length}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = (filter.value === "all" && !active) || filter.value === active
          const href = filter.value === "all" ? "/admin/orders" : `/admin/orders?status=${filter.value}`
          return (
            <Link
              key={filter.value}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy text-navy-foreground"
                  : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {filter.label}
            </Link>
          )
        })}
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingBag size={26} />
          </span>
          <p className="text-sm text-muted-foreground">Заказов не найдено.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Заказ</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Покупатель</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Оплата</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Дата</th>
                <th className="px-4 py-3 font-semibold">Сумма</th>
                <th className="px-4 py-3 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const isPaidYookassa = Boolean(order.payment_id) && order.status === "processing"
                const isCash = order.comment?.toLowerCase().includes("наличными") || order.comment?.toLowerCase().includes("кассе")
                const paymentBadgeText = isPaidYookassa
                  ? "Оплачен (ЮKassa)"
                  : order.payment_id
                  ? "ЮKassa"
                  : isCash
                  ? "На кассе"
                  : "—"

                return (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold transition-colors hover:text-primary"
                      >
                        № {order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <p className="text-xs text-muted-foreground">{order.order_items.length} тов.</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <div className="font-medium text-foreground">
                        {order.buyer_name || order.recipient_name || "—"}
                      </div>
                      {order.phone && (
                        <div className="text-xs text-muted-foreground">{order.phone}</div>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-xs md:table-cell">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 font-medium ${
                          isPaidYookassa
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : order.payment_id
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {paymentBadgeText}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {new Date(order.created_at).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS[order.status].tone}`}
                      >
                        {ORDER_STATUS[order.status].label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
