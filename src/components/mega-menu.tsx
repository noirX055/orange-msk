"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

const customMenu = [
  {
    name: "Apple",
    href: "/catalog?brand=Apple",
    dropdown: [
      { name: "14", href: "/catalog?category=iphone-14" },
      { name: "15", href: "/catalog?category=iphone-15" },
      { name: "16", href: "/catalog?category=iphone-16" },
      { name: "17", href: "/catalog?category=iphone-17" },
      { name: "18", href: "/catalog?category=iphone-18" },
      { name: "MacBook", href: "/catalog?category=macbook" },
      { name: "iPad", href: "/catalog?category=ipad" },
      { name: "AirPods", href: "/catalog?category=airpods" },
      { name: "Apple Watch", href: "/catalog?category=apple-watch" },
    ],
  },
  { name: "Samsung", href: "/catalog?category=samsung" },
  { name: "Dyson", href: "/catalog?category=dyson" },
  { name: "Lego", href: "/catalog?category=lego" },
  { name: "Игровые консоли", href: "/catalog?category=consoles" },
  { name: "Аксессуары", href: "/catalog?category=accessories" },
]

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const [dropdownTop, setDropdownTop] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveCategory(name)
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect()
      setDropdownTop(rect.bottom)
    }
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveCategory(null), 200)
  }

  const activeItem = customMenu.find((item) => item.name === activeCategory)
  const hasDropdown = activeItem?.dropdown && activeItem.dropdown.length > 0

  const dropdown = activeCategory && hasDropdown ? (
    <div
      className="fixed left-0 right-0 z-[9999] border-b border-border bg-background shadow-xl"
      style={{ top: dropdownTop }}
      onMouseEnter={() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }}
      onMouseLeave={handleLeave}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {activeItem.dropdown!.map((sub) => (
            <Link
              key={sub.name}
              href={sub.href}
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 p-4 font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="text-xl">🍊</span>
              {sub.name}
            </Link>
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
          <ul className="flex items-center gap-1">
            {customMenu.map((item) => (
              <li
                key={item.name}
                onMouseEnter={() => handleEnter(item.name)}
              >
                <Link
                  href={item.href}
                  onClick={() => setActiveCategory(null)}
                  className={`block whitespace-nowrap border-b-2 px-4 py-3 text-[15px] font-semibold transition-colors ${
                    activeCategory === item.name
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
                className="block whitespace-nowrap px-3 py-3 text-[15px] font-bold text-primary hover:opacity-80 transition-opacity"
              >
                🔥 Скидки
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      {mounted && dropdown && createPortal(dropdown, document.body)}
    </>
  )
}
