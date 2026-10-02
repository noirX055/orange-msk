import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { syncPricesToMarket } from "@/lib/yandex-market/sync"

export const dynamic = "force-dynamic"
export const maxDuration = 300

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
    const result = await syncPricesToMarket()
    revalidatePath("/admin/yandex-market")
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Ошибка синхронизации цен" },
      { status: 500 }
    )
  }
}
