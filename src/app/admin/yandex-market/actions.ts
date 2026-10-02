"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/admin/guard"
import {
  getYandexMarketSettings,
  saveYandexMarketSettings,
  getInitializedMarketClient,
  logMarketSync,
} from "@/lib/yandex-market/settings"
import {
  syncPricesToMarket,
  syncStocksToMarket,
  pushCatalogToMarket,
} from "@/lib/yandex-market/sync"

export type MarketActionState = {
  ok: boolean
  error?: string
  message?: string
  data?: any
}

/**
 * Сохранение настроек Яндекс.Маркета
 */
export async function saveMarketSettingsAction(
  _prev: MarketActionState,
  formData: FormData
): Promise<MarketActionState> {
  await requireAdmin()

  const apiKey = String(formData.get("api_key") ?? "").trim()
  const campaignId = String(formData.get("campaign_id") ?? "").trim()
  const businessId = String(formData.get("business_id") ?? "").trim()
  const warehouseId = String(formData.get("warehouse_id") ?? "").trim()
  const feedUrl = String(formData.get("feed_url") ?? "").trim()
  const autoSyncPrices = formData.get("auto_sync_prices") === "on"
  const autoSyncStocks = formData.get("auto_sync_stocks") === "on"

  const payload: Record<string, any> = {
    campaignId,
    businessId,
    warehouseId,
    feedUrl,
    autoSyncPrices,
    autoSyncStocks,
  }

  // Не перезаписываем ключ, если пользователь оставил поле пустым (маскированным)
  if (apiKey && !apiKey.includes("••••")) {
    payload.apiKey = apiKey
  }

  const result = await saveYandexMarketSettings(payload)

  if (!result.ok) {
    return { ok: false, error: result.error || "Не удалось сохранить настройки" }
  }

  revalidatePath("/admin/yandex-market")
  return { ok: true, message: "Настройки Яндекс.Маркета успешно сохранены" }
}

/**
 * Проверка подключения к Яндекс.Маркет API
 */
export async function testMarketConnectionAction(): Promise<MarketActionState> {
  await requireAdmin()

  try {
    const client = await getInitializedMarketClient()
    if (!client.apiKey) {
      return { ok: false, error: "Укажите API-ключ в настройках" }
    }

    const test = await client.testConnection()
    if (!test.ok) {
      return { ok: false, error: test.message }
    }

    return {
      ok: true,
      message: test.message,
      data: {
        campaigns: test.campaigns,
        detectedBusinessId: test.detectedBusinessId,
        activeCampaign: test.activeCampaign,
      },
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Ошибка подключения к Яндекс.Маркет API",
    }
  }
}

/**
 * Синхронизация цен с Яндекс.Маркетом
 */
export async function syncPricesAction(): Promise<MarketActionState> {
  await requireAdmin()

  try {
    const res = await syncPricesToMarket()
    revalidatePath("/admin/yandex-market")
    return {
      ok: res.ok,
      message: res.message,
      error: res.errors.length ? res.errors.slice(0, 3).join("; ") : undefined,
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Ошибка при синхронизации цен",
    }
  }
}

/**
 * Синхронизация остатков с Яндекс.Маркетом
 */
export async function syncStocksAction(): Promise<MarketActionState> {
  await requireAdmin()

  try {
    const res = await syncStocksToMarket()
    revalidatePath("/admin/yandex-market")
    return {
      ok: res.ok,
      message: res.message,
      error: res.errors.length ? res.errors.slice(0, 3).join("; ") : undefined,
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Ошибка при синхронизации остатков",
    }
  }
}

/**
 * Выгрузка каталога магазина в кабинет Маркета
 */
export async function pushCatalogAction(): Promise<MarketActionState> {
  await requireAdmin()

  try {
    const res = await pushCatalogToMarket()
    revalidatePath("/admin/yandex-market")
    return {
      ok: res.ok,
      message: res.message,
      error: res.errors.length ? res.errors.slice(0, 3).join("; ") : undefined,
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Ошибка при выгрузке каталога",
    }
  }
}

/**
 * Принудительное обновление фида в кабинете Маркета
 */
export async function refreshMarketFeedAction(feedId: number | string): Promise<MarketActionState> {
  await requireAdmin()

  try {
    const client = await getInitializedMarketClient()
    await client.refreshFeed(feedId)
    await logMarketSync("feed_refresh", "success", 1, `Запрошено обновление фида #${feedId}`)
    revalidatePath("/admin/yandex-market")
    return {
      ok: true,
      message: `Запрос на обновление фида #${feedId} отправлен в Яндекс.Маркет`,
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Ошибка обновления фида",
    }
  }
}

/**
 * Смена статуса заказа Маркета
 */
export async function updateMarketOrderStatusAction(
  formData: FormData
): Promise<MarketActionState> {
  await requireAdmin()

  const orderId = String(formData.get("order_id") ?? "")
  const status = String(formData.get("status") ?? "")
  const substatus = String(formData.get("substatus") ?? "") || undefined

  if (!orderId || !status) {
    return { ok: false, error: "Укажите номер заказа и статус" }
  }

  try {
    const client = await getInitializedMarketClient()
    await client.updateOrderStatus(orderId, status, substatus)
    revalidatePath("/admin/yandex-market")
    return {
      ok: true,
      message: `Статус заказа #${orderId} изменён на ${status}`,
    }
  } catch (err: any) {
    return {
      ok: false,
      error: err.message || "Ошибка при смене статуса заказа",
    }
  }
}
