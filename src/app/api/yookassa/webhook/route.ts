import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Webhook от ЮКасса не требует авторизации пользователя —
// ЮКасса отправляет уведомления напрямую на наш сервер.
// Для безопасности проверяем наличие payment_id в нашей БД.

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const event = body.event as string | undefined
    const objectId = body.object?.id as string | undefined
    const objectStatus = body.object?.status as string | undefined

    if (!event || !objectId) {
      return NextResponse.json({ error: "Неверный формат" }, { status: 400 })
    }

    console.log(`[YooKassa Webhook] event=${event} objectId=${objectId} status=${objectStatus}`)

    const supabase = await createClient()

    // refund.succeeded: object.id — ID возврата, payment_id — ID исходного платежа
    if (event === "refund.succeeded") {
      const refundPaymentId = body.object?.payment_id as string | undefined
      if (refundPaymentId) {
        const { data: refundOrder } = await supabase
          .from("orders")
          .select("id, status")
          .eq("payment_id", refundPaymentId)
          .single()

        if (refundOrder && refundOrder.status !== "refunded") {
          await supabase
            .from("orders")
            .update({ status: "refunded" })
            .eq("id", refundOrder.id)

          console.log(`[YooKassa Webhook] Заказ ${refundOrder.id} → refunded`)
        } else if (!refundOrder) {
          console.warn(`[YooKassa Webhook] Заказ с payment_id=${refundPaymentId} не найден`)
        }
      }

      return NextResponse.json({ ok: true })
    }

    // payment.*: object.id — ID платежа
    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("payment_id", objectId)
      .single()

    if (!order) {
      console.warn(`[YooKassa Webhook] Заказ с payment_id=${objectId} не найден`)
      return NextResponse.json({ ok: true })
    }

    if (event === "payment.succeeded" && order.status === "pending_payment") {
      await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", order.id)

      console.log(`[YooKassa Webhook] Заказ ${order.id} → processing (оплачен)`)
    }

    if (event === "payment.canceled" && order.status === "pending_payment") {
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", order.id)

      console.log(`[YooKassa Webhook] Заказ ${order.id} → cancelled`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[YooKassa Webhook] Ошибка:", error)
    return NextResponse.json({ ok: true })
  }
}
