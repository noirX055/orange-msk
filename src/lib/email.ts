import nodemailer, { type Transporter } from "nodemailer"

// SMTP Транспорт (Selectel Cloud Mail)
const smtpHost = process.env.SMTP_HOST || "smtp.mail.selcloud.ru"
const smtpPort = parseInt(process.env.SMTP_PORT || "1127", 10)
const smtpUser = process.env.SMTP_USER || "12710"
const smtpPass = process.env.SMTP_PASS || "lHUVetGm7ji1KEkp4S"
const defaultFrom =
  process.env.EMAIL_FROM || "Orange MSK <noreply@orangemsk.ru>"

// Порт 1127 в Selectel Mail работает через прямой SSL/TLS (secure: true)
const isSecure = smtpPort === 1127 || smtpPort === 465

let cachedTransporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  }
  return cachedTransporter
}

export type SendEmailOptions = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export type SendEmailResult = {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Базовая отправка email через SMTP
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = defaultFrom,
  replyTo,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    const transporter = getTransporter()
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      replyTo,
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error: any) {
    console.error("[Email Service] Ошибка отправки письма:", error)
    return {
      success: false,
      error: error?.message || "Неизвестная ошибка отправки email",
    }
  }
}

/**
 * Фирменный HTML-шаблон Orange MSK
 */
export function renderEmailTemplate({
  preheader,
  title,
  contentHtml,
  ctaText,
  ctaUrl,
  footerNote,
}: {
  preheader?: string
  title: string
  contentHtml: string
  ctaText?: string
  ctaUrl?: string
  footerNote?: string
}): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  ${
    preheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${preheader}</div>`
      : ""
  }

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f8; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header with Brand Logo -->
          <tr>
            <td style="background-color: #0b132b; padding: 28px 36px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <a href="${siteUrl}" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center;">
                      <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Orange</span>
                      <span style="display: inline-block; background-color: #ff6b00; color: #ffffff; font-size: 13px; font-weight: 800; padding: 3px 8px; border-radius: 6px; margin-left: 8px; letter-spacing: 0.5px;">MSK</span>
                    </a>
                  </td>
                  <td align="right" style="color: #94a3b8; font-size: 13px;">
                    Оригинальная техника Apple
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title & Content -->
          <tr>
            <td style="padding: 36px 36px 24px 36px;">
              <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.35;">
                ${title}
              </h1>
              
              <div style="font-size: 15px; line-height: 1.6; color: #334155;">
                ${contentHtml}
              </div>

              ${
                ctaText && ctaUrl
                  ? `
              <div style="margin-top: 32px; margin-bottom: 12px; text-align: center;">
                <a href="${ctaUrl}" target="_blank" style="display: inline-block; background-color: #ff6b00; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(255, 107, 0, 0.25);">
                  ${ctaText}
                </a>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 36px;">
              <div style="height: 1px; background-color: #e2e8f0; width: 100%;"></div>
            </td>
          </tr>

          <!-- Footer Information -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #f8fafc; font-size: 13px; color: #64748b; line-height: 1.5;">
              ${
                footerNote
                  ? `<p style="margin: 0 0 12px 0;">${footerNote}</p>`
                  : ""
              }
              <p style="margin: 0 0 8px 0;">
                Интернет-магазин <strong>Orange MSK</strong> — оригинальная электроника Apple, Dyson и премиальные аксессуары с гарантией.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                Сайт: <a href="${siteUrl}" target="_blank" style="color: #ff6b00; text-decoration: none;">${siteUrl.replace(/^https?:\/\//, "")}</a> • Поддержка клиентов
              </p>
            </td>
          </tr>

        </table>

        <!-- Micro Footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} Orange MSK. Все права защищены.<br>
              Это сервисное сообщение отправлено автоматически.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/* =========================================================================
   1. КОДЫ ВЕРИФИКАЦИИ И ПОДТВЕРЖДЕНИЕ EMAIL
   ========================================================================= */

export async function sendVerificationCodeEmail({
  email,
  code,
  userName,
  actionType = "регистрации",
}: {
  email: string
  code: string
  userName?: string
  actionType?: string
}): Promise<SendEmailResult> {
  const greeting = userName ? `Здравствуйте, ${userName}!` : "Здравствуйте!"
  const title = `Код подтверждения для ${actionType}`

  const contentHtml = `
    <p style="margin-top: 0;">${greeting}</p>
    <p>Для подтверждения вашего адреса электронной почты при ${actionType} в магазине Orange MSK используйте следующий код:</p>
    
    <div style="margin: 28px 0; text-align: center;">
      <div style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 36px; border-radius: 12px; font-family: monospace;">
        ${code}
      </div>
    </div>

    <p style="color: #64748b; font-size: 14px;">Код действителен в течение <strong>15 минут</strong>. Никому не сообщайте данный код во избежание доступа к вашему аккаунту.</p>
    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0;">Если вы не регистрировались на сайте Orange MSK, просто проигнорируйте это письмо.</p>
  `

  const html = renderEmailTemplate({
    preheader: `Ваш проверочный код: ${code}`,
    title,
    contentHtml,
  })

  return sendEmail({
    to: email,
    subject: `${code} — ваш проверочный код Orange MSK`,
    html,
  })
}

/* =========================================================================
   2. ВОССТАНОВЛЕНИЕ ПАРОЛЯ
   ========================================================================= */

export async function sendPasswordResetEmail({
  email,
  resetUrl,
  code,
  userName,
}: {
  email: string
  resetUrl: string
  code?: string
  userName?: string
}): Promise<SendEmailResult> {
  const greeting = userName ? `Здравствуйте, ${userName}!` : "Здравствуйте!"
  const title = "Восстановление пароля"

  const contentHtml = `
    <p style="margin-top: 0;">${greeting}</p>
    <p>Мы получили запрос на сброс пароля для вашей учетной записи <strong>${email}</strong> в магазине Orange MSK.</p>
    
    <p>Чтобы установить новый пароль, нажмите на кнопку ниже:</p>

    ${
      code
        ? `
      <div style="margin: 20px 0; text-align: center;">
        <span style="font-size: 13px; color: #64748b; display: block; margin-bottom: 6px;">Или введите проверочный код:</span>
        <span style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-size: 24px; font-weight: 700; letter-spacing: 4px; padding: 10px 24px; border-radius: 8px; font-family: monospace;">
          ${code}
        </span>
      </div>
      `
        : ""
    }

    <p style="color: #64748b; font-size: 14px; margin-top: 24px;">Ссылка на сброс пароля действительна в течение <strong>1 часа</strong>.</p>
    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 0;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо — ваш текущий пароль останется прежним.</p>
  `

  const html = renderEmailTemplate({
    preheader: "Запрос на восстановление пароля в Orange MSK",
    title,
    contentHtml,
    ctaText: "Установить новый пароль",
    ctaUrl: resetUrl,
  })

  return sendEmail({
    to: email,
    subject: "Восстановление пароля в Orange MSK",
    html,
  })
}

/* =========================================================================
   3. ЭЛЕКТРОННЫЙ ЧЕК / ПОДТВЕРЖДЕНИЕ ЗАКАЗА
   ========================================================================= */

export type OrderReceiptItem = {
  name: string
  category?: string
  color?: string
  price: number
  quantity: number
}

export type OrderReceiptData = {
  orderId: number | string
  date?: string
  customerEmail: string
  customerName?: string
  phone?: string
  address?: string
  items: OrderReceiptItem[]
  subtotal: number
  delivery: number
  total: number
  paymentMethod?: string
  status?: string
}

function formatRub(num: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(num)
}

export async function sendOrderReceiptEmail(
  order: OrderReceiptData
): Promise<SendEmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"
  const orderUrl = `${siteUrl}/account/orders`
  const orderDate = order.date || new Date().toLocaleDateString("ru-RU")

  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${item.name}</div>
        ${
          item.color
            ? `<div style="font-size: 12px; color: #64748b;">Цвет: ${item.color}</div>`
            : ""
        }
      </td>
      <td align="center" style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #64748b;">
        ${item.quantity} шт.
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a; font-size: 14px; white-space: nowrap;">
        ${formatRub(item.price * item.quantity)}
      </td>
    </tr>`
    )
    .join("")

  const contentHtml = `
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
      <span style="color: #065f46; font-size: 14px; font-weight: 600;">
        ✔ Оплата успешно получена. Заказ передан в комплектацию!
      </span>
    </div>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; font-size: 14px;">
      <tr>
        <td style="color: #64748b;">Номер заказа:</td>
        <td align="right" style="font-weight: 700; color: #0f172a;">#${order.orderId}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding-top: 6px;">Дата заказа:</td>
        <td align="right" style="color: #0f172a; padding-top: 6px;">${orderDate}</td>
      </tr>
      ${
        order.customerName
          ? `
      <tr>
        <td style="color: #64748b; padding-top: 6px;">Получатель:</td>
        <td align="right" style="color: #0f172a; padding-top: 6px;">${order.customerName}</td>
      </tr>`
          : ""
      }
      ${
        order.phone
          ? `
      <tr>
        <td style="color: #64748b; padding-top: 6px;">Телефон:</td>
        <td align="right" style="color: #0f172a; padding-top: 6px;">${order.phone}</td>
      </tr>`
          : ""
      }
      ${
        order.address
          ? `
      <tr>
        <td style="color: #64748b; padding-top: 6px; vertical-align: top;">Адрес доставки:</td>
        <td align="right" style="color: #0f172a; padding-top: 6px;">${order.address}</td>
      </tr>`
          : ""
      }
    </table>

    <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 24px 0 12px 0;">
      Состав заказа:
    </h3>

    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <thead>
        <tr style="border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-transform: uppercase;">
          <th align="left" style="padding-bottom: 8px;">Товар</th>
          <th align="center" style="padding-bottom: 8px;">Кол-во</th>
          <th align="right" style="padding-bottom: 8px;">Сумма</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Total Calculations -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; font-size: 14px;">
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Сумма товаров:</td>
        <td align="right" style="color: #0f172a; padding: 4px 0;">${formatRub(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="color: #64748b; padding: 4px 0;">Доставка:</td>
        <td align="right" style="color: #0f172a; padding: 4px 0;">
          ${order.delivery === 0 ? "Бесплатно" : formatRub(order.delivery)}
        </td>
      </tr>
      <tr>
        <td style="font-size: 18px; font-weight: 800; color: #0f172a; padding-top: 12px; border-top: 2px solid #0f172a;">Итого к оплате:</td>
        <td align="right" style="font-size: 20px; font-weight: 800; color: #ff6b00; padding-top: 12px; border-top: 2px solid #0f172a;">
          ${formatRub(order.total)}
        </td>
      </tr>
    </table>
  `

  const html = renderEmailTemplate({
    preheader: `Чек по заказу #${order.orderId} на сумму ${formatRub(order.total)}`,
    title: `Электронный чек к заказу #${order.orderId}`,
    contentHtml,
    ctaText: "Отследить заказ в личном кабинете",
    ctaUrl: orderUrl,
    footerNote:
      "Данное письмо является подтверждением оформления и оплаты заказа. Если у вас возникли вопросы по доставке, ответьте на это письмо или свяжитесь с нашим менеджером.",
  })

  return sendEmail({
    to: order.customerEmail,
    subject: `Электронный чек к заказу #${order.orderId} — Orange MSK`,
    html,
  })
}

/* =========================================================================
   4. РАССЫЛКИ (NEWSLETTER / PROMO)
   ========================================================================= */

export type NewsletterOptions = {
  subject: string
  title: string
  previewText?: string
  contentHtml: string
  ctaText?: string
  ctaUrl?: string
}

export async function sendNewsletterEmail({
  to,
  subject,
  title,
  previewText,
  contentHtml,
  ctaText,
  ctaUrl,
}: NewsletterOptions & { to: string }): Promise<SendEmailResult> {
  const html = renderEmailTemplate({
    preheader: previewText,
    title,
    contentHtml,
    ctaText,
    ctaUrl,
    footerNote:
      "Вы получили это письмо, так как подписаны на новости и персональные предложения интернет-магазина Orange MSK.",
  })

  return sendEmail({
    to,
    subject,
    html,
  })
}

/**
 * Пакетная отправка рассылки списку адресатов с троттлингом (защита от перегрузки SMTP)
 */
export async function sendNewsletterBatch({
  recipients,
  newsletter,
  batchSize = 10,
  delayMs = 1000,
}: {
  recipients: string[]
  newsletter: NewsletterOptions
  batchSize?: number
  delayMs?: number
}): Promise<{ total: number; sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  for (let i = 0; i < recipients.length; i += batchSize) {
    const chunk = recipients.slice(i, i + batchSize)

    await Promise.all(
      chunk.map(async (email) => {
        const res = await sendNewsletterEmail({
          to: email,
          ...newsletter,
        })
        if (res.success) sent++
        else failed++
      })
    )

    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return { total: recipients.length, sent, failed }
}
