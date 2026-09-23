import { createClient } from "@/lib/supabase/server"
import type { HomeCategoryCard } from "./types"

export type HomeCategoryRow = {
  id: string
  category_label: string
  title: string
  image: string
  price_from: string
  href: string
  is_visible: boolean
  sort: number
}

const COLUMNS =
  "id, category_label, title, image, price_from, href, is_visible, sort"

export const defaultHomeCategoryCards: HomeCategoryCard[] = [
  {
    id: "default-iphone-16",
    categoryLabel: "Смартфоны",
    title: "iPhone 16",
    image: "/categories/smartphone.png",
    priceFrom: "от 99 900 ₽",
    href: "/catalog?category=apple&series=iPhone+16",
    isVisible: true,
    sort: 10,
  },
  {
    id: "default-iphone-15",
    categoryLabel: "Смартфоны",
    title: "iPhone 15",
    image: "/categories/smartphone.png",
    priceFrom: "от 79 900 ₽",
    href: "/catalog?category=apple&series=iPhone+15",
    isVisible: true,
    sort: 20,
  },
  {
    id: "default-macbook",
    categoryLabel: "Ноутбуки",
    title: "MacBook",
    image: "/categories/laptop.png",
    priceFrom: "от 129 900 ₽",
    href: "/catalog?category=apple&series=MacBook",
    isVisible: true,
    sort: 30,
  },
  {
    id: "default-ipad",
    categoryLabel: "Планшеты",
    title: "iPad",
    image: "/categories/laptop.png",
    priceFrom: "от 59 900 ₽",
    href: "/catalog?category=apple&series=iPad",
    isVisible: true,
    sort: 40,
  },
  {
    id: "default-apple-watch",
    categoryLabel: "Смарт-часы",
    title: "Apple Watch",
    image: "/categories/whatch.png",
    priceFrom: "от 39 900 ₽",
    href: "/catalog?category=apple&series=Apple+Watch",
    isVisible: true,
    sort: 50,
  },
  {
    id: "default-airpods",
    categoryLabel: "Наушники",
    title: "AirPods",
    image: "/categories/audi.png",
    priceFrom: "от 19 900 ₽",
    href: "/catalog?category=apple&series=AirPods",
    isVisible: true,
    sort: 60,
  },
]

export function mapHomeCategory(row: HomeCategoryRow): HomeCategoryCard {
  return {
    id: row.id,
    categoryLabel: row.category_label,
    title: row.title,
    image: row.image ?? "",
    priceFrom: row.price_from ?? "",
    href: row.href ?? "/catalog",
    isVisible: row.is_visible,
    sort: row.sort,
  }
}

// Витрина: только видимые карточки, по порядку (с fallback)
export async function getHomeCategoryCards(): Promise<HomeCategoryCard[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("home_categories")
      .select(COLUMNS)
      .eq("is_visible", true)
      .order("sort", { ascending: true })

    if (error || !data || data.length === 0) {
      return defaultHomeCategoryCards
    }

    return (data as HomeCategoryRow[]).map(mapHomeCategory)
  } catch (err) {
    console.error("Error fetching home categories:", err)
    return defaultHomeCategoryCards
  }
}

// Админка: все карточки, по порядку
export async function getAllHomeCategoryCards(): Promise<HomeCategoryCard[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("home_categories")
      .select(COLUMNS)
      .order("sort", { ascending: true })

    if (error) {
      console.error("Error fetching all home categories:", error)
      return defaultHomeCategoryCards
    }

    if (!data || data.length === 0) {
      return defaultHomeCategoryCards
    }

    return (data as HomeCategoryRow[]).map(mapHomeCategory)
  } catch (err) {
    console.error("Error fetching all home categories:", err)
    return defaultHomeCategoryCards
  }
}

export async function getHomeCategoryCardById(id: string): Promise<HomeCategoryCard | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("home_categories")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle()

    if (error || !data) {
      return defaultHomeCategoryCards.find((c) => c.id === id) ?? null
    }

    return mapHomeCategory(data as HomeCategoryRow)
  } catch (err) {
    console.error("Error fetching home category by id:", err)
    return defaultHomeCategoryCards.find((c) => c.id === id) ?? null
  }
}
