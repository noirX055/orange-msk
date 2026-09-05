"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/guard"
import type { AdminActionState } from "@/app/admin/actions"
import type { AttributeType } from "@/lib/admin/attributes-types"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-я\s-_]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function parseAttributeType(raw: string): AttributeType | null {
  if (raw === "text" || raw === "select" || raw === "color") return raw
  return null
}

function revalidateAttributes(attributeId?: number) {
  revalidatePath("/admin/attributes")
  if (attributeId) revalidatePath(`/admin/attributes/${attributeId}`)
  revalidatePath("/admin/products")
  revalidatePath("/admin/products/new")
}

export async function createAttribute(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdmin()
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(name)
  const type = parseAttributeType(String(formData.get("type") ?? ""))
  const categorySlug = String(formData.get("category_slug") ?? "").trim() || null
  const sort = Number(formData.get("sort") ?? 0) || 0

  if (!name) return { ok: false, error: "Укажите название" }
  if (!type) return { ok: false, error: "Выберите тип" }

  const { data, error } = await supabase.from("product_attributes").insert({
    name,
    slug,
    type,
    category_slug: categorySlug,
    sort,
  }).select("id").single()

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Характеристика с таким slug уже есть" }
    return { ok: false, error: error.message }
  }

  revalidateAttributes()
  redirect(`/admin/attributes/${data.id}`)
}

export async function updateAttribute(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get("id"))
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(name)
  const type = parseAttributeType(String(formData.get("type") ?? ""))
  const categorySlug = String(formData.get("category_slug") ?? "").trim() || null
  const sort = Number(formData.get("sort") ?? 0) || 0

  if (!id) return { ok: false, error: "Не указана характеристика" }
  if (!name) return { ok: false, error: "Укажите название" }
  if (!type) return { ok: false, error: "Выберите тип" }

  const { error } = await supabase
    .from("product_attributes")
    .update({ name, slug, type, category_slug: categorySlug, sort })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Характеристика с таким slug уже есть" }
    return { ok: false, error: error.message }
  }

  revalidateAttributes(id)
  return { ok: true, message: "Сохранено" }
}

export async function deleteAttribute(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get("id"))
  if (!id) return

  await supabase.from("product_attributes").delete().eq("id", id)
  revalidateAttributes()
  redirect("/admin/attributes")
}

export async function createAttributeValue(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdmin()
  const attributeId = Number(formData.get("attribute_id"))
  const label = String(formData.get("label") ?? "").trim()
  const valueRaw = String(formData.get("value") ?? "").trim()
  const value = valueRaw ? slugify(valueRaw) : slugify(label)
  const colorHex = String(formData.get("color_hex") ?? "").trim() || null
  const sort = Number(formData.get("sort") ?? 0) || 0

  if (!attributeId) return { ok: false, error: "Не указана характеристика" }
  if (!label) return { ok: false, error: "Укажите название значения" }

  const { data: attr } = await supabase
    .from("product_attributes")
    .select("type")
    .eq("id", attributeId)
    .maybeSingle()

  if (attr?.type === "color" && !colorHex) {
    return { ok: false, error: "Для цвета укажите RGB/HEX код" }
  }

  const { error } = await supabase.from("product_attribute_values").insert({
    attribute_id: attributeId,
    label,
    value,
    color_hex: attr?.type === "color" ? colorHex : null,
    sort,
  })

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Такое значение уже есть в списке" }
    return { ok: false, error: error.message }
  }

  revalidateAttributes(attributeId)
  return { ok: true, message: "Значение добавлено" }
}

export async function updateAttributeValue(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get("id"))
  const attributeId = Number(formData.get("attribute_id"))
  const label = String(formData.get("label") ?? "").trim()
  const valueRaw = String(formData.get("value") ?? "").trim()
  const value = valueRaw ? slugify(valueRaw) : slugify(label)
  const colorHex = String(formData.get("color_hex") ?? "").trim() || null
  const sort = Number(formData.get("sort") ?? 0) || 0

  if (!id) return { ok: false, error: "Не указано значение" }
  if (!label) return { ok: false, error: "Укажите название значения" }

  const { data: attr } = await supabase
    .from("product_attributes")
    .select("type")
    .eq("id", attributeId)
    .maybeSingle()

  if (attr?.type === "color" && !colorHex) {
    return { ok: false, error: "Для цвета укажите RGB/HEX код" }
  }

  const { error } = await supabase
    .from("product_attribute_values")
    .update({
      label,
      value,
      color_hex: attr?.type === "color" ? colorHex : null,
      sort,
    })
    .eq("id", id)

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Такое значение уже есть в списке" }
    return { ok: false, error: error.message }
  }

  revalidateAttributes(attributeId)
  return { ok: true, message: "Сохранено" }
}

export async function deleteAttributeValue(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = Number(formData.get("id"))
  const attributeId = Number(formData.get("attribute_id"))
  if (!id) return

  await supabase.from("product_attribute_values").delete().eq("id", id)
  revalidateAttributes(attributeId || undefined)
}
