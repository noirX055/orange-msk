"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import type { NavigationTree } from "@/lib/products/queries"

// Админка (/admin) — самостоятельная панель со своей оболочкой,
// поэтому витринные хедер и футер на её маршрутах не показываем.
export function SiteChrome({ 
  children,
  navigationTree 
}: { 
  children: React.ReactNode
  navigationTree?: NavigationTree
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <SiteHeader navigationTree={navigationTree} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  )
}
