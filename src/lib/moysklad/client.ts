import type {
  MoySkladCounterparty,
  MoySkladCustomerOrder,
  MoySkladList,
  MoySkladOrganization,
  MoySkladProduct,
  MoySkladStore,
  MoySkladWebhook,
} from "./types"

const MOYSKLAD_API_URL = "https://api.moysklad.ru/api/remap/1.2"

export class MoySkladClient {
  private token: string

  constructor(token?: string) {
    const apiToken = token || process.env.MOYSKLAD_API_TOKEN
    if (!apiToken) {
      throw new Error("MOYSKLAD_API_TOKEN не задан в переменных окружения")
    }
    this.token = apiToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 3
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${MOYSKLAD_API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip",
      ...((options.headers as Record<string, string>) || {}),
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (response.status === 429) {
        if (retries > 0) {
          const retryAfter = Number(response.headers.get("Retry-After") || 2)
          console.warn(`[MoySklad] Лимит 429. Ожидание ${retryAfter} сек...`)
          await new Promise((r) => setTimeout(r, retryAfter * 1000))
          return this.request<T>(endpoint, options, retries - 1)
        }
        throw new Error("Превышен лимит запросов к MoySklad API (429)")
      }

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Ошибка MoySklad [${response.status}]: ${response.statusText}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.errors && Array.isArray(errorJson.errors)) {
            errorMessage = errorJson.errors.map((e: { error: string }) => e.error).join("; ")
          }
        } catch {
          errorMessage = `${errorMessage} - ${errorText}`
        }
        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return {} as T
      }

      return (await response.json()) as T
    } catch (error) {
      if (retries > 0 && error instanceof Error && error.message.includes("fetch failed")) {
        await new Promise((r) => setTimeout(r, 1500))
        return this.request<T>(endpoint, options, retries - 1)
      }
      throw error
    }
  }

  // --- Товары ---
  async getProducts(limit = 1000, offset = 0): Promise<MoySkladList<MoySkladProduct>> {
    return this.request<MoySkladList<MoySkladProduct>>(
      `/entity/product?limit=${limit}&offset=${offset}`
    )
  }

  async getProductById(id: string): Promise<MoySkladProduct | null> {
    return this.request<MoySkladProduct>(`/entity/product/${id}`)
  }

  async getProductByHref(href: string): Promise<MoySkladProduct | null> {
    return this.request<MoySkladProduct>(href)
  }

  // --- Вебхуки ---
  async getWebhooks(): Promise<MoySkladWebhook[]> {
    const data = await this.request<MoySkladList<MoySkladWebhook>>("/entity/webhook")
    return data.rows || []
  }

  async createWebhook(data: {
    url: string
    action: "CREATE" | "UPDATE" | "DELETE"
    entityType: string
  }): Promise<MoySkladWebhook> {
    return this.request<MoySkladWebhook>("/entity/webhook", {
      method: "POST",
      body: JSON.stringify({
        url: data.url,
        action: data.action,
        entityType: data.entityType,
        enabled: true,
      }),
    })
  }

  async deleteWebhook(id: string): Promise<void> {
    await this.request<void>(`/entity/webhook/${id}`, {
      method: "DELETE",
    })
  }

  // --- Организации и склады (для заказов) ---
  async getOrganizations(): Promise<MoySkladOrganization[]> {
    const data = await this.request<MoySkladList<MoySkladOrganization>>("/entity/organization")
    return data.rows || []
  }

  async getStores(): Promise<MoySkladStore[]> {
    const data = await this.request<MoySkladList<MoySkladStore>>("/entity/store")
    return data.rows || []
  }

  // --- Контрагенты ---
  async findCounterparty(params: { phone?: string; email?: string }): Promise<MoySkladCounterparty | null> {
    if (params.phone) {
      const cleanPhone = params.phone.replace(/[^0-9+]/g, "")
      const data = await this.request<MoySkladList<MoySkladCounterparty>>(
        `/entity/counterparty?filter=phone~${encodeURIComponent(cleanPhone)}`
      )
      if (data.rows && data.rows.length > 0) return data.rows[0]
    }
    return null
  }

  async createCounterparty(data: {
    name: string
    phone?: string
    email?: string
    address?: string
  }): Promise<MoySkladCounterparty> {
    return this.request<MoySkladCounterparty>("/entity/counterparty", {
      method: "POST",
      body: JSON.stringify({
        name: data.name || "Покупатель сайта",
        phone: data.phone,
        email: data.email,
        actualAddress: data.address,
      }),
    })
  }

  // --- Заказ покупателя ---
  async createCustomerOrder(order: MoySkladCustomerOrder): Promise<MoySkladCustomerOrder> {
    return this.request<MoySkladCustomerOrder>("/entity/customerorder", {
      method: "POST",
      body: JSON.stringify(order),
    })
  }
}
