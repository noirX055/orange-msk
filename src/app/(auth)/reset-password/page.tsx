"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
          Новый пароль
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          Придумайте надёжный пароль для входа в ваш аккаунт
        </p>
      </div>

      {success ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-green-200 bg-green-50/80 p-5 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-300">
            <h3 className="mb-2 font-semibold">Пароль успешно изменён!</h3>
            <p className="leading-relaxed">
              Ваш новый пароль сохранён. Теперь вы можете войти в систему с новыми данными.
            </p>
          </div>

          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Войти в аккаунт
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && <AuthAlert message={error} />}

          <AuthField
            id="reset-password"
            label="Новый пароль"
            password
            autoComplete="new-password"
            required
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          <AuthField
            id="reset-confirm-password"
            label="Повторите пароль"
            password
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
          />

          <AuthSubmit id="reset-submit" loading={loading}>
            Сохранить новый пароль
          </AuthSubmit>

          <div className="text-center">
            <Link
              href="/login"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Отмена и вход
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
