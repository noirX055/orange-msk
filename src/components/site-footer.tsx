import Link from "next/link"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { categories } from "@/lib/products"
import { Logo } from "@/components/logo"

const info = [
  { label: "О компании", href: "/catalog" },
  { label: "Доставка и оплата", href: "/catalog" },
  { label: "Гарантия и возврат", href: "/catalog" },
  { label: "Trade-in", href: "/catalog" },
  { label: "Контакты", href: "/catalog" },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo variant="light" />
          <p className="text-sm leading-relaxed text-navy-foreground/70">
            Магазин электроники в Москве. Официальная гарантия, проверка при получении и доставка
            в день заказа.
          </p>
        </div>

        <nav aria-label="Каталог">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Каталог</h2>
          <ul className="flex flex-col gap-2.5 text-sm">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/catalog?category=${category.slug}`}
                  className="text-navy-foreground/75 transition-colors hover:text-primary"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Покупателям">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Покупателям
          </h2>
          <ul className="flex flex-col gap-2.5 text-sm">
            {info.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-navy-foreground/75 transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Контакты</h2>
          <ul className="flex flex-col gap-3 text-sm text-navy-foreground/75">
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="text-primary" />
              <a href="tel:+74951234567" className="hover:text-primary">
                +7 (495) 123-45-67
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="text-primary" />
              <a href="mailto:hello@orangemsk.ru" className="hover:text-primary">
                hello@orangemsk.ru
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 text-primary" />
              Москва, ул. Тверская, 12
            </li>
            <li className="flex items-center gap-2.5">
              <Clock size={16} className="text-primary" />
              Ежедневно 10:00 — 22:00
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-navy-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Orange MSK. Все права защищены.</p>
          <p>Информация на сайте не является публичной офертой.</p>
        </div>
      </div>
    </footer>
  )
}
