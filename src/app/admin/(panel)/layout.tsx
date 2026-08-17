import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export const metadata: Metadata = {
  title: "Админ-панель — Orange MSK",
  description: "Управление товарами и заказами Orange MSK",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile } = await requireAdmin()
  const name = profile.full_name?.trim() || "Администратор"

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="w-full shrink-0 border-b border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-navy-foreground">
            <ShieldCheck size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">Orange MSK</p>
            <p className="text-xs text-muted-foreground">Админ-панель</p>
          </div>
        </div>

        <div className="border-b border-border p-4">
          <p className="truncate text-sm font-semibold">{name}</p>
          <Link href="/account" className="text-xs text-muted-foreground transition-colors hover:text-primary">
            Личный кабинет
          </Link>
        </div>

        <div className="p-3 lg:flex-1 lg:overflow-y-auto">
          <AdminSidebar />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
