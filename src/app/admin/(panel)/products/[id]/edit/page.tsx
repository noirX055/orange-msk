import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getProductById, getAllCategories, getAllBrands } from "@/lib/admin/queries"
import { ProductForm } from "@/components/admin/product-form"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getAllCategories(),
    getAllBrands()
  ])

  if (!product) notFound()

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
        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Редактирование товара</p>
      </div>

      <ProductForm product={product} categories={categories} brands={brands} />
    </div>
  )
}
