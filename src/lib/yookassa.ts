// Серверный модуль для работы с YooKassa REST API.
// Используется только на сервере (API Routes / Server Actions).

const YOOKASSA_API = "https://api.yookassa.ru/v3"

function getAuthHeader(): string {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY
  if (!shopId || !secretKey) {
    throw new Error("YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY должны быть заданы в .env.local")
  }
  return "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64")
}

export type YooKassaPayment = {
  id: string
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled"
  amount: { value: string; currency: string }
  confirmation?: {
    type: string
    confirmation_token?: string
    confirmation_url?: string
  }
  paid: boolean
  description?: string
  metadata?: Record<string, string>
}

export type ReceiptItem = {
  name: string
  price: number
  quantity: number
}

export type YooKassaRefund = {
  id: string
  status: "pending" | "succeeded" | "canceled"
  amount: { value: string; currency: string }
  payment_id: string
  created_at: string
  receipt_registration?: "pending" | "succeeded" | "canceled"
  metadata?: Record<string, string>
}

function yookassaHeaders(idempotenceKey?: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: getAuthHeader(),
    ...(idempotenceKey ? { "Idempotence-Key": idempotenceKey } : {}),
  }
}

async function parseYooKassaError(res: Response, context: string): Promise<never> {
  const body = await res.text()
  console.error(`[YooKassa] ${context}:`, res.status, body)
  let message = `YooKassa API error: ${res.status}`
  try {
    const parsed = JSON.parse(body) as { description?: string }
    if (parsed.description) message = parsed.description
  } catch {
    // оставляем сообщение по умолчанию
  }
  throw new Error(message)
}

/**
 * Создаёт платёж в ЮКасса (embedded-виджет).
 * Возвращает confirmation_token для инициализации виджета на клиенте.
 */
export async function createPayment(input: {
  amount: number
  orderId: string
  description: string
  returnUrl: string
  items: ReceiptItem[]
  delivery?: number
  customerEmail?: string
}): Promise<{ paymentId: string; confirmationToken: string }> {
  const receiptItems = input.items.map((item) => ({
    description: item.name.slice(0, 128),
    quantity: String(item.quantity),
    amount: {
      value: item.price.toFixed(2),
      currency: "RUB",
    },
    vat_code: 1, // НДС не облагается
    payment_subject: "commodity" as const,
    payment_mode: "full_payment" as const,
  }))

  if (input.delivery && input.delivery > 0) {
    receiptItems.push({
      description: "Доставка по Москве",
      quantity: "1",
      amount: {
        value: input.delivery.toFixed(2),
        currency: "RUB",
      },
      vat_code: 1,
      payment_subject: "service",
      payment_mode: "full_payment",
    })
  }

  // Формируем чек по 54-ФЗ
  const receipt = {
    tax_system_code: 2, // УСН доходы (измените если у вас другая система)
    customer: {
      email: input.customerEmail || "receipt@orangemsk.ru",
    },
    items: receiptItems,
  }

  const requestBody = {
    amount: {
      value: input.amount.toFixed(2),
      currency: "RUB",
    },
    confirmation: {
      type: "embedded",
    },
    capture: true,
    description: input.description,
    receipt,
    metadata: {
      order_id: input.orderId,
    },
  }

  console.log("[YooKassa] Тело запроса:", JSON.stringify(requestBody, null, 2))

  const res = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: yookassaHeaders(crypto.randomUUID()),
    body: JSON.stringify(requestBody),
  })

  if (!res.ok) await parseYooKassaError(res, "Ошибка создания платежа")

  const payment = (await res.json()) as YooKassaPayment

  if (!payment.confirmation?.confirmation_token) {
    throw new Error("YooKassa не вернул confirmation_token")
  }

  return {
    paymentId: payment.id,
    confirmationToken: payment.confirmation.confirmation_token,
  }
}

/**
 * Получает текущий статус платежа.
 */
export async function getPayment(paymentId: string): Promise<YooKassaPayment> {
  const res = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
    },
  })

  if (!res.ok) await parseYooKassaError(res, "Ошибка получения платежа")

  return (await res.json()) as YooKassaPayment
}

/**
 * Создаёт полный возврат по успешному платежу.
 * Для «Чеков от ЮKassa» при полном возврате объект receipt не нужен —
 * YooKassa сформирует чек возврата на основе данных платежа.
 * @see https://yookassa.ru/developers/payment-acceptance/receipts/54fz/yoomoney/refunds
 */
export async function createRefund(input: {
  paymentId: string
  amount: number
  orderId?: string
}): Promise<YooKassaRefund> {
  const requestBody: Record<string, unknown> = {
    payment_id: input.paymentId,
    amount: {
      value: input.amount.toFixed(2),
      currency: "RUB",
    },
  }

  if (input.orderId) {
    requestBody.metadata = { order_id: input.orderId }
  }

  console.log("[YooKassa] Создание возврата:", JSON.stringify(requestBody, null, 2))

  const res = await fetch(`${YOOKASSA_API}/refunds`, {
    method: "POST",
    headers: yookassaHeaders(crypto.randomUUID()),
    body: JSON.stringify(requestBody),
  })

  if (!res.ok) await parseYooKassaError(res, "Ошибка создания возврата")

  return (await res.json()) as YooKassaRefund
}

/**
 * Получает информацию о возврате.
 */
export async function getRefund(refundId: string): Promise<YooKassaRefund> {
  const res = await fetch(`${YOOKASSA_API}/refunds/${refundId}`, {
    method: "GET",
    headers: yookassaHeaders(),
  })

  if (!res.ok) await parseYooKassaError(res, "Ошибка получения возврата")

  return (await res.json()) as YooKassaRefund
}
