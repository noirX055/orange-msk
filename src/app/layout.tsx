import type { Metadata, Viewport } from "next"
import { Montserrat, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart-provider"
import { FavoritesProvider } from "@/components/favorites-provider"
import { SiteChrome } from "@/components/site-chrome"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
})

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
})

export const metadata: Metadata = {
  title: "Orange MSK — магазин электроники в Москве",
  description:
    "Смартфоны, ноутбуки, мониторы, аудио и техника для дома с официальной гарантией. Доставка по Москве в день заказа.",
}

export const viewport: Viewport = {
  themeColor: "#22303f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${montserrat.variable} ${playfair.variable} h-full bg-background antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <FavoritesProvider>
            <SiteChrome>{children}</SiteChrome>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  )
}
