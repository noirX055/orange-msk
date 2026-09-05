import { getAllAttributesWithValues, getAllCategories } from "@/lib/admin/queries"
import { AttributesManager } from "@/components/admin/attributes-manager"

export default async function AdminAttributesPage() {
  const [attributes, categories] = await Promise.all([
    getAllAttributesWithValues(),
    getAllCategories(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Характеристики</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Справочник параметров товаров. Для типа «Цвет» задайте название и HEX/RGB — на витрине
          появится цветной кружок. Для «Список» — варианты вроде объёма памяти.
        </p>
      </div>

      <AttributesManager initialAttributes={attributes} categories={categories} />
    </div>
  )
}
