"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AuthAlert, AuthField, AuthSubmit } from "@/components/auth-ui"

function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(params.get("denied") ? "У этого аккаунта нет доступа к админ-панели." : "")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    // Пускаем в панель только администраторов; остальных — сразу выходим из сессии
    const role = (data.user?.user_metadata as { role?: string } | undefined)?.role
    if (role !== "admin") {
      await supabase.auth.signOut()
      setError("У этого аккаунта нет доступа к админ-панели.")
      setLoading(false)
      return
    }

    router.replace("/admin")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <AuthAlert message={error} />}

      <AuthField
        id="admin-email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
        placeholder="admin@orange-msk.ru"
      />

      <AuthField
        id="admin-password"
        label="Пароль"
        password
        autoComplete="current-password"
        required
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
      />

      <AuthSubmit id="admin-submit" loading={loading}>
        Войти в панель
      </AuthSubmit>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-card border border-border bg-card p-8 shadow-xl shadow-navy/5">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-navy-foreground">
            <ShieldCheck size={26} />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Админ-панель</h1>
            <p className="mt-1 text-sm text-muted-foreground">Orange MSK · вход для администраторов</p>
          </div>
        </div>

        <Suspense fallback={null}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  )
}
