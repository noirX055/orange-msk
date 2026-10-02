import { getAdminClient } from "@/lib/supabase/admin"
import { YandexMarketClient } from "./client"
import type { YandexMarketConfig, YandexMarketSyncLog } from "./types"

const DEFAULT_SETTINGS_ID = "default"

export interface LoadedSettingsResult {
  settings: YandexMarketConfig
  maskedApiKey: string
  isConfigured: boolean
  isTableReady: boolean
  source: "database" | "env" | "not_configured"
}

export function maskApiKey(key?: string): string {
  if (!key) return ""
  if (key.length <= 8) return "********"
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`
}

export async function getYandexMarketSettings(): Promise<LoadedSettingsResult> {
  const defaultFeedUrl = `${
    process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
  }/yandex-feed.xml`

  const envSettings: YandexMarketConfig = {
    apiKey:
      process.env.YANDEX_MARKET_API_KEY ||
      process.env.YANDEX_MARKET_TOKEN ||
      "",
    campaignId: process.env.YANDEX_MARKET_CAMPAIGN_ID || "",
    businessId: process.env.YANDEX_MARKET_BUSINESS_ID || "",
    warehouseId: process.env.YANDEX_MARKET_WAREHOUSE_ID || "",
    feedUrl: process.env.YANDEX_MARKET_FEED_URL || defaultFeedUrl,
    autoSyncPrices: false,
    autoSyncStocks: false,
  }

  let dbRow: any = null
  let isTableReady = true

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("yandex_market_settings")
      .select("*")
      .eq("id", DEFAULT_SETTINGS_ID)
      .maybeSingle()

    if (error) {
      isTableReady = false
    } else {
      dbRow = data
    }
  } catch {
    isTableReady = false
  }

  const mergedSettings: YandexMarketConfig = {
    apiKey: dbRow?.api_key || envSettings.apiKey || "",
    campaignId: dbRow?.campaign_id || envSettings.campaignId || "",
    businessId: dbRow?.business_id || envSettings.businessId || "",
    warehouseId: dbRow?.warehouse_id || envSettings.warehouseId || "",
    feedUrl: dbRow?.feed_url || envSettings.feedUrl || defaultFeedUrl,
    autoSyncPrices: Boolean(dbRow?.auto_sync_prices),
    autoSyncStocks: Boolean(dbRow?.auto_sync_stocks),
  }

  const isConfigured = Boolean(
    mergedSettings.apiKey && (mergedSettings.campaignId || mergedSettings.businessId)
  )

  let source: LoadedSettingsResult["source"] = "not_configured"
  if (dbRow?.api_key || dbRow?.campaign_id) {
    source = "database"
  } else if (envSettings.apiKey) {
    source = "env"
  }

  return {
    settings: mergedSettings,
    maskedApiKey: maskApiKey(mergedSettings.apiKey),
    isConfigured,
    isTableReady,
    source,
  }
}

export async function saveYandexMarketSettings(
  config: Partial<YandexMarketConfig>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = getAdminClient()

    const payload: Record<string, any> = {
      id: DEFAULT_SETTINGS_ID,
      updated_at: new Date().toISOString(),
    }

    if (config.apiKey !== undefined && config.apiKey !== "") {
      payload.api_key = config.apiKey.trim()
    }
    if (config.campaignId !== undefined) {
      payload.campaign_id = config.campaignId.trim()
    }
    if (config.businessId !== undefined) {
      payload.business_id = config.businessId.trim()
    }
    if (config.warehouseId !== undefined) {
      payload.warehouse_id = config.warehouseId.trim()
    }
    if (config.feedUrl !== undefined) {
      payload.feed_url = config.feedUrl.trim()
    }
    if (config.autoSyncPrices !== undefined) {
      payload.auto_sync_prices = Boolean(config.autoSyncPrices)
    }
    if (config.autoSyncStocks !== undefined) {
      payload.auto_sync_stocks = Boolean(config.autoSyncStocks)
    }

    const { error } = await supabase
      .from("yandex_market_settings")
      .upsert(payload, { onConflict: "id" })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message || "Ошибка сохранения настроек" }
  }
}

export async function logMarketSync(
  action: string,
  status: "success" | "error" | "warning",
  itemsCount: number,
  message?: string,
  details?: any
): Promise<void> {
  try {
    const supabase = getAdminClient()
    await supabase.from("yandex_market_sync_logs").insert({
      action,
      status,
      items_count: itemsCount,
      message,
      details: details ? details : null,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    console.warn("[YandexMarket] Не удалось записать лог:", err)
  }
}

export async function getMarketSyncLogs(limit = 20): Promise<YandexMarketSyncLog[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from("yandex_market_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as YandexMarketSyncLog[]
  } catch {
    return []
  }
}

export async function getInitializedMarketClient(): Promise<YandexMarketClient> {
  const { settings } = await getYandexMarketSettings()
  return new YandexMarketClient(settings)
}
