"use client"

import Link from "next/link"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      const msg = signInError.message.toLowerCase()

      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        setError("Email ещё не подтверждён. Пожалуйста, введите код подтверждения из письма.")
        setLoading(false)
        return
      }

      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push(returnTo)
    router.refresh()
  }

  const registerHref =
    returnTo && returnTo !== "/"
      ? `/register?returnTo=${encodeURIComponent(returnTo)}`
      : "/register"

  const forgotHref =
    returnTo && returnTo !== "/"
      ? `/forgot-password?returnTo=${encodeURIComponent(returnTo)}`
      : "/forgot-password"

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
          Добро пожаловать
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          {returnTo.startsWith("/cart")
            ? "Войдите в аккаунт, чтобы перейти к оформлению и оплате заказа"
            : "Войдите, чтобы отслеживать заказы и копить бонусы"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <AuthAlert message={error} />}

        <AuthField
          id="login-email"
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
          id="login-password"
          label="Пароль"
          password
          autoComplete="current-password"
          required
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
        />

        <div className="-mt-2 flex justify-end">
          <Link
            href={forgotHref}
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Забыли пароль?
          </Link>
        </div>

        <AuthSubmit id="login-submit" loading={loading}>
          Войти
        </AuthSubmit>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">или</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Register link */}
      <Link
        href={registerHref}
        className="flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        Создать аккаунт
      </Link>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px]" />}>
      <LoginForm />
    </Suspense>
  )
}
