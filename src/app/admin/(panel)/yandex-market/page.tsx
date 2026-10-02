import type { Metadata } from "next"
import { requireAdmin } from "@/lib/admin/guard"
import { getAdminClient } from "@/lib/supabase/admin"
import {
  getYandexMarketSettings,
  getMarketSyncLogs,
  getInitializedMarketClient,
} from "@/lib/yandex-market/settings"
import { MarketDashboard } from "@/components/admin/yandex-market/market-dashboard"
import type { YandexMarketFeed, YandexMarketOrder } from "@/lib/yandex-market/types"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Яндекс.Маркет — Админ-панель",
  description: "Интеграция с Яндекс.Маркет Partner API в магазине Orange MSK",
}

export default async function AdminYandexMarketPage() {
  await requireAdmin()

  const {
    settings,
    maskedApiKey,
    isConfigured,
    isTableReady,
    source,
  } = await getYandexMarketSettings()

  const supabase = getAdminClient()

  // Загружаем статистику товаров
  const [totalRes, inStockRes, productsRes, logs] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_visible", true),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_visible", true)
      .eq("in_stock", true),
    supabase
      .from("products")
      .select("id, name, slug, brand, category, price, old_price, in_stock, is_visible, images")
      .order("created_at", { ascending: false })
      .limit(200),
    getMarketSyncLogs(30),
  ])

  const totalProducts = totalRes.count || 0
  const inStockProducts = inStockRes.count || 0
  const products = productsRes.data || []

  // Если API настроен, пробуем получить заказы и фиды из Маркета
  let orders: YandexMarketOrder[] = []
  let feeds: YandexMarketFeed[] = []

  if (isConfigured && settings.campaignId) {
    try {
      const client = await getInitializedMarketClient()
      const [ordersRes, feedsRes] = await Promise.all([
        client.getOrders({ pageSize: 50 }).catch(() => ({ orders: [] })),
        client.getFeeds().catch(() => []),
      ])

      orders = ordersRes.orders || []
      feeds = feedsRes || []
    } catch (e) {
      console.warn("[Admin YandexMarket] Ошибка загрузки данных Маркета:", e)
    }
  }

  return (
    <MarketDashboard
      initialSettings={settings}
      maskedApiKey={maskedApiKey}
      isConfigured={isConfigured}
      isTableReady={isTableReady}
      source={source}
      totalProducts={totalProducts}
      inStockProducts={inStockProducts}
      orders={orders}
      feeds={feeds}
      logs={logs}
      products={products}
    />
  )
}
