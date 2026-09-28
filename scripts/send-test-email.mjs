#!/usr/bin/env node
/**
 * Скрипт тестирования отправки писем через Selectel Cloud Mail SMTP
 * 
 * Использование:
 *   node scripts/send-test-email.mjs --to=youremail@example.com --type=code
 *   node scripts/send-test-email.mjs --to=youremail@example.com --type=receipt
 *   node scripts/send-test-email.mjs --to=youremail@example.com --type=reset
 *   node scripts/send-test-email.mjs --to=youremail@example.com --type=newsletter
 */

import fs from "node:fs"
import path from "node:path"
import {
  sendEmail,
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
  sendOrderReceiptEmail,
  sendNewsletterEmail,
} from "../src/lib/email.ts"

function loadEnv() {
  const envFiles = [".env.local", ".env"]
  for (const f of envFiles) {
    const full = path.resolve(process.cwd(), f)
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, "utf-8")
      for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const [k, ...v] = trimmed.split("=")
        const val = v.join("=").trim().replace(/^['"]|['"]$/g, "")
        if (k && !process.env[k.trim()]) process.env[k.trim()] = val
      }
    }
  }
}

loadEnv()

const args = process.argv.slice(2)
const toArg = args.find((a) => a.startsWith("--to="))?.split("=")[1]
const typeArg = args.find((a) => a.startsWith("--type="))?.split("=")[1] || "code"

if (!toArg) {
  console.log("Укажите адрес получателя: node scripts/send-test-email.mjs --to=your-email@mail.ru [--type=code|receipt|reset|newsletter]")
  process.exit(1)
}

console.log(`Отправка тестового письма [${typeArg}] на: ${toArg}...`)

let result

switch (typeArg) {
  case "code":
    result = await sendVerificationCodeEmail({
      email: toArg,
      code: "749201",
      userName: "Тестовый Клиент",
      actionType: "верификации аккаунта",
    })
    break

  case "receipt":
    result = await sendOrderReceiptEmail({
      orderId: 1042,
      date: new Date().toLocaleDateString("ru-RU"),
      customerEmail: toArg,
      customerName: "Тестовый Покупатель",
      phone: "+7 (999) 000-00-00",
      address: "г. Москва, ул. Тверская, д. 1, кв. 10",
      items: [
        {
          name: "iPhone 18 Pro 512GB (1SIM+eSim) Burgundy",
          color: "Burgundy",
          price: 139990,
          quantity: 1,
        },
        {
          name: "Чехол Apple Silicon Case для iPhone 18 Pro",
          color: "Тёмно-синий",
          price: 4990,
          quantity: 1,
        },
      ],
      subtotal: 144980,
      delivery: 0,
      total: 144980,
    })
    break

  case "reset":
    result = await sendPasswordResetEmail({
      email: toArg,
      resetUrl: "https://orangemsk.ru/reset-password",
      code: "839102",
      userName: "Тестовый Клиент",
    })
    break

  case "newsletter":
    result = await sendNewsletterEmail({
      to: toArg,
      subject: "Новинки недели и эксклюзивные скидки в Orange MSK",
      title: "Большое поступление флагманов Apple",
      previewText: "Специальные цены на линейку iPhone 18 Pro и аксессуары",
      contentHtml: `
        <p>Мы рады сообщить о поступлении новых конфигураций техники Apple и премиальных аксессуаров.</p>
        <p>Только на этой неделе — бесплатная экспресс-доставка по Москве при любом заказе от 50 000 ₽.</p>
        <ul style="padding-left: 20px; line-height: 1.8;">
          <li>Официальная гарантия 1 год</li>
          <li>100% оригинальная заводская продукция</li>
          <li>Проверка устройства перед оплатой</li>
        </ul>
      `,
      ctaText: "Перейти в каталог",
      ctaUrl: "https://orangemsk.ru/catalog",
    })
    break

  default:
    console.error("Неизвестный тип письма:", typeArg)
    process.exit(1)
}

if (result.success) {
  console.log("УСПЕХ! Письмо успешно отправлено. Message ID:", result.messageId)
} else {
  console.error("ОШИБКА отправки:", result.error)
}
