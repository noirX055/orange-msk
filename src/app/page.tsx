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
  { slug: "smartphones", name: "Смартфоны", count: "320 товаров", Icon: Smartphone, color: "bg-blue-50 text-blue-500", image: "/products/smartphones/1.png" },
  { slug: "laptops", name: "Ноутбуки", count: "180 товаров", Icon: Laptop, color: "bg-purple-50 text-purple-500", image: "/products/laptops/1.png" },
  { slug: "monitors", name: "Мониторы", count: "95 товаров", Icon: Monitor, color: "bg-emerald-50 text-emerald-500", image: "/products/monitors/1.png" },
  { slug: "audio", name: "Аудио", count: "240 товаров", Icon: Headphones, color: "bg-orange-50 text-orange-500", image: "/products/audio/1.png" },
  { slug: "wearables", name: "Гаджеты", count: "150 товаров", Icon: Watch, color: "bg-pink-50 text-pink-500", image: "/products/wearables/1.png" },
  { slug: "home", name: "Техника для дома", count: "210 товаров", Icon: WashingMachine, color: "bg-sky-50 text-sky-500", image: "/products/home/1.png" },
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
    <div className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-8">
      <h1 className="sr-only">Orange MSK — магазин электроники в Москве</h1>
      <BannerCarousel banners={banners} />

      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="mb-6 text-2xl font-bold tracking-tight">
          Категории
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {categoryCards.map(({ slug, name, count, Icon, color, image }) => (
            <li key={slug}>
              <Link
                href={`/catalog?category=${slug}`}
                className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl p-5 transition-shadow hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, var(--background) 0%, hsl(from currentColor h s l / 0.06) 100%)` }}
              >
                <div className="flex flex-col gap-3 relative z-10">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${color.split(' ')[0]}`}>
                    <Icon size={22} strokeWidth={1.5} className={color.split(' ')[1]} />
                  </span>
                  <span className="text-base font-bold leading-tight">{name}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <div className="relative z-10 mt-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight size={18} />
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 h-[70%] w-[50%] opacity-90 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="200px"
                    className="object-contain object-right-bottom mix-blend-multiply"
                  />
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
