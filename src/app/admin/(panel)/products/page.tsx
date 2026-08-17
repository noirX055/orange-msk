import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllProducts } from "@/lib/admin/queries"
import { ProductsTable } from "@/components/admin/products-table"

export default async function AdminProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Товары</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} в каталоге</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex h-11 items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <Plus size={16} />
          Добавить
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  )
}
