import Link from "next/link"
import { ArrowRight, Banknote, Clock, Package, ShoppingBag } from "lucide-react"
import { getAdminStats } from "@/lib/admin/queries"
import { formatPrice } from "@/lib/products"

function StatCard({
  icon: Icon,
  value,
  label,
  href,
  accent,
}: {
  icon: typeof Package
  value: string | number
  label: string
  href: string
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-card border p-5 transition-colors ${
        accent
          ? "border-primary/40 bg-primary/[0.04] hover:bg-primary/[0.08]"
          : "border-border hover:border-primary/40 hover:bg-primary/[0.03]"
      }`}
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

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Обзор</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управление каталогом и заказами Orange MSK.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Package} value={stats.products} label="Товаров" href="/admin/products" />
        <StatCard icon={ShoppingBag} value={stats.orders} label="Заказов" href="/admin/orders" />
        <StatCard
          icon={Clock}
          value={stats.pending}
          label="Новых заказов"
          href="/admin/orders?status=new"
          accent={stats.pending > 0}
        />
        <StatCard
          icon={Banknote}
          value={formatPrice(stats.revenue)}
          label="Выручка (доставлено)"
          href="/admin/orders?status=done"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/products/new"
          className="flex items-center justify-between gap-4 rounded-card border border-border p-6 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
        >
          <div>
            <p className="font-semibold">Добавить товар</p>
            <p className="mt-1 text-sm text-muted-foreground">Создать новую карточку в каталоге</p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center justify-between gap-4 rounded-card border border-border p-6 transition-colors hover:border-primary/40 hover:bg-primary/[0.03]"
        >
          <div>
            <p className="font-semibold">Обработать заказы</p>
            <p className="mt-1 text-sm text-muted-foreground">Сменить статусы и проверить детали</p>
          </div>
          <ArrowRight size={20} className="text-primary" />
        </Link>
      </div>
    </div>
  )
}
