export interface YandexMarketConfig {
  apiKey: string
  campaignId: string
  businessId: string
  warehouseId?: string
  feedUrl?: string
  autoSyncPrices?: boolean
  autoSyncStocks?: boolean
}

export interface YandexMarketCampaign {
  id: number
  domain?: string
  state?: number
  stateReason?: string
  clientId?: number
  business?: {
    id: number
    name: string
  }
}

export interface YandexMarketOrderItem {
  id: number
  offerId: string
  offerName: string
  price: number
  count: number
  vat?: string
  feedId?: number
}

export interface YandexMarketOrderDelivery {
  type?: string
  price?: number
  serviceName?: string
  dates?: {
    fromDate?: string
    toDate?: string
    fromTime?: string
    toTime?: string
  }
  address?: {
    country?: string
    city?: string
    street?: string
    house?: string
    floor?: string
    apartment?: string
    recipient?: string
    phone?: string
  }
}

export interface YandexMarketOrderBuyer {
  id?: string
  lastName?: string
  firstName?: string
  middleName?: string
  phone?: string
  email?: string
}

export interface YandexMarketOrder {
  id: number
  status:
    | "PLACING"
    | "RESERVED"
    | "PROCESSING"
    | "DELIVERY"
    | "PICKUP"
    | "DELIVERED"
    | "CANCELLED"
    | "UNPAID"
    | string
  substatus?: string
  creationDate: string
  currency: string
  itemsTotal: number
  total: number
  paymentType?: "PREPAID" | "POSTPAID" | string
  paymentMethod?: string
  fake?: boolean
  delivery?: YandexMarketOrderDelivery
  buyer?: YandexMarketOrderBuyer
  items: YandexMarketOrderItem[]
  notes?: string
}

export interface YandexMarketOfferPrice {
  offerId: string
  price: {
    value: number
    currencyId: "RUR" | "RUB" | string
    discountBase?: number
  }
}

export interface YandexMarketOfferStock {
  sku: string
  warehouseId: number
  items: Array<{
    type: "FIT" | "DEFECT" | "QUARANTINE" | string
    count: number
    updatedAt: string
  }>
}

export interface YandexMarketOfferMappingItem {
  offer: {
    offerId: string
    name: string
    category?: string
    pictures?: string[]
    vendor?: string
    description?: string
    barcodes?: string[]
    urls?: string[]
  }
  mapping?: {
    marketSku?: number
    marketModelId?: number
    marketCategoryId?: number
  }
}

export interface YandexMarketFeed {
  id: number
  url: string
  name?: string
  updatedAt?: string
  status?: string
}

export interface YandexMarketSyncLog {
  id: number
  action: string
  status: "success" | "error" | "warning"
  items_count: number
  message?: string
  details?: any
  created_at: string
}
