import { notFound } from "next/navigation"
import { getHomeCategoryCardById } from "@/lib/home-categories/queries"
import { HomeCategoryForm } from "@/components/admin/home-category-form"

export const metadata = {
  title: "Редактировать карточку — Админ-панель",
}

export default async function EditHomeCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const card = await getHomeCategoryCardById(id)

  if (!card) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Редактировать карточку</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Изменение карточки «{card.title}» в карусели главной страницы.
        </p>
      </div>

      <HomeCategoryForm card={card} />
    </div>
  )
}
