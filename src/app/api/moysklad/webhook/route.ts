import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import { MoySkladClient } from "@/lib/moysklad/client"
import { mapMoySkladProductToDb } from "@/lib/moysklad/mapper"
import type { MoySkladWebhookEvent } from "@/lib/moysklad/types"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("Supabase URL или Key не заданы")
  }

  return createClient(url, key)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MoySkladWebhookEvent
    const events = body.events || []

    if (!events.length) {
      return NextResponse.json({ ok: true, message: "No events" })
    }

    console.log(`[MoySklad Webhook] Получено ${events.length} событий`)

    const token = process.env.MOYSKLAD_API_TOKEN
    if (!token) {
      console.warn("[MoySklad Webhook] MOYSKLAD_API_TOKEN не задан")
      return NextResponse.json({ ok: true })
    }

    const ms = new MoySkladClient(token)
    const supabase = getSupabase()

    for (const event of events) {
      const type = event.meta?.type
      const action = event.action
      const href = event.meta?.href

      if (type !== "product" || !href) {
        continue
      }

      const msId = href.split("/").pop() || ""

      if (action === "DELETE") {
        console.log(`[MoySklad Webhook] Удаление/скрытие товара: ${msId}`)
        await supabase
          .from("products")
          .update({ is_visible: false, in_stock: false })
          .eq("moysklad_id", msId)
        continue
      }

      if (action === "CREATE" || action === "UPDATE") {
        try {
          const msProduct = await ms.getProductByHref(href)
          if (!msProduct) continue

          const dbProduct = mapMoySkladProductToDb(msProduct)

          // Проверяем, есть ли уже товар с таким moysklad_id
          const { data: existing } = await supabase
            .from("products")
            .select("id, slug")
            .eq("moysklad_id", msProduct.id)
            .maybeSingle()

          if (existing) {
            // Обновляем существующий (сохраняя прежний slug, если он не менялся)
            await supabase
              .from("products")
              .update({
                name: dbProduct.name,
                code: dbProduct.code,
                sku: dbProduct.sku,
                path_name: dbProduct.path_name,
                brand: dbProduct.brand,
                category: dbProduct.category,
                price: dbProduct.price,
                in_stock: dbProduct.in_stock,
                is_visible: dbProduct.is_visible,
                description: dbProduct.description,
                updated_at: new Date().toISOString(),
              })
              .eq("moysklad_id", msProduct.id)

            console.log(`[MoySklad Webhook] Обновлен товар: "${dbProduct.name}" (ID: ${msProduct.id})`)
          } else {
            // Создаем новый товар
            await supabase.from("products").insert(dbProduct)
            console.log(`[MoySklad Webhook] Создан новый товар: "${dbProduct.name}" (ID: ${msProduct.id})`)
          }
        } catch (err) {
          console.error(`[MoySklad Webhook] Ошибка обработки товара ${msId}:`, err)
        }
      }
    }

    // Сбрасываем кэш витрины и админки
    revalidatePath("/admin/products")
    revalidatePath("/catalog")
    revalidatePath("/")

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[MoySklad Webhook] Ошибка:", error)
    // Всегда возвращаем 200 OK, чтобы МойСклад не спамил повторами
    return NextResponse.json({ ok: true, error: String(error) })
  }
}
