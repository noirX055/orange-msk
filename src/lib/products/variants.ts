import type { Product } from "@/lib/products"

/** Основной цвет SKU (у варианта обычно один цвет) */
export function getPrimaryColor(product: Product) {
  return product.colors[0] ?? null
}

/** Значение «Память» из характеристик */
export function getMemoryLabel(product: Product): string | null {
  const spec = product.specs.find((item) => item.label.toLowerCase().includes("память"))
  return spec?.value?.trim() || null
}

/** Короткая подпись для кнопки памяти — «256 ГБ» из «8 / 256 ГБ» */
export function getMemoryOptionLabel(value: string): string {
  const parts = value.split("/").map((part) => part.trim())
  const last = parts[parts.length - 1]
  const match = last.match(/(\d+\s*(?:ГБ|GB|ТБ|TB))/i)
  return match ? match[1].replace(/\s+/g, " ") : last
}

export type ProductVariants = {
  /** Тот же variant_group — другой slug, другой цвет */
  colors: Product[]
  /** Та же серия + тот же цвет — другой объём памяти */
  memory: Product[]
}

export function buildProductVariants(current: Product, candidates: Product[]): ProductVariants {
  const primaryColor = getPrimaryColor(current)?.name ?? null

  const colors = candidates
    .filter((item) => {
      if (item.id === current.id) return true
      if (current.variantGroup && item.variantGroup === current.variantGroup) return true
      return false
    })
    .filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index)
    .sort((a, b) => {
      const colorA = getPrimaryColor(a)?.name ?? a.slug
      const colorB = getPrimaryColor(b)?.name ?? b.slug
      return colorA.localeCompare(colorB, "ru")
    })

  const memory =
    current.series && primaryColor
      ? candidates
          .filter((item) => item.id !== current.id)
          .filter((item) => item.series === current.series && item.brand === current.brand)
          .filter((item) => getPrimaryColor(item)?.name === primaryColor)
          .filter((item) => getMemoryLabel(item))
          .filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index)
          .sort((a, b) => {
            const memA = getMemoryLabel(a) ?? ""
            const memB = getMemoryLabel(b) ?? ""
            return memA.localeCompare(memB, "ru", { numeric: true })
          })
      : []

  // Текущий товар всегда в списке памяти для подсветки активной кнопки
  const memoryWithCurrent = memory.some((item) => item.id === current.id)
    ? memory
    : getMemoryLabel(current)
      ? [current, ...memory]
      : memory

  return {
    colors: colors.length > 0 ? colors : [current],
    memory: memoryWithCurrent.sort((a, b) => {
      const memA = getMemoryLabel(a) ?? ""
      const memB = getMemoryLabel(b) ?? ""
      return memA.localeCompare(memB, "ru", { numeric: true })
    }),
  }
}
