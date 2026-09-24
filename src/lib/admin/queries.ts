import { createClient } from "@/lib/supabase/server"
import { mapProduct, type ProductRow } from "@/lib/products/queries"
import type { Order, OrderStatus } from "@/lib/account/queries"
import type { ProductAttribute, ProductAttributeValue } from "@/lib/admin/attributes-types"
import type { Product } from "@/lib/products"

const PRODUCT_COLUMNS =
  "id, slug, name, brand, series, variant_group, category, price, old_price, rating, reviews, in_stock, is_visible, badge, colors, specs, images, description, sort"

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

export async function getAllBrands(): Promise<{ id: number; slug: string; name: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase.from("brands").select("id, slug, name").order("name")
  return (data as { id: number; slug: string; name: string }[] | null) ?? []
}

export type AdminGroup = {
  id: number
  name: string
  brand_id: number
  category_slug: string
  parent_group?: string | null
  attribute_ids?: number[]
}

export async function getAllGroups(): Promise<AdminGroup[]> {
  const supabase = await createClient()
  let { data, error } = await supabase
    .from("product_groups")
    .select("id, name, brand_id, category_slug, parent_group, attribute_ids")
    .order("name")

  if (error) {
    const fb1 = await supabase
      .from("product_groups")
      .select("id, name, brand_id, category_slug, parent_group")
      .order("name")
    if (fb1.error) {
      const fb2 = await supabase
        .from("product_groups")
        .select("id, name, brand_id, category_slug")
        .order("name")
      return (fb2.data as AdminGroup[] | null) ?? []
    }
    return (fb1.data as AdminGroup[] | null) ?? []
  }
  return (data as AdminGroup[] | null) ?? []
}

export type AdminCategory = {
  id: number
  slug: string
  name: string
  is_visible: boolean
}

export async function getAllCategories(): Promise<AdminCategory[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, is_visible")
    .order("name")
  return (data as AdminCategory[] | null) ?? []
}

export async function getCategoriesWithGroups(): Promise<{
  categories: AdminCategory[]
  groups: AdminGroup[]
  brands: { id: number; name: string }[]
}> {
  const supabase = await createClient()

  const fetchGroups = async (): Promise<AdminGroup[]> => {
    const res = await supabase
      .from("product_groups")
      .select("id, name, brand_id, category_slug, parent_group, attribute_ids")
      .order("name")

    if (!res.error && res.data) {
      return res.data as AdminGroup[]
    }

    const fb1 = await supabase
      .from("product_groups")
      .select("id, name, brand_id, category_slug, parent_group")
      .order("name")

    if (!fb1.error && fb1.data) {
      return fb1.data as AdminGroup[]
    }

    const fb2 = await supabase
      .from("product_groups")
      .select("id, name, brand_id, category_slug")
      .order("name")

    return (fb2.data as AdminGroup[] | null) ?? []
  }

  const [categoriesRes, groups, brandsRes] = await Promise.all([
    supabase.from("categories").select("id, slug, name, is_visible").order("name"),
    fetchGroups(),
    supabase.from("brands").select("id, name").order("name"),
  ])

  return {
    categories: (categoriesRes.data as AdminCategory[] | null) ?? [],
    groups,
    brands: (brandsRes.data as { id: number; name: string }[] | null) ?? [],
  }
}

/** Получение характеристик, привязанных к группе (серии) товара */
export async function getGroupAttributes(
  seriesName?: string | null,
  categorySlug?: string | null
): Promise<ProductAttribute[]> {
  if (!seriesName) return []
  const supabase = await createClient()

  try {
    let query = supabase
      .from("product_groups")
      .select("id, name, parent_group, attribute_ids")
      .eq("name", seriesName)

    if (categorySlug) {
      query = query.eq("category_slug", categorySlug)
    }

    const { data: groups } = await query.limit(1)
    const group = groups?.[0] as
      | { id: number; name: string; parent_group?: string | null; attribute_ids?: number[] }
      | undefined

    let attributeIds: number[] = group?.attribute_ids ?? []

    // Если у конкретной группы нет характеристик, но есть общая группа (parent_group) — проверяем родительскую группу
    if ((!attributeIds || attributeIds.length === 0) && group?.parent_group) {
      const { data: parentGroups } = await supabase
        .from("product_groups")
        .select("attribute_ids")
        .eq("parent_group", group.parent_group)
        .not("attribute_ids", "is", null)
        .limit(5)

      for (const pg of (parentGroups ?? []) as { attribute_ids?: number[] }[]) {
        if (pg.attribute_ids && pg.attribute_ids.length > 0) {
          attributeIds = pg.attribute_ids
          break
        }
      }
    }

    if (!attributeIds || attributeIds.length === 0) {
      return []
    }

    // Загружаем атрибуты со значениями
    const allAttributes = await getAllAttributesWithValues()
    const idMap = new Map(allAttributes.map((a) => [a.id, a]))

    // Возвращаем в том порядке, в котором они сохранены в attributeIds
    return attributeIds
      .map((id) => idMap.get(id))
      .filter((a): a is ProductAttribute => Boolean(a))
  } catch (err) {
    console.error("Error in getGroupAttributes:", err)
    return []
  }
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
      "id, user_id, status, payment_id, subtotal, delivery, total, recipient_name, phone, address, created_at, order_items(id, product_slug, name, category, color, price, quantity)",
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
      "id, user_id, status, payment_id, subtotal, delivery, total, recipient_name, phone, address, created_at, order_items(id, product_slug, name, category, color, price, quantity)",
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

export async function getAllAttributesWithValues(): Promise<ProductAttribute[]> {
  const supabase = await createClient()

  let attributes: (Omit<ProductAttribute, "values"> & { is_filter?: boolean })[] | null = null
  const { data: withFilter, error } = await supabase
    .from("product_attributes")
    .select("id, slug, name, type, category_slug, sort, is_filter")
    .order("sort", { ascending: true })
    .order("name", { ascending: true })

  if (!error && withFilter) {
    attributes = withFilter as (Omit<ProductAttribute, "values"> & { is_filter?: boolean })[]
  } else {
    // Если колонка is_filter еще не создана в БД, запрашиваем без неё
    const { data: fallbackData } = await supabase
      .from("product_attributes")
      .select("id, slug, name, type, category_slug, sort")
      .order("sort", { ascending: true })
      .order("name", { ascending: true })

    if (fallbackData) {
      attributes = (fallbackData as Omit<ProductAttribute, "values">[]).map((a) => ({
        ...a,
        is_filter:
          /цвет|color|памят|storage|sim|сим/i.test(a.name) ||
          /цвет|color|памят|storage|sim|сим/i.test(a.slug),
      }))
    }
  }

  if (!attributes?.length) return []

  const { data: values } = await supabase
    .from("product_attribute_values")
    .select("id, attribute_id, label, value, color_hex, sort")
    .order("sort", { ascending: true })
    .order("label", { ascending: true })

  const valuesByAttr = new Map<number, ProductAttributeValue[]>()
  for (const row of (values as ProductAttributeValue[] | null) ?? []) {
    const list = valuesByAttr.get(row.attribute_id) ?? []
    list.push(row)
    valuesByAttr.set(row.attribute_id, list)
  }

  return attributes.map((attr) => ({
    ...attr,
    is_filter: Boolean(attr.is_filter),
    type: attr.type as ProductAttribute["type"],
    values: valuesByAttr.get(attr.id) ?? [],
  }))
}

export async function getAttributeById(id: number): Promise<ProductAttribute | null> {
  const supabase = await createClient()

  let attribute: (Omit<ProductAttribute, "values"> & { is_filter?: boolean }) | null = null
  const { data: withFilter, error } = await supabase
    .from("product_attributes")
    .select("id, slug, name, type, category_slug, sort, is_filter")
    .eq("id", id)
    .maybeSingle()

  if (!error && withFilter) {
    attribute = withFilter as Omit<ProductAttribute, "values"> & { is_filter?: boolean }
  } else {
    const { data: fallbackData } = await supabase
      .from("product_attributes")
      .select("id, slug, name, type, category_slug, sort")
      .eq("id", id)
      .maybeSingle()

    if (fallbackData) {
      attribute = {
        ...(fallbackData as Omit<ProductAttribute, "values">),
        is_filter:
          /цвет|color|памят|storage|sim|сим/i.test(fallbackData.name) ||
          /цвет|color|памят|storage|sim|сим/i.test(fallbackData.slug),
      }
    }
  }

  if (!attribute) return null

  const { data: values } = await supabase
    .from("product_attribute_values")
    .select("id, attribute_id, label, value, color_hex, sort")
    .eq("attribute_id", id)
    .order("sort", { ascending: true })
    .order("label", { ascending: true })

  return {
    ...attribute,
    is_filter: Boolean(attribute.is_filter),
    type: attribute.type as ProductAttribute["type"],
    values: (values as ProductAttributeValue[] | null) ?? [],
  }
}
