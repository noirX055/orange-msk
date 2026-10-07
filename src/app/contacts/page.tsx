import type { Metadata } from "next"
import Link from "next/link"
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Navigation,
  Car,
  Bus,
  ExternalLink,
} from "lucide-react"
import { BreadcrumbsJsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "Контакты — Orange MSK",
  description:
    "Контакты магазина техники Orange MSK. Адрес пункта самовывоза: М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М. Телефон: +7 (989) 205-83-77, Telegram, WhatsApp, график работы ежедневно с 10:00 до 19:00.",
  alternates: {
    canonical: "/contacts",
  },
  openGraph: {
    title: "Контакты — Orange MSK",
    description:
      "Адрес, телефон, график работы и схема проезда к магазину Orange MSK в Химках.",
    url: "/contacts",
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

const contactChannels = [
  {
    icon: Phone,
    title: "Телефон",
    value: "+7 (989) 205-83-77",
    href: "tel:+79892058377",
    description: "Ежедневно с 10:00 до 19:00",
    actionText: "Позвонить",
  },
  {
    icon: Send,
    title: "Telegram",
    value: "@orangemsk",
    href: "https://t.me/orangemsk",
    description: "Быстрые ответы и заказы",
    actionText: "Написать",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+7 (989) 205-83-77",
    href: "https://wa.me/79892058377",
    description: "Консультация специалистов",
    actionText: "Написать",
  },
  {
    icon: Mail,
    title: "Электронная почта",
    value: "orange-msk@mail.ru",
    href: "mailto:orange-msk@mail.ru",
    description: "Вопросы сотрудничества",
    actionText: "Написать письмо",
  },
]

export default function ContactsPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: "Orange MSK",
    url: siteUrl,
    telephone: "+7-989-205-83-77",
    email: "orange-msk@mail.ru",
    image: `${siteUrl}/logo-orange-msk.jpg`,
    priceRange: "₽₽₽",
    address: {
      "@type": "PostalAddress",
      streetAddress: "д. Чёрная Грязь, 7/1 М",
      addressLocality: "Химки",
      addressRegion: "Московская область",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "55.9863",
      longitude: "37.3117",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
    ],
  }

  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Главная", url: `${siteUrl}` },
          { name: "Контакты", url: `${siteUrl}/contacts` },
        ]}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
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
            <li className="text-foreground">Контакты</li>
          </ol>
        </nav>

        {/* Заголовок */}
        <div>
          <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Контакты
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Магазин оригинальной техники и электроники Orange MSK в Москве и Химках.
          </p>
        </div>

        {/* Каналы связи */}
        <section aria-labelledby="channels-heading">
          <h2 id="channels-heading" className="sr-only">
            Способы связи
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactChannels.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.title}
                  className="flex flex-col justify-between rounded-card border border-border bg-card p-6"
                >
                  <div>
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Icon size={18} className="text-primary" />
                      <h3 className="text-sm font-semibold">{c.title}</h3>
                    </div>
                    <p className="mt-3 text-base font-bold text-foreground">{c.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <div className="mt-5 border-t border-border pt-3">
                    <a
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-opacity hover:opacity-80"
                    >
                      {c.actionText}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Шоурум и интерактивная карта */}
        <section aria-labelledby="location-heading" className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-card border border-border bg-card p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <h2 id="location-heading" className="text-xl font-bold tracking-tight">
                  Пункт выдачи и шоурум
                </h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>Ежедневно: 10:00 – 19:00</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Phone size={18} className="mt-0.5 shrink-0 text-primary" />
                    <a href="tel:+79892058377" className="hover:text-primary">
                      +7 (989) 205-83-77
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                <p className="font-semibold text-foreground mb-1">Как добраться:</p>
                По Ленинградскому шоссе (М-10) в сторону области, 15 км от МКАД до д. Чёрная Грязь. У магазина предусмотрена бесплатная клиентская парковка.
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <a
                href="https://yandex.md/maps/1/moscow-and-moscow-oblast/house/derevnya_chyornaya_gryaz_7_1m/Z04YdQZhTEEEQFtvfXV2dH1lbQ==/"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                <Navigation size={15} />
                Маршрут на Яндекс.Картах
              </a>
            </div>
          </div>

          <div className="relative min-h-[380px] overflow-hidden rounded-card border border-border bg-muted lg:col-span-2">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=37.311746%2C55.986348&z=16&pt=37.311746%2C55.986348%2Cpm2orgm"
              width="100%"
              height="100%"
              className="absolute inset-0 h-full w-full border-0"
              title="Orange MSK на карте"
              loading="lazy"
            />
          </div>
        </section>

        {/* Реквизиты компании */}
        <section aria-labelledby="requisites-heading" className="rounded-card border border-border bg-muted/40 p-6 sm:p-8">
          <h2 id="requisites-heading" className="text-base font-bold text-foreground">
            Реквизиты и информация
          </h2>
          <div className="mt-4 grid gap-4 text-xs text-muted-foreground sm:grid-cols-2 md:grid-cols-3">
            <div>
              <span className="font-semibold text-foreground">Юридическое лицо:</span>
              <p className="mt-0.5">ИП Белокур Елена Руслановна</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">ОГРНИП / ИНН:</span>
              <p className="mt-0.5">325508100440023 / 504419271112</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Фактический адрес:</span>
              <p className="mt-0.5">МО, г.о. Химки, д. Чёрная Грязь, 7/1 М</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Почта:</span>
              <p className="mt-0.5">orange-msk@mail.ru</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Телефон:</span>
              <p className="mt-0.5">+7 (989) 205-83-77</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Оплата:</span>
              <p className="mt-0.5">Наличными, картой, по QR-коду (СБП), на р/с</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">Доставка:</span>
              <p className="mt-0.5">Курьер по Москве и МО, СДЭК по РФ, самовывоз</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
