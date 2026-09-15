"use client"

import Link from "next/link"
import { useState, useRef, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import type { AdminCategory, AdminGroup } from "@/lib/admin/queries"

export function MegaMenu({
  categories,
  groups,
}: {
  categories: AdminCategory[]
  groups: AdminGroup[]
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const [dropdownTop, setDropdownTop] = useState(0)
  const [mounted, setMounted] = useState(false)

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.is_visible),
    [categories]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveCategory(slug)
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect()
      setDropdownTop(rect.bottom)
    }
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 200)
  }

  const activeItem = visibleCategories.find((item) => item.slug === activeCategory)
  const categoryGroups = activeItem
    ? groups.filter((g) => g.category_slug === activeItem.slug)
    : []
  const hasDropdown = categoryGroups.length > 0

  const sections = useMemo(() => {
    if (!activeItem) return []
    const catGroups = groups.filter((g) => g.category_slug === activeItem.slug)

    const parentMap = new Map<string, AdminGroup[]>()
    const standalone: AdminGroup[] = []

    for (const g of catGroups) {
      const p = g.parent_group?.trim()
      if (p) {
        const list = parentMap.get(p) ?? []
        list.push(g)
        parentMap.set(p, list)
      } else {
        standalone.push(g)
      }
    }

    const res: { title: string | null; items: AdminGroup[] }[] = []
    for (const [title, items] of parentMap.entries()) {
      res.push({ title, items })
    }

    if (standalone.length > 0) {
      res.push({
        title: parentMap.size > 0 ? "Другое" : null,
        items: standalone,
      })
    }

    return res
  }, [activeItem, groups])

  const dropdown = activeCategory && hasDropdown ? (
    <div
      className="fixed left-0 right-0 z-[9999] border-b border-border bg-background shadow-xl"
      style={{ top: dropdownTop }}
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }}
      onMouseLeave={handleLeave}
    >
      <div className="mx-auto max-w-7xl px-8 py-7">
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          {sections.map((section, idx) => (
            <div key={section.title ?? `col-${idx}`} className="flex flex-col min-w-[160px] max-w-[220px]">
              {section.title && (
                <div className="mb-2.5 pb-1 border-b border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                    {section.title}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {section.items.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/catalog?category=${activeItem!.slug}&series=${encodeURIComponent(sub.name)}`}
                    onClick={() => setActiveCategory(null)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Категории"
        className="hidden border-t border-border md:block"
        onMouseLeave={handleLeave}
      >
        <div className="mx-auto max-w-7xl px-4">
          <ul className="flex flex-wrap items-center gap-1">
            {visibleCategories.map((item) => (
              <li
                key={item.slug}
                onMouseEnter={() => handleEnter(item.slug)}
              >
                <Link
                  href={`/catalog?category=${item.slug}`}
                  onClick={() => setActiveCategory(null)}
                  className={`block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    activeCategory === item.slug
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <Link
                href="/catalog?sale=1"
                className="block whitespace-nowrap px-3 py-3 text-sm font-semibold text-primary"
              >
                Скидки
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </>
  )
}
