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

/**
 * Создаёт платёж в ЮКасса (embedded-виджет).
 * Возвращает confirmation_token для инициализации виджета на клиенте.
 */
export async function createPayment(input: {
  amount: number
  orderId: string
  description: string
  returnUrl: string
}): Promise<{ paymentId: string; confirmationToken: string }> {
  const res = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
      "Idempotence-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: input.amount.toFixed(2),
        currency: "RUB",
      },
      confirmation: {
        type: "embedded",
      },
      capture: true,
      description: input.description,
      metadata: {
        order_id: input.orderId,
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error("[YooKassa] Ошибка создания платежа:", res.status, body)
    throw new Error(`YooKassa API error: ${res.status}`)
  }

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

  if (!res.ok) {
    const body = await res.text()
    console.error("[YooKassa] Ошибка получения платежа:", res.status, body)
    throw new Error(`YooKassa API error: ${res.status}`)
  }

  return (await res.json()) as YooKassaPayment
}
