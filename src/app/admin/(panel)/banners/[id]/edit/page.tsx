import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getBannerById } from "@/lib/banners/queries"
import { BannerForm } from "@/components/admin/banner-form"

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const banner = await getBannerById(id)

  if (!banner) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/banners"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft size={16} />
          К баннерам
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">{banner.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Редактирование баннера</p>
      </div>

      <BannerForm banner={banner} />
    </div>
  )
}
