"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, LayoutGrid, LogOut, MapPin, Package, User } from "lucide-react"
import { signOut } from "@/app/account/actions"

const links = [
  { href: "/account", label: "Обзор", icon: LayoutGrid, exact: true },
  { href: "/account/orders", label: "Мои заказы", icon: Package },
  { href: "/account/favorites", label: "Избранное", icon: Heart },
  { href: "/account/addresses", label: "Адреса доставки", icon: MapPin },
  { href: "/account/profile", label: "Профиль", icon: User },
]

export function AccountSidebar() {
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

      <form action={signOut} className="mt-2 border-t border-border pt-2">
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
