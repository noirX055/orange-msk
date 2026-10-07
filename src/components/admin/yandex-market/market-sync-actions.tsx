"use client"

import { useState, useTransition } from "react"
import { ArrowUpRight, Check, DollarSign, Layers, Package, RefreshCw, ShieldAlert } from "lucide-react"
import { pushCatalogAction, syncPricesAction, syncStocksAction } from "@/app/admin/yandex-market/actions"

interface Props {
  isConfigured: boolean
}

export function MarketSyncActions({ isConfigured }: Props) {
  const [loadingType, setLoadingType] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{
    ok: boolean
    message: string
    error?: string
  } | null>(null)

  const handleSyncPrices = () => {
    setLoadingType("prices")
    setFeedback(null)
    startTransition(async () => {
      const res = await syncPricesAction()
      setFeedback({
        ok: res.ok,
        message: res.message || "Синхронизация цен завершена",
        error: res.error,
      })
      setLoadingType(null)
    })
  }

  const handleSyncStocks = () => {
    setLoadingType("stocks")
    setFeedback(null)
    startTransition(async () => {
      const res = await syncStocksAction()
      setFeedback({
        ok: res.ok,
        message: res.message || "Синхронизация остатков завершена",
        error: res.error,
      })
      setLoadingType(null)
    })
  }

  const handlePushCatalog = () => {
    setLoadingType("catalog")
    setFeedback(null)
    startTransition(async () => {
      const res = await pushCatalogAction()
      setFeedback({
        ok: res.ok,
        message: res.message || "Выгрузка каталога завершена",
        error: res.error,
      })
      setLoadingType(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Sync Prices */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <DollarSign size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Синхронизация цен</h4>
                <p className="text-[11px] text-muted-foreground">Partner API</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Отправляет актуальные цены и скидки всех видимых товаров в Яндекс.Маркет
            </p>
          </div>

          <button
            onClick={handleSyncPrices}
            disabled={!isConfigured || isPending}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-navy-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loadingType === "prices" ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {loadingType === "prices" ? "Синхронизация..." : "Отправить цены"}
          </button>
        </div>

        {/* Sync Stocks */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Package size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Синхронизация остатков</h4>
                <p className="text-[11px] text-muted-foreground">FBS / DBS склады</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Обновляет доступность товаров (в наличии / нет в наличии) на складе Маркета
            </p>
          </div>

          <button
            onClick={handleSyncStocks}
            disabled={!isConfigured || isPending}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-navy-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loadingType === "stocks" ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            {loadingType === "stocks" ? "Синхронизация..." : "Отправить остатки"}
          </button>
        </div>

        {/* Push Catalog */}
        <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Layers size={20} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-foreground">Каталог в Маркет</h4>
                <p className="text-[11px] text-muted-foreground">Offer Mappings</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Регистрирует карточки товаров магазина в каталоге бизнеса (название, фото, описание)
            </p>
          </div>

          <button
            onClick={handlePushCatalog}
            disabled={!isConfigured || isPending}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-navy-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loadingType === "catalog" ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <ArrowUpRight size={14} />
            )}
            {loadingType === "catalog" ? "Выгрузка..." : "Выгрузить каталог"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border p-4 text-xs font-medium ${
            feedback.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.ok ? (
              <Check size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert size={16} className="text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>

          {feedback.error && (
            <div className="mt-2 pl-6 text-[11px] leading-relaxed">
              <span className="font-semibold">Причина от Яндекс.Маркета:</span>{" "}
              <code className="rounded bg-red-100 px-1 py-0.5 font-mono text-red-800">
                {feedback.error}
              </code>
              {feedback.error.toLowerCase().includes("revoked") && (
                <p className="mt-1 text-red-700">
                  Токен API-ключа был отозван или удален в личном кабинете Яндекс.Маркета. Создайте новый API-ключ в кабинете продавца Маркета и сохраните его в блоке «Настройки интеграции» ниже.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
