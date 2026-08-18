import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ProductForm } from "@/components/admin/product-form"
import { getAllCategories, getAllBrands, getAllGroups } from "@/lib/admin/queries"

export default async function NewProductPage() {
  const [categories, brands, groups] = await Promise.all([
    getAllCategories(),
    getAllBrands(),
    getAllGroups(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft size={16} />
          К товарам
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Новый товар</h1>
      </div>

      <ProductForm categories={categories} brands={brands} groups={groups} />
    </div>
  )
}
