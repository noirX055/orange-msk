import { getAllBrands } from "@/lib/admin/queries"
import { BrandsManager } from "@/components/admin/brands-manager"

export default async function AdminSettingsPage() {
  const brands = await getAllBrands()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Управление общими настройками магазина
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Бренды</h2>
        <BrandsManager initialBrands={brands} />
      </div>
    </div>
  )
}
