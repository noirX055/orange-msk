"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { resetPasswordWithCode } from "../actions"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

export default function ResetPasswordPage() {
  const router = useRouter()

  // Режим: если сессия есть — меняем пароль напрямую, если нет — используем проверочный код
  const [hasSession, setHasSession] = useState(false)
  const [mode, setMode] = useState<"auto" | "code">("auto")

  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 1. Проверяем хэш в URL (#access_token=...&refresh_token=...)
    const hash = window.location.hash
    if (hash && hash.includes("access_token")) {
      const p = new URLSearchParams(hash.replace(/^#/, ""))
      const at = p.get("access_token")
      const rt = p.get("refresh_token")
      if (at && rt) {
        supabase.auth
          .setSession({ access_token: at, refresh_token: rt })
          .then(({ data, error }) => {
            if (data.session) {
              setHasSession(true)
            }
          })
          .catch(() => {})
      }
    }

    // 2. Проверяем PKCE код в search (?code=...)
    const searchParams = new URLSearchParams(window.location.search)
    const codeParam = searchParams.get("code")
    if (codeParam) {
      supabase.auth
        .exchangeCodeForSession(codeParam)
        .then(({ data }) => {
          if (data.session) {
            setHasSession(true)
          }
        })
        .catch(() => {})
    }

    // 3. Подписываемся на события изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true)
      }
    })

    // 4. Проверяем уже существующую сессию
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasSession(true)
      }
      setInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов")
      return
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      return
    }

    setLoading(true)

    // Вариант 1: Если активен режим кода ИЛИ сессии нет — выполняем надёжный серверный сброс по коду
    if (mode === "code" || !hasSession) {
      if (!email.trim() || !code.trim()) {
        setError("Укажите email и проверочный код из письма")
        setLoading(false)
        return
      }

      const res = await resetPasswordWithCode({
        email,
        code,
        newPassword: password,
      })

      setLoading(false)

      if (!res.ok) {
        setError(res.error || "Не удалось сменить пароль")
        return
      }

      setSuccess(true)
      return
    }

    // Вариант 2: Если есть сессия от Supabase
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        // Если сессия всё же потерялась — автоматически переключаем на ввод кода
        const msg = updateError.message.toLowerCase()
        if (msg.includes("session") || msg.includes("missing")) {
          setMode("code")
          setError(
            "Сессия перехода устарела. Пожалуйста, введите ваш email и 6-значный проверочный код из письма ниже."
          )
          setLoading(false)
          return
        }

        setError(updateError.message)
        setLoading(false)
        return
      }

      setLoading(false)
      setSuccess(true)
    } catch (err: any) {
      setMode("code")
      setError(
        "Сессия перехода устарела. Пожалуйста, введите ваш email и 6-значный проверочный код из письма ниже."
      )
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
          Новый пароль
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          {mode === "code"
            ? "Введите ваш email, проверочный код из письма и новый пароль"
            : "Придумайте надёжный пароль для входа в ваш аккаунт"}
        </p>
      </div>

      {success ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-green-200 bg-green-50/80 p-5 text-sm text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-300">
            <h3 className="mb-2 font-semibold">Пароль успешно изменён!</h3>
            <p className="leading-relaxed">
              Ваш новый пароль успешно сохранён. Теперь вы можете войти в аккаунт с новыми данными.
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

          {/* Если сессии нет или включен ввод по коду — запрашиваем email и код */}
          {(mode === "code" || (!hasSession && !initializing)) && (
            <>
              <AuthField
                id="reset-email"
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
              />

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="reset-code"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  6-значный проверочный код из письма
                </label>
                <input
                  id="reset-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="h-12 w-full rounded-xl border border-border bg-card px-4 text-center font-mono text-xl font-bold tracking-[0.3em] text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

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
            label="Повторите новый пароль"
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

          <div className="flex flex-col items-center gap-3 text-center">
            {mode === "auto" && hasSession && (
              <button
                type="button"
                onClick={() => setMode("code")}
                className="text-xs text-muted-foreground transition-colors hover:text-primary underline underline-offset-4"
              >
                Ввести проверочный код вручную
              </button>
            )}

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
