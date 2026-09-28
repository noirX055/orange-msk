"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  startRegistration,
  verifyRegistrationCode,
  resendRegistrationCode,
} from "../actions"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "verify">("form")

  // Поля формы
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Поле кода
  const [code, setCode] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Таймер для повторной отправки кода
  const [resendCooldown, setResendCooldown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (step === "verify" && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    } else if (resendCooldown === 0) {
      setCanResend(true)
    }
    return () => clearTimeout(timer)
  }, [step, resendCooldown])

  // 1. Отправка формы регистрации и получение кода на почту
  async function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов")
      return
    }

    setLoading(true)

    const res = await startRegistration({ name, email, password })
    setLoading(false)

    if (!res.ok) {
      setError(res.error || "Не удалось отправить код подтверждения")
      return
    }

    // Переходим к шагу ввода проверочного кода
    setStep("verify")
    setResendCooldown(60)
    setCanResend(false)
    setCode("")
  }

  // 2. Подтверждение кода из письма
  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (code.trim().length < 6) {
      setError("Введите полный 6-значный проверочный код")
      return
    }

    setLoading(true)

    const verifyRes = await verifyRegistrationCode({ email, code })

    if (!verifyRes.ok) {
      setError(verifyRes.error || "Неверный код подтверждения")
      setLoading(false)
      return
    }

    // 3. Авторизуемся под подтвержденным аккаунтом
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      router.push("/login")
      return
    }

    router.push("/account")
    router.refresh()
  }

  // 3. Повторная отправка кода
  async function handleResendCode() {
    if (!canResend || resending) return
    setResending(true)
    setError("")
    setResendMessage("")

    const res = await resendRegistrationCode(email)
    setResending(false)

    if (!res.ok) {
      setError(res.error || "Не удалось повторно отправить код")
      return
    }

    setResendMessage("Новый проверочный код успешно отправлен на вашу почту")
    setResendCooldown(60)
    setCanResend(false)
  }

  return (
    <div className="w-full">
      {step === "form" ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
              Создать аккаунт
            </h1>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
              Регистрация для персональных скидок и&nbsp;быстрых покупок
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-5">
            {error && <AuthAlert message={error} />}

            <AuthField
              id="register-name"
              label="Имя"
              autoComplete="name"
              required
              value={name}
              onChange={setName}
              placeholder="Иван Иванов"
            />

            <AuthField
              id="register-email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
            />

            <AuthField
              id="register-password"
              label="Пароль"
              password
              autoComplete="new-password"
              required
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />

            <AuthSubmit id="register-submit" loading={loading}>
              Продолжить
            </AuthSubmit>
          </form>

          {/* Footer link */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
            >
              Войти
            </Link>
          </div>
        </>
      ) : (
        <>
          {/* Header Verify Step */}
          <div className="mb-8">
            <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
              Подтверждение почты
            </h1>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
              Мы отправили 6-значный проверочный код на адрес{" "}
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
            {error && <AuthAlert message={error} />}
            {resendMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50/80 p-3.5 text-xs text-green-900 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-300">
                {resendMessage}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="verify-code"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Код из письма
              </label>
              <input
                id="verify-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="h-14 w-full rounded-xl border border-border bg-card px-4 text-center font-mono text-2xl font-bold tracking-[0.4em] text-foreground transition-colors placeholder:text-muted-foreground/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">
                Код действителен 15 минут. Если письма нет, проверьте папку «Спам».
              </span>
            </div>

            <AuthSubmit id="verify-submit" loading={loading}>
              Подтвердить и войти
            </AuthSubmit>

            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || resending}
                className="text-xs text-muted-foreground transition-colors hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending
                  ? "Отправка..."
                  : canResend
                  ? "Отправить код повторно"
                  : `Отправить код повторно через ${resendCooldown} сек`}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("form")
                  setError("")
                  setResendMessage("")
                }}
                className="text-xs text-muted-foreground/80 hover:text-foreground underline underline-offset-4"
              >
                Изменить адрес email
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
