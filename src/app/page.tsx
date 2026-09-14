import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  RefreshCw,
  Truck,
} from "lucide-react"
import { BannerCarousel } from "@/components/banner-carousel"
import { ProductCard } from "@/components/product-card"
import { BrandLogo } from "@/components/brand-logo"
import { getProducts } from "@/lib/products/queries"
import { getBanners } from "@/lib/banners/queries"

const botCategories = [
  { name: "Lego", href: "/catalog?brand=Lego" },
  { name: "Dyson", href: "/catalog?brand=Dyson" },
  { name: "Samsung", href: "/catalog?brand=Samsung", fullWidth: true },
  { name: "Игровые консоли", href: "/catalog?search=PlayStation" },
  { name: "Аксессуары и Адаптеры", href: "/catalog?search=Адаптер" },
  { name: "AirPods", href: "/catalog?brand=Apple&search=AirPods" },
  { name: "Apple Watch", href: "/catalog?brand=Apple&search=Watch" },
  { name: "iPad", href: "/catalog?brand=Apple&search=iPad" },
  { name: "MacBook", href: "/catalog?brand=Apple&search=MacBook" },
  { name: "14", href: "/catalog?brand=Apple&search=14" },
  { name: "15", href: "/catalog?brand=Apple&search=15" },
  { name: "16", href: "/catalog?brand=Apple&search=16" },
  { name: "17", href: "/catalog?brand=Apple&search=17" },
  { name: "18", href: "/catalog?brand=Apple&search=18", fullWidth: true },
]

const brandOrder = ["Apple", "Samsung", "Xiaomi", "ASUS", "LG", "Sony", "Dyson"]

const benefits = [
  { title: "Доставка за 2 часа", text: "По Москве и в пределах МКАД", Icon: Truck },
  { title: "Официальная гарантия", text: "От 1 года на всю технику", Icon: BadgeCheck },
  { title: "Рассрочка 0%", text: "До 24 месяцев без переплат", Icon: CreditCard },
  { title: "Trade-in", text: "Обмен старого устройства", Icon: RefreshCw },
]

export default async function HomePage() {
  const products = await getProducts()
  const banners = await getBanners()
  const popular = products.slice(0, 8)
  const deals = products.filter((product) => product.oldPrice).slice(0, 4)
  const brandCards = brandOrder.filter((brand) =>
    products.some((product) => product.brand === brand),
  )

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6">
      <h1 className="sr-only">Orange MSK — магазин электроники в Москве</h1>
      <BannerCarousel banners={banners} />

      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="mb-4 text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Каталог
        </h2>
        {/* Telegram-style grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {botCategories.map(({ name, href, fullWidth }) => (
            <Link
              key={name}
              href={href}
              className={`group relative flex h-14 sm:h-16 items-center justify-center rounded-xl bg-[#1c2433] text-white shadow-sm transition-all hover:bg-[#253043] ${
                fullWidth ? "col-span-2 lg:col-span-2" : "col-span-1"
              }`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg">🍊</span>
                <span className="text-sm font-semibold tracking-tight sm:text-base">{name}</span>
                <span className="text-base sm:text-lg">🍊</span>
              </div>
              <ArrowRight
                size={14}
                className="absolute right-3 top-3 text-white/50 -rotate-45 transition-transform group-hover:text-white group-hover:scale-110"
              />
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="brands-title">
        <h2 id="brands-title" className="mb-6 text-2xl font-bold tracking-tight">
          Официальные бренды
        </h2>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {brandCards.map((brand) => (
            <li key={brand}>
              <Link
                href={`/catalog?brand=${encodeURIComponent(brand)}`}
                aria-label={brand}
                className="flex h-20 items-center justify-center rounded-card border border-border bg-card px-3 transition-colors hover:border-primary"
              >
                <BrandLogo brand={brand} size={24} />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="benefits-title">
        <h2 id="benefits-title" className="sr-only">
          Преимущества магазина
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ title, text, Icon }) => (
            <li key={title} className="flex items-start gap-3 rounded-card bg-muted p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs leading-relaxed text-muted-foreground">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="popular-title">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="popular-title" className="text-2xl font-bold tracking-tight">
            Популярные товары
          </h2>
          <Link
            href="/catalog"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Все товары
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {popular.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section aria-labelledby="deals-title">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="deals-title" className="text-2xl font-bold tracking-tight">
            Скидки недели
          </h2>
          <Link
            href="/catalog?sale=1"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Все скидки
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {deals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start gap-6 rounded-card border border-primary/30 bg-primary/10 p-6 md:flex-row md:items-center md:p-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-balance">
            Обменяйте старый смартфон на новый со скидкой до 30 000 ₽
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Бесплатная диагностика в магазине на Тверской: оцениваем устройство за 15 минут и сразу
            вычитаем сумму из стоимости покупки.
          </p>
        </div>
        <Link
          href="/catalog"
          className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-navy-foreground transition-opacity hover:opacity-90"
        >
          Узнать цену обмена
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
