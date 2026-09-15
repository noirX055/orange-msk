import { getCategoriesWithGroups, getAllAttributesWithValues } from "@/lib/admin/queries"
import { CategoriesManager } from "@/components/admin/categories-manager"

export default async function AdminCategoriesPage() {
  const [{ categories, groups, brands }, attributes] = await Promise.all([
    getCategoriesWithGroups(),
    getAllAttributesWithValues(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Категории и группы</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {categories.length} категорий · {groups.length} групп · {attributes.length} характеристик
        </p>
      </div>

      <CategoriesManager
        initialCategories={categories}
        initialGroups={groups}
        brands={brands}
        attributes={attributes}
      />
    </div>
  )
}
