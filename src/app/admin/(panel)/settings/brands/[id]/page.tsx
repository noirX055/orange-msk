import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getAllBrands, getAllCategories, getAllGroups } from "@/lib/admin/queries"
import { GroupsManager } from "@/components/admin/groups-manager"

export default async function BrandSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const brandId = Number(id)
  
  const [brands, categories, groups] = await Promise.all([
    getAllBrands(),
    getAllCategories(),
    getAllGroups(),
  ])

  const brand = brands.find((b) => b.id === brandId)
  if (!brand) notFound()

  const brandGroups = groups.filter((g) => g.brand_id === brandId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/settings"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft size={16} />
          Назад к настройкам
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{brand.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Настройки бренда и его группы (серии)</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Группы товаров</h2>
        <GroupsManager 
          initialGroups={brandGroups} 
          brands={brands} 
          categories={categories} 
          fixedBrandId={brandId} 
        />
      </div>
    </div>
  )
}
