import Image from "next/image"
import { getBrandLogo } from "@/lib/products"

// Простые иконки хранятся в квадратном viewBox 24x24, поэтому широкие
// текстовые знаки (Samsung, Sony) занимают лишь узкую полосу по центру.
// Масштабируем такие знаки сильнее, чтобы оптически сравнять их с Apple.
const scaleByBrand: Record<string, number> = {
  Samsung: 2.6,
  Sony: 2.6,
  ASUS: 2.1,
  LG: 1.9,
  Xiaomi: 1.1,
}

export function BrandLogo({
  brand,
  size = 16,
  className = "",
}: {
  brand: string
  size?: number
  className?: string
}) {
  const src = getBrandLogo(brand)
  const box = size * (scaleByBrand[brand] ?? 1)

  if (!src) {
    return (
      <span
        className={`font-extrabold uppercase leading-none tracking-[0.14em] text-navy ${className}`}
        style={{ fontSize: size * 0.6 }}
      >
        {brand}
      </span>
    )
  }

  return (
    <Image
      src={src}
      alt={brand}
      width={box}
      height={box}
      style={{ height: box, width: box }}
      className={`shrink-0 object-contain opacity-75 ${className}`}
    />
  )
}
