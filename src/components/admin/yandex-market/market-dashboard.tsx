"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock,
  History,
  Layers,
  Package,
  Rss,
  Settings,
  ShoppingBag,
  ShoppingCart,
  XCircle,
} from "lucide-react"
import { MarketSettingsCard } from "./market-settings-card"
import { MarketFeedCard } from "./market-feed-card"
import { MarketSyncActions } from "./market-sync-actions"
import { MarketOrdersList } from "./market-orders-list"
import { MarketOffersTable } from "./market-offers-table"
import { MarketLogsTable } from "./market-logs-table"
import type {
  YandexMarketConfig,
  YandexMarketFeed,
  YandexMarketOrder,
  YandexMarketSyncLog,
} from "@/lib/yandex-market/types"

interface Props {
  initialSettings: YandexMarketConfig
  maskedApiKey: string
  isConfigured: boolean
  isTableReady: boolean
  source: string
  totalProducts: number
  inStockProducts: number
  orders: YandexMarketOrder[]
  feeds: YandexMarketFeed[]
  logs: YandexMarketSyncLog[]
  products: any[]
}

export function MarketDashboard({
  initialSettings,
  maskedApiKey,
  isConfigured,
  isTableReady,
  source,
  totalProducts,
  inStockProducts,
  orders,
  feeds,
  logs,
  products,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "offers" | "settings" | "logs"
  >("overview")

  return (
    <div className="flex flex-col gap-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <ShoppingCart size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Яндекс.Маркет
              </h1>
              <p className="text-xs text-muted-foreground">
                Управление интеграцией, синхронизация цен, остатков и обработка заказов
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfigured ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={14} className="text-emerald-600" />
              API подключен (ID: {initialSettings.campaignId || initialSettings.businessId})
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
              <XCircle size={14} className="text-amber-600" />
              Требуется настройка API
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Товаров в каталоге</span>
            <Package size={18} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalProducts}</span>
            <span className="text-xs text-emerald-600 font-medium">
              ({inStockProducts} в наличии)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Доступно для выгрузки в фид</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Заказы Маркета</span>
            <ShoppingBag size={18} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{orders.length}</span>
            <span className="text-xs text-muted-foreground">заказов в API</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {orders.filter((o) => o.status === "PROCESSING").length} ожидают обработки
          </p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Статус фида</span>
            <Rss size={18} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-600">Активен</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate">
            /yandex-feed.xml
          </p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Последняя синхронизация</span>
            <Clock size={18} className="text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-sm font-bold text-foreground">
              {logs.length > 0 ? logs[0].action : "Нет данных"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {logs.length > 0 ? `${logs[0].items_count} шт.` : "Синхронизаций не было"}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Обзор и фид", icon: Rss },
            { id: "orders", label: `Заказы Маркета (${orders.length})`, icon: ShoppingBag },
            { id: "offers", label: `Товары и цены (${products.length})`, icon: Layers },
            { id: "settings", label: "Настройки API", icon: Settings },
            { id: "logs", label: `История (${logs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <MarketSyncActions isConfigured={isConfigured} />
          <MarketFeedCard
            feedUrl={initialSettings.feedUrl || "https://orangemsk.ru/yandex-feed.xml"}
            totalProducts={totalProducts}
            inStockProducts={inStockProducts}
            feeds={feeds}
            campaignId={initialSettings.campaignId}
          />
        </div>
      )}

      {activeTab === "orders" && (
        <MarketOrdersList orders={orders} isConfigured={isConfigured} />
      )}

      {activeTab === "offers" && <MarketOffersTable products={products} />}

      {activeTab === "settings" && (
        <MarketSettingsCard
          initialSettings={initialSettings}
          maskedApiKey={maskedApiKey}
          isTableReady={isTableReady}
          source={source}
        />
      )}

      {activeTab === "logs" && <MarketLogsTable logs={logs} />}
    </div>
  )
}
