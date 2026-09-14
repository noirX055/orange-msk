export type MoySkladMeta = {
  href: string
  metadataHref?: string
  type: string
  mediaType: string
  size?: number
  limit?: number
  offset?: number
}

export type MoySkladList<T> = {
  meta: MoySkladMeta
  context?: Record<string, unknown>
  rows: T[]
}

export type MoySkladProduct = {
  id: string
  name: string
  code?: string
  article?: string
  externalCode?: string
  description?: string
  pathName?: string
  archived?: boolean
  salePrices?: {
    value: number // в копейках
    priceType?: {
      id?: string
      name?: string
      meta: MoySkladMeta
    }
  }[]
  buyPrice?: {
    value: number
  }
  barcodes?: {
    ean13?: string
    ean8?: string
    code128?: string
  }[]
  meta: MoySkladMeta
}

export type MoySkladWebhook = {
  id?: string
  url: string
  action: "CREATE" | "UPDATE" | "DELETE"
  entityType: string
  enabled: boolean
  meta?: MoySkladMeta
}

export type MoySkladWebhookEvent = {
  auditContext?: Record<string, unknown>
  events: {
    meta: MoySkladMeta
    action: "CREATE" | "UPDATE" | "DELETE"
    accountId: string
  }[]
}

export type MoySkladOrganization = {
  id: string
  name: string
  meta: MoySkladMeta
}

export type MoySkladStore = {
  id: string
  name: string
  meta: MoySkladMeta
}

export type MoySkladCounterparty = {
  id?: string
  name: string
  phone?: string
  email?: string
  actualAddress?: string
  description?: string
  meta: MoySkladMeta
}

export type MoySkladCustomerOrderPosition = {
  quantity: number
  price: number // в копейках
  reserve?: number
  discount?: number
  vat?: number
  assortment: { meta: MoySkladMeta }
}

export type MoySkladCustomerOrder = {
  id?: string
  name?: string
  externalCode?: string
  description?: string
  organization: { meta: MoySkladMeta }
  agent: { meta: MoySkladMeta }
  store?: { meta: MoySkladMeta }
  shipmentAddress?: string
  positions?: MoySkladCustomerOrderPosition[]
  meta?: MoySkladMeta
}
