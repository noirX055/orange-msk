import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { logMarketSync } from "@/lib/yandex-market/settings"

export const dynamic = "force-dynamic"

/**
 * Вебхук изменения статуса заказа Маркета (POST /order/status)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = body.order || {}
    const orderId = order.id
    const status = order.status
    const substatus = order.substatus

    if (orderId && status) {
      const supabase = getAdminClient()
      // Обновляем статус в нашей базе
      await supabase
        .from("orders")
        .update({
          status: status === "DELIVERED" ? "done" : status === "CANCELLED" ? "cancelled" : "processing",
        })
        .eq("payment_id", `ym-${orderId}`)

      await logMarketSync(
        "order_status_changed",
        "success",
        1,
        `Заказ #${orderId} переведён в статус ${status} (${substatus || ""})`,
        order
      )
    }

    return new NextResponse(null, { status: 200 })
  } catch (err: any) {
    console.error("[YandexMarket order status error]:", err)
    return new NextResponse(null, { status: 200 })
  }
}
