"use client"

import Link from "next/link"
import { Phone, ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Logo } from "@/components/logo"
import { SearchBox } from "@/components/search-box"
import { AccountMenu } from "@/components/account/account-menu"
import { MegaMenu } from "@/components/mega-menu"

export function SiteHeader() {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      {/* Top bar — desktop only */}
      <div className="hidden bg-navy text-navy-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 text-xs">
          <p className="text-navy-foreground/80">Доставка по Москве за 2 часа — бесплатно от 5 000 ₽</p>
          <div className="flex items-center gap-6">
            <Link href="/catalog" className="text-navy-foreground/80 transition-colors hover:text-primary">
              Гарантия и сервис
            </Link>
            <a href="tel:+74951234567" className="flex items-center gap-2 font-medium hover:text-primary">
              <Phone size={14} />
              +7 (495) 123-45-67
            </a>
          </div>
        </div>
      </div>

      {/* Mobile header: logo + search + login */}
      <div className="flex items-center gap-3 px-3 py-2.5 md:hidden">
        <Link href="/" className="shrink-0" aria-label="Orange MSK — на главную">
          <Logo />
        </Link>
        <div className="flex-1">
          <SearchBox placeholder="Поиск" />
        </div>
        <AccountMenu />
      </div>

      {/* Desktop header: logo + search + account + cart */}
      <div className="mx-auto hidden max-w-7xl items-center gap-4 px-4 py-4 md:flex">
        <Link href="/" className="shrink-0" aria-label="Orange MSK — на главную">
          <Logo />
        </Link>

        <div className="ml-2 flex-1">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <AccountMenu />
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingCart size={18} />
            Корзина
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-xs font-bold text-navy-foreground">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Category mega-menu — desktop only */}
      <MegaMenu />
    </header>
  )
}
