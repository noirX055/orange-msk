import Link from "next/link"
import { ArrowRight, Heart, MapPin, Package } from "lucide-react"
import { getAddresses, getFavorites, getOrders, getProfile, ORDER_STATUS } from "@/lib/account/queries"
import { formatPrice } from "@/lib/products"

function StatCard({
  href,
  icon: Icon,
  value,
  label,
}: {
  href: string
  icon: typeof Package
  value: number
  label: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-card border border-border p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-navy transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  )
}

export default async function AccountDashboard() {
  const [profile, orders, favorites, addresses] = await Promise.all([
    getProfile(),
    getOrders(),
    getFavorites(),
    getAddresses(),
  ])

  const name = profile?.full_name?.trim() || "Покупатель"
  const lastOrder = orders[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Здравствуйте, {name}!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Здесь собраны ваши заказы, избранное и настройки.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard href="/account/orders" icon={Package} value={orders.length} label="Заказов" />
        <StatCard href="/account/favorites" icon={Heart} value={favorites.length} label="В избранном" />
        <StatCard href="/account/addresses" icon={MapPin} value={addresses.length} label="Адресов" />
      </div>

      <div className="rounded-card border border-border p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Последний заказ</h2>
          {orders.length > 0 && (
            <Link
              href="/account/orders"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Все заказы
              <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {lastOrder ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="font-semibold">№ {lastOrder.id.slice(0, 8).toUpperCase()}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_STATUS[lastOrder.status].tone}`}
                >
                  {ORDER_STATUS[lastOrder.status].label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(lastOrder.created_at).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {lastOrder.order_items.length} тов.
              </p>
            </div>
            <span className="text-xl font-bold">{formatPrice(lastOrder.total)}</span>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">У вас пока нет заказов.</p>
            <Link
              href="/catalog"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Перейти в каталог
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
