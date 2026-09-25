import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Публичный клиент Supabase для статических страниц, фидов (RSS, YML, Sitemap)
 * и маршрутов, где не требуются cookies авторизации пользователя.
 * Не вызывает `cookies()`, поэтому не ломает статическую генерацию и кэширование Next.js.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
