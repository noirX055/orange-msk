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

type DbProduct = ReturnType<typeof mapMoySkladProductToDb> & {
  series?: string | null
  variant_group?: string | null
  badge?: string | null
  rating?: number | null
  reviews?: number | null
}

export async function POST() {
  // 1. Проверка прав
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

    let offset = 0
    let totalFetched = 0
    let totalUpserted = 0
    let errors: string[] = []

    // 2. Постраничная загрузка всех товаров из МойСклад
    while (true) {
      const page = await ms.getProducts(PAGE_SIZE, offset)
      const rows = page.rows || []

      if (rows.length === 0) break

      totalFetched += rows.length

      // Преобразуем в формат БД
      const dbRows: DbProduct[] = rows.map((product) => mapMoySkladProductToDb(product))

      // Батчевый upsert с сохранением уже существующих пользовательских данных (фото, характеристики, цвета, слаг)
      for (let i = 0; i < dbRows.length; i += BATCH_SIZE) {
        const batch = dbRows.slice(i, i + BATCH_SIZE)
        const batchIds = batch.map((p) => p.moysklad_id)

        // Получаем уже существующие товары для сохранения обогащённых данных
        const { data: existingProducts } = await supabase
          .from("products")
          .select("moysklad_id, slug, images, specs, colors, series, variant_group, badge, rating, reviews")
          .in("moysklad_id", batchIds)

        if (existingProducts && existingProducts.length > 0) {
          const existingMap = new Map(
            existingProducts.map((p: any) => [p.moysklad_id, p])
          )

          for (const item of batch) {
            const existing = existingMap.get(item.moysklad_id)
            if (existing) {
              if (existing.slug) item.slug = existing.slug
              if (Array.isArray(existing.images) && existing.images.length > 0) {
                item.images = existing.images
              }
              if (Array.isArray(existing.specs) && existing.specs.length > 0) {
                item.specs = existing.specs
              }
              if (Array.isArray(existing.colors) && existing.colors.length > 0) {
                item.colors = existing.colors
              }
              if (existing.series) item.series = existing.series
              if (existing.variant_group) item.variant_group = existing.variant_group
              if (existing.badge) item.badge = existing.badge
              if (existing.rating !== undefined && existing.rating !== null) item.rating = existing.rating
              if (existing.reviews !== undefined && existing.reviews !== null) item.reviews = existing.reviews
            }
          }
        }

        const { error } = await supabase
          .from("products")
          .upsert(batch, { onConflict: "moysklad_id" })

        if (error) {
          errors.push(`Batch offset=${offset + i}: ${error.message}`)
        } else {
          totalUpserted += batch.length
        }
      }

      // Если записей меньше PAGE_SIZE — это последняя страница
      if (rows.length < PAGE_SIZE) break
      offset += PAGE_SIZE
    }

    // 3. Сбрасываем кэш
    revalidatePath("/admin/products")
    revalidatePath("/catalog")
    revalidatePath("/")

    return NextResponse.json({
      ok: true,
      totalFetched,
      totalUpserted,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    console.error("[Sync Products] Ошибка:", err)
    return NextResponse.json(
      { ok: false, error: err?.message || "Ошибка синхронизации" },
      { status: 500 }
    )
  }
}
