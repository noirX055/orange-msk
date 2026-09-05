import type { Product } from "@/lib/products"
import type { ProductAttribute } from "@/lib/admin/attributes-types"

export type ColorRow = { name: string; hex: string }
export type SpecRow = { label: string; value: string }

export function filterAttributesForCategory(
  attributes: ProductAttribute[],
  categorySlug: string,
): ProductAttribute[] {
  return attributes
    .filter((attr) => !attr.category_slug || attr.category_slug === categorySlug)
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "ru"))
}

export function initAttributeValuesFromProduct(
  product: Product | undefined,
  attributes: ProductAttribute[],
): Record<string, string> {
  if (!product) return {}

  const result: Record<string, string> = {}

  for (const attr of attributes) {
    const spec = product.specs.find((row) => row.label === attr.name)

    if (attr.type === "color") {
      const colorName = product.colors[0]?.name
      const match = attr.values.find(
        (item) =>
          item.label === colorName || item.label === spec?.value || item.value === spec?.value,
      )
      if (match) result[attr.slug] = match.value
    } else if (attr.type === "select") {
      const match = attr.values.find(
        (item) => item.label === spec?.value || item.value === spec?.value,
      )
      if (match) result[attr.slug] = match.value
    } else if (attr.type === "text" && spec?.value) {
      result[attr.slug] = spec.value
    }
  }

  return result
}

export function getExtraSpecs(
  product: Product | undefined,
  attributes: ProductAttribute[],
): SpecRow[] {
  if (!product?.specs.length) return []
  const dictionaryLabels = new Set(attributes.map((attr) => attr.name))
  return product.specs.filter((row) => row.label && !dictionaryLabels.has(row.label))
}

export function buildSpecsAndColors(
  attributes: ProductAttribute[],
  attributeValues: Record<string, string>,
  extraSpecs: SpecRow[],
): { colors: ColorRow[]; specs: SpecRow[] } {
  const colors: ColorRow[] = []
  const specs: SpecRow[] = []

  for (const attr of attributes) {
    const selected = attributeValues[attr.slug]
    if (!selected) continue

    if (attr.type === "color") {
      const item = attr.values.find((row) => row.value === selected)
      if (item) {
        colors.push({ name: item.label, hex: item.color_hex ?? "#22303f" })
        specs.push({ label: attr.name, value: item.label })
      }
    } else if (attr.type === "select") {
      const item = attr.values.find((row) => row.value === selected)
      if (item) specs.push({ label: attr.name, value: item.label })
    } else if (attr.type === "text" && selected.trim()) {
      specs.push({ label: attr.name, value: selected.trim() })
    }
  }

  for (const row of extraSpecs) {
    if (row.label && row.value) specs.push(row)
  }

  return { colors, specs }
}
