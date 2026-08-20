import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Headphones,
  Laptop,
  Monitor,
  RefreshCw,
  Smartphone,
  Truck,
  WashingMachine,
  Watch,
} from "lucide-react"
import { BannerCarousel } from "@/components/banner-carousel"
import { ProductCard } from "@/components/product-card"
import { BrandLogo } from "@/components/brand-logo"
import { getProducts } from "@/lib/products/queries"
import { getBanners } from "@/lib/banners/queries"

const categoryCards = [
  {
    slug: "smartphones",
    name: "Смартфоны",
    count: "320 товаров",
    Icon: Smartphone,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-50/80 to-blue-100/30 dark:from-blue-950/20 dark:to-muted/30",
    borderColor: "hover:border-blue-200 dark:hover:border-blue-800",
    arrowBg: "bg-blue-600 text-white",
    image: "/categories/smartphone.png?v=2",
  },
  {
    slug: "laptops",
    name: "Ноутбуки",
    count: "180 товаров",
    Icon: Laptop,
    color: "text-purple-600 dark:text-purple-400",
    bgGradient: "from-purple-50/80 to-purple-100/30 dark:from-purple-950/20 dark:to-muted/30",
    borderColor: "hover:border-purple-200 dark:hover:border-purple-800",
    arrowBg: "bg-purple-600 text-white",
    image: "/categories/laptop.png?v=2",
  },
  {
    slug: "monitors",
    name: "Мониторы",
    count: "95 товаров",
    Icon: Monitor,
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-50/80 to-emerald-100/30 dark:from-emerald-950/20 dark:to-muted/30",
    borderColor: "hover:border-emerald-200 dark:hover:border-emerald-800",
    arrowBg: "bg-emerald-600 text-white",
    image: "/categories/monitors.png?v=2",
  },
  {
    slug: "audio",
    name: "Аудио",
    count: "240 товаров",
    Icon: Headphones,
    color: "text-amber-600 dark:text-amber-400",
    bgGradient: "from-amber-50/80 to-amber-100/30 dark:from-amber-950/20 dark:to-muted/30",
    borderColor: "hover:border-amber-200 dark:hover:border-amber-800",
    arrowBg: "bg-amber-600 text-white",
    image: "/categories/audi.png?v=2",
  },
  {
    slug: "wearables",
    name: "Гаджеты",
    count: "150 товаров",
    Icon: Watch,
    color: "text-rose-600 dark:text-rose-400",
    bgGradient: "from-rose-50/80 to-rose-100/30 dark:from-rose-950/20 dark:to-muted/30",
    borderColor: "hover:border-rose-200 dark:hover:border-rose-800",
    arrowBg: "bg-rose-600 text-white",
    image: "/categories/whatch.png?v=2",
  },
  {
    slug: "home",
    name: "Техника для дома",
    count: "210 товаров",
    Icon: WashingMachine,
    color: "text-sky-600 dark:text-sky-400",
    bgGradient: "from-sky-50/80 to-sky-100/30 dark:from-sky-950/20 dark:to-muted/30",
    borderColor: "hover:border-sky-200 dark:hover:border-sky-800",
    arrowBg: "bg-sky-600 text-white",
    image: "/categories/homedevice.png?v=2",
  },
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
          Категории
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {categoryCards.map(({ slug, name, count, Icon, color, bgGradient, borderColor, arrowBg, image }) => (
            <li key={slug}>
              <Link
                href={`/catalog?category=${slug}`}
                className={`group relative flex h-36 sm:h-44 md:h-48 w-full flex-col justify-between overflow-hidden rounded-2xl md:rounded-3xl border border-border/60 bg-gradient-to-br ${bgGradient} p-3.5 sm:p-5 md:p-6 transition-all duration-300 ${borderColor} hover:-translate-y-1 hover:shadow-xl`}
              >
                {/* Left Info (restricted to 55% width so text never overlaps image) */}
                <div className="z-10 flex h-full w-[55%] flex-col justify-between pr-1">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-white shadow-sm dark:bg-card">
                    <Icon size={16} strokeWidth={1.8} className={`${color} sm:w-5 sm:h-5`} />
                  </div>
                  <div className="my-auto py-1">
                    <h3 className="text-xs sm:text-base md:text-xl font-bold text-foreground leading-tight tracking-tight line-clamp-2">{name}</h3>
                  </div>
                  <div className={`flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${arrowBg} shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-0.5`}>
                    <ArrowRight size={12} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
                  </div>
                </div>

                {/* Right Product Image (contained inside right 45%) */}
                <div className="absolute right-0 top-0 bottom-0 w-[45%] overflow-hidden pointer-events-none flex items-center justify-center p-1 sm:p-2">
                  <div className="relative h-24 w-24 sm:h-36 sm:w-36 md:h-40 md:w-40 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 120px, 200px"
                      className="object-contain object-right"
                      priority
                    />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
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
