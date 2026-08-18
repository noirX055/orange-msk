import { createClient } from "@/lib/supabase/server"
import { mapProduct, type ProductRow } from "@/lib/products/queries"
import type { Order, OrderStatus } from "@/lib/account/queries"
import type { Product } from "@/lib/products"

const PRODUCT_COLUMNS =
  "id, slug, name, brand, series, category, price, old_price, rating, reviews, in_stock, is_visible, badge, colors, specs, images, description, sort"

export type AdminStats = {
  products: number
  orders: number
  pending: number
  revenue: number
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient()

  const [{ count: products }, { count: orders }, { count: pending }, { data: doneOrders }] =
    await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("orders").select("total").eq("status", "done"),
    ])

  const revenue = (doneOrders ?? []).reduce(
    (sum, row) => sum + ((row as { total: number }).total ?? 0),
    0,
  )

  return {
    products: products ?? 0,
    orders: orders ?? 0,
    pending: pending ?? 0,
    revenue,
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  
  let allData: ProductRow[] = []
  let from = 0
  let to = 999
  let hasMore = true

  while (hasMore) {
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("name", { ascending: true })
      .range(from, to)

    if (data && data.length > 0) {
      allData = allData.concat(data as ProductRow[])
      from += 1000
      to += 1000
      if (data.length < 1000) hasMore = false
    } else {
      hasMore = false
    }
  }

  return allData.map(mapProduct)
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .maybeSingle()

  return data ? mapProduct(data as ProductRow) : null
}

// Заказ с именем покупателя для админских списков
export type AdminOrder = Order & { buyer_name: string | null; buyer_email_id: string }

export async function getAllOrders(status?: OrderStatus): Promise<AdminOrder[]> {
  const supabase = await createClient()

  let query = supabase
    .from("orders")
    .select(
      "id, user_id, status, subtotal, delivery, total, recipient_name, phone, address, created_at, order_items(id, product_slug, name, category, color, price, quantity)",
    )
    .order("created_at", { ascending: false })

  if (status) query = query.eq("status", status)

  const { data } = await query
  const orders = (data as (Order & { user_id: string })[] | null) ?? []

  // Имена покупателей — отдельным запросом по profiles (политика Admins can view all profiles)
  const userIds = Array.from(new Set(orders.map((order) => order.user_id)))
  const names = new Map<string, string | null>()

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds)

    for (const profile of (profiles as { id: string; full_name: string | null }[] | null) ?? []) {
      names.set(profile.id, profile.full_name)
    }
  }

  return orders.map((order) => ({
    ...order,
    buyer_name: names.get(order.user_id) ?? null,
    buyer_email_id: order.user_id,
  }))
}

export async function getOrderById(id: string): Promise<AdminOrder | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, subtotal, delivery, total, recipient_name, phone, address, created_at, order_items(id, product_slug, name, category, color, price, quantity)",
    )
    .eq("id", id)
    .maybeSingle()

  if (!data) return null
  const order = data as Order & { user_id: string }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", order.user_id)
    .maybeSingle()

  return {
    ...order,
    buyer_name: (profile as { full_name: string | null } | null)?.full_name ?? null,
    buyer_email_id: order.user_id,
  }
}
