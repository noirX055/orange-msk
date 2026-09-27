import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllProducts, getAllCategories, getAllGroups } from "@/lib/admin/queries"
import { ProductsTable } from "@/components/admin/products-table"
import { SyncProductsButton } from "@/components/admin/sync-products-button"

export default async function AdminProductsPage() {
  const [products, categories, groups] = await Promise.all([
    getAllProducts(),
    getAllCategories(),
    getAllGroups(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Товары</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} в каталоге</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SyncProductsButton />
          <Link
            href="/admin/products/new"
            className="flex h-11 items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:brightness-110 active:scale-[0.99]"
          >
            <Plus size={16} />
            Добавить
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Загрузка фильтров…</div>}>
        <ProductsTable products={products} categories={categories} groups={groups} />
      </Suspense>
    </div>
  )
}
