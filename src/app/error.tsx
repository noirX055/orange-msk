"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Что-то пошло не так
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Произошла ошибка при загрузке страницы. Попробуйте обновить её или вернуться на главную.
        </p>

        {error?.message && (
          <div className="mt-4 text-left">
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium hover:text-foreground">
                Подробности ошибки
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-muted p-2.5 font-mono text-[11px] text-destructive">
                {error.message}
                {error.digest ? `\nID: ${error.digest}` : ""}
              </pre>
            </details>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:brightness-110 active:scale-95"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
