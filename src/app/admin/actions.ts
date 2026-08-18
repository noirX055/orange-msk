"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/admin/guard"
import type { OrderStatus } from "@/lib/account/queries"

export type AdminActionState = { ok: boolean; error?: string; message?: string }

const BUCKET = "product-images"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-я\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Разбирает общие поля товара из формы
function parseProductForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const slugRaw = String(formData.get("slug") ?? "").trim()
  const slug = slugRaw ? slugify(slugRaw) : slugify(name)

  const badge = String(formData.get("badge") ?? "").trim()
  const oldPriceRaw = String(formData.get("old_price") ?? "").trim()

  let colors: { name: string; hex: string }[] = []
  let specs: { label: string; value: string }[] = []
  try {
    colors = JSON.parse(String(formData.get("colors") ?? "[]"))
  } catch {
    colors = []
  }
  try {
    specs = JSON.parse(String(formData.get("specs") ?? "[]"))
  } catch {
    specs = []
  }

  const parseNum = (val: string) => Number(val.replace(/\s/g, "").replace(",", "."))

  return {
    name,
    slug,
    brand: String(formData.get("brand") ?? "").trim(),
    series: String(formData.get("series") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim(),
    price: parseNum(String(formData.get("price") ?? "0")),
    old_price: oldPriceRaw ? parseNum(oldPriceRaw) : null,
    rating: parseNum(String(formData.get("rating") ?? "0")),
    reviews: parseNum(String(formData.get("reviews") ?? "0")),
    in_stock: formData.get("in_stock") === "on",
    is_visible: formData.get("is_visible") === "on",
    badge: badge || null,
    description: String(formData.get("description") ?? "").trim(),
    colors: colors.filter((c) => c.name),
    specs: specs.filter((s) => s.label),
  }
}

// Существующие URL картинок передаются скрытым полем; новые файлы — input[type=file]
async function collectImages(
  formData: FormData,
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  slug: string,
): Promise<string[]> {
  let kept: string[] = []
  try {
    kept = JSON.parse(String(formData.get("existing_images") ?? "[]"))
  } catch {
    kept = []
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0)

  for (const [index, file] of files.entries()) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    // Уникальное имя без Date.now(): slug + индекс + размер
    const path = `${slug}/${index}-${file.size}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type || undefined,
    })
    if (error) continue
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    kept.push(data.publicUrl)
  }

  return kept
}

export async function createProduct(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdmin()
  const fields = parseProductForm(formData)

  if (!fields.name) return { ok: false, error: "Укажите название" }
  if (!fields.brand) return { ok: false, error: "Укажите бренд" }
  if (!fields.category) return { ok: false, error: "Выберите категорию" }
  if (!fields.price || fields.price <= 0) return { ok: false, error: "Укажите цену" }

  const images = await collectImages(formData, supabase, fields.slug)

  const { error } = await supabase.from("products").insert({ ...fields, images })

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Товар с таким slug уже существует" }
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  revalidatePath("/")
  redirect("/admin/products")
}

export async function updateProduct(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) return { ok: false, error: "Не указан товар" }

  const fields = parseProductForm(formData)
  if (!fields.name) return { ok: false, error: "Укажите название" }
  if (!fields.price || fields.price <= 0) return { ok: false, error: "Укажите цену" }

  const images = await collectImages(formData, supabase, fields.slug)

  const { error } = await supabase.from("products").update({ ...fields, images }).eq("id", Number(id))

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Товар с таким slug уже существует" }
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  revalidatePath("/")
  revalidatePath(`/product/${fields.slug}`)
  redirect("/admin/products")
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await supabase.from("products").delete().eq("id", Number(id))
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  revalidatePath("/")
}

// Быстрое переключение видимости товара на витрине (из списка товаров)
export async function toggleProductVisibility(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const visible = String(formData.get("visible") ?? "") === "1"
  if (!id) return

  await supabase.from("products").update({ is_visible: visible }).eq("id", Number(id))
  revalidatePath("/admin/products")
  revalidatePath("/catalog")
  revalidatePath("/")
}

// ---------- Заказы ----------
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "") as OrderStatus
  if (!id || !status) return

  await supabase.from("orders").update({ status }).eq("id", id)
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${id}`)
}

export async function removeOrderItem(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const itemId = String(formData.get("item_id") ?? "")
  const orderId = String(formData.get("order_id") ?? "")
  if (!itemId) return

  await supabase.from("order_items").delete().eq("id", itemId)

  // Пересчитываем суммы заказа
  if (orderId) {
    const { data: items } = await supabase
      .from("order_items")
      .select("price, quantity")
      .eq("order_id", orderId)
    const { data: order } = await supabase
      .from("orders")
      .select("delivery")
      .eq("id", orderId)
      .maybeSingle()

    const subtotal = (items ?? []).reduce(
      (sum, i) => sum + (i as { price: number; quantity: number }).price * (i as { price: number; quantity: number }).quantity,
      0,
    )
    const delivery = (order as { delivery: number } | null)?.delivery ?? 0
    await supabase
      .from("orders")
      .update({ subtotal, total: subtotal + delivery })
      .eq("id", orderId)
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/orders")
}

export async function deleteOrder(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await supabase.from("orders").delete().eq("id", id)
  revalidatePath("/admin/orders")
  redirect("/admin/orders")
}
