export type AttributeType = "text" | "select" | "color"

export type ProductAttributeValue = {
  id: number
  attribute_id: number
  label: string
  value: string
  color_hex: string | null
  sort: number
}

export type ProductAttribute = {
  id: number
  slug: string
  name: string
  type: AttributeType
  category_slug: string | null
  sort: number
  values: ProductAttributeValue[]
}

export const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  text: "Текст",
  select: "Список",
  color: "Цвет (RGB)",
}
