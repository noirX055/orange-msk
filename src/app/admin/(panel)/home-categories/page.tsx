import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllHomeCategoryCards } from "@/lib/home-categories/queries"
import { HomeCategoriesTable } from "@/components/admin/home-categories-table"

export const metadata = {
  title: "Карусель категорий на главной — Админ-панель",
}

export default async function AdminHomeCategoriesPage() {
  const cards = await getAllHomeCategoryCards()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Карусель категорий на главной</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Карточки товаров и серий, отображаемые в карусели блока «Каталог» на главной странице.
          </p>
        </div>
        <Link
          href="/admin/home-categories/new"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <Plus size={16} />
          Добавить карточку
        </Link>
      </div>

      <HomeCategoriesTable cards={cards} />
    </div>
  )
}
