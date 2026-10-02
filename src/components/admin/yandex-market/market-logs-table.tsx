"use client"

import { CheckCircle2, Clock, History, ShieldAlert } from "lucide-react"
import type { YandexMarketSyncLog } from "@/lib/yandex-market/types"

interface Props {
  logs: YandexMarketSyncLog[]
}

function getActionLabel(action: string) {
  switch (action) {
    case "sync_prices":
      return "Синхронизация цен"
    case "sync_stocks":
      return "Синхронизация остатков"
    case "push_catalog":
      return "Выгрузка каталога"
    case "feed_refresh":
      return "Обновление фида"
    case "order_accepted":
      return "Принят заказ"
    case "order_status_changed":
      return "Смена статуса заказа"
    default:
      return action
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function MarketLogsTable({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
        <History size={40} className="text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">Логов синхронизации пока нет</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
          После отправки цен, остатков или каталога здесь появится подробная история запросов
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <tr>
              <th className="p-3.5 pl-5">Действие</th>
              <th className="p-3.5">Статус</th>
              <th className="p-3.5">Обработано</th>
              <th className="p-3.5">Сообщение</th>
              <th className="p-3.5 pr-5 text-right">Время</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => {
              const isSuccess = log.status === "success"
              const isError = log.status === "error"

              return (
                <tr key={log.id} className="transition hover:bg-muted/30">
                  <td className="p-3.5 pl-5 font-semibold text-foreground">
                    {getActionLabel(log.action)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        isSuccess
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isError
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle2 size={11} />
                      ) : (
                        <ShieldAlert size={11} />
                      )}
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-foreground">
                    {log.items_count} шт.
                  </td>
                  <td className="p-3.5 text-muted-foreground max-w-md truncate">
                    {log.message || "—"}
                  </td>
                  <td className="p-3.5 pr-5 text-right text-muted-foreground whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} />
                      {formatDate(log.created_at)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
