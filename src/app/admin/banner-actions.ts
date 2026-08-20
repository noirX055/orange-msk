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
  const rawTitle = String(formData.get("title") ?? "").trim()
  return {
    title: rawTitle || "Баннер",
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    bg_color: String(formData.get("bg_color") ?? "").trim() || "#22303f",
    text_color: textColor === "dark" ? "dark" : "light",
    href: String(formData.get("href") ?? "").trim(),
    is_visible: formData.get("is_visible") === "on",
  }
}

// Возвращает URL картинки или сообщение об ошибке загрузки
async function resolveImage(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  titleSlug: string,
): Promise<{ url: string; error?: string }> {
  const existing = String(formData.get("existing_image") ?? "").trim()
  const file = formData.get("image")

  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"
    // Чистый ASCII ключ для Supabase Storage без кириллицы
    const path = `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`

    // Пытаемся автоматически гарантировать наличие бакета 'banner-images'
    try {
      await supabase.storage.createBucket(BUCKET, { public: true })
    } catch {
      // Бакет уже существует
    }

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    })

    if (uploadError) {
      console.error("Supabase Storage error:", uploadError)
      return {
        url: "",
        error: `Ошибка загрузки файла в Supabase (${uploadError.message}). Убедитесь, что бакет 'banner-images' создан в хранилище Supabase.`,
      }
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl }
  }

  return { url: existing }
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

  const { url: image, error: uploadErr } = await resolveImage(formData, supabase, slugifyTitle(fields.title))
  if (uploadErr) return { ok: false, error: uploadErr }
  if (!image) return { ok: false, error: "Пожалуйста, выберите и загрузите фото баннера" }

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

  const { url: image, error: uploadErr } = await resolveImage(formData, supabase, slugifyTitle(fields.title))
  if (uploadErr) return { ok: false, error: uploadErr }

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
