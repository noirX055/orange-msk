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
    Icon: Smartphone,
    image: "/categories/smartphone.png",
  },
  {
    slug: "laptops",
    name: "Ноутбуки",
    Icon: Laptop,
    image: "/categories/laptop.png",
  },
  {
    slug: "monitors",
    name: "Мониторы",
    Icon: Monitor,
    image: "/categories/monitorsnew.png",
  },
  {
    slug: "audio",
    name: "Аудио",
    Icon: Headphones,
    image: "/categories/audi.png",
  },
  {
    slug: "wearables",
    name: "Гаджеты",
    Icon: Watch,
    image: "/categories/whatch.png",
  },
  {
    slug: "home",
    name: "Техника для дома",
    Icon: WashingMachine,
    image: "/categories/homedevice.png",
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
          {categoryCards.map(({ slug, name, Icon, image }) => (
            <li key={slug}>
              <Link
                href={`/catalog?category=${slug}`}
                className="group relative flex h-36 sm:h-40 md:h-44 w-full justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-4 sm:p-5 transition-colors hover:border-foreground/30 hover:bg-muted/30"
              >
                {/* Левый блок с заглавием и иконкой перехода */}
                <div className="z-10 flex h-full w-[55%] flex-col justify-between pr-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  
                  <div className="my-auto py-1">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight leading-snug line-clamp-2">
                      {name}
                    </h3>
                  </div>

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/70 transition-colors group-hover:bg-navy group-hover:text-navy-foreground">
                    <ArrowRight size={14} strokeWidth={2} />
                  </div>
                </div>

                {/* Правый блок с изображением без вылетов и подскакиваний */}
                <div className="absolute right-2 bottom-2 top-2 w-[45%] overflow-hidden pointer-events-none flex items-end justify-end">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(max-width: 640px) 110px, 160px"
                      className="object-contain object-right-bottom"
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
