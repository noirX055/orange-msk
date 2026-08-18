"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ImageIcon, LayoutGrid, LogOut, Package, Settings, ShoppingBag, Store } from "lucide-react"
import { signOut } from "@/app/account/actions"

const links = [
  { href: "/admin", label: "Обзор", icon: LayoutGrid, exact: true },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/orders", label: "Заказы", icon: ShoppingBag },
  { href: "/admin/banners", label: "Баннеры", icon: ImageIcon },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "bg-navy text-navy-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon size={18} />
            {link.label}
          </Link>
        )
      })}

      <Link
        href="/"
        className="mt-2 flex items-center gap-3 rounded-xl border-t border-border px-4 py-3 pt-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Store size={18} />
        На сайт
      </Link>

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Выйти
        </button>
      </form>
    </nav>
  )
}
