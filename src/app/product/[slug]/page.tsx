import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, CreditCard, RefreshCw, Star, Truck } from "lucide-react"
import { getCategoryName, getProductImages } from "@/lib/products"
import { getProductBySlug, getRelatedProducts } from "@/lib/products/queries"
import { ProductGallery } from "@/components/product-gallery"
import { BrandLogo } from "@/components/brand-logo"
import { ProductBuyPanel } from "@/components/product-buy-panel"
import { ProductCard } from "@/components/product-card"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Товар не найден — Orange MSK" }
  return {
    title: `${product.name} — Orange MSK`,
    description: product.description,
  }
}

const guarantees = [
  { title: "Доставка сегодня", text: "По Москве от 2 часов", Icon: Truck },
  { title: "Гарантия 1 год", text: "Официальный сервис", Icon: BadgeCheck },
  { title: "Рассрочка 0%", text: "До 24 месяцев", Icon: CreditCard },
  { title: "Возврат 14 дней", text: "Без объяснения причин", Icon: RefreshCw },
]

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const related = await getRelatedProducts(product)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8">
      <nav aria-label="Хлебные крошки" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/catalog?category=${product.category}`} className="hover:text-primary">
              {getCategoryName(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-1/2">
          <ProductGallery images={getProductImages(product)} alt={product.name} />
        </div>

        <div className="flex flex-col gap-5 lg:w-1/2">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-balance md:text-3xl">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-50/80 px-2.5 py-1 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Оригинальный товар
              </span>
              
              <div className="flex items-center gap-1.5 text-sm">
                <span className="flex items-center gap-0.5 text-amber-500" aria-label={`Рейтинг ${product.rating} из 5`}>
                  <Star size={14} className="fill-current" />
                  <span className="font-bold text-foreground">{product.rating}</span>
                </span>
                <span className="text-muted-foreground">· {product.reviews} отзывов</span>
              </div>
            </div>
          </div>

          <ProductBuyPanel product={product} />

          <ul className="grid gap-3 sm:grid-cols-2">
            {guarantees.map(({ title, text, Icon }) => (
              <li key={title} className="flex items-start gap-3 rounded-lg bg-muted p-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-primary" />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">{title}</span>
                  <span className="text-xs text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="about-title" className="flex flex-col">
          <h2 id="about-title" className="mb-4 text-xl font-bold tracking-tight">
            Описание
          </h2>
          <div className="flex-1 rounded-card border border-border bg-card p-6 shadow-sm">
            <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {product.description || "Описание пока не добавлено."}
            </p>
          </div>
        </section>

        <section aria-labelledby="specs-title" className="flex flex-col">
          <h2 id="specs-title" className="mb-4 text-xl font-bold tracking-tight">
            Характеристики
          </h2>
          <dl className="flex-1 overflow-hidden rounded-card border border-border bg-card shadow-sm">
            {product.specs.map((spec, index) => (
              <div
                key={spec.label}
                className={`flex items-baseline justify-between gap-4 px-4 py-3 text-sm ${
                  index % 2 === 0 ? "bg-muted/60" : "bg-card"
                }`}
              >
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section aria-labelledby="related-title">
        <h2 id="related-title" className="mb-6 text-2xl font-bold tracking-tight">
          Похожие товары
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
