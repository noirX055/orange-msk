"use client"

import { usePathname } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { ContactPanel } from "@/components/contact-panel"
import type { AdminCategory, AdminGroup } from "@/lib/admin/queries"

type Brand = { id: number; name: string }

export function SiteChrome({
  children,
  categories,
  groups,
  brands,
}: {
  children: React.ReactNode
  categories: AdminCategory[]
  groups: AdminGroup[]
  brands: Brand[]
}) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <>
      <SiteHeader categories={categories} groups={groups} brands={brands} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <SiteFooter />
      <MobileBottomNav />
      <ContactPanel />
    </>
  )
}
