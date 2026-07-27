import Link from "next/link"
import { CartView } from "@/components/cart-view"

export const metadata = {
  title: "Корзина — Orange MSK",
  description: "Оформление заказа в магазине электроники Orange MSK.",
}

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Хлебные крошки" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Корзина</li>
        </ol>
      </nav>
      <CartView />
    </div>
  )
}
