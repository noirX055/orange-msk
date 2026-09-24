import type { Metadata } from "next"
import Link from "next/link"
import { CatalogView } from "@/components/catalog-view"
import { getProducts } from "@/lib/products/queries"
import { getCategoryName } from "@/lib/products"
import { getCategoriesWithGroups, getAllAttributesWithValues } from "@/lib/admin/queries"
import { BreadcrumbsJsonLd } from "@/components/json-ld"

export const revalidate = 60

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sale?: string; brand?: string; q?: string; series?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  let title = "Каталог оригинальной техники в Москве — купить в интернет-магазине"
  let description =
    "Каталог оригинальной электроники в Москве: смартфоны, ноутбуки, аудио, техника для дома. Официальная гарантия 1 год, доставка в день заказа."

  if (params.category && params.category !== "all") {
    const { categories } = await getCategoriesWithGroups()
    const catItem = categories.find(
      (c) => c.slug === params.category || c.name.toLowerCase() === params.category?.toLowerCase()
    )
    const catName = catItem ? catItem.name : getCategoryName(params.category)
    if (params.series) {
      title = `${catName} ${params.series} — купить в Москве | Каталог Orange MSK`
      description = `Большой выбор ${catName} серии ${params.series} по выгодным ценам в Москве. Официальная гарантия, быстрая доставка.`
    } else if (params.brand) {
      title = `${catName} ${params.brand} — купить в Москве | Каталог Orange MSK`
      description = `Большой выбор ${catName} бренда ${params.brand} по выгодным ценам в Москве. Официальная гарантия, быстрая доставка.`
    } else {
      title = `${catName} — купить в Москве | Каталог интернет-магазина Orange MSK`
      description = `Купить ${catName} с официальной гарантией в Москве. Экспресс-доставка от 2 часов, рассрочка 0%, гарантия 1 год.`
    }
  } else if (params.brand) {
    title = `Техника ${params.brand} — купить в Москве с гарантией | Orange MSK`
    description = `Оригинальная техника ${params.brand} в Москве. Большой ассортимент, быстрая доставка, выгодные цены.`
  } else if (params.sale === "1") {
    title = "Скидки и акции на технику в Москве — распродажа Orange MSK"
    description = "Товары со скидкой и спецпредложения на электронику в Москве. Гарантия качества, быстрая доставка."
  } else if (params.q) {
    title = `Поиск: «${params.q}» — результаты поиска | Orange MSK`
    description = `Результаты поиска по запросу «${params.q}» в каталоге электроники Orange MSK.`
  }

  let canonicalUrl = `${siteUrl}/catalog${params.category ? `?category=${params.category}` : ""}`
  if (params.series) {
    canonicalUrl += `${params.category ? "&" : "?"}series=${encodeURIComponent(params.series)}`
  }

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
          url: "/logo-orange-msk.jpg",
          width: 800,
          height: 800,
          alt: title,
        },
      ],
    },
  }
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sale?: string; brand?: string; q?: string; series?: string }>
}) {
  const params = await searchParams
  const [{ categories, groups }, products, attributes] = await Promise.all([
    getCategoriesWithGroups(),
    getProducts(),
    getAllAttributesWithValues(),
  ])
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  const visibleCategories = categories.filter((c) => c.is_visible !== false)

  const currentCategory = visibleCategories.find(
    (c) => c.slug === params.category || c.name.toLowerCase() === params.category?.toLowerCase()
  )
  const categoryName = currentCategory
    ? currentCategory.name
    : (params.category && params.category !== "all" ? getCategoryName(params.category) : null)

  const breadcrumbs = [
    { name: "Главная", url: siteUrl },
    { name: "Каталог", url: `${siteUrl}/catalog` },
    ...(categoryName
      ? [{ name: categoryName, url: `${siteUrl}/catalog?category=${params.category}` }]
      : []),
    ...(categoryName && params.series
      ? [{ name: params.series, url: `${siteUrl}/catalog?category=${params.category}&series=${encodeURIComponent(params.series)}` }]
      : []),
  ]

  return (
    <>
      <BreadcrumbsJsonLd items={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav aria-label="Хлебные крошки" className="mb-4 text-xs text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/catalog" className={categoryName ? "hover:text-primary" : "text-foreground"}>
                Каталог
              </Link>
            </li>
            {categoryName && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={`/catalog?category=${params.category}`}
                    className={params.series ? "hover:text-primary" : "text-foreground"}
                  >
                    {categoryName}
                  </Link>
                </li>
              </>
            )}
            {categoryName && params.series && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-foreground">{params.series}</li>
              </>
            )}
          </ol>
        </nav>

        <CatalogView
          products={products}
          categories={visibleCategories}
          groups={groups}
          attributes={attributes}
          initialCategory={params.category ?? "all"}
          initialSaleOnly={params.sale === "1"}
          initialBrand={params.brand}
          initialQuery={params.q ?? ""}
          initialSeries={params.series}
        />
      </div>
    </>
  )
}
