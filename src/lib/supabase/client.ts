import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase.co")
      ? process.env.NEXT_PUBLIC_SUPABASE_URL
      : "https://db.orangemsk.ru"

  return createBrowserClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
