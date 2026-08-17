"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return { supabase, user }
}

export type ActionState = { ok: boolean; error?: string; message?: string }

// ---------- Профиль ----------
export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser()

  const full_name = String(formData.get("full_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim()

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone })
    .eq("id", user.id)

  if (error) return { ok: false, error: error.message }

  revalidatePath("/account/profile")
  revalidatePath("/account")
  return { ok: true, message: "Профиль обновлён" }
}

// ---------- Избранное ----------
export async function toggleFavorite(productSlug: string): Promise<ActionState> {
  const { supabase, user } = await requireUser()

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_slug", productSlug)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, product_slug: productSlug })
    if (error) return { ok: false, error: error.message }
  }

  revalidatePath("/account/favorites")
  revalidatePath("/account")
  return { ok: true }
}

export async function removeFavorite(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser()
  const productSlug = String(formData.get("product_slug") ?? "")

  await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", productSlug)

  revalidatePath("/account/favorites")
  revalidatePath("/account")
}

// ---------- Адреса ----------
export async function addAddress(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, user } = await requireUser()

  const street = String(formData.get("street") ?? "").trim()
  if (!street) return { ok: false, error: "Укажите улицу и дом" }

  const label = String(formData.get("label") ?? "").trim() || null
  const city = String(formData.get("city") ?? "").trim() || "Москва"
  const apartment = String(formData.get("apartment") ?? "").trim() || null
  const comment = String(formData.get("comment") ?? "").trim() || null
  const makeDefault = formData.get("is_default") === "on"

  // Есть ли уже адреса — первый становится основным автоматически
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)

  const is_default = makeDefault || (count ?? 0) === 0

  if (is_default) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label,
    city,
    street,
    apartment,
    comment,
    is_default,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath("/account/addresses")
  return { ok: true, message: "Адрес добавлен" }
}

export async function deleteAddress(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser()
  const id = String(formData.get("id") ?? "")

  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id)
  revalidatePath("/account/addresses")
}

export async function setDefaultAddress(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser()
  const id = String(formData.get("id") ?? "")

  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id)
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id)

  revalidatePath("/account/addresses")
}

// ---------- Заказы ----------
export type NewOrderItem = {
  product_slug: string
  name: string
  category?: string
  color?: string
  price: number
  quantity: number
}

export async function createOrder(input: {
  items: NewOrderItem[]
  subtotal: number
  delivery: number
  total: number
  recipient_name?: string
  phone?: string
  address?: string
}): Promise<ActionState & { orderId?: string }> {
  const { supabase, user } = await requireUser()

  if (!input.items.length) return { ok: false, error: "Корзина пуста" }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "new",
      subtotal: input.subtotal,
      delivery: input.delivery,
      total: input.total,
      recipient_name: input.recipient_name ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
    })
    .select("id")
    .single()

  if (orderError || !order) return { ok: false, error: orderError?.message ?? "Ошибка" }

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_slug: item.product_slug,
      name: item.name,
      category: item.category ?? null,
      color: item.color ?? null,
      price: item.price,
      quantity: item.quantity,
    }))
  )

  if (itemsError) return { ok: false, error: itemsError.message }

  revalidatePath("/account/orders")
  revalidatePath("/account")
  return { ok: true, orderId: order.id }
}

// ---------- Выход ----------
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
