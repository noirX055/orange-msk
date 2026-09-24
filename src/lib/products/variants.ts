import type { Product } from "@/lib/products"
import type { ProductAttribute } from "@/lib/admin/attributes-types"

export type VariantOption = {
  label: string
  product: Product
  active: boolean
  colorHex?: string
  isAvailable?: boolean
}

export type VariantDimension = {
  id: string
  name: string
  type: "color" | "select" | "text"
  activeValue: string
  options: VariantOption[]
}

export type ProductVariants = {
  /** Варианты цвета для текущей конфигурации */
  colors: VariantOption[]
  /** Варианты памяти для текущей конфигурации */
  memory: VariantOption[]
  /** Варианты конфигурации SIM-карт */
  sims: VariantOption[]
  /** Динамические измерения на основе общих характеристик группы */
  dimensions: VariantDimension[]
  /** Все найденные кандидаты модели */
  allCandidates: Product[]
}

// Известные HEX-коды для популярных цветов техники
export const KNOWN_COLOR_HEXES: Record<string, string> = {
  "пустынный титан": "#c4b5a0",
  "песочный титан": "#d8c7a9",
  "натуральный титан": "#8f8a85",
  "белый титан": "#f2f2f2",
  "чёрный титан": "#22303f",
  "черный титан": "#22303f",
  "синий титан": "#2f3b4a",
  "титан": "#8f8a85",
  "чёрный": "#1d1d1f",
  "черный": "#1d1d1f",
  "белый": "#f5f5f7",
  "ультрамарин": "#4a5aa8",
  "бирюзовый": "#7fb4b0",
  "розовый": "#e8b7c2",
  "жёлтый": "#f9e77f",
  "желтый": "#f9e77f",
  "зелёный": "#cdeac0",
  "зеленый": "#cdeac0",
  "фиолетовый": "#e5ddea",
  "голубой": "#d4e4f7",
  "космический чёрный": "#1b1b1b",
  "серый космос": "#4b5563",
  "серебристый": "#d4d7db",
  "золотой": "#fad7bd",
  "графитовый": "#535150",
  "синий": "#5b7ba6",
  "полночь": "#1f2937",
  "звёздный свет": "#ede4d3",
  "мраморный серый": "#c4c6c8",
  "титановый серый": "#8b8d8f",
  "титановый чёрный": "#2b2b2b",
  "мятный": "#b8e0d2",
  "лаванда": "#d8c9e6",
  // Dyson цвета
  "apricot topaz": "#e89271",
  "strawberry bronze": "#c86d51",
  "blush pink": "#f2c7ce",
  "prussian blue": "#203a4f",
  "rich copper": "#b87333",
  "copper": "#b87333",
  "bright nickel": "#b5b5b5",
  "nickel": "#929292",
  "onyx black": "#1b1b1b",
  "vinca blue": "#5b6b8c",
  "ceramic pop": "#3878b4",
  "jasper plum": "#5c2a3e",
  // Англоязычные цвета
  "black": "#1d1d1f",
  "white": "#f5f5f7",
  "silver": "#d4d7db",
  "gold": "#fad7bd",
  "space gray": "#4b5563",
  "space black": "#1b1b1b",
  "starlight": "#ede4d3",
  "midnight": "#1f2937",
  "blue": "#5b7ba6",
  "pink": "#e8b7c2",
  "green": "#cdeac0",
  "yellow": "#f9e77f",
  "orange": "#ea580c",
  "red": "#dc2626",
  "purple": "#7c3aed",
  "natural titanium": "#8f8a85",
  "desert titanium": "#c4b5a0",
  "white titanium": "#f2f2f2",
  "black titanium": "#22303f",
}

/** Основной цвет SKU (из colors, specs или названия) */
export function getPrimaryColor(product: Product): { name: string; hex: string } | null {
  if (product.colors && product.colors.length > 0 && product.colors[0]?.name) {
    const raw = product.colors[0]
    return {
      name: raw.name.trim(),
      hex: raw.hex?.trim() || KNOWN_COLOR_HEXES[raw.name.trim().toLowerCase()] || "#22303f",
    }
  }

  // Поиск в характеристиках
  const spec = product.specs.find((item) => /цвет/i.test(item.label))
  if (spec?.value?.trim()) {
    const name = spec.value.trim()
    return {
      name,
      hex: KNOWN_COLOR_HEXES[name.toLowerCase()] || "#22303f",
    }
  }

  // Поиск по ключевым словам в названии
  const lowerName = product.name.toLowerCase()
  for (const [colorKey, hex] of Object.entries(KNOWN_COLOR_HEXES)) {
    if (lowerName.includes(colorKey)) {
      const formattedName = colorKey.charAt(0).toUpperCase() + colorKey.slice(1)
      return { name: formattedName, hex }
    }
  }

  return null
}

/** Значение «Память» из характеристик или названия */
export function getMemoryLabel(product: Product): string | null {
  const spec = product.specs.find((item) =>
    /(?:память|встроенная|накопитель|хранилище|rom|storage|ssd)/i.test(item.label)
  )
  if (spec?.value?.trim()) {
    return spec.value.trim()
  }

  // Поиск в названии (128 ГБ, 256 ГБ, 512 ГБ, 1 ТБ, 2 ТБ)
  const match = product.name.match(
    /(?:^|\s)(16|32|64|128|256|512)\s*(?:ГБ|GB)|(?:^|\s)(1|2)\s*(?:ТБ|TB)(?:\s|$)/i
  )
  if (match) {
    return match[1] ? `${match[1]} ГБ` : `${match[2]} ТБ`
  }

  return null
}

/** Короткая чистая подпись для кнопки памяти: «256 ГБ» из «8 / 256 ГБ» */
export function getMemoryOptionLabel(value: string): string {
  const parts = value.split("/").map((part) => part.trim())
  const last = parts[parts.length - 1]
  const match = last.match(/(\d+\s*(?:ГБ|GB|ТБ|TB))/i)
  return match ? match[1].replace(/\s+/g, " ") : last
}

/** Числовое значение объема памяти в ГБ для корректной сортировки */
export function getMemoryInGb(value: string): number {
  const cleaned = getMemoryOptionLabel(value).toLowerCase().replace(/\s+/g, "")
  if (cleaned.includes("тб") || cleaned.includes("tb")) {
    const num = parseFloat(cleaned) || 1
    return num * 1024
  }
  return parseFloat(cleaned) || 0
}

/** Значение «SIM-карта / Конфигурация SIM» из характеристик или названия */
export function getSimLabel(product: Product): string | null {
  const spec = product.specs.find((item) => /(?:sim|сим)/i.test(item.label))
  if (spec?.value?.trim()) {
    return getSimOptionLabel(spec.value.trim())
  }

  // Определение по названию товара
  const name = product.name.toLowerCase()
  if (/2\s*x?\s*nano[-\s]?sim|dual\s*sim|2\s*sim|две\s*sim|2\s*сим/i.test(name)) {
    return "2x nano-SIM"
  }
  if (/nano[-\s]?sim\s*\+\s*esim|1\s*sim\s*\+\s*esim|sim\s*\+\s*esim/i.test(name)) {
    return "nano-SIM + eSIM"
  }
  if (/dual\s*esim|только\s*esim|esim\s*only|2\s*esim/i.test(name)) {
    return "Dual eSIM"
  }
  if (/\besim\b/i.test(name)) {
    return "eSIM"
  }

  return null
}

/** Нормализация подписи для кнопки SIM */
export function getSimOptionLabel(value: string): string {
  const lower = value.toLowerCase().trim()

  if (lower.includes("2") && (lower.includes("nano") || lower.includes("sim") || lower.includes("сим"))) {
    return "2x nano-SIM"
  }
  if (lower.includes("dual") && lower.includes("esim")) {
    return "Dual eSIM"
  }
  if (lower.includes("dual") && (lower.includes("sim") || lower.includes("nano"))) {
    return "2x nano-SIM"
  }
  if (lower.includes("nano") && lower.includes("esim")) {
    return "nano-SIM + eSIM"
  }
  if (lower === "esim" || lower === "только esim") {
    return "eSIM"
  }

  return value.trim()
}

/**
 * 3-мерная матрица вариантов (Цвет x Память x SIM)
 * Для каждого измерения находит наилучший SKU при переключении:
 * 1. Идеально: совпадает целевое свойство + остальные 2 свойства текущего товара
 * 2. Если нет: совпадает целевое + одно из оставшихся
 * 3. Fallback: любой товар с этим свойством
 */
/**
 * Извлечение значения атрибута из товара
 */
/**
 * Извлечение значения атрибута или характеристики из товара
 */
export function getProductDimensionValue(
  product: Product,
  dimensionName: string,
  dimensionType?: "color" | "select" | "text",
  knownAttribute?: ProductAttribute
): { label: string; colorHex?: string } | null {
  // 1. Цвет
  if (dimensionType === "color" || knownAttribute?.type === "color" || /цвет/i.test(dimensionName)) {
    const color = getPrimaryColor(product)
    if (color) {
      return { label: color.name, colorHex: color.hex }
    }
  }

  // 2. Память
  if (
    knownAttribute?.slug === "storage" ||
    knownAttribute?.slug === "rom" ||
    /(?:память|встроенная|накопитель|хранилище|rom|storage|ssd)/i.test(dimensionName)
  ) {
    const mem = getMemoryLabel(product)
    if (mem) {
      return { label: getMemoryOptionLabel(mem) }
    }
  }

  // 3. SIM
  if (
    knownAttribute?.slug?.includes("sim") ||
    /(?:sim|сим)/i.test(dimensionName)
  ) {
    const sim = getSimLabel(product)
    if (sim) {
      return { label: sim }
    }
  }

  // 4. Поиск в характеристиках specs
  const lowerName = dimensionName.toLowerCase().trim()
  const spec = product.specs?.find(
    (s) =>
      s.label.toLowerCase().trim() === lowerName ||
      s.label.toLowerCase().includes(lowerName) ||
      lowerName.includes(s.label.toLowerCase())
  )
  if (spec && spec.value?.trim()) {
    const val = spec.value.trim()
    const matchedVal = knownAttribute?.values?.find(
      (v) => v.label.toLowerCase() === val.toLowerCase()
    )
    return {
      label: val,
      colorHex:
        matchedVal?.color_hex ??
        (dimensionType === "color" ? KNOWN_COLOR_HEXES[val.toLowerCase()] : undefined),
    }
  }

  return null
}

export function getProductAttributeValue(
  product: Product,
  attribute: ProductAttribute
): { label: string; colorHex?: string } | null {
  return getProductDimensionValue(product, attribute.name, attribute.type, attribute)
}

/**
 * Матрица вариантов (динамические атрибуты группы или стандартная Цвет x Память x SIM)
 */
export function buildProductVariants(
  current: Product,
  candidates: Product[],
  groupAttributes?: ProductAttribute[]
): ProductVariants {
  const allCandidates = candidates.length > 0 ? candidates : [current]

  // Свойства текущего просматриваемого товара
  const currentColorObj = getPrimaryColor(current)
  const currentColor = currentColorObj?.name ?? ""
  const currentMemRaw = getMemoryLabel(current)
  const currentMemory = currentMemRaw ? getMemoryOptionLabel(currentMemRaw) : ""
  const currentSim = getSimLabel(current) ?? ""

  // Карта свойств для всех кандидатов
  const parsedCandidates = allCandidates.map((item) => {
    const c = getPrimaryColor(item)
    const m = getMemoryLabel(item)
    const s = getSimLabel(item)
    return {
      product: item,
      color: c?.name ?? "",
      colorHex: c?.hex ?? "#22303f",
      memory: m ? getMemoryOptionLabel(m) : "",
      memoryGb: m ? getMemoryInGb(m) : 0,
      sim: s ?? "",
    }
  })

  // -------------------------------------------------------------
  // ДИНАМИЧЕСКИЕ ИЗМЕРЕНИЯ КОНФИГУРАТОРА
  // -------------------------------------------------------------
  type DimensionTarget = {
    id: string
    name: string
    type: "color" | "select" | "text"
    knownAttribute?: ProductAttribute
  }

  const targets: DimensionTarget[] = []
  const usedNames = new Set<string>()

  // 1. Характеристики, настроенные в группе товаров
  if (groupAttributes && groupAttributes.length > 0) {
    for (const attr of groupAttributes) {
      const lower = attr.name.toLowerCase().trim()
      if (!usedNames.has(lower)) {
        targets.push({
          id: attr.slug,
          name: attr.name,
          type: attr.type,
          knownAttribute: attr,
        })
        usedNames.add(lower)
      }
    }
  }

  // 2. Характеристики карточки товара, помеченные как is_configurator === true
  if (current.specs && current.specs.length > 0) {
    for (const spec of current.specs) {
      const lower = spec.label.toLowerCase().trim()
      if (spec.is_configurator && !usedNames.has(lower)) {
        const isColor = /цвет/i.test(spec.label)
        targets.push({
          id: isColor ? "color" : spec.label.toLowerCase().replace(/\s+/g, "-"),
          name: spec.label,
          type: isColor ? "color" : "select",
        })
        usedNames.add(lower)
      }
    }
  }

  // 3. Если цвет есть у товара, но ещё не в targets — добавляем цвет первым
  //    Пропускаем, если уже есть любое измерение типа "color" (например "Dyson" → color)
  const hasColorTypeDimension = targets.some((t) => t.type === "color")
  if (!hasColorTypeDimension && !usedNames.has("цвет") && !Array.from(usedNames).some((n) => /цвет/i.test(n))) {
    if (currentColor || (current.colors && current.colors.length > 0)) {
      targets.unshift({
        id: "color",
        name: "Цвет",
        type: "color",
      })
      usedNames.add("цвет")
    }
  }

  const dimensions: VariantDimension[] = []

  if (targets.length > 0) {
    for (const target of targets) {
      const currentValObj = getProductDimensionValue(current, target.name, target.type, target.knownAttribute)
      const currentVal = currentValObj?.label ?? ""

      const uniqueValuesMap = new Map<string, { label: string; colorHex?: string }>()

      if (currentValObj && currentValObj.label) {
        uniqueValuesMap.set(currentValObj.label, currentValObj)
      }

      for (const item of allCandidates) {
        const val = getProductDimensionValue(item, target.name, target.type, target.knownAttribute)
        if (val && val.label && !uniqueValuesMap.has(val.label)) {
          uniqueValuesMap.set(val.label, val)
        }
      }

      if (uniqueValuesMap.size > 0) {
        let valueList = Array.from(uniqueValuesMap.values())

        if (
          target.knownAttribute?.slug === "storage" ||
          /(?:память|встроенная|накопитель|хранилище|rom|storage|ssd)/i.test(target.name)
        ) {
          valueList.sort((a, b) => getMemoryInGb(a.label) - getMemoryInGb(b.label))
        }

        const options: VariantOption[] = []
        for (const meta of valueList) {
          const isActive = meta.label === currentVal

          let bestMatch: Product = current
          let bestScore = -1
          let hasExactCandidate = false

          for (const item of allCandidates) {
            const candidateVal = getProductDimensionValue(item, target.name, target.type, target.knownAttribute)?.label
            if (candidateVal !== meta.label) continue

            let matchesAllOthers = true
            let score = 100
            for (const other of targets) {
              if (other.name === target.name) continue
              const otherCurrent = getProductDimensionValue(current, other.name, other.type, other.knownAttribute)?.label
              const otherCandidate = getProductDimensionValue(item, other.name, other.type, other.knownAttribute)?.label
              if (otherCurrent && otherCandidate === otherCurrent) {
                score += 30
              } else if (otherCurrent && otherCandidate && otherCandidate !== otherCurrent) {
                matchesAllOthers = false
              }
            }

            if (matchesAllOthers && item.inStock !== false) {
              hasExactCandidate = true
            }

            if (item.inStock) score += 5

            if (score > bestScore) {
              bestScore = score
              bestMatch = item
            }
          }

          options.push({
            label: meta.label,
            product: bestMatch,
            active: isActive,
            colorHex: meta.colorHex,
            isAvailable: isActive || hasExactCandidate,
          })
        }

        dimensions.push({
          id: target.id,
          name: target.name,
          type: target.type,
          activeValue: currentVal,
          options,
        })
      }
    }
  }

  // -------------------------------------------------------------
  // 1. ВАРИАНТЫ ЦВЕТА (LEGACY / FALLBACK)
  // -------------------------------------------------------------
  const uniqueColorsMap = new Map<string, { label: string; hex: string }>()
  for (const item of parsedCandidates) {
    if (item.color && !uniqueColorsMap.has(item.color)) {
      uniqueColorsMap.set(item.color, { label: item.color, hex: item.colorHex })
    }
  }

  const colors: VariantOption[] = []
  for (const [colorName, colorMeta] of uniqueColorsMap.entries()) {
    const isActive = colorName === currentColor

    let bestMatch: Product = current
    let bestScore = -1

    for (const item of parsedCandidates) {
      if (item.color !== colorName) continue

      let score = 100
      if (currentMemory && item.memory === currentMemory) score += 40
      if (currentSim && item.sim === currentSim) score += 20
      if (item.product.inStock) score += 5

      if (score > bestScore) {
        bestScore = score
        bestMatch = item.product
      }
    }

    colors.push({
      label: colorMeta.label,
      product: bestMatch,
      active: isActive,
      colorHex: colorMeta.hex,
    })
  }

  // -------------------------------------------------------------
  // 2. ВАРИАНТЫ ПАМЯТИ (LEGACY / FALLBACK)
  // -------------------------------------------------------------
  const uniqueMemoryMap = new Map<string, { label: string; gb: number }>()
  for (const item of parsedCandidates) {
    if (item.memory && !uniqueMemoryMap.has(item.memory)) {
      uniqueMemoryMap.set(item.memory, { label: item.memory, gb: item.memoryGb })
    }
  }

  const sortedMemories = Array.from(uniqueMemoryMap.values()).sort((a, b) => a.gb - b.gb)

  const memory: VariantOption[] = []
  for (const memMeta of sortedMemories) {
    const isActive = memMeta.label === currentMemory

    let bestMatch: Product = current
    let bestScore = -1

    for (const item of parsedCandidates) {
      if (item.memory !== memMeta.label) continue

      let score = 100
      if (currentColor && item.color === currentColor) score += 40
      if (currentSim && item.sim === currentSim) score += 20
      if (item.product.inStock) score += 5

      if (score > bestScore) {
        bestScore = score
        bestMatch = item.product
      }
    }

    memory.push({
      label: memMeta.label,
      product: bestMatch,
      active: isActive,
    })
  }

  // -------------------------------------------------------------
  // 3. ВАРИАНТЫ SIM-КАРТ (LEGACY / FALLBACK)
  // -------------------------------------------------------------
  const uniqueSims = Array.from(
    new Set(parsedCandidates.map((i) => i.sim).filter(Boolean))
  )

  const sims: VariantOption[] = []
  for (const simLabel of uniqueSims) {
    const isActive = simLabel === currentSim

    let bestMatch: Product = current
    let bestScore = -1

    for (const item of parsedCandidates) {
      if (item.sim !== simLabel) continue

      let score = 100
      if (currentColor && item.color === currentColor) score += 40
      if (currentMemory && item.memory === currentMemory) score += 20
      if (item.product.inStock) score += 5

      if (score > bestScore) {
        bestScore = score
        bestMatch = item.product
      }
    }

    sims.push({
      label: simLabel,
      product: bestMatch,
      active: isActive,
    })
  }

  return {
    colors: colors.length > 0 ? colors : (currentColor ? [{ label: currentColor, product: current, active: true, colorHex: currentColorObj?.hex }] : []),
    memory: memory.length > 0 ? memory : (currentMemory ? [{ label: currentMemory, product: current, active: true }] : []),
    sims: sims.length > 0 ? sims : (currentSim ? [{ label: currentSim, product: current, active: true }] : []),
    dimensions,
    allCandidates,
  }
}
