import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, CreditCard, RefreshCw, Star, Truck } from "lucide-react"
import { getCategoryName, getProduct, getRelated, products } from "@/lib/products"
import { ProductVisual } from "@/components/product-visual"
import { ProductBuyPanel } from "@/components/product-buy-panel"
import { ProductCard } from "@/components/product-card"

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
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
  const product = getProduct(slug)

  if (!product) {
    notFound()
  }

  const related = getRelated(product)

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
        <div className="flex flex-col gap-4 lg:w-1/2">
          <ProductVisual
            category={product.category}
            size="lg"
            className="h-80 w-full rounded-card border border-border md:h-[420px]"
          />
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((index) => (
              <ProductVisual
                key={index}
                category={product.category}
                size="sm"
                className="h-20 w-full rounded-lg border border-border"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:w-1/2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                {product.brand}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 font-semibold ${
                  product.inStock ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {product.inStock ? "В наличии" : "Нет в наличии"}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold leading-tight text-balance md:text-3xl">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-0.5" aria-label={`Рейтинг ${product.rating} из 5`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    className={
                      star <= Math.round(product.rating)
                        ? "fill-primary text-primary"
                        : "text-border"
                    }
                  />
                ))}
              </span>
              <span className="font-semibold">{product.rating}</span>
              <span className="text-muted-foreground">· {product.reviews} отзывов</span>
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
        <section aria-labelledby="about-title">
          <h2 id="about-title" className="mb-4 font-serif text-xl font-bold">
            О товаре
          </h2>
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
        </section>

        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="mb-4 font-serif text-xl font-bold">
            Характеристики
          </h2>
          <dl className="overflow-hidden rounded-card border border-border">
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
        <h2 id="related-title" className="mb-6 font-serif text-2xl font-bold">
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
