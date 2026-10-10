/**
 * Модуль сквозной аналитики и электронной коммерции для Яндекс Метрики
 * Счётчик Orange MSK: 113057205
 */

export const YANDEX_METRIKA_ID = 113057205

export type AnalyticsGoal =
  | "order_success"       // Успешное оформление/оплата заказа (Главная макро-цель)
  | "begin_checkout"     // Переход к оформлению заказа из корзины (Микро-цель)
  | "add_to_cart"        // Добавление любого товара в корзину (Микро-цель)
  | "remove_from_cart"   // Удаление товара из корзины
  | "view_cart"          // Просмотр корзины
  | "product_view"       // Просмотр карточки товара
  | "add_to_favorites"   // Добавление в избранное (Интерес к покупке)
  | "lead_contact"       // Любой клик по контактам (Звонок, Telegram, WhatsApp)
  | "click_phone"        // Клик по номеру телефона
  | "click_telegram"     // Клик / переход в Telegram
  | "click_whatsapp"     // Клик / переход в WhatsApp
  | "click_instagram"    // Клик / переход в Instagram
  | "search_query"       // Использование поиска по каталогу

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Безопасная отправка цели (JavaScript-события) в Яндекс Метрику
 */
export function reachGoal(goal: AnalyticsGoal, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return

  try {
    if (typeof window.ym === "function") {
      if (params) {
        window.ym(YANDEX_METRIKA_ID, "reachGoal", goal, params)
      } else {
        window.ym(YANDEX_METRIKA_ID, "reachGoal", goal)
      }
    }
  } catch (err) {
    // Безопасно при наличии блокировщиков рекламы
  }
}

/**
 * Безопасная отправка события в dataLayer (Яндекс Электронная коммерция)
 */
function pushEcommerce(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return

  try {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push(payload)
  } catch (err) {
    // Безопасно
  }
}

/**
 * Просмотр товара (ecommerce.detail + цель product_view)
 */
export function trackProductView(product: {
  id: string
  name: string
  price: number
  category?: string
  brand?: string
}) {
  reachGoal("product_view", { id: product.id, name: product.name })

  pushEcommerce({
    ecommerce: {
      currencyCode: "RUB",
      detail: {
        products: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            brand: product.brand || "Orange MSK",
            category: product.category || "Электроника",
          },
        ],
      },
    },
  })
}

/**
 * Добавление в корзину (ecommerce.add + цель add_to_cart)
 */
export function trackAddToCart(item: {
  id: string
  name: string
  price: number
  category?: string
  quantity?: number
  color?: string
}) {
  const qty = item.quantity ?? 1

  reachGoal("add_to_cart", {
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: qty,
  })

  pushEcommerce({
    ecommerce: {
      currencyCode: "RUB",
      add: {
        products: [
          {
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category || "Электроника",
            variant: item.color,
            quantity: qty,
          },
        ],
      },
    },
  })
}

/**
 * Удаление из корзины (ecommerce.remove + цель remove_from_cart)
 */
export function trackRemoveFromCart(item: {
  id: string
  name: string
  price: number
  category?: string
  quantity?: number
  color?: string
}) {
  reachGoal("remove_from_cart", { id: item.id })

  pushEcommerce({
    ecommerce: {
      currencyCode: "RUB",
      remove: {
        products: [
          {
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            variant: item.color,
            quantity: item.quantity ?? 1,
          },
        ],
      },
    },
  })
}

/**
 * Переход к чекауту / оформлению заказа (цель begin_checkout)
 */
export function trackBeginCheckout(
  items: Array<{ id: string; name: string; price: number; quantity: number }>,
  total: number
) {
  reachGoal("begin_checkout", {
    total,
    itemsCount: items.length,
  })
}

/**
 * Успешное оформление/оплата заказа (ecommerce.purchase + цель order_success)
 */
export function trackPurchase(order: {
  id: string
  revenue: number
  items?: Array<{
    id: string
    name: string
    price: number
    quantity?: number
    category?: string
    color?: string
  }>
}) {
  reachGoal("order_success", {
    orderId: order.id,
    revenue: order.revenue,
  })

  pushEcommerce({
    ecommerce: {
      currencyCode: "RUB",
      purchase: {
        actionField: {
          id: order.id,
          revenue: order.revenue,
        },
        products: (order.items || []).map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          variant: item.color,
          quantity: item.quantity ?? 1,
        })),
      },
    },
  })
}

/**
 * Клик по контакту (звонок, Telegram, WhatsApp)
 */
export function trackContactClick(
  channel: "phone" | "telegram" | "whatsapp" | "instagram",
  label?: string
) {
  reachGoal("lead_contact", { channel, label })

  if (channel === "phone") {
    reachGoal("click_phone", { label })
  } else if (channel === "telegram") {
    reachGoal("click_telegram", { label })
  } else if (channel === "whatsapp") {
    reachGoal("click_whatsapp", { label })
  } else if (channel === "instagram") {
    reachGoal("click_instagram", { label })
  }
}

/**
 * Добавление в избранное
 */
export function trackFavoriteToggle(action: "add" | "remove", slug: string) {
  if (action === "add") {
    reachGoal("add_to_favorites", { slug })
  }
}

/**
 * Поиск по сайту
 */
export function trackSearch(query: string) {
  if (query.trim().length >= 2) {
    reachGoal("search_query", { query: query.trim() })
  }
}
