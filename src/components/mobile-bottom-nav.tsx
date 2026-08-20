"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react"
import { useCart } from "@/components/cart-provider"

const tabs = [
  { href: "/", label: "Главная", Icon: Home },
  { href: "/catalog", label: "Каталог", Icon: LayoutGrid },
  { href: "/favorites", label: "Избранное", Icon: Heart },
  { href: "/cart", label: "Корзина", Icon: ShoppingBag },
  { href: "/account", label: "Профиль", Icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  return (
    <nav className="fixed bottom-2 left-2 right-2 z-50 rounded-2xl border border-border bg-background/90 shadow-lg backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map(({ href, label, Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname?.startsWith(href)
          
          return (
            <li key={href}>
              <Link
                href={href}
                className={`group flex flex-col items-center gap-0.5 px-3 py-2.5 text-[11px] font-medium transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-90"
                }`}
              >
                <span className="relative transition-transform duration-200 group-active:scale-90">
                  <span className={`absolute -inset-2 rounded-full transition-all duration-300 ${
                    isActive ? "bg-primary/10 scale-100" : "scale-0 bg-transparent"
                  }`} />
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} className="relative" />
                  {label === "Корзина" && totalItems > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </span>
                <span className={`transition-all duration-200 ${isActive ? "font-semibold" : ""}`}>
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      {/* Safe area for phones with gesture bars */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
