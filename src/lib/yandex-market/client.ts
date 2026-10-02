import type {
  YandexMarketCampaign,
  YandexMarketConfig,
  YandexMarketFeed,
  YandexMarketOfferMappingItem,
  YandexMarketOfferPrice,
  YandexMarketOfferStock,
  YandexMarketOrder,
} from "./types"

const YANDEX_MARKET_API_URL = "https://api.partner.market.yandex.ru"

export class YandexMarketClient {
  public apiKey: string
  public campaignId: string
  public businessId: string
  public warehouseId?: string

  constructor(config?: Partial<YandexMarketConfig>) {
    this.apiKey =
      config?.apiKey ||
      process.env.YANDEX_MARKET_API_KEY ||
      process.env.YANDEX_MARKET_TOKEN ||
      ""
    this.campaignId =
      config?.campaignId ||
      process.env.YANDEX_MARKET_CAMPAIGN_ID ||
      ""
    this.businessId =
      config?.businessId ||
      process.env.YANDEX_MARKET_BUSINESS_ID ||
      ""
    this.warehouseId =
      config?.warehouseId ||
      process.env.YANDEX_MARKET_WAREHOUSE_ID ||
      ""
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && (this.campaignId || this.businessId))
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("API-ключ Яндекс.Маркета не задан. Укажите его в настройках.")
    }

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    // Убедимся, что путь имеет префикс версии, если требуется
    const normalizedPath = cleanEndpoint.startsWith("/v2") || cleanEndpoint.startsWith("/v3") || cleanEndpoint.startsWith("/v1")
      ? cleanEndpoint
      : `/v2${cleanEndpoint}`

    const url = `${YANDEX_MARKET_API_URL}${normalizedPath}`

    const headers: Record<string, string> = {
      "Api-Key": this.apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...((options.headers as Record<string, string>) || {}),
    }

    // Для OAuth токенов добавляем Bearer, для ACMA API-ключей используется Api-Key
    if (!this.apiKey.startsWith("ACMA:")) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: "no-store",
      })

      if (response.status === 429) {
        if (retries > 0) {
          const retryAfter = Number(response.headers.get("Retry-After") || 3)
          console.warn(`[Yandex Market] Лимит 429. Ожидание ${retryAfter} сек...`)
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))
          return this.request<T>(endpoint, options, retries - 1)
        }
        throw new Error("Превышен лимит запросов к Яндекс.Маркет API (429)")
      }

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Ошибка Яндекс.Маркет [${response.status}]: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.message) {
            errorMessage = errorJson.message
          } else if (errorJson.errors && Array.isArray(errorJson.errors)) {
            errorMessage = errorJson.errors
              .map((e: any) => e.message || e.code || JSON.stringify(e))
              .join("; ")
          } else if (errorJson.error?.message) {
            errorMessage = errorJson.error.message
          }
        } catch {
          if (errorText) errorMessage += ` - ${errorText.slice(0, 200)}`
        }
        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return {} as T
      }

      return (await response.json()) as T
    } catch (error: any) {
      if (retries > 0 && error?.message?.includes("fetch failed")) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        return this.request<T>(endpoint, options, retries - 1)
      }
      throw error
    }
  }

  // ==========================================
  // Кампании и Бизнесы
  // ==========================================

  /**
   * Получение списка всех кампаний магазина, доступных по API-ключу
   */
  async getCampaigns(): Promise<YandexMarketCampaign[]> {
    const data = await this.request<{ campaigns?: YandexMarketCampaign[] }>("/campaigns")
    return data.campaigns || []
  }

  /**
   * Получение детальной информации о кампании
   */
  async getCampaign(campaignId?: string): Promise<YandexMarketCampaign | null> {
    const id = campaignId || this.campaignId
    if (!id) throw new Error("Идентификатор кампании не указан")
    const data = await this.request<{ campaign?: YandexMarketCampaign }>(`/campaigns/${id}`)
    return data.campaign || null
  }

  /**
   * Получение информации о бизнесе (кабинете)
   */
  async getBusinessInfo(businessId?: string): Promise<any> {
    const id = businessId || this.businessId
    if (!id) throw new Error("Идентификатор бизнеса не указан")
    return this.request(`/businesses/${id}/info`)
  }

  /**
   * Проверка соединения с API Маркета
   */
  async testConnection(): Promise<{
    ok: boolean
    campaigns: YandexMarketCampaign[]
    detectedBusinessId?: number
    activeCampaign?: YandexMarketCampaign
    message?: string
  }> {
    try {
      const campaigns = await this.getCampaigns()
      const targetCampaign = campaigns.find(
        (c) => String(c.id) === String(this.campaignId)
      ) || campaigns[0]

      const businessId = targetCampaign?.business?.id || (this.businessId ? Number(this.businessId) : undefined)

      if (campaigns.length > 0) {
        return {
          ok: true,
          campaigns,
          detectedBusinessId: businessId,
          activeCampaign: targetCampaign,
          message: `Успешно подключено к Яндекс.Маркет! Найдено кампаний: ${campaigns.length}`,
        }
      }

      // Если список кампаний пуст, но задан businessId или campaignId — проверяем кабинет бизнеса
      const testId = this.businessId || this.campaignId
      if (testId) {
        try {
          await this.getOffers(1, undefined, testId)
          return {
            ok: true,
            campaigns: [],
            detectedBusinessId: Number(testId),
            message: `Авторизация успешна! Подключен кабинет бизнеса #${testId}`,
          }
        } catch (offerErr: any) {
          const errMsg = offerErr?.message || ""
          if (errMsg.includes("API_DISABLED") || errMsg.includes("disabled partners")) {
            return {
              ok: true,
              campaigns: [],
              detectedBusinessId: Number(testId),
              message: `Авторизация успешна (Бизнес #${testId}). Внимание: в кабинете Маркета магазин находится на модерации или отключен.`,
            }
          }
          throw offerErr
        }
      }

      return {
        ok: true,
        campaigns: [],
        message: "Авторизация успешна, но кампании не найдены в этом аккаунте",
      }
    } catch (err: any) {
      return {
        ok: false,
        campaigns: [],
        message: err.message || "Ошибка подключения к Яндекс.Маркет API",
      }
    }
  }

  // ==========================================
  // Каталог и Оферы
  // ==========================================

  /**
   * Получение списка товаров из каталога бизнеса
   */
  async getOffers(
    limit = 50,
    pageToken?: string,
    businessId?: string
  ): Promise<{
    offers: any[]
    paging?: { nextPageToken?: string }
    total?: number
  }> {
    const bId = businessId || this.businessId
    if (!bId) throw new Error("Business ID не указан")

    const query = new URLSearchParams()
    if (limit) query.set("limit", String(limit))
    if (pageToken) query.set("page_token", pageToken)

    const qs = query.toString() ? `?${query.toString()}` : ""
    const res = await this.request<{
      result?: {
        offerMappings?: any[]
        paging?: { nextPageToken?: string }
        total?: number
      }
    }>(`/businesses/${bId}/offer-mappings${qs}`, {
      method: "POST",
      body: JSON.stringify({}),
    })

    return {
      offers: res.result?.offerMappings || [],
      paging: res.result?.paging,
      total: res.result?.total,
    }
  }

  /**
   * Добавление или обновление товаров в каталоге бизнеса Маркета
   */
  async updateOfferMappings(
    offers: YandexMarketOfferMappingItem[],
    businessId?: string
  ): Promise<any> {
    const bId = businessId || this.businessId
    if (!bId) throw new Error("Business ID не указан")
    if (!offers.length) return { result: { offers: [] } }

    return this.request(`/businesses/${bId}/offer-mappings/update`, {
      method: "POST",
      body: JSON.stringify({
        offerMappings: offers,
      }),
    })
  }

  // ==========================================
  // Цены
  // ==========================================

  /**
   * Обновление цен предложений для кампании или бизнеса
   */
  async updatePrices(
    prices: Array<{
      offerId: string
      price: number
      oldPrice?: number
      currencyId?: string
    }>,
    campaignId?: string
  ): Promise<any> {
    if (!prices.length) return { result: { offers: [] } }

    const offersPayload = prices.map((p) => ({
      id: p.offerId,
      price: {
        value: p.price,
        currencyId: (p.currencyId || "RUR") as "RUR",
        discountBase: p.oldPrice && p.oldPrice > p.price ? p.oldPrice : undefined,
      },
    }))

    const cId = campaignId || this.campaignId
    if (cId) {
      return this.request(`/campaigns/${cId}/offer-prices/updates`, {
        method: "POST",
        body: JSON.stringify({ offers: offersPayload }),
      })
    }

    const bId = this.businessId
    if (bId) {
      return this.request(`/businesses/${bId}/offer-prices/updates`, {
        method: "POST",
        body: JSON.stringify({ offers: offersPayload }),
      })
    }

    throw new Error("Не указан Campaign ID или Business ID для обновления цен")
  }

  // ==========================================
  // Остатки на складе (FBS / DBS)
  // ==========================================

  /**
   * Обновление остатков товаров на складе
   */
  async updateStocks(
    stocks: Array<{ sku: string; count: number }>,
    warehouseId?: string,
    campaignId?: string
  ): Promise<any> {
    const cId = campaignId || this.campaignId
    const wId = Number(warehouseId || this.warehouseId)

    if (!cId) throw new Error("Campaign ID не указан")
    if (!wId || isNaN(wId)) {
      throw new Error("Warehouse ID (ID склада) не указан или некорректен")
    }

    const now = new Date().toISOString()
    const skusPayload: YandexMarketOfferStock[] = stocks.map((s) => ({
      sku: s.sku,
      warehouseId: wId,
      items: [
        {
          type: "FIT",
          count: Math.max(0, s.count),
          updatedAt: now,
        },
      ],
    }))

    return this.request(`/campaigns/${cId}/offers/stocks`, {
      method: "PUT",
      body: JSON.stringify({ skus: skusPayload }),
    })
  }

  // ==========================================
  // Заказы (Orders)
  // ==========================================

  /**
   * Получение списка заказов из Яндекс.Маркета
   */
  async getOrders(params?: {
    status?: string
    substatus?: string
    fromDate?: string
    toDate?: string
    page?: number
    pageSize?: number
    campaignId?: string
  }): Promise<{
    orders: YandexMarketOrder[]
    pager?: {
      currentPage: number
      pagesCount: number
      pageSize: number
      total: number
    }
  }> {
    const cId = params?.campaignId || this.campaignId
    if (!cId) throw new Error("Campaign ID не указан")

    const query = new URLSearchParams()
    if (params?.status) query.set("status", params.status)
    if (params?.substatus) query.set("substatus", params.substatus)
    if (params?.fromDate) query.set("fromDate", params.fromDate)
    if (params?.toDate) query.set("toDate", params.toDate)
    if (params?.page) query.set("page", String(params.page))
    if (params?.pageSize) query.set("pageSize", String(params.pageSize || 50))

    const qs = query.toString() ? `?${query.toString()}` : ""
    const res = await this.request<{
      orders?: YandexMarketOrder[]
      pager?: any
    }>(`/campaigns/${cId}/orders${qs}`)

    return {
      orders: res.orders || [],
      pager: res.pager,
    }
  }

  /**
   * Получение информации о конкретном заказе
   */
  async getOrder(orderId: number | string, campaignId?: string): Promise<YandexMarketOrder | null> {
    const cId = campaignId || this.campaignId
    if (!cId) throw new Error("Campaign ID не указан")

    const res = await this.request<{ order?: YandexMarketOrder }>(
      `/campaigns/${cId}/orders/${orderId}`
    )
    return res.order || null
  }

  /**
   * Обновление статуса заказа (например, для DBS/FBS)
   */
  async updateOrderStatus(
    orderId: number | string,
    status: string,
    substatus?: string,
    campaignId?: string
  ): Promise<any> {
    const cId = campaignId || this.campaignId
    if (!cId) throw new Error("Campaign ID не указан")

    const payload: { order: { status: string; substatus?: string } } = {
      order: { status },
    }
    if (substatus) payload.order.substatus = substatus

    return this.request(`/campaigns/${cId}/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  }

  // ==========================================
  // Фиды (Feeds)
  // ==========================================

  /**
   * Получение списка зарегистрированных фидов кампании
   */
  async getFeeds(campaignId?: string): Promise<YandexMarketFeed[]> {
    const cId = campaignId || this.campaignId
    if (!cId) return []

    try {
      const res = await this.request<{ feeds?: YandexMarketFeed[] }>(
        `/campaigns/${cId}/feeds`
      )
      return res.feeds || []
    } catch {
      return []
    }
  }

  /**
   * Принудительное обновление прайс-листа (фида)
   */
  async refreshFeed(feedId: number | string, campaignId?: string): Promise<any> {
    const cId = campaignId || this.campaignId
    if (!cId) throw new Error("Campaign ID не указан")

    return this.request(`/campaigns/${cId}/feeds/${feedId}/refresh`, {
      method: "POST",
    })
  }
}
