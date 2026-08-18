"use client"

import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"

export function AdminLayoutClient({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()

  // Закрывать сайдбар на мобилках при переходе по ссылке
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }, [pathname])

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Wrapper */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card transition-transform duration-300 lg:sticky lg:top-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        {sidebar}
      </aside>

      {/* Overlay для мобильных экранов */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Кнопка открытия/закрытия сайдбара */}
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Переключить меню"
          >
            <Menu size={20} />
          </button>
        </header>

        <div className="mx-auto w-full max-w-[1600px] px-4 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  )
}
