"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/lib/supabase/client"
import { toggleFavorite, removeFavoriteSlug, syncFavorites } from "@/app/account/actions"
import { trackFavoriteToggle } from "@/lib/analytics"

const STORAGE_KEY = "orange_favorites_slugs_v1"

function getStoredSlugs(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) || localStorage.getItem("orange_favorites")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0)
    }
  } catch {
    // ignore parsing errors
  }
  return []
}

function saveStoredSlugs(slugs: string[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch (e) {
    console.error("Ошибка сохранения избранного в localStorage:", e)
  }
}

type FavoritesContextValue = {
  ready: boolean
  isAuthed: boolean
  slugs: Set<string>
  favoriteSlugs: string[]
  totalFavorites: number
  isFavorite: (slug: string) => boolean
  toggle: (slug: string) => void
  remove: (slug: string) => void
  clear: () => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<Set<string>>(new Set())
  const [isAuthed, setIsAuthed] = useState(false)
  const [ready, setReady] = useState(false)
  const isSyncingRef = useRef(false)

  // 1. Инициализация из localStorage при первом монтировании на клиенте
  useEffect(() => {
    const local = getStoredSlugs()
    if (local.length > 0) {
      setSlugs(new Set(local))
    }
    setReady(true)
  }, [])

  // 2. Загрузка и синхронизация с Supabase для авторизованных пользователей
  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadAndSync() {
      if (isSyncingRef.current) return
      isSyncingRef.current = true

      try {
        const { data, error } = await supabase.auth.getUser()
        if (!active) return

        const user = data?.user
        if (error || !user) {
          setIsAuthed(false)
          // Для гостей оставляем то, что лежит в localStorage
          const local = getStoredSlugs()
          setSlugs(new Set(local))
          return
        }

        setIsAuthed(true)

        // Получаем избранные из базы данных
        const { data: dbFavs } = await supabase
          .from("favorites")
          .select("product_slug")
          .eq("user_id", user.id)

        if (!active) return

        const dbSlugs = (dbFavs ?? []).map((row) => row.product_slug as string)
        const localSlugs = getStoredSlugs()

        // Проверяем, есть ли гостевые товары, которые нужно синхронизировать в аккаунт
        const missingInDb = localSlugs.filter((s) => !dbSlugs.includes(s))

        if (missingInDb.length > 0) {
          // Выполняем слияние гостевых товаров в БД
          const merged = await syncFavorites(localSlugs)
          if (!active) return
          const mergedSet = new Set(merged)
          setSlugs(mergedSet)
          saveStoredSlugs(Array.from(mergedSet))
        } else {
          // Если гостевых нет или они уже есть в БД — объединяем и сохраняем
          const allSlugs = Array.from(new Set([...dbSlugs, ...localSlugs]))
          setSlugs(new Set(allSlugs))
          saveStoredSlugs(allSlugs)
        }
      } catch (err) {
        console.error("Ошибка загрузки избранного:", err)
      } finally {
        isSyncingRef.current = false
      }
    }

    loadAndSync()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || (session?.user && !isAuthed)) {
        loadAndSync()
      } else if (event === "SIGNED_OUT") {
        setIsAuthed(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [isAuthed])

  // 3. Синхронизация между соседними вкладками браузера
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) {
            setSlugs(new Set(parsed))
          }
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  // 4. Добавление/удаление товара (работает одинаково для гостей и авторизованных!)
  const toggle = useCallback(
    (slug: string) => {
      if (!slug) return

      let willBeFavorite = false

      setSlugs((current) => {
        const next = new Set(current)
        if (next.has(slug)) {
          next.delete(slug)
          willBeFavorite = false
        } else {
          next.add(slug)
          willBeFavorite = true
        }
        // Сохраняем в localStorage сразу
        saveStoredSlugs(Array.from(next))
        return next
      })

      // Сохраняем в localStorage сразу
      if (willBeFavorite) {
        trackFavoriteToggle("add", slug)
      }

      // Если пользователь авторизован — также синхронизируем с БД на сервере
      if (isAuthed) {
        void toggleFavorite(slug).catch((err) => {
          console.error("Не удалось синхронизировать избранное с сервером:", err)
        })
      }
    },
    [isAuthed]
  )

  // 5. Явное удаление товара из избранного
  const remove = useCallback(
    (slug: string) => {
      if (!slug) return

      setSlugs((current) => {
        if (!current.has(slug)) return current
        const next = new Set(current)
        next.delete(slug)
        saveStoredSlugs(Array.from(next))
        return next
      })

      if (isAuthed) {
        void removeFavoriteSlug(slug).catch((err) => {
          console.error("Не удалось удалить из БД:", err)
        })
      }
    },
    [isAuthed]
  )

  // 6. Очистка избранного
  const clear = useCallback(() => {
    setSlugs(new Set())
    saveStoredSlugs([])
  }, [])

  const favoriteSlugs = useMemo(() => Array.from(slugs), [slugs])

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ready,
      isAuthed,
      slugs,
      favoriteSlugs,
      totalFavorites: slugs.size,
      isFavorite: (slug: string) => slugs.has(slug),
      toggle,
      remove,
      clear,
    }),
    [ready, isAuthed, slugs, favoriteSlugs, toggle, remove, clear]
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
