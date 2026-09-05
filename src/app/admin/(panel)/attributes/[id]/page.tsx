import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getAttributeById, getAllCategories } from "@/lib/admin/queries"
import { AttributeDetail } from "@/components/admin/attribute-detail"

export default async function AttributeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const attributeId = Number(id)
  if (!attributeId || isNaN(attributeId)) notFound()

  const [attribute, categories] = await Promise.all([
    getAttributeById(attributeId),
    getAllCategories(),
  ])

  if (!attribute) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/attributes"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft size={16} />
          Назад к характеристикам
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{attribute.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Редактирование характеристики и управление значениями
        </p>
      </div>

      <AttributeDetail attribute={attribute} categories={categories} />
    </div>
  )
}
