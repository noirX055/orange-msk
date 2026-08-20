"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, LayoutGrid, Heart, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/cart-provider"

const tabs = [
  { href: "/", label: "Главная", Icon: Home },
  { href: "/catalog", label: "Каталог", Icon: LayoutGrid },
  { href: "/favorites", label: "Избранное", Icon: Heart },
  { href: "/cart", label: "Корзина", Icon: ShoppingBag },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { totalItems } = useCart()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden">
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
                className={`flex flex-col items-center gap-0.5 px-4 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <span className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {label === "Корзина" && totalItems > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                      {totalItems}
                    </span>
                  )}
                </span>
                {label}
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
