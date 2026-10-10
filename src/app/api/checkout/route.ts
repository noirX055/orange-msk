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
    const {
      items,
      subtotal,
      delivery,
      delivery_method,
      total,
      recipient_name,
      phone,
      email,
      social,
      address,
      payment_type,
    } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 })
    }

    if (!total || total <= 0) {
      return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 })
    }

    if (!recipient_name?.trim()) {
      return NextResponse.json({ error: "Укажите имя и фамилию" }, { status: 400 })
    }

    if (!phone?.trim()) {
      return NextResponse.json({ error: "Укажите номер телефона" }, { status: 400 })
    }

    const customerEmail = email?.trim() || user.email || ""
    if (!customerEmail) {
      return NextResponse.json({ error: "Укажите email" }, { status: 400 })
    }

    const isCashInStore = payment_type === "cash_in_store"
    const isCardTerminalInStore = payment_type === "card_terminal_in_store"
    const isOfflinePayment = isCashInStore || isCardTerminalInStore || payment_type === "in_store"

    // Описание способа оплаты для комментария к заказу
    const paymentLabel = isCashInStore
      ? "Оплата наличными на кассе в магазине"
      : isCardTerminalInStore
      ? "Оплата банковской картой через POS-терминал на кассе"
      : isOfflinePayment
      ? "Оплата на кассе в магазине"
      : "Онлайн через ЮKassa"

    const commentParts: string[] = [
      `Способ оплаты: ${paymentLabel}`,
      `Email: ${customerEmail}`,
    ]
    if (social?.trim()) {
      commentParts.push(`Соцсеть / Мессенджер: ${social.trim()}`)
    }

    // 1. Создаём заказ в Supabase (со статусом new для кассы или pending_payment для онлайн-оплаты)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: isOfflinePayment ? "new" : "pending_payment",
        subtotal,
        delivery,
        total,
        recipient_name: recipient_name.trim(),
        phone: phone.trim(),
        address: address ?? null,
        comment: commentParts.join(" | "),
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
        { error: `Не удалось добавить товары: ${itemsError.message}` },
        { status: 500 }
      )
    }

    // Для оплаты наличными / картой на кассе не создаём платёж в ЮКассе
    if (isOfflinePayment) {
      return NextResponse.json({
        orderId: order.id,
        total,
        delivery: delivery ?? 0,
        isOfflinePayment: true,
      })
    }

    // 3. Создаём платёж в ЮКасса
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
    const itemNames = items
      .map((i: { name: string }) => i.name)
      .slice(0, 3)
      .join(", ")
    const description = `Заказ Orange MSK: ${itemNames}${items.length > 3 ? "..." : ""}`

    const deliveryDescription =
      delivery_method === "mo"
        ? "Доставка по Московской области"
        : delivery_method === "moscow"
        ? "Доставка по Москве"
        : "Доставка"

    const { paymentId, confirmationToken } = await createPayment({
      amount: total,
      orderId: order.id,
      description: description.slice(0, 128), // ЮКасса ограничивает 128 символов
      returnUrl: `${siteUrl}/checkout/success?orderId=${order.id}`,
      items: items.map((item: { name: string; price: number; quantity: number }) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      delivery: delivery ?? 0,
      deliveryDescription,
      customerEmail,
    })

    // 4. Сохраняем payment_id в заказе
    await supabase
      .from("orders")
      .update({ payment_id: paymentId })
      .eq("id", order.id)

    return NextResponse.json({
      confirmationToken,
      orderId: order.id,
      total,
      delivery: delivery ?? 0,
    })
  } catch (error) {
    console.error("[Checkout] Непредвиденная ошибка:", error)
    return NextResponse.json(
      { error: `Ошибка сервера при создании платежа: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
