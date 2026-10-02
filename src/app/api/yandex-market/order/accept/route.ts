import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { logMarketSync } from "@/lib/yandex-market/settings"

export const dynamic = "force-dynamic"

/**
 * Вебхук подтверждения заказа (POST /order/accept)
 * Маркет отправляет информацию о поступившем заказе
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const marketOrder = body.order || {}

    const orderId = String(marketOrder.id || Date.now())
    const total = Number(marketOrder.total || 0)
    const items = marketOrder.items || []

    const supabase = getAdminClient()

    // Создаем запись заказа в основной таблице orders магазина (или логируем)
    try {
      const recipientName =
        marketOrder.buyer
          ? `${marketOrder.buyer.lastName || ""} ${marketOrder.buyer.firstName || ""}`.trim()
          : "Покупатель Яндекс.Маркет"

      const phone = marketOrder.buyer?.phone || ""
      const address = marketOrder.delivery?.address
        ? `${marketOrder.delivery.address.city || ""}, ${marketOrder.delivery.address.street || ""} ${marketOrder.delivery.address.house || ""}`.trim()
        : "Доставка Яндекс.Маркет"

      // Вставляем заказ
      const { data: newOrder } = await supabase
        .from("orders")
        .insert({
          user_id: `yandex-market-${orderId}`,
          status: "new",
          payment_id: `ym-${orderId}`,
          subtotal: Number(marketOrder.itemsTotal || total),
          delivery: Number(marketOrder.delivery?.price || 0),
          total,
          recipient_name: recipientName || "Яндекс.Маркет",
          phone: phone || "Маркет",
          address: address || "Доставка Маркета",
        })
        .select("id")
        .maybeSingle()

      if (newOrder?.id && items.length > 0) {
        const orderItemsPayload = items.map((item: any) => ({
          order_id: newOrder.id,
          product_slug: String(item.offerId || item.id),
          name: item.offerName || "Товар с Яндекс.Маркета",
          category: "market",
          price: Number(item.price || 0),
          quantity: Number(item.count || 1),
        }))
        await supabase.from("order_items").insert(orderItemsPayload)
      }
    } catch (saveErr) {
      console.warn("[YandexMarket order save note]:", saveErr)
    }

    await logMarketSync(
      "order_accepted",
      "success",
      items.length,
      `Принят заказ #${orderId} на сумму ${total} ₽ из Яндекс.Маркета`,
      marketOrder
    )

    return NextResponse.json({
      order: {
        accepted: true,
        id: String(orderId),
      },
    })
  } catch (err: any) {
    console.error("[YandexMarket order accept error]:", err)
    return NextResponse.json(
      {
        order: {
          accepted: false,
          reason: "OUT_OF_DATE",
        },
      },
      { status: 200 }
    )
  }
}
