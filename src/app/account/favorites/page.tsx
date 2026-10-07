import { getFavorites } from "@/lib/account/queries"
import { getProductsBySlugs } from "@/lib/products/queries"
import { FavoritesView } from "@/components/favorites-view"

export default async function AccountFavoritesPage() {
  const favorites = await getFavorites()
  const products = await getProductsBySlugs(favorites.map((favorite) => favorite.product_slug))
  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const items = favorites
    .map((favorite) => bySlug.get(favorite.product_slug))
    .filter((product) => product !== undefined)

  return <FavoritesView initialProducts={items} inAccount />
}
