import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getInitializedMarketClient } from "@/lib/yandex-market/settings"

export const dynamic = "force-dynamic"

async function verifyAdmin(): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    return profile?.role === "admin"
  } catch {
    return false
  }
}

export async function POST() {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 })
  }

  try {
    const client = await getInitializedMarketClient()
    const test = await client.testConnection()

    return NextResponse.json(test)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Ошибка подключения" },
      { status: 500 }
    )
  }
}
