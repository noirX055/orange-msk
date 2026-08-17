"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toggleFavorite } from "@/app/account/actions"

type FavoritesContextValue = {
  ready: boolean
  isAuthed: boolean
  isFavorite: (slug: string) => boolean
  toggle: (slug: string) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [slugs, setSlugs] = useState<Set<string>>(new Set())
  const [isAuthed, setIsAuthed] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!active) return

      if (!user) {
        setIsAuthed(false)
        setSlugs(new Set())
        setReady(true)
        return
      }

      setIsAuthed(true)
      const { data } = await supabase
        .from("favorites")
        .select("product_slug")
        .eq("user_id", user.id)

      if (!active) return
      setSlugs(new Set((data ?? []).map((row) => row.product_slug as string)))
      setReady(true)
    }

    load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const toggle = useCallback(
    (slug: string) => {
      if (!isAuthed) {
        router.push("/login")
        return
      }

      // Оптимистичное обновление
      setSlugs((current) => {
        const next = new Set(current)
        if (next.has(slug)) next.delete(slug)
        else next.add(slug)
        return next
      })

      void toggleFavorite(slug)
    },
    [isAuthed, router]
  )

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ready,
      isAuthed,
      isFavorite: (slug: string) => slugs.has(slug),
      toggle,
    }),
    [ready, isAuthed, slugs, toggle]
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites должен использоваться внутри FavoritesProvider")
  }
  return context
}
