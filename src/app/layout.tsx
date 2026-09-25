import type { Metadata, Viewport } from "next"
import { Montserrat, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { FavoritesProvider } from "@/components/favorites-provider"
import { SiteChrome } from "@/components/site-chrome"
import { OrganizationJsonLd } from "@/components/json-ld"
import { getCategoriesWithGroups } from "@/lib/admin/queries"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
})

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Orange MSK — магазин оригинальной электроники в Москве",
    template: "%s | Orange MSK",
  },
  description:
    "Оригинальные смартфоны, ноутбуки, аудио и техника для дома с официальной гарантией в Москве. Экспресс-доставка в день заказа, рассрочка 0%.",
  keywords: [
    "купить iPhone в Москве",
    "оригинальная техника Apple",
    "смартфоны Samsung купить",
    "техника Dyson Москва",
    "интернет-магазин электроники Москва",
    "Orange MSK",
  ],
  authors: [{ name: "Orange MSK" }],
  creator: "Orange MSK",
  publisher: "Orange MSK",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Orange MSK",
    title: "Orange MSK — магазин оригинальной электроники в Москве",
    description:
      "Оригинальные смартфоны, ноутбуки, аудио и техника для дома с официальной гарантией в Москве. Экспресс-доставка в день заказа.",
    images: [
      {
        url: "/logo-orange-msk.jpg",
        width: 800,
        height: 800,
        alt: "Orange MSK",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Orange MSK — магазин электроники в Москве",
    description:
      "Оригинальная техника Apple, Samsung, Dyson с гарантией 1 год. Доставка по Москве в день заказа.",
    images: ["/logo-orange-msk.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "f274de41c368dd50",
  },
}

export const viewport: Viewport = {
  themeColor: "#22303f",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { categories, groups, brands } = await getCategoriesWithGroups()

  return (
    <html
      lang="ru"
      className={`${montserrat.variable} ${playfair.variable} h-full bg-background antialiased`}
    >
      <head>
        <OrganizationJsonLd />
      </head>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <FavoritesProvider>
            <SiteChrome categories={categories} groups={groups} brands={brands}>
              {children}
            </SiteChrome>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  )
}
