"use server"
 
import { getProductsBySlugs } from "@/lib/products/queries"
import type { Product } from "@/lib/products"
 
export async function fetchProductsBySlugsAction(slugs: string[]): Promise<Product[]> {
  if (!slugs || slugs.length === 0) return []
  const unique = Array.from(new Set(slugs)).filter(Boolean).slice(0, 100)
  return await getProductsBySlugs(unique)
}
