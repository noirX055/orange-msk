import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { sendOrderReceiptEmail } from "@/lib/email"

// Webhook от ЮКасса не требует авторизации пользователя —
// ЮКасса отправляет уведомления напрямую на наш сервер.
// Для надёжности и безопасности используем getAdminClient() (Service Role).

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

    const supabaseAdmin = getAdminClient()

    // refund.succeeded: object.id — ID возврата, payment_id — ID исходного платежа
    if (event === "refund.succeeded") {
      const refundPaymentId = body.object?.payment_id as string | undefined
      if (refundPaymentId) {
        const { data: refundOrder } = await supabaseAdmin
          .from("orders")
          .select("id, status")
          .eq("payment_id", refundPaymentId)
          .single()

        if (refundOrder && refundOrder.status !== "refunded") {
          await supabaseAdmin
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
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("payment_id", objectId)
      .single()

    if (!order) {
      console.warn(`[YooKassa Webhook] Заказ с payment_id=${objectId} не найден`)
      return NextResponse.json({ ok: true })
    }

    if (event === "payment.succeeded" && order.status === "pending_payment") {
      await supabaseAdmin
        .from("orders")
        .update({ status: "processing" })
        .eq("id", order.id)

      console.log(`[YooKassa Webhook] Заказ ${order.id} → processing (оплачен)`)

      // Отправка электронного чека клиенту
      try {
        const { data: orderDetails } = await supabaseAdmin
          .from("orders")
          .select(`
            id,
            created_at,
            subtotal,
            delivery,
            total,
            recipient_name,
            phone,
            address,
            user_id,
            order_items (
              name,
              color,
              price,
              quantity
            )
          `)
          .eq("id", order.id)
          .single()

        if (orderDetails) {
          let customerEmail: string | undefined = body.object?.receipt?.customer?.email
          let customerName = orderDetails.recipient_name || undefined

          if (!customerEmail && orderDetails.user_id) {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
              orderDetails.user_id
            )
            customerEmail = userData?.user?.email
            if (!customerName) {
              customerName = userData?.user?.user_metadata?.full_name
            }
          }

          if (customerEmail) {
            const receiptRes = await sendOrderReceiptEmail({
              orderId: orderDetails.id,
              date: orderDetails.created_at
                ? new Date(orderDetails.created_at).toLocaleDateString("ru-RU")
                : undefined,
              customerEmail,
              customerName,
              phone: orderDetails.phone || undefined,
              address: orderDetails.address || undefined,
              items: (orderDetails.order_items || []).map((i: any) => ({
                name: i.name,
                color: i.color || undefined,
                price: Number(i.price),
                quantity: Number(i.quantity),
              })),
              subtotal: Number(orderDetails.subtotal),
              delivery: Number(orderDetails.delivery || 0),
              total: Number(orderDetails.total),
            })
            console.log(
              `[YooKassa Webhook] Отправка чека на ${customerEmail}:`,
              receiptRes.success ? "УСПЕХ" : receiptRes.error
            )
          } else {
            console.warn(`[YooKassa Webhook] Не удалось определить email для заказа #${order.id}`)
          }
        }
      } catch (receiptErr) {
        console.error(`[YooKassa Webhook] Ошибка при отправке чека:`, receiptErr)
      }
    }

    if (event === "payment.canceled" && order.status === "pending_payment") {
      await supabaseAdmin
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
