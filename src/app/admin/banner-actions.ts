"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/guard"

export type BannerActionState = { ok: boolean; error?: string }

const BUCKET = "banner-images"

function slugifyTitle(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-я\s-]/gi, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") || "banner"
  )
}

function parseBannerForm(formData: FormData) {
  const textColor = String(formData.get("text_color") ?? "light")
  return {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    bg_color: String(formData.get("bg_color") ?? "").trim() || "#22303f",
    text_color: textColor === "dark" ? "dark" : "light",
    href: String(formData.get("href") ?? "").trim(),
    is_visible: formData.get("is_visible") === "on",
  }
}

// Возвращает URL картинки: новый файл имеет приоритет, иначе оставляем существующий
async function resolveImage(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  titleSlug: string,
): Promise<string> {
  const existing = String(formData.get("existing_image") ?? "").trim()
  const file = formData.get("image")

  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    // Стабильное имя без Date.now(): slug заголовка + размер файла
    const path = `${titleSlug}/${file.size}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    })
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      return data.publicUrl
    }
  }

  return existing
}

function revalidateBanners() {
  revalidatePath("/admin/banners")
  revalidatePath("/")
}

export async function createBanner(
  _prev: BannerActionState,
  formData: FormData,
): Promise<BannerActionState> {
  const { supabase } = await requireAdmin()
  const fields = parseBannerForm(formData)

  if (!fields.title) return { ok: false, error: "Укажите заголовок" }

  const image = await resolveImage(formData, supabase, slugifyTitle(fields.title))

  // Новый баннер — в конец списка
  const { data: last } = await supabase
    .from("banners")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle()
  const sort = ((last as { sort: number } | null)?.sort ?? 0) + 1

  const { error } = await supabase.from("banners").insert({ ...fields, image, sort })
  if (error) return { ok: false, error: error.message }

  revalidateBanners()
  redirect("/admin/banners")
}

export async function updateBanner(
  _prev: BannerActionState,
  formData: FormData,
): Promise<BannerActionState> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) return { ok: false, error: "Не указан баннер" }

  const fields = parseBannerForm(formData)
  if (!fields.title) return { ok: false, error: "Укажите заголовок" }

  const image = await resolveImage(formData, supabase, slugifyTitle(fields.title))

  const { error } = await supabase.from("banners").update({ ...fields, image }).eq("id", id)
  if (error) return { ok: false, error: error.message }

  revalidateBanners()
  redirect("/admin/banners")
}

export async function deleteBanner(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await supabase.from("banners").delete().eq("id", id)
  revalidateBanners()
}

export async function toggleBannerVisibility(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const visible = String(formData.get("visible") ?? "") === "1"
  if (!id) return

  await supabase.from("banners").update({ is_visible: visible }).eq("id", id)
  revalidateBanners()
}

// Перестановка порядка: обмен sort с соседним баннером
export async function moveBanner(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const dir = String(formData.get("dir") ?? "")
  if (!id || (dir !== "up" && dir !== "down")) return

  const { data } = await supabase
    .from("banners")
    .select("id, sort")
    .order("sort", { ascending: true })
  const list = (data as { id: string; sort: number }[] | null) ?? []

  const index = list.findIndex((banner) => banner.id === id)
  if (index === -1) return
  const neighbor = dir === "up" ? list[index - 1] : list[index + 1]
  if (!neighbor) return

  const current = list[index]
  // Меняем значения sort местами
  await supabase.from("banners").update({ sort: neighbor.sort }).eq("id", current.id)
  await supabase.from("banners").update({ sort: current.sort }).eq("id", neighbor.id)

  revalidateBanners()
}
