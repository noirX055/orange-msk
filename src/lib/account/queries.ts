import { createClient } from "@/lib/supabase/server"
import type { Profile, Order, Favorite, Address } from "@/lib/account/types"

// Реэкспорт клиент-безопасных типов и ORDER_STATUS для серверных потребителей
export * from "@/lib/account/types"

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, created_at")
    .eq("id", user.id)
    .single()

  return data as Profile | null
}

export async function getOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(
      "id, status, payment_id, subtotal, delivery, total, recipient_name, phone, address, created_at, order_items(id, product_slug, name, category, color, price, quantity)"
    )
    .order("created_at", { ascending: false })

  return (data as Order[] | null) ?? []
}

export async function getFavorites(): Promise<Favorite[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("favorites")
    .select("id, product_slug, created_at")
    .order("created_at", { ascending: false })

  return (data as Favorite[] | null) ?? []
}

export async function getAddresses(): Promise<Address[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("addresses")
    .select("id, label, city, street, apartment, comment, is_default, created_at")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  return (data as Address[] | null) ?? []
}
