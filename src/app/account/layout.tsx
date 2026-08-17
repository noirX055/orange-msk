import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/account/queries"
import { AccountSidebar } from "@/components/account/account-sidebar"

export const metadata: Metadata = {
  title: "Личный кабинет — Orange MSK",
  description: "Заказы, избранное и настройки профиля Orange MSK",
}

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const profile = await getProfile()
  const name = profile?.full_name?.trim() || user.email?.split("@")[0] || "Покупатель"
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="mb-4 flex items-center gap-3 rounded-card border border-border p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <AccountSidebar />
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
