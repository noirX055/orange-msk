export type Category = {
  slug: string
  name: string
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  series?: string
  /** Общий ключ для цветовых вариантов одной модели/памяти */
  variantGroup?: string
  category: string
  price: number
  cardPrice?: number
  oldPrice?: number
  rating: number
  reviews: number
  inStock: boolean
  isVisible: boolean
  badge?: "Новинка" | "Хит" | "Скидка"
  colors: { name: string; hex: string }[]
  description: string
  specs: { label: string; value: string; is_configurator?: boolean; is_filter?: boolean }[]
  images?: string[]
  createdAt?: string
}

/**
 * Расчет цены при оплате картой: +15% от базовой цены с округлением до сотен рублей.
 * Пример: 89 990 ₽ -> 103 488.5 ₽ -> 103 500 ₽
 */
export function calculateCardPrice(price: number): number {
  if (!price || price <= 0) return 0
  return Math.round((price * 1.15) / 100) * 100
}

/**
 * Получение актуальной цены при оплате картой.
 * Приоритет: заданная cardPrice товара, иначе автоматический расчет от базовой цены price.
 */
export function getEffectiveCardPrice(product: { price: number; cardPrice?: number | null }): number {
  if (product.cardPrice && product.cardPrice > 0) {
    return product.cardPrice
  }
  return calculateCardPrice(product.price)
}

// Логотипы брендов (моно-версии) загружены из theSVG.org
const brandLogos: Record<string, string> = {
  Apple: "/brands/apple.svg",
  Samsung: "/brands/samsung.svg",
  Xiaomi: "/brands/xiaomi.svg",
  ASUS: "/brands/asus.svg",
  LG: "/brands/lg.svg",
  Sony: "/brands/sony.svg",
}

export function getBrandLogo(brand: string) {
  return brandLogos[brand]
}

export const categories: Category[] = [
  { slug: "apple", name: "Apple" },
  { slug: "lego", name: "Lego" },
  { slug: "dyson", name: "Dyson" },
  { slug: "samsung", name: "Samsung" },
  { slug: "consoles", name: "Игровые консоли" },
  { slug: "accessories", name: "Аксессуары и Адаптеры" },
  { slug: "airpods", name: "AirPods" },
  { slug: "apple-watch", name: "Apple Watch" },
  { slug: "ipad", name: "iPad" },
  { slug: "macbook", name: "MacBook" },
  { slug: "iphone-14", name: "iPhone 14" },
  { slug: "iphone-15", name: "iPhone 15" },
  { slug: "iphone-16", name: "iPhone 16" },
  { slug: "iphone-17", name: "iPhone 17" },
  { slug: "iphone-18", name: "iPhone 18" },
]

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getCategoryName(slug: string) {
  if (!slug) return ""
  return (
    categories.find((category) => category.slug.toLowerCase() === slug.toLowerCase())?.name ??
    slug
  )
}

const galleryByCategory: Record<string, string[]> = {
  smartphones: [
    "/products/smartphones/1.png",
    "/products/smartphones/2.png",
    "/products/smartphones/3.png",
  ],
  laptops: ["/products/laptops/1.png", "/products/laptops/2.png", "/products/laptops/3.png"],
  monitors: ["/products/monitors/1.png", "/products/monitors/2.png", "/products/monitors/3.png"],
  audio: ["/products/audio/1.png", "/products/audio/2.png", "/products/audio/3.png"],
  wearables: ["/products/wearables/1.png", "/products/wearables/2.png", "/products/wearables/3.png"],
  home: ["/products/home/1.png", "/products/home/2.png", "/products/home/3.png"],
}

export function getProductImages(product: Product) {
  // Загруженные админом фото имеют приоритет над галереей по категории
  if (product.images && product.images.length > 0) {
    return product.images
  }

  const gallery = galleryByCategory[product.category] ?? []
  // товары одной категории показывают снимки в разном порядке
  const offset = product.id.length % Math.max(gallery.length, 1)
  return [...gallery.slice(offset), ...gallery.slice(0, offset)]
}
