"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

type SyncResult = {
  ok: boolean
  totalFetched?: number
  totalUpserted?: number
  errors?: string[]
  error?: string
}

export function SyncProductsButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    if (loading) return

    const confirmed = window.confirm(
      "Запустить полную синхронизацию товаров с МойСклад?\n\nЭто может занять несколько минут."
    )
    if (!confirmed) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/admin/sync-products", {
        method: "POST",
      })
      const data: SyncResult = await res.json()
      setResult(data)

      if (data.ok) {
        // Перезагружаем страницу через 2 секунды, чтобы увидеть обновлённые товары
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Ошибка сети" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        {loading ? "Синхронизация…" : "Обновить с МойСклад"}
      </button>

      {result && (
        <span
          className={`text-xs font-medium ${
            result.ok ? "text-green-600" : "text-red-500"
          }`}
        >
          {result.ok
            ? `✓ Загружено ${result.totalFetched}, обновлено ${result.totalUpserted}`
            : `✗ ${result.error}`}
        </span>
      )}
    </div>
  )
}
