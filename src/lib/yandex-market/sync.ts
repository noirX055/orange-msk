import { getAdminClient } from "@/lib/supabase/admin"
import { getInitializedMarketClient, logMarketSync } from "./settings"
import type { YandexMarketOfferMappingItem } from "./types"

const BATCH_SIZE = 250

export interface SyncResult {
  ok: boolean
  totalProcessed: number
  totalSuccessful: number
  totalFailed: number
  errors: string[]
  message: string
}

/**
 * Синхронизация цен из базы магазина в Яндекс.Маркет
 */
export async function syncPricesToMarket(): Promise<SyncResult> {
  const client = await getInitializedMarketClient()
  if (!client.isConfigured()) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: ["API-ключ или Campaign ID не настроены"],
      message: "Интеграция не настроена",
    }
  }

  const supabase = getAdminClient()
  const { data: products, error: dbError } = await supabase
    .from("products")
    .select("id, slug, price, old_price, is_visible")
    .eq("is_visible", true)
    .gt("price", 0)

  if (dbError) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: [dbError.message],
      message: "Ошибка загрузки товаров из базы данных",
    }
  }

  const items = products || []
  if (!items.length) {
    return {
      ok: true,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: [],
      message: "Нет активных товаров с ценой для выгрузки",
    }
  }

  const pricesToSync = items.map((p) => ({
    offerId: String(p.id),
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    currencyId: "RUR",
  }))

  let totalSuccessful = 0
  let totalFailed = 0
  const errors: string[] = []

  for (let i = 0; i < pricesToSync.length; i += BATCH_SIZE) {
    const batch = pricesToSync.slice(i, i + BATCH_SIZE)
    try {
      await client.updatePrices(batch)
      totalSuccessful += batch.length
    } catch (err: any) {
      totalFailed += batch.length
      errors.push(`Пакет ${i + 1}-${i + batch.length}: ${err.message}`)
    }
  }

  const isSuccess = totalFailed === 0
  await logMarketSync(
    "sync_prices",
    isSuccess ? "success" : totalSuccessful > 0 ? "warning" : "error",
    totalSuccessful,
    `Синхронизировано цен: ${totalSuccessful} из ${pricesToSync.length}`,
    { totalProcessed: pricesToSync.length, errors }
  )

  return {
    ok: isSuccess,
    totalProcessed: pricesToSync.length,
    totalSuccessful,
    totalFailed,
    errors,
    message: isSuccess
      ? `Успешно обновлены цены для ${totalSuccessful} товаров`
      : `Обновлено ${totalSuccessful} из ${pricesToSync.length} цен. Ошибок: ${totalFailed}`,
  }
}

/**
 * Синхронизация остатков из базы магазина в Яндекс.Маркет (FBS / DBS)
 */
export async function syncStocksToMarket(warehouseId?: string): Promise<SyncResult> {
  const client = await getInitializedMarketClient()
  if (!client.isConfigured()) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: ["API-ключ или Campaign ID не настроены"],
      message: "Интеграция не настроена",
    }
  }

  const targetWarehouse = warehouseId || client.warehouseId
  if (!targetWarehouse) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: ["Не указан Warehouse ID (ID склада в Маркете)"],
      message: "Укажите Warehouse ID в настройках интеграции",
    }
  }

  const supabase = getAdminClient()
  const { data: products, error: dbError } = await supabase
    .from("products")
    .select("id, slug, in_stock, is_visible")
    .eq("is_visible", true)

  if (dbError) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: [dbError.message],
      message: "Ошибка загрузки товаров из базы данных",
    }
  }

  const items = products || []
  const stocksToSync = items.map((p) => ({
    sku: String(p.id),
    count: p.in_stock ? 10 : 0, // 10 если в наличии, 0 если нет
  }))

  let totalSuccessful = 0
  let totalFailed = 0
  const errors: string[] = []

  for (let i = 0; i < stocksToSync.length; i += BATCH_SIZE) {
    const batch = stocksToSync.slice(i, i + BATCH_SIZE)
    try {
      await client.updateStocks(batch, targetWarehouse)
      totalSuccessful += batch.length
    } catch (err: any) {
      totalFailed += batch.length
      errors.push(`Пакет ${i + 1}-${i + batch.length}: ${err.message}`)
    }
  }

  const isSuccess = totalFailed === 0
  await logMarketSync(
    "sync_stocks",
    isSuccess ? "success" : totalSuccessful > 0 ? "warning" : "error",
    totalSuccessful,
    `Синхронизировано остатков: ${totalSuccessful} из ${stocksToSync.length}`,
    { warehouseId: targetWarehouse, errors }
  )

  return {
    ok: isSuccess,
    totalProcessed: stocksToSync.length,
    totalSuccessful,
    totalFailed,
    errors,
    message: isSuccess
      ? `Успешно обновлены остатки для ${totalSuccessful} товаров на складе #${targetWarehouse}`
      : `Обновлено ${totalSuccessful} из ${stocksToSync.length} остатков. Ошибок: ${totalFailed}`,
  }
}

/**
 * Выгрузка каталога товаров магазина в кабинет Яндекс.Маркета (offer-mappings)
 */
export async function pushCatalogToMarket(): Promise<SyncResult> {
  const client = await getInitializedMarketClient()
  if (!client.isConfigured() || !client.businessId) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: ["Не указан Business ID (ID кабинета в Маркете) или API-ключ"],
      message: "Укажите Business ID в настройках интеграции",
    }
  }

  const supabase = getAdminClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  const { data: products, error: dbError } = await supabase
    .from("products")
    .select("id, slug, name, brand, category, description, images, is_visible")
    .eq("is_visible", true)

  if (dbError) {
    return {
      ok: false,
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      errors: [dbError.message],
      message: "Ошибка загрузки товаров из базы данных",
    }
  }

  const items = products || []
  const offersToPush: YandexMarketOfferMappingItem[] = items.map((p) => {
    const rawImages = Array.isArray(p.images) ? p.images : []
    const pictures = rawImages
      .filter((img): img is string => typeof img === "string" && Boolean(img.trim()))
      .slice(0, 10)
      .map((img) => (img.startsWith("/") ? `${baseUrl}${img}` : img))

    return {
      offer: {
        offerId: String(p.id),
        name: p.name,
        category: p.category || "Электроника",
        vendor: p.brand || "Orange MSK",
        description: p.description || p.name,
        pictures,
        urls: [`${baseUrl}/product/${p.slug}`],
      },
    }
  })

  let totalSuccessful = 0
  let totalFailed = 0
  const errors: string[] = []

  for (let i = 0; i < offersToPush.length; i += 100) {
    const batch = offersToPush.slice(i, i + 100)
    try {
      await client.updateOfferMappings(batch)
      totalSuccessful += batch.length
    } catch (err: any) {
      totalFailed += batch.length
      let msg = err.message || "Ошибка API"
      if (msg.includes("API_DISABLED") || msg.includes("disabled partners")) {
        msg = "Магазин в кабинете Маркета находится на проверке/модерации или отключен (API_DISABLED)"
      }
      errors.push(`Пакет ${i + 1}-${i + batch.length}: ${msg}`)
    }
  }

  const isSuccess = totalFailed === 0
  await logMarketSync(
    "push_catalog",
    isSuccess ? "success" : totalSuccessful > 0 ? "warning" : "error",
    totalSuccessful,
    `Выгружено товаров в каталог Маркета: ${totalSuccessful} из ${offersToPush.length}`,
    { total: offersToPush.length, errors }
  )

  return {
    ok: isSuccess,
    totalProcessed: offersToPush.length,
    totalSuccessful,
    totalFailed,
    errors,
    message: isSuccess
      ? `Успешно выгружено ${totalSuccessful} товаров в каталог Яндекс.Маркета`
      : `Выгружено ${totalSuccessful} из ${offersToPush.length} товаров. Ошибок: ${totalFailed}`,
  }
}
