import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BadgeCheck, CreditCard, RefreshCw, Star, Truck } from "lucide-react"
import { formatPrice, getCategoryName, getProductImages } from "@/lib/products"
import { getProductBySlug, getRelatedProducts, getProductVariantCandidates } from "@/lib/products/queries"
import { buildProductVariants } from "@/lib/products/variants"
import { ProductGallery } from "@/components/product-gallery"
import { ProductBuyPanel } from "@/components/product-buy-panel"
import { ProductCard } from "@/components/product-card"
import { ProductTabs } from "@/components/product-tabs"
import { BreadcrumbsJsonLd, ProductJsonLd } from "@/components/json-ld"

// Ревалидация для SSR / ISR (кэширование на 60 секунд)
export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Товар не найден",
      description: "Запрашиваемый товар не найден в каталоге Orange MSK.",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
  const canonicalUrl = `${siteUrl}/product/${product.slug}`
  const images = getProductImages(product)
  const ogImage = images[0]?.startsWith("http")
    ? images[0]
    : `${siteUrl}${images[0] || "/logo-orange-msk.jpg"}`
  const priceFormatted = formatPrice(product.price)
  const categoryName = getCategoryName(product.category)

  const title = `Купить ${product.name} в Москве — цена ${priceFormatted}`
  const description = `${product.name} по цене ${priceFormatted} в интернет-магазине Orange MSK. ${categoryName} с официальной гарантией 1 год. Быстрая доставка по Москве в день заказа, самовывоз.`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Orange MSK",
      locale: "ru_RU",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
  const canonicalUrl = `${siteUrl}/product/${product.slug}`
  const images = getProductImages(product).map((img) =>
    img.startsWith("http") ? img : `${siteUrl}${img}`
  )

  const related = await getRelatedProducts(product)
  const candidates = await getProductVariantCandidates(product)
  const variants = buildProductVariants(product, candidates)

  const breadcrumbs = [
    { name: "Главная", url: siteUrl },
    { name: getCategoryName(product.category), url: `${siteUrl}/catalog?category=${product.category}` },
    { name: product.name, url: canonicalUrl },
  ]

  return (
    <>
      {/* Микроразметка Schema.org: Product + Offer + AggregateRating + Breadcrumbs */}
      <ProductJsonLd product={product} images={images} canonicalUrl={canonicalUrl} />
      <BreadcrumbsJsonLd items={breadcrumbs} />

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
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-600 dark:text-green-500"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Оригинальный товар
                </span>

                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className="flex items-center gap-0.5 text-amber-500"
                    aria-label={`Рейтинг ${product.rating} из 5`}
                  >
                    <Star size={14} className="fill-current" />
                    <span className="font-bold text-foreground">{product.rating}</span>
                  </span>
                  <span className="text-muted-foreground">· {product.reviews} отзывов</span>
                </div>
              </div>
            </div>

            <ProductBuyPanel product={product} variants={variants} />

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

        <ProductTabs description={product.description || ""} specs={product.specs} />

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
    </>
  )
}
