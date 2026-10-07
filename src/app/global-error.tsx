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
    console.error("[Orange MSK Critical Error]:", error)
  }, [error])

  const isDev = process.env.NODE_ENV === "development"

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#f8fafc",
          color: "#22303f",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "36px 28px",
            boxShadow: "0 10px 30px -5px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          {/* Иконка с фирменным стилем */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "rgba(245, 150, 12, 0.12)",
              color: "#f5960c",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f5960c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div
            style={{
              display: "inline-block",
              backgroundColor: "rgba(245, 150, 12, 0.12)",
              color: "#f5960c",
              padding: "3px 12px",
              borderRadius: "999px",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
          >
            Orange MSK
          </div>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              margin: "0 0 10px 0",
              color: "#1e293b",
            }}
          >
            Критический сбой приложения
          </h1>

          <div
            style={{
              width: "36px",
              height: "4px",
              backgroundColor: "#f5960c",
              borderRadius: "2px",
              margin: "0 auto 14px auto",
            }}
          />

          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              margin: "0 0 24px 0",
              lineHeight: "1.5",
            }}
          >
            Произошла непредвиденная ошибка в корневом компоненте магазина. Попробуйте обновить страницу.
          </p>

          {isDev && error?.message && (
            <div
              style={{
                margin: "0 0 20px 0",
                padding: "12px",
                backgroundColor: "#fff1f2",
                borderRadius: "10px",
                border: "1px solid #fecdd3",
                textAlign: "left",
                fontSize: "11px",
                color: "#e11d48",
                wordBreak: "break-word",
                fontFamily: "monospace",
                maxHeight: "140px",
                overflow: "auto",
              }}
            >
              <strong>Сбой:</strong> {error.message}
              {error.digest && <div style={{ marginTop: "4px" }}>ID: {error.digest}</div>}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#f5960c",
                color: "#ffffff",
                border: "none",
                borderRadius: "999px",
                padding: "11px 24px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(245, 150, 12, 0.25)",
              }}
            >
              Обновить страницу
            </button>

            <a
              href="/"
              style={{
                display: "inline-block",
                backgroundColor: "#f1f5f9",
                color: "#1e293b",
                textDecoration: "none",
                borderRadius: "999px",
                padding: "11px 24px",
                fontSize: "14px",
                fontWeight: 600,
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
