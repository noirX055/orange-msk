"use client"

import { useState, useTransition } from "react"
import { Check, Copy, ExternalLink, HelpCircle, Key, RefreshCw, Save, ShieldAlert } from "lucide-react"
import { saveMarketSettingsAction, testMarketConnectionAction } from "@/app/admin/yandex-market/actions"
import type { YandexMarketCampaign, YandexMarketConfig } from "@/lib/yandex-market/types"

interface Props {
  initialSettings: YandexMarketConfig
  maskedApiKey: string
  isTableReady: boolean
  source: string
}

export function MarketSettingsCard({
  initialSettings,
  maskedApiKey,
  isTableReady,
  source,
}: Props) {
  const [apiKey, setApiKey] = useState(maskedApiKey)
  const [campaignId, setCampaignId] = useState(initialSettings.campaignId || "")
  const [businessId, setBusinessId] = useState(initialSettings.businessId || "")
  const [warehouseId, setWarehouseId] = useState(initialSettings.warehouseId || "")
  const [feedUrl, setFeedUrl] = useState(initialSettings.feedUrl || "")

  const [isSaving, startSave] = useTransition()
  const [isTesting, startTest] = useTransition()

  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [testResult, setTestResult] = useState<{
    ok: boolean
    message: string
    campaigns?: YandexMarketCampaign[]
    detectedBusinessId?: number
  } | null>(null)

  const handleTestConnection = () => {
    setTestResult(null)
    startTest(async () => {
      const res = await testMarketConnectionAction()
      if (res.ok) {
        setTestResult({
          ok: true,
          message: res.message || "Подключение успешно установлено!",
          campaigns: res.data?.campaigns,
          detectedBusinessId: res.data?.detectedBusinessId,
        })
      } else {
        setTestResult({
          ok: false,
          message: res.error || "Не удалось подключиться к API",
        })
      }
    })
  }

  const handleApplyCampaign = (c: YandexMarketCampaign) => {
    setCampaignId(String(c.id))
    if (c.business?.id) {
      setBusinessId(String(c.business.id))
    }
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaveStatus(null)

    const formData = new FormData(e.currentTarget)
    startSave(async () => {
      const res = await saveMarketSettingsAction({ ok: false }, formData)
      if (res.ok) {
        setSaveStatus({ ok: true, message: res.message || "Настройки успешно сохранены!" })
      } else {
        setSaveStatus({ ok: false, message: res.error || "Ошибка сохранения настроек" })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {!isTableReady && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 shrink-0 text-amber-600" size={18} />
            <div className="flex flex-col gap-1">
              <span className="font-semibold">Таблица настроек в базе данных ещё не создана</span>
              <p className="text-xs text-amber-800">
                Сейчас используются настройки из переменных окружения (<code className="font-mono font-medium">.env.local</code>).
                Чтобы настройки можно было сохранять и редактировать прямо здесь через админ-панель,
                выполните миграцию <code className="font-mono font-semibold">supabase/migration-yandex-market.sql</code> в Supabase SQL Editor.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-1 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Параметры авторизации API</h3>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              Источник: {source === "database" ? "База данных" : source === "env" ? ".env.local" : "Не настроено"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Данные для взаимодействия с Partner API (Кабинет продавца Яндекс.Маркета)
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* API Key */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-primary" />
                API-ключ / OAuth-токен
              </span>
              <a
                href="https://partner.market.yandex.ru"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-normal text-primary hover:underline"
              >
                Где взять ключ? <ExternalLink size={10} />
              </a>
            </label>
            <input
              type="password"
              name="api_key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Введите API-ключ или OAuth токен"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              В кабинете продавца: Настройки → Настройки API → Создать API-ключ (или Авторизационный токен)
            </p>
          </div>

          {/* Campaign ID */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              ID кампании (Campaign ID)
            </label>
            <input
              type="text"
              name="campaign_id"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              placeholder="Например: 12345678"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Идентификатор магазина в Маркете (виден в адресной строке кабинета)
            </p>
          </div>

          {/* Business ID */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              ID бизнеса (Business ID)
            </label>
            <input
              type="text"
              name="business_id"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="Например: 87654321"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Идентификатор кабинета для управления общим каталогом
            </p>
          </div>

          {/* Warehouse ID */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              ID склада (Warehouse ID, для FBS / DBS)
            </label>
            <input
              type="text"
              name="warehouse_id"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              placeholder="Например: 98765"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Используется для синхронизации остатков (Логистика → Склады)
            </p>
          </div>

          {/* Feed URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              URL YML-фида магазина
            </label>
            <input
              type="text"
              name="feed_url"
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://orangemsk.ru/yandex-feed.xml"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Адрес прайс-листа для автообновления товаров в Маркете
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || (!apiKey && !initialSettings.apiKey)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <RefreshCw size={14} className={isTesting ? "animate-spin" : ""} />
            {isTesting ? "Проверка соединения..." : "Проверить подключение к API"}
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-semibold text-navy-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            <Save size={14} className={isSaving ? "animate-spin" : ""} />
            {isSaving ? "Сохранение..." : "Сохранить настройки"}
          </button>
        </div>

        {/* Save Status message */}
        {saveStatus && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-medium ${
              saveStatus.ok
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {saveStatus.message}
          </div>
        )}

        {/* Test Result card */}
        {testResult && (
          <div
            className={`mt-4 rounded-xl border p-4 text-xs ${
              testResult.ok
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                : "border-red-200 bg-red-50/70 text-red-900"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {testResult.ok ? <Check size={16} className="text-emerald-600" /> : <ShieldAlert size={16} className="text-red-600" />}
              {testResult.message}
            </div>

            {testResult.ok && testResult.campaigns && testResult.campaigns.length > 0 && (
              <div className="mt-3 flex flex-col gap-2 border-t border-emerald-200 pt-3">
                <span className="font-semibold text-emerald-950">Обнаруженные кампании в аккаунте:</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {testResult.campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-emerald-200/80 bg-white p-2.5 text-[11px]"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          Кампания #{c.id}
                        </span>
                        <span className="text-muted-foreground">{c.domain || "Магазин"}</span>
                        {c.business && (
                          <span className="text-[10px] text-muted-foreground">
                            Бизнес: {c.business.name} (#{c.business.id})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCampaign(c)}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
                      >
                        Применить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Helper guide */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <HelpCircle size={16} className="text-primary" />
          Инструкция по настройке интеграции с Яндекс.Маркетом
        </div>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            1. Войдите в кабинет продавца на{" "}
            <a
              href="https://partner.market.yandex.ru"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-medium"
            >
              partner.market.yandex.ru
            </a>
            .
          </p>
          <p>
            2. Перейдите в раздел <strong>Настройки → Настройки API</strong>.
          </p>
          <p>
            3. Скопируйте <strong>Авторизационный токен (или создайте API-ключ)</strong> и вставьте в поле выше.
          </p>
          <p>
            4. Нажмите кнопку <strong>«Проверить подключение к API»</strong> — система автоматически найдёт ID кампании и ID бизнеса.
          </p>
          <p>
            5. Скопируйте ссылку на <strong>YML-фид</strong> из вкладки «Обзор и фид» и укажите её в кабинете Маркета: <strong>Товары → Автообновление каталога → По ссылке</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
