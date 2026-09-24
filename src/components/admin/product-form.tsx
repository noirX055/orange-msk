"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Filter, Plus, Save, SlidersHorizontal, Trash2, X } from "lucide-react"
import { createProduct, updateProduct, type AdminActionState } from "@/app/admin/actions"
import type { ColorRow, SpecRow } from "@/lib/admin/attribute-helpers"
import type { ProductAttribute, ProductAttributeValue } from "@/lib/admin/attributes-types"
import { type Product } from "@/lib/products"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"
const labelBase = "text-[0.8rem] font-semibold text-foreground/80"

const badges = ["", "Хит", "Новинка", "Скидка"]

const initial: AdminActionState = { ok: false }

type FormAdminGroup = {
  id: number
  name: string
  brand_id: number
  category_slug: string
  parent_group?: string | null
  attribute_ids?: number[]
}

type CardAttributeRow = {
  key: string
  attributeId?: number
  label: string
  value: string
  type: "color" | "select" | "text"
  values?: ProductAttributeValue[]
  colorHex?: string
  isConfigurator: boolean
  isFilter: boolean
}

export function ProductForm({
  product,
  categories,
  brands,
  groups = [],
  attributes = [],
}: {
  product?: Product
  categories: { slug: string; name: string }[]
  brands: { id: number; slug: string; name: string }[]
  groups?: FormAdminGroup[]
  attributes?: ProductAttribute[]
}) {
  const isEdit = Boolean(product)
  const action = isEdit ? updateProduct : createProduct
  const [state, formAction, pending] = useActionState(action, initial)

  const initialCategory = product?.category || categories[0]?.slug || ""

  const [selectedBrand, setSelectedBrand] = useState(product?.brand || "")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedSeries, setSelectedSeries] = useState(product?.series || "")

  const [cardAttributes, setCardAttributes] = useState<CardAttributeRow[]>(() => {
    if (!product) return []

    const rows: CardAttributeRow[] = []
    const usedLabels = new Set<string>()

    // 1. Сначала загружаем характеристики specs товара
    if (product.specs && product.specs.length > 0) {
      for (const spec of product.specs) {
        if (!spec.label || !spec.value) continue
        const normLabel = spec.label.toLowerCase().trim()
        if (usedLabels.has(normLabel)) continue

        const matchedAttr = attributes.find(
          (a) => a.name.toLowerCase().trim() === normLabel
        )

        const isColor =
          matchedAttr?.type === "color" ||
          /(?:^|\s)цвет(?:\s|$)/i.test(normLabel)

        const isConf =
          typeof spec.is_configurator === "boolean"
            ? spec.is_configurator
            : isColor || /память|storage|rom|накопитель|sim|сим/i.test(normLabel)

        const isFilt =
          typeof spec.is_filter === "boolean"
            ? spec.is_filter
            : Boolean(matchedAttr?.is_filter ?? isConf)

        if (matchedAttr) {
          const matchedVal = matchedAttr.values?.find(
            (v) =>
              v.label.toLowerCase() === spec.value.toLowerCase() ||
              v.value.toLowerCase() === spec.value.toLowerCase()
          )
          rows.push({
            key: `attr-${matchedAttr.id}-${Math.random()}`,
            attributeId: matchedAttr.id,
            label: matchedAttr.name,
            value: matchedVal ? matchedVal.value : spec.value,
            type: matchedAttr.type,
            values: matchedAttr.values,
            colorHex:
              matchedVal?.color_hex ??
              (matchedAttr.type === "color" ? (product.colors?.[0]?.hex || spec.value) : undefined),
            isConfigurator: isConf,
            isFilter: isFilt,
          })
        } else {
          rows.push({
            key: `custom-${spec.label}-${Math.random()}`,
            label: spec.label,
            value: spec.value,
            type: isColor ? "color" : "text",
            colorHex: isColor ? (product.colors?.[0]?.hex || "#22303f") : undefined,
            isConfigurator: isConf,
            isFilter: isFilt,
          })
        }

        usedLabels.add(normLabel)
        if (isColor) {
          usedLabels.add("цвет")
          usedLabels.add("цвет iphone")
        }
      }
    }

    // 2. Если в specs цвета не было вовсе, но у товара есть массив colors
    const hasAnyColor = rows.some((r) => r.type === "color" || /цвет/i.test(r.label))
    if (!hasAnyColor && product.colors && product.colors.length > 0) {
      const col = product.colors[0]
      if (col && col.name) {
        const colorAttr = attributes.find(
          (a) => a.type === "color" || /цвет/i.test(a.name)
        )
        rows.unshift({
          key: `color-${col.name}-${Math.random()}`,
          attributeId: colorAttr?.id,
          label: colorAttr?.name || "Цвет",
          value: col.name,
          type: "color",
          values: colorAttr?.values,
          colorHex: col.hex,
          isConfigurator: true,
          isFilter: true,
        })
      }
    }

    return rows
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedModalAttrIds, setSelectedModalAttrIds] = useState<number[]>([])

  const currentBrandId = brands.find((b) => b.name === selectedBrand)?.id
  const filteredGroups = groups.filter(
    (g) =>
      (!currentBrandId || g.brand_id === currentBrandId) &&
      (!selectedCategory || g.category_slug === selectedCategory)
  )

  const currentGroup = useMemo(() => {
    if (!selectedSeries) return null
    return (
      groups.find(
        (g) =>
          g.name === selectedSeries &&
          (!selectedCategory || g.category_slug === selectedCategory)
      ) ||
      groups.find((g) => g.name === selectedSeries) ||
      null
    )
  }, [selectedSeries, selectedCategory, groups])

  const groupAttributes = useMemo(() => {
    if (!currentGroup) return []

    let attrIds: number[] = currentGroup.attribute_ids ?? []

    if ((!attrIds || attrIds.length === 0) && currentGroup.parent_group) {
      const siblings = groups.filter(
        (g) =>
          g.parent_group === currentGroup.parent_group &&
          g.attribute_ids &&
          g.attribute_ids.length > 0
      )
      if (siblings.length > 0) {
        attrIds = siblings[0].attribute_ids!
      }
    }

    if (!attrIds || attrIds.length === 0) return []

    const attrMap = new Map(attributes.map((a) => [a.id, a]))
    return attrIds
      .map((id) => attrMap.get(id))
      .filter((a): a is ProductAttribute => Boolean(a))
  }, [currentGroup, groups, attributes])

  const categoryAttributes = useMemo(() => {
    return attributes.filter(
      (a) => !a.category_slug || a.category_slug === selectedCategory
    )
  }, [attributes, selectedCategory])

  const { outputColors, outputSpecs } = useMemo(() => {
    const colorsList: ColorRow[] = []
    const specsList: SpecRow[] = []

    for (const item of cardAttributes) {
      if (!item.label.trim() || !item.value.trim()) continue

      if (item.type === "color") {
        let colorName = item.value
        let hex = item.colorHex || "#22303f"

        const foundVal = item.values?.find((v) => v.value === item.value)
        if (foundVal) {
          colorName = foundVal.label
          if (foundVal.color_hex) hex = foundVal.color_hex
        }

        colorsList.push({ name: colorName, hex })
        specsList.push({
          label: item.label,
          value: colorName,
          is_configurator: item.isConfigurator,
          is_filter: item.isFilter,
        })
      } else if (item.type === "select") {
        const foundVal = item.values?.find((v) => v.value === item.value)
        const displayVal = foundVal ? foundVal.label : item.value
        specsList.push({
          label: item.label,
          value: displayVal,
          is_configurator: item.isConfigurator,
          is_filter: item.isFilter,
        })
      } else {
        specsList.push({
          label: item.label,
          value: item.value,
          is_configurator: item.isConfigurator,
          is_filter: item.isFilter,
        })
      }
    }

    return {
      outputColors: colorsList.length > 0 ? colorsList : (product?.colors ?? []),
      outputSpecs: specsList,
    }
  }, [cardAttributes, product])

  const handleOpenAddModal = () => {
    const existingAttrIds = new Set(
      cardAttributes.map((c) => c.attributeId).filter(Boolean)
    )
    const toSelect = groupAttributes
      .filter((ga) => !existingAttrIds.has(ga.id))
      .map((ga) => ga.id)
    setSelectedModalAttrIds(
      toSelect.length > 0 ? toSelect : groupAttributes.map((ga) => ga.id)
    )
    setIsAddModalOpen(true)
  }

  const handleAddSelectedAttributes = () => {
    const newRows: CardAttributeRow[] = []

    for (const attrId of selectedModalAttrIds) {
      const attr = attributes.find((a) => a.id === attrId)
      if (!attr) continue

      const alreadyExists = cardAttributes.some((ca) => ca.attributeId === attr.id)
      if (alreadyExists) continue

      const firstVal = attr.values?.[0]
      newRows.push({
        key: `attr-${attr.id}-${Date.now()}-${Math.random()}`,
        attributeId: attr.id,
        label: attr.name,
        value: firstVal ? firstVal.value : "",
        type: attr.type,
        values: attr.values,
        colorHex:
          firstVal?.color_hex ?? (attr.type === "color" ? "#22303f" : undefined),
        isConfigurator: true,
        isFilter: Boolean(attr.is_filter ?? true),
      })
    }

    setCardAttributes((prev) => [...prev, ...newRows])
    setIsAddModalOpen(false)
  }

  const handleAddCustomSpec = () => {
    setCardAttributes((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        label: "",
        value: "",
        type: "text",
        isConfigurator: false,
        isFilter: false,
      },
    ])
  }

  const handleClearAll = () => {
    if (cardAttributes.length === 0) return
    if (confirm("Очистить все характеристики у этой карточки?")) {
      setCardAttributes([])
    }
  }

  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? [])
  const [newFiles, setNewFiles] = useState<{ file: File; url: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Синхронизируем стейт превью с реальным input.files (через DataTransfer),
  // чтобы форма отправляла ровно тот набор, что виден пользователю.
  useEffect(() => {
    if (!fileInputRef.current) return
    const dt = new DataTransfer()
    for (const item of newFiles) dt.items.add(item.file)
    fileInputRef.current.files = dt.files
  }, [newFiles])

  function onPickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    setNewFiles((current) => [
      ...current,
      ...files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    ])
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}
      <input type="hidden" name="colors" value={JSON.stringify(outputColors)} />
      <input type="hidden" name="specs" value={JSON.stringify(outputSpecs)} />
      <input type="hidden" name="existing_images" value={JSON.stringify(existingImages)} />

      {/* Основное */}
      <section className="flex flex-col gap-4 rounded-card border border-border p-6">
        <h2 className="text-lg font-bold">Основное</h2>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className={labelBase}>Название *</label>
          <input id="name" name="name" defaultValue={product?.name} required className={inputBase} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="slug" className={labelBase}>Slug (URL)</label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="оставьте пустым — сгенерируем"
              className={inputBase}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="brand" className={labelBase}>Бренд *</label>
            <select
              id="brand"
              name="brand"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              required
              className={inputBase}
            >
              <option value="" disabled>Выберите бренд</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="series" className={labelBase}>Группа товаров (модель)</label>
              <Link
                href="/admin/settings"
                target="_blank"
                className="text-xs text-primary hover:underline"
              >
                Настройки групп →
              </Link>
            </div>
            <select
              id="series"
              name="series"
              value={selectedSeries}
              onChange={(e) => setSelectedSeries(e.target.value)}
              className={inputBase}
            >
              <option value="">Без группы</option>
              {filteredGroups.map((g) => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Все товары с одинаковой группой (например: «iPhone 17 Pro Max») автоматически объединяются на витрине в одну карточку с переключением по цветам, памяти и SIM.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className={labelBase}>Категория *</label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={inputBase}
            >
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="badge" className={labelBase}>Бейдж</label>
            <select id="badge" name="badge" defaultValue={product?.badge ?? ""} className={inputBase}>
              {badges.map((badge) => (
                <option key={badge} value={badge}>
                  {badge || "— нет —"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className={labelBase}>Описание</label>
          <textarea
            id="description"
            name="description"
            defaultValue={product?.description}
            rows={4}
            className={`${inputBase} h-auto py-3`}
          />
        </div>
      </section>

      {/* Цена и наличие */}
      <section className="flex flex-col gap-4 rounded-card border border-border p-6">
        <h2 className="text-lg font-bold">Цена и наличие</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="price" className={labelBase}>Цена, ₽ *</label>
            <input id="price" name="price" type="number" min={0} defaultValue={product?.price} required className={inputBase} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="old_price" className={labelBase}>Старая цена, ₽</label>
            <input id="old_price" name="old_price" type="number" min={0} defaultValue={product?.oldPrice} className={inputBase} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="rating" className={labelBase}>Рейтинг</label>
            <input id="rating" name="rating" type="number" min={0} max={5} step={0.1} defaultValue={product?.rating ?? 0} className={inputBase} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="reviews" className={labelBase}>Отзывов</label>
            <input id="reviews" name="reviews" type="number" min={0} defaultValue={product?.reviews ?? 0} className={inputBase} />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="in_stock" defaultChecked={product?.inStock ?? true} className="h-4 w-4 accent-[var(--primary)]" />
          В наличии
        </label>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" name="is_visible" defaultChecked={product?.isVisible ?? true} className="h-4 w-4 accent-[var(--primary)]" />
          Показывать на витрине
        </label>
      </section>

      {/* Характеристики карточки */}
      <section className="flex flex-col gap-4 rounded-card border border-border p-6 bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Характеристики карточки</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {cardAttributes.length}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedSeries ? (
                <>
                  Группа товара: <strong className="text-foreground">{selectedSeries}</strong>
                  {groupAttributes.length > 0 && (
                    <span> (в группе настроено {groupAttributes.length} общих характеристик)</span>
                  )}
                </>
              ) : (
                "Выберите группу товара выше, чтобы добавить характеристики из неё"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {cardAttributes.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                <Trash2 size={14} />
                Очистить
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={15} />
              Добавить характеристики
            </button>
          </div>
        </div>

        {cardAttributes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <SlidersHorizontal size={22} />
            </div>
            <p className="text-sm font-semibold text-foreground">Характеристики пока не добавлены</p>
            <p className="mt-1 max-w-md text-xs text-muted-foreground">
              {selectedSeries
                ? `Нажмите кнопку «Добавить характеристики», чтобы выбрать нужные параметры из группы «${selectedSeries}».`
                : "Выберите группу товаров в блоке выше, затем нажмите «Добавить характеристики»."}
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-4 flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110"
            >
              <Plus size={14} />
              Добавить характеристики
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cardAttributes.map((row, index) => (
              <div
                key={row.key}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/70 p-3.5 shadow-sm transition-colors hover:border-primary/40"
              >
                {/* Название характеристики */}
                <div className="w-48 shrink-0 min-w-[140px]">
                  {row.attributeId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{row.label}</span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                        {row.type === "color" ? "Цвет" : row.type === "select" ? "Список" : "Текст"}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => {
                        const next = [...cardAttributes]
                        next[index].label = e.target.value
                        setCardAttributes(next)
                      }}
                      placeholder="Название свойства"
                      className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:border-primary"
                    />
                  )}
                </div>

                {/* Значение характеристики */}
                <div className="flex flex-1 items-center gap-2.5 min-w-[200px]">
                  {row.type === "color" && (
                    <div className="flex flex-1 items-center gap-2">
                      {row.values && row.values.length > 0 ? (
                        <select
                          value={row.value}
                          onChange={(e) => {
                            const val = e.target.value
                            const match = row.values?.find((v) => v.value === val)
                            const next = [...cardAttributes]
                            next[index].value = val
                            next[index].colorHex = match?.color_hex ?? row.colorHex
                            setCardAttributes(next)
                          }}
                          className={inputBase + " !h-10 text-xs"}
                        >
                          <option value="">— Выберите цвет —</option>
                          {row.values.map((v) => (
                            <option key={v.id} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const next = [...cardAttributes]
                            next[index].value = e.target.value
                            setCardAttributes(next)
                          }}
                          placeholder="Название цвета"
                          className={inputBase + " !h-10 text-xs flex-1"}
                        />
                      )}
                      <input
                        type="color"
                        value={row.colorHex || "#22303f"}
                        onChange={(e) => {
                          const next = [...cardAttributes]
                          next[index].colorHex = e.target.value
                          setCardAttributes(next)
                        }}
                        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border"
                        title="Цвет"
                      />
                    </div>
                  )}

                  {row.type === "select" && (
                    <div className="flex-1">
                      {row.values && row.values.length > 0 ? (
                        <select
                          value={row.value}
                          onChange={(e) => {
                            const val = e.target.value
                            const match = row.values?.find((v) => v.value === val)
                            const next = [...cardAttributes]
                            next[index].value = val
                            next[index].colorHex = match?.color_hex ?? row.colorHex
                            setCardAttributes(next)
                          }}
                          className={inputBase + " !h-10 text-xs"}
                        >
                          <option value="">— Выберите значение —</option>
                          {row.values.map((v) => (
                            <option key={v.id} value={v.value}>
                              {v.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const next = [...cardAttributes]
                            next[index].value = e.target.value
                            setCardAttributes(next)
                          }}
                          placeholder="Значение"
                          className={inputBase + " !h-10 text-xs"}
                        />
                      )}
                    </div>
                  )}

                  {row.type === "text" && (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => {
                          const next = [...cardAttributes]
                          next[index].value = e.target.value
                          setCardAttributes(next)
                        }}
                        placeholder="Значение характеристики"
                        className={inputBase + " !h-10 text-xs"}
                      />
                    </div>
                  )}
                </div>

                {/* Переключатель: Для конфигуратора */}
                <button
                  type="button"
                  onClick={() => {
                    const next = [...cardAttributes]
                    next[index].isConfigurator = !next[index].isConfigurator
                    setCardAttributes(next)
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                    row.isConfigurator
                      ? "bg-primary text-primary-foreground shadow-sm hover:brightness-110"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/60"
                  }`}
                  title={
                    row.isConfigurator
                      ? "Участвует в конфигураторе товара (переключатель на витрине). Нажмите, чтобы сделать обычной."
                      : "Обычная характеристика (только в описании). Нажмите, чтобы включить в конфигуратор."
                  }
                >
                  <SlidersHorizontal size={13} />
                  <span>{row.isConfigurator ? "В конфигураторе" : "Обычная"}</span>
                </button>

                {/* Переключатель: Для фильтров каталога */}
                <button
                  type="button"
                  onClick={() => {
                    const next = [...cardAttributes]
                    next[index].isFilter = !next[index].isFilter
                    setCardAttributes(next)
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                    row.isFilter
                      ? "bg-emerald-600 text-white shadow-sm hover:brightness-110"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/60"
                  }`}
                  title={
                    row.isFilter
                      ? "Участвует в фильтрах каталога (покупатели могут фильтровать товары по этому параметру). Нажмите, чтобы исключить."
                      : "Не участвует в фильтрах каталога. Нажмите, чтобы включить."
                  }
                >
                  <Filter size={13} />
                  <span>{row.isFilter ? "В фильтрах" : "Без фильтра"}</span>
                </button>

                {/* Удаление строки */}
                <button
                  type="button"
                  onClick={() => setCardAttributes((prev) => prev.filter((_, i) => i !== index))}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                  title="Удалить характеристику"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <div className="mt-1 flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleAddCustomSpec}
                className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <Plus size={13} /> Добавить своё произвольное поле
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Модальное окно выбора характеристик из группы */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-lg font-bold">Выбор характеристик для карточки</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedSeries ? (
                    <>Группа товара: <strong className="text-foreground">{selectedSeries}</strong></>
                  ) : (
                    "Группа товара не выбрана"
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {!selectedSeries ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                  Пожалуйста, сначала выберите группу товаров (модель) в блоке «Основное» выше, чтобы использовать её характеристики.
                </div>
              ) : groupAttributes.length === 0 ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    У группы «{selectedSeries}» ещё не выбраны общие характеристики в настройках групп товаров. Вы можете настроить их в разделе{" "}
                    <Link href="/admin/categories" target="_blank" className="font-semibold underline">
                      «Категории и группы»
                    </Link>{" "}
                    или выбрать любую характеристику из общего справочника ниже:
                  </div>
                  <p className="text-xs font-semibold text-foreground">Характеристики категории:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {categoryAttributes.map((attr) => {
                      const isChecked = selectedModalAttrIds.includes(attr.id)
                      const alreadyInCard = cardAttributes.some((ca) => ca.attributeId === attr.id)
                      return (
                        <label
                          key={attr.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                            isChecked
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedModalAttrIds((prev) =>
                                  prev.includes(attr.id)
                                    ? prev.filter((id) => id !== attr.id)
                                    : [...prev, attr.id]
                                )
                              }}
                              className="h-4 w-4 rounded accent-primary cursor-pointer"
                            />
                            <div>
                              <span className="text-sm font-medium">{attr.name}</span>
                              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                                {attr.type}
                              </span>
                            </div>
                          </div>
                          {alreadyInCard && (
                            <span className="text-[11px] text-muted-foreground">Уже в карточке</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Отметьте характеристики из группы «{selectedSeries}», которые нужно добавить в эту карточку товара:
                  </p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {groupAttributes.map((attr) => {
                      const isChecked = selectedModalAttrIds.includes(attr.id)
                      const alreadyInCard = cardAttributes.some((ca) => ca.attributeId === attr.id)
                      return (
                        <label
                          key={attr.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                            isChecked
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedModalAttrIds((prev) =>
                                  prev.includes(attr.id)
                                    ? prev.filter((id) => id !== attr.id)
                                    : [...prev, attr.id]
                                )
                              }}
                              className="h-4 w-4 rounded accent-primary cursor-pointer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{attr.name}</span>
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                                  {attr.type === "color" ? "Цвет" : attr.type === "select" ? "Список" : "Текст"}
                                </span>
                              </div>
                              {attr.values && attr.values.length > 0 && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                                  {attr.values.map((v) => v.label).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          {alreadyInCard && (
                            <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                              (Уже добавлено)
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border p-4 bg-muted/20">
              <span className="text-xs text-muted-foreground">
                Выбрано: <strong className="text-foreground">{selectedModalAttrIds.length}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-muted transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleAddSelectedAttributes}
                  disabled={selectedModalAttrIds.length === 0}
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  Добавить выбранные
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Фото */}
      <section className="flex flex-col gap-4 rounded-card border border-border p-6">
        <h2 className="text-lg font-bold">Фотографии</h2>
        <p className="text-sm text-muted-foreground">
          Если фото не загружены, на витрине показываются изображения по категории.
        </p>

        {(existingImages.length > 0 || newFiles.length > 0) && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {existingImages.map((url) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                <Image src={url} alt="" fill sizes="120px" className="object-contain p-2" />
                <button
                  type="button"
                  onClick={() => setExistingImages((imgs) => imgs.filter((u) => u !== url))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-red-600"
                  aria-label="Удалить фото"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {newFiles.map((item, index) => (
              <div key={item.url} className="relative aspect-square overflow-hidden rounded-lg border border-primary/40 bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="h-full w-full object-contain p-2" />
                <button
                  type="button"
                  onClick={() => setNewFiles((files) => files.filter((_, i) => i !== index))}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-red-600"
                  aria-label="Убрать фото"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          <Plus size={16} />
          Загрузить фото
        </button>
        <input
          ref={fileInputRef}
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={onPickFiles}
          className="hidden"
        />
      </section>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-8 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-foreground/30 border-t-navy-foreground" />
          ) : (
            <>
              <Save size={16} />
              {isEdit ? "Сохранить" : "Создать товар"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
