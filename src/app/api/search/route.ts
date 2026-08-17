import type { NextRequest } from "next/server"
import { getProductImages } from "@/lib/products"
import { searchProducts } from "@/lib/products/queries"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""
  const products = await searchProducts(q)

  const results = products.map((product) => ({
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    oldPrice: product.oldPrice ?? null,
    image: getProductImages(product)[0] ?? null,
  }))

  return Response.json({ results })
}
