// Клиент-безопасные типы и константы заказов/профиля.
// Без серверных импортов — можно использовать в клиентских компонентах.

export type Profile = {
  id: string
  full_name: string | null
  role: "user" | "admin"
  phone: string | null
  created_at: string
}

export type OrderStatus =
  | "new"
  | "pending_payment"
  | "processing"
  | "shipping"
  | "done"
  | "cancelled"
  | "refunded"

export type OrderItem = {
  id: string
  product_slug: string
  name: string
  category: string | null
  color: string | null
  price: number
  quantity: number
}

export type Order = {
  id: string
  status: OrderStatus
  payment_id: string | null
  subtotal: number
  delivery: number
  total: number
  recipient_name: string | null
  phone: string | null
  address: string | null
  comment?: string | null
  created_at: string
  order_items: OrderItem[]
}

export type Favorite = {
  id: string
  product_slug: string
  created_at: string
}

export type Address = {
  id: string
  label: string | null
  city: string
  street: string
  apartment: string | null
  comment: string | null
  is_default: boolean
  created_at: string
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  new: { label: "Новый (на кассе)", tone: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
  pending_payment: { label: "Ожидает оплаты", tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  processing: { label: "Оплачен (в обработке)", tone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" },
  shipping: { label: "В доставке", tone: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" },
  done: { label: "Выдан / Доставлен", tone: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
  cancelled: { label: "Отменён", tone: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
  refunded: { label: "Возвращён", tone: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
}

/** Заказы, по которым можно оформить возврат через ЮKassa */
export const REFUNDABLE_ORDER_STATUSES: OrderStatus[] = ["processing", "shipping", "done"]
