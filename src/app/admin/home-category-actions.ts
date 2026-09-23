"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/guard"

export type HomeCategoryActionState = { ok: boolean; error?: string }

const BUCKET = "category-images"

function parseCardForm(formData: FormData) {
  return {
    category_label: String(formData.get("category_label") ?? "").trim() || "Категория",
    title: String(formData.get("title") ?? "").trim() || "Товар",
    price_from: String(formData.get("price_from") ?? "").trim(),
    href: String(formData.get("href") ?? "").trim() || "/catalog",
    is_visible: formData.get("is_visible") === "on",
    sort: Number(formData.get("sort") ?? 0),
  }
}

// Возвращает URL картинки или сообщение об ошибке загрузки
async function resolveImageField(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  fileFieldName: string,
  existingFieldName: string,
): Promise<{ url: string; error?: string }> {
  const existing = String(formData.get(existingFieldName) ?? "").trim()
  const file = formData.get(fileFieldName)

  if (file instanceof File && file.size > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png"
    const path = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`

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
        error: `Ошибка загрузки файла (${uploadError.message}).`,
      }
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return { url: data.publicUrl }
  }

  return { url: existing }
}

export async function createHomeCategoryCard(
  _prev: HomeCategoryActionState,
  formData: FormData,
): Promise<HomeCategoryActionState> {
  const { supabase } = await requireAdmin()
  const payload = parseCardForm(formData)

  const { url: image, error: uploadErr } = await resolveImageField(
    formData,
    supabase,
    "image_file",
    "image_url",
  )
  if (uploadErr) return { ok: false, error: uploadErr }

  const { error } = await supabase.from("home_categories").insert({
    ...payload,
    image,
  })

  if (error) {
    console.error("Error creating home category card:", error)
    return { ok: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/home-categories")
  redirect("/admin/home-categories")
}

export async function updateHomeCategoryCard(
  id: string,
  _prev: HomeCategoryActionState,
  formData: FormData,
): Promise<HomeCategoryActionState> {
  const { supabase } = await requireAdmin()
  const payload = parseCardForm(formData)

  const { url: image, error: uploadErr } = await resolveImageField(
    formData,
    supabase,
    "image_file",
    "image_url",
  )
  if (uploadErr) return { ok: false, error: uploadErr }

  const { error } = await supabase
    .from("home_categories")
    .update({
      ...payload,
      image,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating home category card:", error)
    return { ok: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/home-categories")
  redirect("/admin/home-categories")
}

export async function deleteHomeCategoryCard(id: string): Promise<void> {
  const { supabase } = await requireAdmin()
  await supabase.from("home_categories").delete().eq("id", id)

  revalidatePath("/")
  revalidatePath("/admin/home-categories")
}

export async function toggleHomeCategoryCardVisibility(
  id: string,
  isVisible: boolean,
): Promise<void> {
  const { supabase } = await requireAdmin()
  await supabase
    .from("home_categories")
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
    .eq("id", id)

  revalidatePath("/")
  revalidatePath("/admin/home-categories")
}
