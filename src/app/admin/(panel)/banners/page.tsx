import Link from "next/link"
import { Plus } from "lucide-react"
import { getAllBanners } from "@/lib/banners/queries"
import { BannersTable } from "@/components/admin/banners-table"

export default async function AdminBannersPage() {
  const banners = await getAllBanners()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Баннеры</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Промо-плитки на главной. Порядок и видимость управляются здесь.
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="flex h-11 items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:brightness-110 active:scale-[0.99]"
        >
          <Plus size={16} />
          Добавить
        </Link>
      </div>

      <BannersTable banners={banners} />
    </div>
  )
}
