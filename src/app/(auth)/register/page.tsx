"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { registerUser } from "../actions"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов")
      return
    }

    setLoading(true)

    // 1. Создание аккаунта через Server Action с автоматическим подтверждением email
    // (полностью обходит отправку писем через SMTP в self-hosted Supabase)
    const res = await registerUser({ name, email, password })

    if (!res.ok) {
      setError(res.error || "Не удалось создать аккаунт")
      setLoading(false)
      return
    }

    // 2. Сразу выполняем авторизацию под созданным аккаунтом
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // Если по какой-то причине автоматический вход не прошел, отправляем на форму логина
      router.push("/login")
      return
    }

    router.push("/account")
    router.refresh()
  }

  return (
    <div className="w-full">
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          placeholder="Минимум 6 символов"
          helper="Не менее 6 символов"
        />

        <AuthSubmit id="register-submit" loading={loading}>
          Создать аккаунт
        </AuthSubmit>
      </form>

      {/* Terms note */}
      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground/70">
        Регистрируясь, вы соглашаетесь с условиями сервиса и политикой конфиденциальности
      </p>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">или</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Login link */}
      <Link
        href="/login"
        className="flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        Уже есть аккаунт? Войти
      </Link>
    </div>
  )
}
