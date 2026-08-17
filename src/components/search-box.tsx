"use client"

import { useEffect, useId, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2, Search, X } from "lucide-react"
import { formatPrice, getCategoryName } from "@/lib/products"

type SearchHit = {
  slug: string
  name: string
  brand: string
  category: string
  price: number
  oldPrice: number | null
  image: string | null
}

export function SearchBox({
  autoFocus = false,
  placeholder = "Искать смартфоны, ноутбуки, наушники…",
  onNavigate,
}: {
  autoFocus?: boolean
  placeholder?: string
  onNavigate?: () => void
}) {
  const router = useRouter()
  const listId = useId()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)

  // Живые подсказки с дебаунсом; прошлый запрос отменяем.
  // Весь setState — внутри асинхронного колбэка (не в теле эффекта синхронно).
  useEffect(() => {
    const term = query.trim()
    const controller = new AbortController()

    const timer = window.setTimeout(async () => {
      if (term.length < 2) {
        setResults([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        })
        const data = (await res.json()) as { results: SearchHit[] }
        setResults(data.results)
        setActive(-1)
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, term.length < 2 ? 0 : 200)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  // Закрытие по клику вне компонента
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    setResults([])
    onNavigate?.()
    router.push(href)
  }

  const submit = () => {
    if (active >= 0 && results[active]) {
      go(`/product/${results[active].slug}`)
    } else if (query.trim()) {
      go(`/catalog?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActive((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, -1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      submit()
    } else if (event.key === "Escape") {
      setOpen(false)
    }
  }

  const showPanel = open && query.trim().length >= 2

  return (
    <div ref={rootRef} className="relative flex-1">
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2.5 focus-within:border-primary">
        <Search size={18} className="shrink-0 text-muted-foreground" />
        <input
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {loading && <Loader2 size={16} className="shrink-0 animate-spin text-muted-foreground" />}
        {query && !loading && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setResults([])
            }}
            aria-label="Очистить поиск"
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          {results.length === 0 && !loading ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Ничего не найдено по запросу «{query.trim()}»
            </p>
          ) : (
            <>
              <ul className="max-h-[70vh] overflow-y-auto py-2">
                {results.map((hit, index) => (
                  <li key={hit.slug}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === active}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(`/product/${hit.slug}`)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        index === active ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                        {hit.image && (
                          <Image
                            src={hit.image}
                            alt=""
                            width={48}
                            height={48}
                            className="h-full w-full object-contain"
                          />
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium">{hit.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {hit.brand} · {getCategoryName(hit.category)}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatPrice(hit.price)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => go(`/catalog?q=${encodeURIComponent(query.trim())}`)}
                className="block w-full border-t border-border px-4 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-muted"
              >
                Показать все результаты по «{query.trim()}»
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
