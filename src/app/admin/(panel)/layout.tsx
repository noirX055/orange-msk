import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { requireAdmin } from "@/lib/admin/guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

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

  const sidebarContent = (
    <>
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
    </>
  )

  return (
    <AdminLayoutClient sidebar={sidebarContent}>
      {children}
    </AdminLayoutClient>
  )
}
