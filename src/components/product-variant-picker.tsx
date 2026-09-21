"use client"

import Link from "next/link"
import { type Product } from "@/lib/products"
import {
  getPrimaryColor,
  getSimLabel,
  type ProductVariants,
  type VariantOption,
} from "@/lib/products/variants"

function ColorSwatch({ option }: { option: VariantOption }) {
  const { product, active, label, colorHex, isAvailable = true } = option

  const className = `relative h-[34px] w-[34px] shrink-0 rounded-full transition-all ${
    active
      ? "ring-2 ring-foreground ring-offset-2"
      : !isAvailable
      ? "ring-1 ring-border/40 opacity-35 hover:opacity-75"
      : "ring-1 ring-border hover:ring-foreground/40"
  }`

  const inner = (
    <>
      {colorHex ? (
        <span
          className="absolute inset-1 rounded-full border border-black/10 shadow-inner dark:border-white/10"
          style={{ backgroundColor: colorHex }}
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
      <span className={className} aria-label={label} aria-current="true" title={`${label} (выбрано)`}>
        {inner}
      </span>
    )
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={className}
      aria-label={label}
      title={!isAvailable ? `${label} (нет для выбранной конфигурации)` : label}
    >
      {inner}
    </Link>
  )
}

function OptionButton({ option }: { option: VariantOption }) {
  const { product, active, label, isAvailable = true } = option

  const className = `rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
    active
      ? "border-2 border-foreground bg-foreground/5 font-semibold text-foreground shadow-sm"
      : !isAvailable
      ? "border-border/60 bg-muted/40 text-muted-foreground/60 line-through opacity-50 hover:opacity-80"
      : "border-border text-foreground hover:border-foreground/40 hover:bg-muted/40"
  }`

  if (active) {
    return (
      <span className={className} aria-current="true">
        {label}
      </span>
    )
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className={className}
      title={!isAvailable ? `${label} (нет в наличии для выбранного цвета)` : `Выбрать ${label}`}
    >
      {label}
    </Link>
  )
}

function MemoryButton({ option }: { option: VariantOption }) {
  return <OptionButton option={option} />
}

function SimButton({ option }: { option: VariantOption }) {
  return <OptionButton option={option} />
}

export function ProductVariantPicker({
  product,
  variants,
}: {
  product: Product
  variants: ProductVariants
}) {
  const activeColor = getPrimaryColor(product)
  const activeSim = getSimLabel(product)

  const hasDimensions = Boolean(
    variants.dimensions && variants.dimensions.length > 0
  )

  const showColors = variants.colors.length > 1
  const showMemory = variants.memory.length > 1
  const showSims = variants.sims.length > 1

  if (!hasDimensions && !showColors && !showMemory && !showSims) return null

  return (
    <div className="flex flex-col gap-6">
      {hasDimensions ? (
        variants.dimensions.map((dim) => {
          if (!dim.options || dim.options.length === 0) return null

          if (dim.type === "color") {
            return (
              <fieldset key={dim.id}>
                <legend className="mb-3 text-sm">
                  <span className="text-muted-foreground">{dim.name} — </span>
                  <span className="font-medium text-foreground">{dim.activeValue || "—"}</span>
                </legend>
                <div className="flex flex-wrap items-center gap-3">
                  {dim.options.map((opt) => (
                    <ColorSwatch key={opt.label} option={opt} />
                  ))}
                </div>
              </fieldset>
            )
          }

          return (
            <fieldset key={dim.id}>
              <legend className="mb-3 text-sm">
                <span className="font-medium text-foreground">{dim.name} — </span>
                <span className="text-muted-foreground">{dim.activeValue || "Выберите вариант"}</span>
              </legend>
              <div className="flex flex-wrap items-center gap-2.5">
                {dim.options.map((opt) => (
                  <OptionButton key={opt.label} option={opt} />
                ))}
              </div>
            </fieldset>
          )
        })
      ) : (
        <>
          {/* Выбор цвета */}
          {showColors && (
            <fieldset>
              <legend className="mb-3 text-sm">
                <span className="text-muted-foreground">Цвет — </span>
                <span className="font-medium text-foreground">{activeColor?.name ?? "—"}</span>
              </legend>
              <div className="flex flex-wrap items-center gap-3">
                {variants.colors.map((opt) => (
                  <ColorSwatch key={opt.label} option={opt} />
                ))}
              </div>
            </fieldset>
          )}

          {/* Выбор памяти / накопителя */}
          {showMemory && (
            <fieldset>
              <legend className="mb-3 text-sm">
                <span className="font-medium text-foreground">Память. </span>
                <span className="text-muted-foreground">Сколько памяти вам нужно?</span>
              </legend>
              <div className="flex flex-wrap items-center gap-2.5">
                {variants.memory.map((opt) => (
                  <MemoryButton key={opt.label} option={opt} />
                ))}
              </div>
            </fieldset>
          )}

          {/* Выбор конфигурации SIM */}
          {showSims && (
            <fieldset>
              <legend className="mb-3 text-sm">
                <span className="font-medium text-foreground">SIM-карта — </span>
                <span className="text-muted-foreground">{activeSim || "Конфигурация"}</span>
              </legend>
              <div className="flex flex-wrap items-center gap-2.5">
                {variants.sims.map((opt) => (
                  <SimButton key={opt.label} option={opt} />
                ))}
              </div>
            </fieldset>
          )}
        </>
      )}
    </div>
  )
}
