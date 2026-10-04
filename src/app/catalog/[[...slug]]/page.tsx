import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { CatalogView } from "@/components/catalog-view"
import { getProducts } from "@/lib/products/queries"
import { getCategoriesWithGroups, getAllAttributesWithValues } from "@/lib/admin/queries"
import { BreadcrumbsJsonLd } from "@/components/json-ld"
import {
  findSeriesNameBySlug,
  buildCatalogHref,
  getLegacyCatalogRedirect,
} from "@/lib/catalog-urls"

export const revalidate = 60

type CatalogPageProps = {
  params: Promise<{ slug?: string[] }>
  searchParams: Promise<{
    category?: string
    sale?: string
    brand?: string
    q?: string
    series?: string
    sort?: string
    [key: string]: string | undefined
  }>
}

async function resolveRouteContext(
  paramsPromise: Promise<{ slug?: string[] }>,
  searchParamsPromise: Promise<{
    category?: string
    sale?: string
    brand?: string
    q?: string
    series?: string
    [key: string]: string | undefined
  }>,
) {
  const { slug } = await paramsPromise
  const queryParams = await searchParamsPromise

  // Проверка на legacy query параметры: /catalog?category=... -> 301 на ЧПУ
  if (!slug || slug.length === 0) {
    const legacyRedirect = getLegacyCatalogRedirect(queryParams)
    if (legacyRedirect) {
      permanentRedirect(legacyRedirect)
    }
  }

  const [{ categories, groups }] = await Promise.all([
    getCategoriesWithGroups(),
  ])
  const visibleCategories = categories.filter((c) => c.is_visible !== false)

  // 1. Корень каталога: /catalog
  if (!slug || slug.length === 0) {
    return {
      mode: "root" as const,
      categorySlug: undefined,
      categoryName: null,
      seriesName: undefined,
      visibleCategories,
      groups,
      queryParams,
    }
  }

  // Больше 2 сегментов (/catalog/a/b/c) не существует
  if (slug.length > 2) {
    notFound()
  }

  const rawCatSlug = decodeURIComponent(slug[0]).toLowerCase()

  // Проверяем категорию
  const currentCategory = visibleCategories.find(
    (c) => c.slug.toLowerCase() === rawCatSlug,
  )

  if (!currentCategory) {
    // Проверяем, не старая ли это псевдо-категория (например /catalog/iphone-17)
    const legacyTarget = getLegacyCatalogRedirect({ category: rawCatSlug })
    if (legacyTarget) {
      permanentRedirect(legacyTarget)
    }
    notFound()
  }

  const categoryName = currentCategory.name

  // 2. Страница категории: /catalog/[category]
  if (slug.length === 1) {
    return {
      mode: "category" as const,
      categorySlug: currentCategory.slug,
      categoryName,
      seriesName: undefined,
      visibleCategories,
      groups,
      queryParams,
    }
  }

  // 3. Страница серии: /catalog/[category]/[series]
  const rawSeriesSlug = decodeURIComponent(slug[1]).toLowerCase()

  const catGroups = groups.filter(
    (g) => g.category_slug?.toLowerCase() === currentCategory.slug.toLowerCase(),
  )
  const candidateNames = catGroups.map((g) => g.name)

  let seriesName = findSeriesNameBySlug(rawSeriesSlug, candidateNames)

  // Если в groups серии нет, ищем в товарах этой категории
  if (!seriesName) {
    const allProducts = await getProducts()
    const productSeriesCandidates = Array.from(
      new Set(
        allProducts
          .filter(
            (p) =>
              p.category.toLowerCase() === currentCategory.slug.toLowerCase() &&
              p.series,
          )
          .map((p) => p.series as string),
      ),
    )
    seriesName = findSeriesNameBySlug(rawSeriesSlug, productSeriesCandidates)
  }

  if (!seriesName) {
    notFound()
  }

  return {
    mode: "series" as const,
    categorySlug: currentCategory.slug,
    categoryName,
    seriesName,
    visibleCategories,
    groups,
    queryParams,
  }
}

export async function generateMetadata(props: CatalogPageProps): Promise<Metadata> {
  const ctx = await resolveRouteContext(props.params, props.searchParams)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  let title = "Каталог оригинальной техники в Москве — купить в интернет-магазине"
  let description =
    "Каталог оригинальной электроники в Москве: смартфоны, ноутбуки, аудио, техника для дома. Официальная гарантия 1 год, доставка в день заказа."

  if (ctx.mode === "series" && ctx.categoryName && ctx.seriesName) {
    title = `${ctx.categoryName} ${ctx.seriesName} — купить в Москве`
    description = `Большой выбор ${ctx.categoryName} серии ${ctx.seriesName} по выгодным ценам в Москве. Официальная гарантия, быстрая доставка.`
  } else if (ctx.mode === "category" && ctx.categoryName) {
    title = `${ctx.categoryName} — купить в Москве с гарантией`
    description = `Купить ${ctx.categoryName} с официальной гарантией в Москве. Экспресс-доставка от 2 часов, рассрочка 0%, гарантия 1 год.`
  } else if (ctx.queryParams.brand) {
    title = `Техника ${ctx.queryParams.brand} — купить в Москве с гарантией`
    description = `Оригинальная техника ${ctx.queryParams.brand} в Москве. Большой ассортимент, быстрая доставка, выгодные цены.`
  } else if (ctx.queryParams.sale === "1") {
    title = "Скидки и акции на технику в Москве — распродажа"
    description = "Товары со скидкой и спецпредложения на электронику в Москве. Гарантия качества, быстрая доставка."
  } else if (ctx.queryParams.q) {
    title = `Поиск: «${ctx.queryParams.q}» — результаты поиска`
    description = `Результаты поиска по запросу «${ctx.queryParams.q}» в каталоге электроники Orange MSK.`
  }

  const canonicalPath = buildCatalogHref(ctx.categorySlug, ctx.seriesName)
  const canonicalUrl = `${siteUrl}${canonicalPath}`

  return {
    title,
    description,
    ...(ctx.queryParams.q ? { robots: { index: false, follow: true } } : {}),
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

export default async function CatalogPage(props: CatalogPageProps) {
  const ctx = await resolveRouteContext(props.params, props.searchParams)
  const [products, attributes] = await Promise.all([
    getProducts(),
    getAllAttributesWithValues(),
  ])
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  const breadcrumbs = [
    { name: "Главная", url: siteUrl },
    { name: "Каталог", url: `${siteUrl}/catalog` },
    ...(ctx.categoryName
      ? [{ name: ctx.categoryName, url: `${siteUrl}${buildCatalogHref(ctx.categorySlug)}` }]
      : []),
    ...(ctx.categoryName && ctx.seriesName
      ? [
          {
            name: ctx.seriesName,
            url: `${siteUrl}${buildCatalogHref(ctx.categorySlug, ctx.seriesName)}`,
          },
        ]
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
              <Link
                href="/catalog"
                className={ctx.categoryName ? "hover:text-primary" : "text-foreground"}
              >
                Каталог
              </Link>
            </li>
            {ctx.categoryName && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href={buildCatalogHref(ctx.categorySlug)}
                    className={ctx.seriesName ? "hover:text-primary" : "text-foreground"}
                  >
                    {ctx.categoryName}
                  </Link>
                </li>
              </>
            )}
            {ctx.categoryName && ctx.seriesName && (
              <>
                <li aria-hidden="true">/</li>
                <li className="text-foreground">{ctx.seriesName}</li>
              </>
            )}
          </ol>
        </nav>

        <CatalogView
          products={products}
          categories={ctx.visibleCategories}
          groups={ctx.groups}
          attributes={attributes}
          initialCategory={ctx.categorySlug ?? "all"}
          initialSaleOnly={ctx.queryParams.sale === "1"}
          initialBrand={ctx.queryParams.brand}
          initialQuery={ctx.queryParams.q ?? ""}
          initialSeries={ctx.seriesName}
        />
      </div>
    </>
  )
}
