import Link from "next/link"
import { Package } from "lucide-react"
import { getOrders, ORDER_STATUS } from "@/lib/account/queries"
import { formatPrice } from "@/lib/products"
import { ProductVisual } from "@/components/product-visual"

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мои заказы</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length > 0
            ? `Всего заказов: ${orders.length}`
            : "История ваших покупок появится здесь."}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Package size={26} />
          </span>
          <p className="text-sm text-muted-foreground">У вас пока нет заказов.</p>
          <Link
            href="/catalog"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-card border border-border">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      № {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS[order.status].tone}`}
                    >
                      {ORDER_STATUS[order.status].label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="text-lg font-bold">{formatPrice(order.total)}</span>
              </div>

              <ul className="flex flex-col divide-y divide-border">
                {order.order_items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 p-4">
                    <ProductVisual
                      category={item.category ?? "smartphones"}
                      className="h-16 w-16 shrink-0 rounded-lg"
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
                  </li>
                ))}
              </ul>

              {order.address && (
                <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                  Доставка: {order.address}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
