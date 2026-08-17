import { createClient } from "@/lib/supabase/server"
import type { Banner } from "@/lib/banners/types"

// Строка таблицы banners (snake_case из БД)
export type BannerRow = {
  id: string
  title: string
  subtitle: string | null
  bg_color: string
  text_color: string
  image: string | null
  href: string | null
  is_visible: boolean
  sort: number
}

const BANNER_COLUMNS =
  "id, title, subtitle, bg_color, text_color, image, href, is_visible, sort"

export function mapBanner(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? "",
    bgColor: row.bg_color,
    textColor: row.text_color === "dark" ? "dark" : "light",
    image: row.image ?? "",
    href: row.href ?? "",
    isVisible: row.is_visible,
    sort: row.sort,
  }
}

// Витрина: только видимые баннеры, по порядку
export async function getBanners(): Promise<Banner[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("banners")
    .select(BANNER_COLUMNS)
    .eq("is_visible", true)
    .order("sort", { ascending: true })

  return ((data as BannerRow[] | null) ?? []).map(mapBanner)
}

// Админка: все баннеры, по порядку
export async function getAllBanners(): Promise<Banner[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("banners")
    .select(BANNER_COLUMNS)
    .order("sort", { ascending: true })

  return ((data as BannerRow[] | null) ?? []).map(mapBanner)
}

export async function getBannerById(id: string): Promise<Banner | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("banners")
    .select(BANNER_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  return data ? mapBanner(data as BannerRow) : null
}
