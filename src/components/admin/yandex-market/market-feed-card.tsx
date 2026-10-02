"use client"

import { useState, useTransition } from "react"
import { Check, Copy, ExternalLink, FileCode, RefreshCw, Rss } from "lucide-react"
import { refreshMarketFeedAction } from "@/app/admin/yandex-market/actions"
import type { YandexMarketFeed } from "@/lib/yandex-market/types"

interface Props {
  feedUrl: string
  totalProducts: number
  inStockProducts: number
  feeds?: YandexMarketFeed[]
  campaignId?: string
}

export function MarketFeedCard({
  feedUrl,
  totalProducts,
  inStockProducts,
  feeds = [],
  campaignId,
}: Props) {
  const [copied, setCopied] = useState(false)
  const [isRefreshing, startRefresh] = useTransition()
  const [refreshMsg, setRefreshMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleRefreshFeed = (feedId: number) => {
    setRefreshMsg(null)
    startRefresh(async () => {
      const res = await refreshMarketFeedAction(feedId)
      if (res.ok) {
        setRefreshMsg({ ok: true, text: res.message || "Запрос на обновление отправлен" })
      } else {
        setRefreshMsg({ ok: false, text: res.error || "Ошибка обновления фида" })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main feed URL box */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Rss size={24} />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">YML Прайс-лист для Маркета</h3>
              <p className="text-xs text-muted-foreground">
                Автоматически генерируемый XML-фид каталога Orange MSK в формате YML (Yandex Market Language)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Онлайн
          </span>
        </div>

        {/* URL Input Box */}
        <div className="mt-6 flex flex-col gap-2">
          <label className="text-xs font-semibold text-foreground">
            Прямая ссылка на фид для кабинета Яндекс.Маркета:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="w-full rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 font-mono text-xs text-foreground select-all focus:outline-none"
              />
            </div>

            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              {copied ? "Скопировано!" : "Копировать"}
            </button>

            <a
              href={feedUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-xs font-semibold text-navy-foreground transition hover:opacity-90"
            >
              <ExternalLink size={14} />
              Открыть XML
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Всего товаров в фиде</span>
            <span className="text-lg font-bold text-foreground">{totalProducts}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">В наличии (available=true)</span>
            <span className="text-lg font-bold text-emerald-600">{inStockProducts}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Валюта каталога</span>
            <span className="text-lg font-bold text-foreground">RUB (RUR)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-muted-foreground">Формат выгрузки</span>
            <span className="text-lg font-bold text-foreground">YML / UTF-8</span>
          </div>
        </div>
      </div>

      {/* Connected feeds in Market API */}
      {feeds.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-foreground">
              Зарегистрированные фиды в кампании #{campaignId}
            </h4>
            <span className="text-xs text-muted-foreground">Найдено: {feeds.length}</span>
          </div>

          <div className="divide-y divide-border">
            {feeds.map((feed) => (
              <div key={feed.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileCode size={18} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">
                      Фид #{feed.id} {feed.name ? `— ${feed.name}` : ""}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground truncate max-w-md">
                      {feed.url}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRefreshFeed(feed.id)}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                  Запросить обновление
                </button>
              </div>
            ))}
          </div>

          {refreshMsg && (
            <div
              className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                refreshMsg.ok
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {refreshMsg.text}
            </div>
          )}
        </div>
      )}

      {/* Guide how to connect feed in Yandex Market */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h4 className="text-sm font-bold text-foreground mb-2">
          Как подключить автообновление фида в кабинете продавца:
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            1. Скопируйте ссылку выше (<code className="font-mono font-semibold">{feedUrl}</code>).
          </p>
          <p>
            2. В кабинете продавца Яндекс.Маркета перейдите в меню <strong>Товары → Автообновление каталога</strong> (или <strong>Загрузка данных</strong>).
          </p>
          <p>
            3. Выберите способ <strong>«По ссылке»</strong> и вставьте скопированный URL.
          </p>
          <p>
            4. Яндекс.Маркет будет регулярно скачивать каталог, обновлять новые поступления, описания, фото, цены и наличие.
          </p>
        </div>
      </div>
    </div>
  )
}
