"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

// Админка (/admin) — самостоятельная панель со своей оболочкой,
// поэтому витринные хедер и футер на её маршрутах не показываем.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav />
    </>
  )
}
