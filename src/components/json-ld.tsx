import type { Product } from "@/lib/products"

type BreadcrumbItem = {
  name: string
  url: string
}

/**
 * Микроразметка «Хлебные крошки» (BreadcrumbList)
 */
export function BreadcrumbsJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Микроразметка товара (Product + Offer + AggregateRating) по стандарту Schema.org
 */
export function ProductJsonLd({
  product,
  images,
  canonicalUrl,
}: {
  product: Product
  images: string[]
  canonicalUrl: string
}) {
  const primaryColor = product.colors?.[0]?.name

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || `${product.name} в интернет-магазине Orange MSK с гарантией и доставкой по Москве.`,
    image: images && images.length > 0 ? images : undefined,
    sku: product.slug,
    mpn: product.id,
    color: primaryColor || undefined,
    category: product.category,
    brand: {
      "@type": "Brand",
      name: product.brand || "Orange MSK",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "RUB",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Orange MSK",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru",
      },
    },
    ...(product.rating && product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(product.rating),
            reviewCount: String(Math.max(product.reviews || 1, 1)),
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * Микроразметка Организации и Сайта (Organization + WebSite) для сниппета в поиске
 */
export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Orange MSK",
        url: siteUrl,
        logo: `${siteUrl}/logo-orange-msk.jpg`,
        image: `${siteUrl}/logo-orange-msk.jpg`,
        description: "Интернет-магазин оригинальной электроники и техники в Москве.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Москва",
          addressCountry: "RU",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Orange MSK",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/catalog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
