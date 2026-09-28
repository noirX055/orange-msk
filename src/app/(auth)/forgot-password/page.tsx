"use client"

import Link from "next/link"
import { useState } from "react"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"
import { requestPasswordReset } from "../actions"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await requestPasswordReset(email)
    setLoading(false)

    if (!result.ok) {
      setError(result.error || "Не удалось отправить письмо для сброса пароля")
      return
    }

    setSuccess(true)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
          Восстановление пароля
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          Укажите email, привязанный к аккаунту, и мы отправим ссылку для сброса пароля
        </p>
      </div>

      {success ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-green-200 bg-green-50/80 p-5 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-300">
            <h3 className="mb-2 font-semibold">Письмо успешно отправлено!</h3>
            <p className="leading-relaxed">
              Мы отправили инструкции по восстановлению пароля на адрес{" "}
              <strong>{email}</strong>. Перейдите по ссылке из письма, чтобы задать новый пароль.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Если письмо не пришло в течение нескольких минут, проверьте папку «Спам».
            </p>
          </div>

          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold transition-colors hover:bg-muted"
          >
            Вернуться ко входу
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <AuthAlert message={error} />}

          <AuthField
            id="forgot-email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />

          <AuthSubmit id="forgot-submit" loading={loading}>
            Отправить ссылку для сброса
          </AuthSubmit>

          <div className="text-center">
            <Link
              href="/login"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Вспомнили пароль? Войти
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
