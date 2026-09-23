import { HomeCategoryForm } from "@/components/admin/home-category-form"

export const metadata = {
  title: "Добавить карточку в карусель — Админ-панель",
}

export default function NewHomeCategoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Добавить карточку в карусель</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Создание новой карточки для карусели категорий на главной странице.
        </p>
      </div>

      <HomeCategoryForm />
    </div>
  )
}
