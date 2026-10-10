import Link from "next/link"
import { ShieldCheck, Store, CreditCard, Banknote } from "lucide-react"

export function SbpLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 74 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="СБП"
    >
      {/* СБП веер из трех треугольников */}
      <path
        d="M12 2.5L3.5 12H15.2L18.8 7.8L12 2.5Z"
        fill="#F9A825"
      />
      <path
        d="M3.5 12L12 21.5L18.8 16.2L15.2 12H3.5Z"
        fill="#00A0E3"
      />
      <path
        d="M18.8 7.8L15.2 12L18.8 16.2L24.5 12L18.8 7.8Z"
        fill="#D4145A"
      />
      <text
        x="29"
        y="17"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        fontSize="14"
        fill="currentColor"
        letterSpacing="0.4"
      >
        СБП
      </text>
    </svg>
  )
}

export function MirLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="МИР"
    >
      {/* МИР надпись */}
      <path
        d="M3 17V5H7.2L11 11.8L14.8 5H19V17H15V9.4L11.8 14.8H10.2L7 9.4V17H3Z"
        fill="#0B72BA"
      />
      <path
        d="M23 17V5H27V17H23Z"
        fill="#0B72BA"
      />
      <path
        d="M31 17V5H38C41.2 5 43 6.8 43 9.4C43 12 41.2 13.8 38 13.8H35V17H31ZM35 10.6H37.8C38.6 10.6 39.2 10.1 39.2 9.4C39.2 8.7 38.6 8.2 37.8 8.2H35V10.6Z"
        fill="#0B72BA"
      />
      {/* Зеленый элемент (хвостик) МИР */}
      <path
        d="M38 9.5C40 9.5 41.8 10.2 43 11.5C44.2 9.4 46.8 8 50.2 8C55.6 8 60 12.2 60 17H55.5C55.5 14 53.2 11.4 50.2 11.4C47.8 11.4 45.8 13 44.8 15.2L43.5 13C42.2 11.2 40.5 10.2 38 9.5Z"
        fill="#00A551"
      />
    </svg>
  )
}

export function SberPayLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 86 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SberPay"
    >
      <circle cx="11" cy="11" r="9.5" fill="url(#sber-gradient)" />
      <path
        d="M6.8 11.2L9.8 14.2L15.6 8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="sber-gradient"
          x1="2"
          y1="2"
          x2="20"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
      </defs>
      <text
        x="25"
        y="15.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        fill="currentColor"
        letterSpacing="-0.2"
      >
        SberPay
      </text>
    </svg>
  )
}

export function TPayLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 68 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="T-Pay"
    >
      <rect x="1" y="2.5" width="17" height="17" rx="4" fill="#FFDD2D" />
      <path
        d="M5.5 6.5H13.5V8.8H10.7V15.5H8.3V8.8H5.5V6.5Z"
        fill="#000000"
      />
      <text
        x="23"
        y="15.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        fill="currentColor"
        letterSpacing="-0.2"
      >
        T-Pay
      </text>
    </svg>
  )
}

export function CardsLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 74 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Банковские карты"
    >
      {/* Круги Mastercard */}
      <circle cx="8" cy="11" r="6.5" fill="#EB001B" />
      <circle cx="15" cy="11" r="6.5" fill="#F79E1B" fillOpacity="0.88" />
      <text
        x="26"
        y="15.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="600"
        fontSize="12"
        fill="currentColor"
      >
        Карты
      </text>
    </svg>
  )
}

export function YooKassaLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ЮKassa"
    >
      <circle cx="7.5" cy="11" r="6" fill="#8033E5" />
      <circle cx="13.5" cy="11" r="6" fill="#00D2B8" fillOpacity="0.85" />
      <circle cx="10.5" cy="11" r="3.2" fill="white" />
      <text
        x="24"
        y="15.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="12.5"
        fill="currentColor"
        letterSpacing="-0.2"
      >
        ЮKassa
      </text>
    </svg>
  )
}

export function SberCreditLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 118 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Кредит от Сбера"
    >
      <circle cx="11" cy="11" r="9.5" fill="url(#sber-credit-gradient)" />
      <path
        d="M6.8 11.2L9.8 14.2L15.6 8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="sber-credit-gradient"
          x1="2"
          y1="2"
          x2="20"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22C55E" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
      </defs>
      <text
        x="24"
        y="15.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="11.5"
        fill="currentColor"
        letterSpacing="-0.2"
      >
        Кредит Сбер
      </text>
    </svg>
  )
}

export function CashTerminalLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 134 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Наличные или карта в магазине"
    >
      <rect x="1.5" y="2.5" width="17" height="17" rx="4" fill="#0284C7" />
      {/* Экран терминала */}
      <rect x="4.5" y="5.5" width="11" height="5" rx="1" fill="white" />
      {/* Кнопки */}
      <circle cx="6" cy="14" r="0.9" fill="white" />
      <circle cx="10" cy="14" r="0.9" fill="white" />
      <circle cx="14" cy="14" r="0.9" fill="white" />
      <circle cx="6" cy="16.8" r="0.9" fill="white" />
      <circle cx="10" cy="16.8" r="0.9" fill="white" />
      <circle cx="14" cy="16.8" r="0.9" fill="white" />
      <text
        x="24"
        y="15.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fontSize="11.5"
        fill="currentColor"
        letterSpacing="-0.2"
      >
        На кассе в магазине
      </text>
    </svg>
  )
}

const PAYMENT_METHODS = [
  {
    id: "sbp",
    name: "СБП",
    label: "Система быстрых платежей (QR-код или приложение любого банка)",
    Logo: SbpLogo,
  },
  {
    id: "mir",
    name: "МИР",
    label: "Карты национальной платежной системы МИР",
    Logo: MirLogo,
  },
  {
    id: "sberpay",
    name: "SberPay",
    label: "Быстрая оплата через Сбербанк Онлайн в один клик",
    Logo: SberPayLogo,
  },
  {
    id: "tpay",
    name: "T-Pay",
    label: "Мгновенная оплата для клиентов Т-Банка",
    Logo: TPayLogo,
  },
  {
    id: "sber_credit",
    name: "Кредит Сбер",
    label: "Покупка в кредит и рассрочку от СберБанка через ЮKassa",
    Logo: SberCreditLogo,
  },
  {
    id: "cards",
    name: "Карты",
    label: "Банковские карты Visa, Mastercard, МИР любого банка РФ",
    Logo: CardsLogo,
  },
  {
    id: "yookassa",
    name: "ЮKassa",
    label: "Безопасные онлайн-платежи через шлюз ЮKassa",
    Logo: YooKassaLogo,
  },
  {
    id: "in_store",
    name: "На кассе",
    label: "Оплата наличными или картой через терминал на кассе в магазине",
    Logo: CashTerminalLogo,
  },
]

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border/80 bg-muted/30 p-4 transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <ShieldCheck size={14} />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Способы оплаты
          </span>
        </div>
        <Link
          href="/delivery"
          className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Условия →
        </Link>
      </div>

      {/* Логотипы поддерживаемых методов */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {PAYMENT_METHODS.map((method) => {
          const Logo = method.Logo
          return (
            <div
              key={method.id}
              title={method.label}
              className="flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 shadow-xs transition-colors hover:border-primary/50"
            >
              <Logo className="h-3.5 w-auto max-w-full" />
            </div>
          )
        })}
      </div>

      {/* Оплата наличными или картой на кассе */}
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-border/80 bg-background/80 p-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Store size={15} />
        </div>
        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-foreground">
              Оплата на кассе в магазине
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              В шоуруме
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            При самовывозе вы можете оплатить покупку <strong>наличными</strong> или <strong>банковской картой через терминал</strong> прямо на кассе в шоуруме после личной проверки товара.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
        <span>✓ Выгода за наличные</span>
        <span className="font-medium text-foreground/90">✓ Кредит от Сбера</span>
        <span>✓ Чек и гарантия</span>
      </div>
    </div>
  )
}
