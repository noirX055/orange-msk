"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Heart, LogOut, Package, User } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/account/actions"

function displayName(user: SupabaseUser) {
  const meta = user.user_metadata as { full_name?: string } | undefined
  return meta?.full_name?.trim() || user.email?.split("@")[0] || "Кабинет"
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function AccountMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // До готовности не мигаем — резервируем место ссылкой «Войти»
  if (!ready || !user) {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted md:flex"
      >
        <User size={18} />
        Войти
      </Link>
    )
  }

  const name = displayName(user)

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {initialsOf(name)}
        </span>
        <span className="max-w-28 truncate">{name}</span>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-navy/10"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-col p-1.5">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              <User size={17} />
              Личный кабинет
            </Link>
            <Link
              href="/account/orders"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              <Package size={17} />
              Мои заказы
            </Link>
            <Link
              href="/account/favorites"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
            >
              <Heart size={17} />
              Избранное
            </Link>
          </div>
          <form action={signOut} className="border-t border-border p-1.5">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={17} />
              Выйти
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
