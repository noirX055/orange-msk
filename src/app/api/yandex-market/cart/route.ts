import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

/**
 * Вебхук корзины Яндекс.Маркета (POST /cart)
 * Маркет запрашивает актуальное наличие и цены для корзины покупателя
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const cart = body.cart || {}
    const items = cart.items || []

    const offerIds = items.map((i: any) => String(i.offerId))
    const supabase = getAdminClient()

    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, slug, price, in_stock, is_visible")
      .in("id", offerIds)

    const productMap = new Map((dbProducts || []).map((p) => [String(p.id), p]))

    const responseItems = items.map((item: any) => {
      const prod = productMap.get(String(item.offerId))
      const count = prod && prod.in_stock && prod.is_visible ? item.count : 0
      const price = prod?.price ? Number(prod.price) : Number(item.price)

      return {
        id: item.id,
        feedId: item.feedId,
        offerId: item.offerId,
        price,
        count,
        delivery: true,
      }
    })

    return NextResponse.json({
      cart: {
        items: responseItems,
        deliveryCurrency: "RUR",
        deliveryOptions: [
          {
            id: "courier-msk",
            type: "DELIVERY",
            serviceName: "Курьерская доставка по Москве",
            price: 500,
            dates: {
              fromDate: new Date().toISOString().slice(0, 10),
            },
          },
        ],
      },
    })
  } catch (err: any) {
    console.error("[YandexMarket cart webhook error]:", err)
    return NextResponse.json(
      { error: err.message || "Ошибка обработки корзины" },
      { status: 500 }
    )
  }
}
