"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, Phone, Search, ShoppingCart, User, X } from "lucide-react"
import { categories } from "@/lib/products"
import { useCart } from "@/components/cart-provider"
import { Logo } from "@/components/logo"

export function SiteHeader() {
  const { totalItems } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
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

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <Link href="/" className="shrink-0" aria-label="Orange MSK — на главную">
          <Logo />
        </Link>

        <form
          className="ml-2 hidden flex-1 items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5 md:flex"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={18} className="text-muted-foreground" />
          <input
            type="search"
            placeholder="Искать смартфоны, ноутбуки, наушники…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <Link
            href="/catalog"
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted md:flex"
          >
            <User size={18} />
            Войти
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Корзина</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-xs font-bold text-navy-foreground">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center justify-center rounded-full p-2.5 text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <nav aria-label="Категории" className="hidden border-t border-border md:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={`/catalog?category=${category.slug}`}
                className="block whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {category.name}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link
              href="/catalog?sale=1"
              className="block whitespace-nowrap px-3 py-3 text-sm font-semibold text-primary"
            >
              Скидки
            </Link>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <form
            className="flex items-center gap-2 border-b border-border px-4 py-3"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={18} className="text-muted-foreground" />
            <input
              type="search"
              placeholder="Поиск товаров"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </form>
          <ul className="flex flex-col p-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/catalog?category=${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="tel:+74951234567"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary"
              >
                +7 (495) 123-45-67
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
