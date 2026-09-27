import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js"
import { MoySkladClient } from "@/lib/moysklad/client"
import { mapMoySkladProductToDb } from "@/lib/moysklad/mapper"
import { createClient as createServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const maxDuration = 300

const BATCH_SIZE = 250
const PAGE_SIZE = 1000

/** Проверяем, что запрос идёт от admin-пользователя */
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

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("Supabase URL или Service Role Key не заданы")
  }

  return createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST() {
  // 1. Проверка прав администратора
  const isAdmin = await verifyAdmin()
  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, error: "Доступ запрещён" },
      { status: 403 }
    )
  }

  try {
    const msToken = process.env.MOYSKLAD_API_TOKEN
    if (!msToken) {
      return NextResponse.json(
        { ok: false, error: "MOYSKLAD_API_TOKEN не задан" },
        { status: 500 }
      )
    }

    const ms = new MoySkladClient(msToken)
    const supabase = getAdminSupabase()

    // 2. Загружаем идентификаторы ВСЕХ уже существующих в базе товаров,
    // чтобы НИ ПРИ КАКИХ УСЛОВИЯХ их не трогать и не перезаписывать.
    const { data: existingProducts, error: fetchErr } = await supabase
      .from("products")
      .select("moysklad_id, code, sku")

    if (fetchErr) {
      throw new Error(`Ошибка получения существующих товаров: ${fetchErr.message}`)
    }

    const existingMsIds = new Set<string>()
    const existingCodes = new Set<string>()
    const existingSkus = new Set<string>()

    for (const p of existingProducts || []) {
      if (p.moysklad_id) existingMsIds.add(String(p.moysklad_id).trim())
      if (p.code) existingCodes.add(String(p.code).trim().toLowerCase())
      if (p.sku) existingSkus.add(String(p.sku).trim().toLowerCase())
    }

    let offset = 0
    let totalFetched = 0
    let totalAdded = 0
    let totalSkipped = 0
    let errors: string[] = []

    // 3. Постранично читаем МойСклад и добавляем ТОЛЬКО новые товары
    while (true) {
      const page = await ms.getProducts(PAGE_SIZE, offset)
      const rows = page.rows || []

      if (rows.length === 0) break

      totalFetched += rows.length

      // Отбираем ИСКЛЮЧИТЕЛЬНО новые товары, которых ещё нет в нашей базе
      const trulyNewProducts = rows.filter((p) => {
        const msId = p.id?.trim()
        const code = p.code ? String(p.code).trim().toLowerCase() : null
        const sku = p.article ? String(p.article).trim().toLowerCase() : null

        if (msId && existingMsIds.has(msId)) {
          totalSkipped++
          return false
        }
        if (code && existingCodes.has(code)) {
          totalSkipped++
          return false
        }
        if (sku && existingSkus.has(sku)) {
          totalSkipped++
          return false
        }

        return true
      })

      // Преобразуем только новые товары
      const dbRowsToInsert = trulyNewProducts.map((p) => {
        // Добавляем в Set, чтобы предотвратить дубликаты внутри самой выгрузки
        if (p.id) existingMsIds.add(String(p.id).trim())
        if (p.code) existingCodes.add(String(p.code).trim().toLowerCase())
        if (p.article) existingSkus.add(String(p.article).trim().toLowerCase())

        return mapMoySkladProductToDb(p)
      })

      // Вставляем ТОЛЬКО новые товары (ignoreDuplicates гарантирует, что существующие строки никогда не обновятся)
      for (let i = 0; i < dbRowsToInsert.length; i += BATCH_SIZE) {
        const batch = dbRowsToInsert.slice(i, i + BATCH_SIZE)
        const { error } = await supabase
          .from("products")
          .upsert(batch, { onConflict: "moysklad_id", ignoreDuplicates: true })

        if (error) {
          errors.push(`Пакет offset=${offset + i}: ${error.message}`)
        } else {
          totalAdded += batch.length
        }
      }

      if (rows.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    // 4. Сбрасываем кэш
    revalidatePath("/admin/products")
    revalidatePath("/catalog")
    revalidatePath("/")

    return NextResponse.json({
      ok: true,
      totalFetched,
      totalAdded,
      totalSkipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error("[Sync Products] Ошибка:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка обновления списка товаров" },
      { status: 500 }
    )
  }
}
