import Link from "next/link"
import type { Metadata } from "next"
import {
  ShoppingBag,
  Home,
  Search,
  Smartphone,
  Laptop,
  Headphones,
  Tablet,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { RecentlyViewed } from "@/components/recently-viewed"

export const metadata: Metadata = {
  title: "Страница не найдена (404) — Orange MSK",
  description: "Запрашиваемая страница не существует или была перемещена. Перейдите в каталог электроники Orange MSK.",
}

const popularCategories = [
  {
    icon: Smartphone,
    title: "Смартфоны",
    href: "/catalog/apple/iphone",
  },
  {
    icon: Laptop,
    title: "Ноутбуки",
    href: "/catalog/apple/macbook",
  },
  {
    icon: Tablet,
    title: "Планшеты",
    href: "/catalog/apple/ipad",
  },
  {
    icon: Headphones,
    title: "Наушники и аудио",
    href: "/catalog/accessories",
  },
  {
    icon: Sparkles,
    title: "Товары со скидкой",
    href: "/catalog?sale=1",
  },
]

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* Декоративный бейдж */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          Ошибка 404
        </span>

        {/* Большой стильный номер */}
        <div className="relative my-2 select-none">
          <span className="text-7xl font-extrabold tracking-tight text-primary/15 sm:text-8xl md:text-9xl">
            404
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          Страница не найдена
        </h1>

        <div className="mx-auto my-3 h-1 w-10 rounded-full bg-primary" />

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Возможно, адрес страницы набран с ошибкой, страница была перемещена или товар временно закончился на складе.
        </p>

        {/* Кнопки основных действий */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:brightness-110 active:scale-95"
          >
            <ShoppingBag size={17} />
            Перейти в каталог
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
          >
            <Home size={17} />
            На главную
          </Link>

          <Link
            href="/catalog?q="
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
          >
            <Search size={17} />
            Поиск товаров
          </Link>
        </div>

        {/* Быстрые разделы каталога */}
        <div className="mt-12 rounded-card border border-border bg-card p-6 text-left sm:p-7">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Популярные разделы каталога
            </h2>
            <Link
              href="/catalog"
              className="flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:underline"
            >
              Все товары
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {popularCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.title}
                  href={cat.href}
                  className="group flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/40 p-3 text-xs font-semibold text-foreground transition-all hover:border-primary/50 hover:bg-muted"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-xs transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon size={14} />
                  </div>
                  <span className="line-clamp-1">{cat.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Блок недавно просмотренных товаров, если посетитель уже что-то смотрел */}
      <RecentlyViewed className="mt-14 border-t border-border pt-10" />
    </div>
  )
}
