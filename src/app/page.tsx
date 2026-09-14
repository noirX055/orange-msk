import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Gamepad2,
  Headphones,
  Laptop,
  Plug,
  RefreshCw,
  Smartphone,
  Tablet,
  Truck,
  Watch,
} from "lucide-react"
import { BannerCarousel } from "@/components/banner-carousel"
import { ProductCard } from "@/components/product-card"
import { BrandLogo } from "@/components/brand-logo"
import { getProducts } from "@/lib/products/queries"
import { getBanners } from "@/lib/banners/queries"

const categoryCards = [
  {
    slug: "iphone-16",
    name: "iPhone 16",
    Icon: Smartphone,
    image: "/categories/smartphone.png",
    href: "/catalog?category=iphone-16",
  },
  {
    slug: "iphone-15",
    name: "iPhone 15",
    Icon: Smartphone,
    image: "/categories/smartphone.png",
    href: "/catalog?category=iphone-15",
  },
  {
    slug: "macbook",
    name: "MacBook",
    Icon: Laptop,
    image: "/categories/laptop.png",
    href: "/catalog?category=macbook",
  },
  {
    slug: "ipad",
    name: "iPad",
    Icon: Tablet,
    image: "/categories/laptop.png",
    href: "/catalog?category=ipad",
  },
  {
    slug: "apple-watch",
    name: "Apple Watch",
    Icon: Watch,
    image: "/categories/whatch.png",
    href: "/catalog?category=apple-watch",
  },
  {
    slug: "airpods",
    name: "AirPods",
    Icon: Headphones,
    image: "/categories/audi.png",
    href: "/catalog?category=airpods",
  },
  {
    slug: "samsung",
    name: "Samsung",
    Icon: Smartphone,
    image: "/categories/smartphone.png",
    href: "/catalog?category=samsung",
  },
  {
    slug: "dyson",
    name: "Dyson",
    Icon: Plug,
    image: "/categories/homedevice.png",
    href: "/catalog?category=dyson",
  },
  {
    slug: "consoles",
    name: "Игровые консоли",
    Icon: Gamepad2,
    image: "/categories/monitorsnew.png",
    href: "/catalog?category=consoles",
  },
  {
    slug: "accessories",
    name: "Аксессуары",
    Icon: Plug,
    image: "/categories/audi.png",
    href: "/catalog?category=accessories",
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

      <section aria-labelledby="categories-title" className="pt-4">
        {/* Заголовок блока */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
            <h2 id="categories-title" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Каталог
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Техника, электроника и аксессуары — всё, что нужно, в одном месте
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted sm:flex"
          >
            Смотреть весь каталог <ArrowRight size={16} />
          </Link>
        </div>

        {/* Горизонтальная карусель в фирменных цветах сайта */}
        <div className="flex gap-4 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
          {categoryCards.map(({ slug, name, Icon, image, href }) => (
            <Link
              key={slug}
              href={href}
              className="group relative flex h-[260px] w-[200px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[24px] border border-border bg-navy p-5 transition-all duration-300 hover:border-primary hover:shadow-[0_0_24px_rgba(245,150,12,0.25)] sm:h-[280px] sm:w-[220px]"
            >
              {/* Внутреннее свечение (видно только при наведении) */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-start">
                {/* Иконка */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 text-white shadow-sm transition-colors group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:text-primary">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                {/* Название */}
                <h3 className="text-base font-medium tracking-wide text-white sm:text-lg">
                  {name}
                </h3>
              </div>

              {/* Круглая кнопка со стрелкой внизу слева */}
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowRight size={14} strokeWidth={2} />
              </div>

              {/* Большое изображение справа внизу */}
              <div className="absolute -bottom-2 -right-2 z-0 h-[150px] w-[150px] sm:h-[170px] sm:w-[170px]">
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 150px, 170px"
                  className="object-contain object-right-bottom transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="brands-title" className="pt-4">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
            <h2 id="brands-title" className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Официальные бренды
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Только проверенные производители и оригинальная продукция
            </p>
          </div>
          <Link
            href="/catalog"
            className="hidden shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            <ArrowRight size={20} strokeWidth={1.5} />
          </Link>
        </div>
        <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {brandCards.map((brand) => (
            <li key={brand}>
              <Link
                href={`/catalog?brand=${encodeURIComponent(brand)}`}
                aria-label={brand}
                className="flex h-20 items-center justify-center rounded-[20px] border border-border bg-card px-3 transition-colors hover:border-primary"
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
