import Link from "next/link"
import { Heart } from "lucide-react"
import { getFavorites } from "@/lib/account/queries"
import { getProductsBySlugs } from "@/lib/products/queries"
import { ProductCard } from "@/components/product-card"

export default async function FavoritesPage() {
  const favorites = await getFavorites()
  const products = await getProductsBySlugs(favorites.map((favorite) => favorite.product_slug))
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const items = favorites
    .map((favorite) => bySlug.get(favorite.product_slug))
    .filter((product) => product !== undefined)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Избранное</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length > 0
            ? `Товаров в избранном: ${items.length}`
            : "Сохраняйте товары, чтобы вернуться к ним позже."}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-card border border-border p-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Heart size={26} />
          </span>
          <p className="text-sm text-muted-foreground">В избранном пока пусто.</p>
          <Link
            href="/catalog"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product!.id} product={product!} />
          ))}
        </div>
      )}
    </div>
  )
}
