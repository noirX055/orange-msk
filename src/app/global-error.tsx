"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global Layout Error:", error)
  }, [error])

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#f4f6f8",
          color: "#1e2a38",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px 24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(245, 150, 12, 0.12)",
              color: "#f5960c",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px",
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 8px 0" }}>
            Ошибка загрузки страницы
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              margin: "0 0 20px 0",
              lineHeight: "1.5",
            }}
          >
            Произошла ошибка при инициализации интерфейса. Попробуйте обновить страницу.
          </p>

          {error?.message && (
            <div
              style={{
                margin: "16px 0",
                padding: "12px",
                backgroundColor: "#fff1f2",
                borderRadius: "8px",
                border: "1px solid #fecdd3",
                textAlign: "left",
                fontSize: "12px",
                color: "#e11d48",
                wordBreak: "break-word",
                fontFamily: "monospace",
              }}
            >
              <strong>Сбой:</strong> {error.message}
              {error.digest && <div style={{ marginTop: "4px" }}>ID: {error.digest}</div>}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#f5960c",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Обновить
            </button>
            <a
              href="/"
              style={{
                display: "inline-block",
                backgroundColor: "#f1f5f9",
                color: "#1e2a38",
                textDecoration: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              На главную
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
