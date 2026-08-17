import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

// Гарантирует, что текущий пользователь — админ.
// Гость и обычный пользователь → на страницу входа в админку.
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/admin/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") redirect("/admin/login?denied=1")

  return { supabase, user, profile }
}
