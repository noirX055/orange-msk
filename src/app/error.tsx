"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home, Headphones } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Orange MSK Application Error]:", error)
  }, [error])

  const isDev = process.env.NODE_ENV === "development"

  return (
    <div className="flex min-h-[65vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-lg rounded-card border border-border bg-card p-6 text-center shadow-xs sm:p-8">
        {/* Иконка с фирменным акцентом */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <AlertTriangle size={28} />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Ошибка 500
        </span>

        <h1 className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Что-то пошло не так
        </h1>

        <div className="mx-auto my-3 h-1 w-10 rounded-full bg-primary" />

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Произошла непредвиденная ошибка при загрузке страницы. Мы уже зафиксировали сбой и работаем над его устранением.
        </p>

        {/* Технические детали для разработчиков */}
        {(isDev || Boolean(error?.digest)) && (
          <div className="mt-5 text-left">
            <details className="rounded-xl border border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium hover:text-foreground">
                Технические сведения о сбое
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-background p-2.5 font-mono text-[11px] text-destructive">
                {error?.message || "Неизвестная ошибка"}
                {error?.digest ? `\nDigest ID: ${error.digest}` : ""}
              </pre>
            </details>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:brightness-110 active:scale-95"
          >
            <RotateCcw size={15} />
            Попробовать снова
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
          >
            <Home size={15} />
            На главную
          </Link>

          <Link
            href="/contacts"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary active:scale-95"
          >
            <Headphones size={15} />
            Служба поддержки
          </Link>
        </div>
      </div>
    </div>
  )
}
