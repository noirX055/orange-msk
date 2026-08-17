import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { BannerForm } from "@/components/admin/banner-form"

export default function NewBannerPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">Новый баннер</h1>
      </div>

      <BannerForm />
    </div>
  )
}
