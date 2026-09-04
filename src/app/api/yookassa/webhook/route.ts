import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Webhook от ЮКасса не требует авторизации пользователя —
// ЮКасса отправляет уведомления напрямую на наш сервер.
// Для безопасности проверяем наличие payment_id в нашей БД.

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const event = body.event as string | undefined
    const paymentId = body.object?.id as string | undefined
    const paymentStatus = body.object?.status as string | undefined

    if (!event || !paymentId) {
      return NextResponse.json({ error: "Неверный формат" }, { status: 400 })
    }

    console.log(`[YooKassa Webhook] event=${event} paymentId=${paymentId} status=${paymentStatus}`)

    const supabase = await createClient()

    // Находим заказ по payment_id
    const { data: order } = await supabase
      .from("orders")
      .select("id, status")
      .eq("payment_id", paymentId)
      .single()

    if (!order) {
      console.warn(`[YooKassa Webhook] Заказ с payment_id=${paymentId} не найден`)
      // Возвращаем 200 чтобы ЮКасса не повторяла запрос
      return NextResponse.json({ ok: true })
    }

    // Обновляем статус заказа
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

    // Всегда возвращаем 200 — иначе ЮКасса будет повторять запрос
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[YooKassa Webhook] Ошибка:", error)
    // Даже при ошибке возвращаем 200 чтобы не было бесконечных ретраев
    return NextResponse.json({ ok: true })
  }
}
