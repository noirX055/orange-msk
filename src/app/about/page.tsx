import type { Metadata } from "next"
import Link from "next/link"
import {
  Smartphone,
  Laptop,
  Headphones,
  Home,
  Watch,
  Gamepad2,
  Cable,
  Cpu,
  Layers,
  TrendingDown,
  HelpCircle,
  Clock,
  ShieldCheck,
  ArrowRight,
  Phone,
} from "lucide-react"
import { BreadcrumbsJsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "О компании — Orange MSK",
  description:
    "Orange MSK — магазин современной электроники, бытовой техники и товаров для дома. Большой выбор смартфонов, ноутбуков, аудиотехники и аксессуаров по выгодным ценам.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "О компании — Orange MSK",
    description:
      "Магазин современной электроники, бытовой техники и товаров для дома. Большой выбор, выгодные цены, помощь с выбором.",
    url: "/about",
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

const catalogCategories = [
  {
    icon: Smartphone,
    title: "Смартфоны и мобильные устройства",
    href: "/catalog/apple/iphone",
  },
  {
    icon: Laptop,
    title: "Ноутбуки, компьютеры и планшеты",
    href: "/catalog/apple/macbook",
  },
  {
    icon: Headphones,
    title: "Наушники, колонки и аудиотехника",
    href: "/catalog/apple/airpods",
  },
  {
    icon: Home,
    title: "Бытовая техника для дома",
    href: "/catalog/dyson",
  },
  {
    icon: Watch,
    title: "Умные часы и аксессуары",
    href: "/catalog/apple/apple-watch",
  },
  {
    icon: Gamepad2,
    title: "Игровые устройства и товары для геймеров",
    href: "/catalog",
  },
  {
    icon: Cable,
    title: "Кабели, зарядные устройства и различные аксессуары",
    href: "/catalog",
  },
  {
    icon: Cpu,
    title: "Другая современная электроника и техника",
    href: "/catalog",
  },
]

const reasons = [
  {
    icon: Layers,
    title: "Большой выбор",
    text: "Мы предлагаем технику разных категорий и ценовых сегментов, чтобы каждый покупатель мог подобрать подходящий вариант.",
  },
  {
    icon: TrendingDown,
    title: "Выгодные цены",
    text: "Следим за рынком и стараемся предлагать привлекательные цены на популярные товары.",
  },
  {
    icon: HelpCircle,
    title: "Помощь с выбором",
    text: "Если вы не знаете, какую модель выбрать, наши специалисты помогут разобраться в характеристиках и подобрать технику под ваши задачи и бюджет.",
  },
  {
    icon: Clock,
    title: "Удобная покупка",
    text: "Мы стараемся сделать процесс заказа максимально простым — от оформления до получения товара.",
  },
  {
    icon: ShieldCheck,
    title: "Качество и надежность",
    text: "Для нас важно, чтобы покупатель понимал, что именно он приобретает, и оставался доволен покупкой.",
  },
]

export default function AboutPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Главная", url: `${siteUrl}` },
          { name: "О компании", url: `${siteUrl}/about` },
        ]}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6 md:py-8">
        {/* Хлебные крошки */}
        <nav aria-label="Хлебные крошки" className="text-xs text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">О компании</li>
          </ol>
        </nav>

        {/* Заголовок страницы */}
        <div>
          <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Orange MSK
          </h1>
          <p className="mt-2 text-base font-medium text-foreground/80 md:text-lg">
            Электроника и техника для вашей жизни
          </p>
          <div className="mt-4 max-w-3xl space-y-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>
              Orange MSK — магазин современной электроники, бытовой техники и товаров для дома, где
              покупатели могут найти всё необходимое в одном месте.
            </p>
            <p>
              Мы стремимся сделать покупку техники простой, понятной и удобной — от выбора подходящей
              модели до получения заказа и консультации после покупки.
            </p>
          </div>
        </div>

        {/* Раздел: Что можно купить */}
        <section aria-labelledby="assortment-title">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 id="assortment-title" className="text-2xl font-bold tracking-tight text-foreground">
                Что можно купить в Orange MSK
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                В нашем ассортименте представлены:
              </p>
            </div>
            <Link
              href="/catalog"
              className="flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
            >
              Смотреть весь каталог <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogCategories.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col justify-between rounded-card border border-border bg-card p-5 transition-all hover:border-primary/60 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    <span>Перейти в раздел</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Раздел: Почему покупатели выбирают Orange MSK */}
        <section aria-labelledby="why-us-title">
          <div className="mb-6">
            <h2 id="why-us-title" className="text-2xl font-bold tracking-tight text-foreground">
              Почему покупатели выбирают Orange MSK
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Наши принципы и стандарты работы для каждого клиента
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r, idx) => {
              const Icon = r.icon
              return (
                <div
                  key={r.title}
                  className={`flex flex-col rounded-card bg-muted p-6 ${
                    idx === 4 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Нижний блок связи */}
        <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-foreground">Нужна помощь с выбором?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Наши специалисты помогут подобрать устройство под ваши задачи и бюджет.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
            <a
              href="tel:+79892058377"
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <Phone size={14} />
              +7 (989) 205-83-77
            </a>
            <Link
              href="/catalog"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              В каталог
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
