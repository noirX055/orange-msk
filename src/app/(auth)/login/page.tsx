"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

const testAccounts = [
  { label: "Пользователь", email: "user@orange-msk.ru", password: "user1234" },
  { label: "Админ", email: "admin@orange-msk.ru", password: "admin1234" },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-[2rem] font-bold leading-tight tracking-tight">
          Добро пожаловать
        </h1>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-foreground">
          Войдите, чтобы отслеживать заказы и копить&nbsp;бонусы
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
        href="/register"
        className="flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        Создать аккаунт
      </Link>

      {/* TODO: удалить перед выпуском в прод */}
      <div className="mt-8 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-primary/70">
          🛠 Dev · тестовые аккаунты
        </p>
        <div className="flex flex-col gap-2">
          {testAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => {
                setEmail(account.email)
                setPassword(account.password)
              }}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-left text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span>
                <span className="font-semibold text-foreground/80">{account.label}</span>{" "}
                <span className="text-muted-foreground">— {account.email}</span>
              </span>
              <span className="shrink-0 font-medium text-primary">Заполнить</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
