import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getPayment } from "@/lib/yookassa"

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId")
    if (!orderId) {
      return NextResponse.json({ error: "orderId обязателен" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Необходимо войти в аккаунт" }, { status: 401 })
    }

    // Получаем заказ (только свой)
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, payment_id, total")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single()

    if (!order) {
      return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
    }

    // Если заказ ещё ожидает оплаты и есть payment_id — проверяем у ЮКасса
    if (order.status === "pending_payment" && order.payment_id) {
      const payment = await getPayment(order.payment_id)

      if (payment.status === "succeeded") {
        await supabase
          .from("orders")
          .update({ status: "processing" })
          .eq("id", order.id)

        return NextResponse.json({
          status: "processing",
          paid: true,
          total: order.total,
        })
      }

      if (payment.status === "canceled") {
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", order.id)

        return NextResponse.json({
          status: "cancelled",
          paid: false,
          total: order.total,
        })
      }

      // Ещё в процессе
      return NextResponse.json({
        status: "pending_payment",
        paid: false,
        total: order.total,
      })
    }

    return NextResponse.json({
      status: order.status,
      paid: order.status !== "pending_payment" && order.status !== "cancelled" && order.status !== "refunded",
      total: order.total,
    })
  } catch (error) {
    console.error("[Checkout/Status] Ошибка:", error)
    return NextResponse.json(
      { error: "Ошибка проверки статуса" },
      { status: 500 }
    )
  }
}
