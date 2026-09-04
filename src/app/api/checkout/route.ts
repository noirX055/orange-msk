import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createPayment } from "@/lib/yookassa"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Необходимо войти в аккаунт" }, { status: 401 })
    }

    const body = await request.json()
    const { items, subtotal, delivery, total, recipient_name, phone, address } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 })
    }

    if (!total || total <= 0) {
      return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 })
    }

    // 1. Создаём заказ в Supabase со статусом pending_payment
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending_payment",
        subtotal,
        delivery,
        total,
        recipient_name: recipient_name ?? null,
        phone: phone ?? null,
        address: address ?? null,
      })
      .select("id")
      .single()

    if (orderError || !order) {
      console.error("[Checkout] Ошибка создания заказа:", orderError)
      return NextResponse.json(
        { error: "Не удалось создать заказ" },
        { status: 500 }
      )
    }

    // 2. Добавляем позиции заказа
    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item: { product_slug: string; name: string; category?: string; color?: string; price: number; quantity: number }) => ({
        order_id: order.id,
        product_slug: item.product_slug,
        name: item.name,
        category: item.category ?? null,
        color: item.color ?? null,
        price: item.price,
        quantity: item.quantity,
      }))
    )

    if (itemsError) {
      console.error("[Checkout] Ошибка добавления позиций:", itemsError)
      // Удаляем заказ если позиции не добавились
      await supabase.from("orders").delete().eq("id", order.id)
      return NextResponse.json(
        { error: "Не удалось добавить товары" },
        { status: 500 }
      )
    }

    // 3. Создаём платёж в ЮКасса
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
    const itemNames = items
      .map((i: { name: string }) => i.name)
      .slice(0, 3)
      .join(", ")
    const description = `Заказ Orange MSK: ${itemNames}${items.length > 3 ? "..." : ""}`

    const { paymentId, confirmationToken } = await createPayment({
      amount: total,
      orderId: order.id,
      description: description.slice(0, 128), // ЮКасса ограничивает 128 символов
      returnUrl: `${siteUrl}/checkout/success?orderId=${order.id}`,
    })

    // 4. Сохраняем payment_id в заказе
    await supabase
      .from("orders")
      .update({ payment_id: paymentId })
      .eq("id", order.id)

    return NextResponse.json({
      confirmationToken,
      orderId: order.id,
    })
  } catch (error) {
    console.error("[Checkout] Непредвиденная ошибка:", error)
    return NextResponse.json(
      { error: "Ошибка сервера при создании платежа" },
      { status: 500 }
    )
  }
}
