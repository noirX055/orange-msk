"use client"

import Link from "next/link"
import { type Product } from "@/lib/products"
import {
  getMemoryLabel,
  getMemoryOptionLabel,
  getPrimaryColor,
  type ProductVariants,
} from "@/lib/products/variants"

function ColorSwatch({
  product,
  active,
}: {
  product: Product
  active: boolean
}) {
  const color = getPrimaryColor(product)
  const label = color?.name ?? product.name

  const className = `relative h-[34px] w-[34px] shrink-0 rounded-full transition-all ${
    active ? "ring-2 ring-foreground ring-offset-2" : "ring-1 ring-border hover:ring-foreground/40"
  }`

  const inner = (
    <>
      {color ? (
        <span
          className="absolute inset-1 rounded-full border border-black/10 shadow-inner dark:border-white/10"
          style={{ backgroundColor: color.hex }}
        />
      ) : (
        <span className="absolute inset-1 rounded-full bg-muted text-[10px] font-semibold leading-[26px] text-center">
          ?
        </span>
      )}
    </>
  )

  if (active) {
    return (
      <span className={className} aria-label={label} aria-current="true">
        {inner}
      </span>
    )
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={className}
      aria-label={label}
      title={label}
    >
      {inner}
    </Link>
  )
}

function MemoryButton({
  product,
  active,
}: {
  product: Product
  active: boolean
}) {
  const memory = getMemoryLabel(product)
  const label = memory ? getMemoryOptionLabel(memory) : product.name

  const className = `rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
    active
      ? "border-2 border-foreground bg-foreground/5"
      : "border-border hover:border-foreground/40"
  }`

  if (active) {
    return (
      <span className={className} aria-current="true">
        {label}
      </span>
    )
  }

  return (
    <Link href={`/product/${product.slug}`} className={className} title={memory ?? undefined}>
      {label}
    </Link>
  )
}

export function ProductVariantPicker({
  product,
  variants,
}: {
  product: Product
  variants: ProductVariants
}) {
  const activeColor = getPrimaryColor(product)
  const showColors = variants.colors.length > 1
  const showMemory = variants.memory.length > 1

  if (!showColors && !showMemory) return null

  return (
    <div className="flex flex-col gap-6">
      {showColors && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="text-muted-foreground">Цвет — </span>
            <span className="font-medium text-foreground">{activeColor?.name ?? "—"}</span>
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            {variants.colors.map((item) => (
              <ColorSwatch key={item.id} product={item} active={item.id === product.id} />
            ))}
          </div>
        </fieldset>
      )}

      {showMemory && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="font-medium text-foreground">Память. </span>
            <span className="text-muted-foreground">Сколько памяти вам нужно?</span>
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            {variants.memory.map((item) => (
              <MemoryButton key={item.id} product={item} active={item.id === product.id} />
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}
