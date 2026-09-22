"use client"

import { useEffect, useState } from "react"
import { ChevronRight, Instagram, Phone, Send } from "lucide-react"

const contacts = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/orangelenengradka?stkn=MWk0b3Q0bzZjaWNieg%3D%3D&utm_source=qr",
    Icon: Instagram,
    className: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
  },
  {
    label: "Telegram",
    href: "https://t.me/orangemsk",
    Icon: Send,
    className: "bg-[#229ED9]",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/79892058377",
    Icon: Phone,
    className: "bg-[#25D366]",
  },
  {
    label: "Позвонить: 8 989 205-83-77",
    href: "tel:+79892058377",
    Icon: Phone,
    className: "bg-primary text-primary-foreground",
  },
]

export function ContactPanel() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), 350)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <aside
      aria-label="Связаться с нами"
      className="fixed right-0 top-1/2 z-40 -translate-y-1/2"
    >
      <div
        className={`flex items-center rounded-l-2xl border border-r-0 border-border bg-background/95 py-2 shadow-xl backdrop-blur transition-[transform,opacity] duration-500 ease-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-[calc(100%-3.5rem)] opacity-80"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? "Свернуть контакты" : "Открыть контакты"}
          aria-expanded={isOpen}
          className="flex h-12 w-9 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className={`size-5 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`} />
        </button>

        <div className="flex flex-col gap-2 pr-2">
          {contacts.map(({ label, href, Icon, className }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              title={label}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className={`flex size-11 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
            >
              <Icon className="size-5" strokeWidth={2} />
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
