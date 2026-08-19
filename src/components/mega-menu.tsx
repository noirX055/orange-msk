"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { categories } from "@/lib/products"
import type { NavigationTree } from "@/lib/products/queries"

export function MegaMenu({ navigationTree }: { navigationTree?: NavigationTree }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = (slug: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveCategory(slug)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 200)
  }

  const brands = activeCategory && navigationTree?.[activeCategory]
    ? Object.entries(navigationTree[activeCategory])
    : []

  return (
    <nav
      aria-label="Категории"
      className="relative hidden border-t border-border md:block"
      onMouseLeave={handleLeave}
    >
      <div className="mx-auto max-w-7xl px-4">
        <ul className="flex items-center gap-1">
          {categories.map((category) => (
            <li
              key={category.slug}
              onMouseEnter={() => handleEnter(category.slug)}
            >
              <Link
                href={`/catalog?category=${category.slug}`}
                onClick={() => setActiveCategory(null)}
                className={`block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  activeCategory === category.slug
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.name}
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

      {activeCategory && brands.length > 0 && (
        <div
          className="absolute left-0 right-0 top-full z-[60] border-b border-border bg-background shadow-xl"
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
          }}
          onMouseLeave={handleLeave}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-6 px-8 py-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {brands.map(([brand, seriesList]) => (
              <div key={brand} className="flex flex-col gap-2">
                <Link
                  href={`/catalog?category=${activeCategory}&brand=${encodeURIComponent(brand)}`}
                  onClick={() => setActiveCategory(null)}
                  className="text-sm font-bold text-foreground transition-colors hover:text-primary"
                >
                  {brand}
                </Link>
                {seriesList.length > 0 && (
                  <ul className="flex flex-col gap-1">
                    {seriesList.map((series) => (
                      <li key={series}>
                        <Link
                          href={`/catalog?category=${activeCategory}&brand=${encodeURIComponent(brand)}&series=${encodeURIComponent(series)}`}
                          onClick={() => setActiveCategory(null)}
                          className="block text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {series}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
