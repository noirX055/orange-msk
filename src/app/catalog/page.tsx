import Link from "next/link"
import { CatalogView } from "@/components/catalog-view"

export const metadata = {
  title: "Каталог — Orange MSK",
  description: "Смартфоны, ноутбуки, мониторы, аудио и техника для дома в наличии в Москве.",
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sale?: string; brand?: string }>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Хлебные крошки" className="mb-4 text-xs text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-primary">
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">Каталог</li>
        </ol>
      </nav>

      <CatalogView
        initialCategory={params.category ?? "all"}
        initialSaleOnly={params.sale === "1"}
        initialBrand={params.brand}
      />
    </div>
  )
}
