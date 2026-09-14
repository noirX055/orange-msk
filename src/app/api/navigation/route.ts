import { NextResponse } from "next/server"
import { getNavigationTree } from "@/lib/products/queries"

export const revalidate = 3600

export async function GET() {
  const tree = await getNavigationTree()
  return NextResponse.json(tree)
}
