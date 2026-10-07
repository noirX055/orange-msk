import type { Metadata } from "next"
import Link from "next/link"
import { FavoritesView } from "@/components/favorites-view"

export const metadata: Metadata = {
  title: "Избранное — Orange MSK",
  description: "Избранные товары в интернет-магазине электроники Orange MSK.",
}

export default function FavoritesPage() {
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
          <li className="text-foreground">Избранное</li>
        </ol>
      </nav>
      <FavoritesView />
    </div>
  )
}
