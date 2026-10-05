import { getAdminClient } from "@/lib/supabase/admin"
import { sendOrderReceiptEmail } from "@/lib/email"

// Заглушка, которая подставляется в чек ЮКассы, если у пользователя нет email.
// На неё письмо клиенту отправлять нельзя.
const PLACEHOLDER_EMAILS = new Set(["receipt@orangemsk.ru"])

/**
 * Помечает заказ оплаченным (pending_payment → processing) и отправляет клиенту письмо.
 *
 * Обновление атомарное (`WHERE status = 'pending_payment'`), поэтому письмо уходит
 * ровно один раз — кто бы первым ни узнал об оплате: вебхук ЮКассы или
 * страница /checkout/success (через /api/checkout/status).
 *
 * Раньше статус менялся в двух местах, и если клиент возвращался на сайт раньше,
 * чем приходил вебхук, вебхук видел статус "processing" и письмо не отправлял.
 */
export async function markOrderPaid(
  orderId: number | string,
  opts: { customerEmailHint?: string } = {}
): Promise<{ updated: boolean }> {
  const supabaseAdmin = getAdminClient()

  const { data: updatedRows, error } = await supabaseAdmin
    .from("orders")
    .update({ status: "processing" })
    .eq("id", orderId)
    .eq("status", "pending_payment")
    .select("id")

  if (error) {
    console.error(`[Orders] Не удалось отметить заказ ${orderId} оплаченным:`, error)
    return { updated: false }
  }

  if (!updatedRows || updatedRows.length === 0) {
    // Заказ уже обработан ранее — письмо было отправлено тогда
    return { updated: false }
  }

  console.log(`[Orders] Заказ ${orderId} → processing (оплачен)`)

  try {
    await sendReceipt(orderId, opts.customerEmailHint)
  } catch (err) {
    console.error(`[Orders] Ошибка при отправке чека по заказу ${orderId}:`, err)
  }

  return { updated: true }
}

async function sendReceipt(orderId: number | string, emailHint?: string) {
  const supabaseAdmin = getAdminClient()

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
    .eq("id", orderId)
    .single()

  if (!orderDetails) {
    console.warn(`[Orders] Заказ ${orderId} не найден для отправки чека`)
    return
  }

  let customerEmail =
    emailHint && !PLACEHOLDER_EMAILS.has(emailHint.toLowerCase()) ? emailHint : undefined
  let customerName: string | undefined = orderDetails.recipient_name || undefined

  if (orderDetails.user_id) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(orderDetails.user_id)
    if (!customerEmail) customerEmail = userData?.user?.email || undefined
    if (!customerName) customerName = userData?.user?.user_metadata?.full_name
  }

  if (!customerEmail) {
    console.warn(`[Orders] Не удалось определить email для заказа #${orderId}`)
    return
  }

  const res = await sendOrderReceiptEmail({
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
    `[Orders] Отправка чека на ${customerEmail}:`,
    res.success ? "УСПЕХ" : res.error
  )
}
