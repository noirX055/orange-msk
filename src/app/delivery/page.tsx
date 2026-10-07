import type { Metadata } from "next"
import Link from "next/link"
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  Banknote,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  Check,
  PackageCheck,
  Store,
  Navigation,
} from "lucide-react"
import { BreadcrumbsJsonLd } from "@/components/json-ld"

export const metadata: Metadata = {
  title: "Доставка и оплата — Orange MSK",
  description:
    "Условия доставки и оплаты в интернет-магазине техники Orange MSK. Курьер по Москве 1 000 ₽, по МО 1 500 ₽, СДЭК по России, бесплатный самовывоз в Химках. Оплата наличными, картой, по QR-коду и на р/с.",
  alternates: {
    canonical: "/delivery",
  },
  openGraph: {
    title: "Доставка и оплата — Orange MSK",
    description:
      "Удобная покупка электроники с доставкой по Москве, МО и всей России. Оплата после проверки.",
    url: "/delivery",
  },
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

const deliveryTariffs = [
  {
    title: "Москва",
    price: "1 000 ₽",
    subtitle: "Курьером до двери",
    description: "Быстрая доставка курьерской службой по Москве. При оформлении заказа в первой половине дня привезём в этот же день.",
    badge: "В день заказа",
    points: [
      "Доставка в согласованный интервал",
      "Оплата курьеру после проверки",
      "Бережная транспортировка электроники",
    ],
  },
  {
    title: "Московская область",
    price: "1 500 ₽",
    subtitle: "Курьером по Подмосковью",
    description: "Доставка курьерской службой до двери по городам и населённым пунктам Московской области.",
    badge: "Москва и МО",
    points: [
      "В день заказа или на следующий день",
      "Согласование времени с водителем",
      "Оплата при получении",
    ],
  },
  {
    title: "По России",
    price: "СДЭК",
    subtitle: "В любой регион",
    description: "Отправка заказов проверенной транспортной компанией СДЭК до двери или в пункт выдачи в вашем городе.",
    badge: "Вся Россия",
    points: [
      "Отправка при 100% предоплате",
      "Полная страховка посылки",
      "Трек-номер для отслеживания",
    ],
  },
  {
    title: "Самовывоз",
    price: "Бесплатно",
    subtitle: "Из шоурума в Химках",
    description: "М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М. Возможность протестировать технику и получить консультацию.",
    badge: "Шоурум",
    points: [
      "Ежедневно с 10:00 до 19:00",
      "Бесплатная парковка для клиентов",
      "Проверка на месте перед оплатой",
    ],
  },
]

const paymentMethods = [
  {
    icon: Banknote,
    title: "Наличными",
    subtitle: "При получении",
    description: "Оплата наличными курьеру при получении или в кассе пункта выдачи после проверки товара.",
  },
  {
    icon: CreditCard,
    title: "Банковской картой",
    subtitle: "Терминал или онлайн",
    description: "Оплата банковской картой через мобильный терминал у курьера или онлайн при оформлении заказа.",
  },
  {
    icon: QrCode,
    title: "По QR-коду",
    subtitle: "Система быстрых платежей",
    description: "Мгновенная оплата по QR-коду через приложение любого банка без дополнительных комиссий.",
  },
  {
    icon: Building2,
    title: "На расчётный счёт",
    subtitle: "Для юрлиц и ИП",
    description: "Безналичный расчёт по счёту с предоставлением полного пакета закрывающих бухгалтерских документов.",
  },
]

export default function DeliveryAndPaymentPage() {
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: "Главная", url: `${siteUrl}` },
          { name: "Доставка и оплата", url: `${siteUrl}/delivery` },
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
            <li className="text-foreground">Доставка и оплата</li>
          </ol>
        </nav>

        {/* Заголовок страницы в фирменном стиле */}
        <div>
          <div className="mb-3 h-1 w-8 rounded-full bg-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Доставка и оплата
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Orange MSK — электроника и техника. Удобная покупка техники с доставкой по всей России.
          </p>
        </div>

        {/* Раздел: Доставка */}
        <section aria-labelledby="delivery-heading">
          <div className="mb-6 flex flex-col gap-1">
            <h2 id="delivery-heading" className="text-2xl font-bold tracking-tight">
              Способы доставки
            </h2>
            <p className="text-sm text-muted-foreground">
              Выберите подходящий способ получения вашего заказа
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {deliveryTariffs.map((t) => (
              <div
                key={t.title}
                className="flex flex-col justify-between rounded-card border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/60"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {t.badge}
                    </span>
                    <span className="text-xl font-bold text-primary">{t.price}</span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-foreground">{t.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.subtitle}</p>

                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                </div>

                <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  {t.points.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check size={14} className="mt-0.5 shrink-0 text-primary" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Раздел: Оплата */}
        <section aria-labelledby="payment-heading">
          <div className="mb-6 flex flex-col gap-1">
            <h2 id="payment-heading" className="text-2xl font-bold tracking-tight">
              Способы оплаты
            </h2>
            <p className="text-sm text-muted-foreground">
              Удобные и безопасные варианты расчёта
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {paymentMethods.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.title}
                  className="flex flex-col rounded-card border border-border bg-card p-6 transition-all hover:border-primary/60"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-foreground">{m.title}</h3>
                  <span className="text-xs font-medium text-primary">{m.subtitle}</span>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Блок: Проверка перед оплатой */}
        <div className="flex flex-col gap-6 rounded-card border border-border bg-muted/40 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ShieldCheck size={26} />
            </div>
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-foreground">Проверка перед оплатой</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                При курьерской доставке по Москве и МО, а также при самовывозе в шоуруме, вы можете
                вскрыть заводскую упаковку, проверить серийный номер на официальном сайте производителя
                и включить устройство до передачи денег.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Перейти к покупкам
            </Link>
          </div>
        </div>

        {/* Шоурум и интерактивная карта */}
        <section aria-labelledby="pickup-heading" className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-card border border-border bg-card p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <h2 id="pickup-heading" className="text-xl font-bold tracking-tight">
                  Пункт выдачи и шоурум
                </h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>М.О., г.о. Химки, д. Чёрная Грязь, 7/1 М</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock size={18} className="mt-0.5 shrink-0 text-primary" />
                    <span>Ежедневно с 10:00 до 19:00</span>
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
                Перед визитом рекомендуем забронировать интересующую модель в каталоге или по телефону,
                чтобы товар ожидал вас в шоуруме.
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <a
                href="https://yandex.ru/maps/-/CXqmFXmF"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                <Navigation size={15} />
                Маршрут на Яндекс.Картах
              </a>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-card border border-border bg-muted lg:col-span-2">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ol=biz&oid=69848803792&ll=37.311543%2C55.975169&z=16&pt=37.311543%2C55.975169%2Cpm2orgm"
              width="100%"
              height="100%"
              className="absolute inset-0 h-full w-full border-0"
              title="Шоурум Orange MSK на карте"
              loading="lazy"
            />
          </div>
        </section>
      </div>
    </>
  )
}
