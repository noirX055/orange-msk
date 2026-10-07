import type { Metadata } from "next"
import Link from "next/link"
import { Phone, ShieldCheck, Check, ArrowRight } from "lucide-react"
import { BreadcrumbsJsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "Гарантия и возврат — Orange MSK",
  description:
    "Условия гарантийного обслуживания и возврата техники в магазине Orange MSK. Гарантия 1 год, проверка по серийному номеру перед покупкой, сервисное обслуживание.",
  alternates: {
    canonical: "/warranty",
  },
  openGraph: {
    title: "Гарантия и возврат — Orange MSK",
    description:
      "Официальная гарантия 1 год на всю электронику. Проверка подлинности перед покупкой.",
    url: "/warranty",
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

const warrantyPoints = [
  {
    title: "Гарантия 1 год",
    text: "На всю новую технику, приобретённую в магазине Orange MSK, действует гарантия 12 месяцев со дня покупки.",
  },
  {
    title: "Проверка подлинности",
    text: "Вы можете проверить статус активации и серийный номер на официальном сайте производителя прямо перед оплатой.",
  },
  {
    title: "Обмен и возврат",
    text: "В случае выявления заводского брака мы оперативно производим замену на новое устройство или возвращаем средства.",
  },
  {
    title: "Документы к заказу",
    text: "С каждым заказом покупатель получает чек и гарантийный талон с указанием модели и серийного номера.",
  },
]

const steps = [
  {
    step: "1",
    title: "Свяжитесь с нами",
    text: "Позвоните по телефону +7 (989) 205-83-77 или напишите в Telegram @orangemsk, назвав номер заказа или серийный номер устройства.",
  },
  {
    step: "2",
    title: "Передайте устройство на диагностику",
    text: "Передайте технику через курьера или принесите в наш пункт выдачи: М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М.",
  },
  {
    step: "3",
    title: "Экспертиза и решение",
    text: "Сервисный центр проверяет устройство. При подтверждении заводского дефекта мы устраняем неисправность, заменяем устройство или возвращаем средства.",
  },
]

export default function WarrantyPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Главная", url: `${siteUrl}` },
          { name: "Гарантия и возврат", url: `${siteUrl}/warranty` },
        ]}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6 md:py-8">
        {/* Хлебные крошки */}
        <nav aria-label="Хлебные крошки" className="text-xs text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-primary">
                Главная
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">Гарантия и возврат</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div>
          <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Гарантия и сервис
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Мы продаём оригинальную технику в запечатанных заводских упаковках и несём ответственность
            за её надёжность и работоспособность.
          </p>
        </div>

        {/* Основные условия */}
        <section aria-labelledby="terms-title">
          <h2 id="terms-title" className="mb-6 text-2xl font-bold tracking-tight">
            Условия гарантийного обслуживания
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {warrantyPoints.map((point) => (
              <div
                key={point.title}
                className="flex flex-col rounded-card border border-border bg-card p-6"
              >
                <h3 className="text-base font-bold text-foreground">{point.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Проверка перед покупкой */}
        <div className="flex flex-col gap-6 rounded-card border border-border bg-muted/40 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck size={26} />
            </div>
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-foreground">Проверка подлинности до оплаты</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                При получении вы можете убедиться в целостности заводских пломб, проверить серийный номер
                на официальном сайте производителя (например, checkcoverage.apple.com), вскрыть коробку и
                включить гаджет.
              </p>
            </div>
          </div>
        </div>

        {/* Порядок действий при обращении */}
        <section aria-labelledby="steps-title">
          <h2 id="steps-title" className="mb-6 text-2xl font-bold tracking-tight">
            Порядок действий при гарантийном случае
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.step}
                className="flex flex-col rounded-card border border-border bg-card p-6"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
                  {s.step}
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Блок связи */}
        <div className="flex flex-col gap-4 rounded-card border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-foreground">Вопросы по гарантии?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Свяжитесь с нами — ответим на все вопросы по сервису и обслуживанию.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0">
            <a
              href="tel:+79892058377"
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
            >
              <Phone size={14} />
              +7 (989) 205-83-77
            </a>
            <Link
              href="/contacts"
              className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Контакты <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
