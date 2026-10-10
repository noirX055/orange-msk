import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, User, CreditCard, Mail, ExternalLink, MessageSquare, MapPin } from "lucide-react"
import { getOrderById } from "@/lib/admin/queries"
import { ORDER_STATUS } from "@/lib/account/queries"
import { formatPrice } from "@/lib/products"
import { ProductVisual } from "@/components/product-visual"
import { StatusSelect } from "@/components/admin/status-select"
import { removeOrderItem, deleteOrder } from "@/app/admin/actions"
import { DeleteButton } from "@/components/admin/delete-button"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import { RefundButton } from "@/components/admin/refund-button"
import { REFUNDABLE_ORDER_STATUSES } from "@/lib/account/types"

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) notFound()

  const canRefund =
    Boolean(order.payment_id) &&
    REFUNDABLE_ORDER_STATUSES.includes(order.status)

  // Парсинг структурированного комментария к заказу
  const comment = order.comment || ""
  let parsedEmail = ""
  let parsedSocial = ""
  let parsedPayment = ""

  if (comment) {
    const parts = comment.split(" | ")
    for (const part of parts) {
      if (part.startsWith("Email: ")) {
        parsedEmail = part.replace("Email: ", "").trim()
      } else if (part.startsWith("Соцсеть / Мессенджер: ")) {
        parsedSocial = part.replace("Соцсеть / Мессенджер: ", "").trim()
      } else if (part.startsWith("Способ оплаты: ")) {
        parsedPayment = part.replace("Способ оплаты: ", "").trim()
      }
    }
  }

  const isOnlinePaid = Boolean(order.payment_id) && order.status === "processing"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft size={16} />
          К заказам
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Заказ № {order.id.slice(0, 8).toUpperCase()}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS[order.status].tone}`}
            >
              {ORDER_STATUS[order.status].label}
            </span>
          </div>
          <StatusSelect id={order.id} status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(order.created_at).toLocaleString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Позиции */}
        <div className="lg:col-span-2">
          <div className="rounded-card border border-border">
            <div className="border-b border-border p-4">
              <h2 className="font-bold">Состав заказа</h2>
            </div>
            <ul className="flex flex-col divide-y divide-border">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-center gap-4 p-4">
                  <ProductVisual
                    category={item.category ?? "smartphones"}
                    className="h-14 w-14 shrink-0 rounded-lg"
                  />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <Link
                      href={`/product/${item.product_slug}`}
                      className="text-sm font-semibold transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {item.color && (
                      <span className="text-xs text-muted-foreground">Цвет: {item.color}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <form action={removeOrderItem}>
                    <input type="hidden" name="item_id" value={item.id} />
                    <input type="hidden" name="order_id" value={order.id} />
                    <DeleteButton confirmText="Убрать позицию из заказа?" label="Убрать позицию" />
                  </form>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-2 border-t border-border p-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Товары</dt>
                <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Доставка</dt>
                <dd className="font-medium">
                  {order.delivery === 0 ? "Бесплатно" : formatPrice(order.delivery)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <dt className="font-semibold">Итого</dt>
                <dd className="font-bold">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Покупатель + Оплата + действия */}
        <div className="flex flex-col gap-6">
          {/* Данные покупателя */}
          <div className="rounded-card border border-border p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold">
              <User size={18} />
              Данные клиента
            </h2>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Имя и фамилия</dt>
                <dd className="font-medium text-foreground">
                  {order.recipient_name || order.buyer_name || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Телефон</dt>
                <dd className="font-medium">
                  {order.phone ? (
                    <a href={`tel:${order.phone}`} className="text-primary hover:underline font-semibold">
                      {order.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              {parsedEmail && (
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd className="font-medium">
                    <a href={`mailto:${parsedEmail}`} className="text-primary hover:underline">
                      {parsedEmail}
                    </a>
                  </dd>
                </div>
              )}
              {parsedSocial && (
                <div>
                  <dt className="text-xs text-muted-foreground">Соцсеть / Мессенджер</dt>
                  <dd className="font-medium text-foreground break-all">
                    {parsedSocial}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Способ получения и адрес</dt>
                <dd className="font-medium text-foreground">
                  {order.address || "—"}
                </dd>
              </div>
              {order.comment && (
                <div className="pt-2 border-t border-border">
                  <dt className="text-xs text-muted-foreground mb-0.5">Примечание к заказу</dt>
                  <dd className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg leading-relaxed">
                    {order.comment}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Чек и статус оплаты */}
          <div className="rounded-card border border-border p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold">
              <CreditCard size={18} />
              Оплата и чек
            </h2>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Статус оплаты</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS[order.status].tone}`}
                  >
                    {isOnlinePaid
                      ? "Оплачен онлайн через ЮKassa"
                      : order.payment_id
                      ? "Ожидает онлайн-оплаты в ЮKassa"
                      : parsedPayment || "Оплата на кассе (наличные / терминал)"}
                  </span>
                </dd>
              </div>

              {parsedPayment && (
                <div>
                  <dt className="text-xs text-muted-foreground">Выбранный способ</dt>
                  <dd className="font-medium text-foreground">{parsedPayment}</dd>
                </div>
              )}

              {order.payment_id ? (
                <div className="pt-2 border-t border-border">
                  <dt className="text-xs text-muted-foreground">Идентификатор платежа ЮKassa</dt>
                  <dd className="font-mono text-xs text-foreground mt-0.5 break-all">
                    {order.payment_id}
                  </dd>
                  <a
                    href={`https://yookassa.ru/my/payments?search=${order.payment_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Открыть в кабинете ЮKassa</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              ) : (
                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  Заказ без онлайн-платежа ЮKassa. Расчёт производится на кассе при получении.
                </div>
              )}
            </dl>
          </div>

          {canRefund && <RefundButton orderId={order.id} total={order.total} />}

          <form action={deleteOrder} className="rounded-card border border-red-200 bg-red-50/50 p-5">
            <input type="hidden" name="id" value={order.id} />
            <h2 className="font-bold text-red-700">Удалить заказ</h2>
            <p className="mt-1 text-xs text-red-700/80">
              Действие необратимо: заказ и его позиции будут удалены.
            </p>
            <ConfirmSubmit
              confirmText="Удалить заказ безвозвратно?"
              className="mt-3 flex h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Удалить заказ
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </div>
  )
}
