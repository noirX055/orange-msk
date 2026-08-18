"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Plus, Save, Trash2, X } from "lucide-react"
import { createProduct, updateProduct, type AdminActionState } from "@/app/admin/actions"
import { type Product } from "@/lib/products"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"
const labelBase = "text-[0.8rem] font-semibold text-foreground/80"

const badges = ["", "Хит", "Новинка", "Скидка"]

const initial: AdminActionState = { ok: false }

type ColorRow = { name: string; hex: string }
type SpecRow = { label: string; value: string }

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product
  categories: { slug: string; name: string }[]
  brands: { id: number; slug: string; name: string }[]
}) {
  const isEdit = Boolean(product)
  const action = isEdit ? updateProduct : createProduct
  const [state, formAction, pending] = useActionState(action, initial)

  const [colors, setColors] = useState<ColorRow[]>(
    product?.colors?.length ? product.colors : [{ name: "", hex: "#22303f" }],
  )
  const [specs, setSpecs] = useState<SpecRow[]>(
    product?.specs?.length ? product.specs : [{ label: "", value: "" }],
  )
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
      <input type="hidden" name="colors" value={JSON.stringify(colors.filter((c) => c.name))} />
      <input type="hidden" name="specs" value={JSON.stringify(specs.filter((s) => s.label))} />
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
            <select id="brand" name="brand" defaultValue={product?.brand || ""} required className={inputBase}>
              <option value="" disabled>Выберите бренд</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="series" className={labelBase}>Серия / модель</label>
            <input
              id="series"
              name="series"
              defaultValue={product?.series}
              placeholder="напр. iPhone 16, Galaxy S25"
              className={inputBase}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="category" className={labelBase}>Категория *</label>
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? categories[0].slug}
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

      {/* Цвета */}
      <section className="flex flex-col gap-4 rounded-card border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Цвета</h2>
          <button
            type="button"
            onClick={() => setColors((c) => [...c, { name: "", hex: "#22303f" }])}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="color"
                value={color.hex}
                onChange={(e) =>
                  setColors((c) => c.map((row, i) => (i === index ? { ...row, hex: e.target.value } : row)))
                }
                className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border"
                aria-label="Цвет"
              />
              <input
                value={color.name}
                onChange={(e) =>
                  setColors((c) => c.map((row, i) => (i === index ? { ...row, name: e.target.value } : row)))
                }
                placeholder="Название цвета"
                className={inputBase}
              />
              <button
                type="button"
                onClick={() => setColors((c) => c.filter((_, i) => i !== index))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Удалить цвет"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Характеристики */}
      <section className="flex flex-col gap-4 rounded-card border border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Характеристики</h2>
          <button
            type="button"
            onClick={() => setSpecs((s) => [...s, { label: "", value: "" }])}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {specs.map((spec, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                value={spec.label}
                onChange={(e) =>
                  setSpecs((s) => s.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)))
                }
                placeholder="Параметр"
                className={inputBase}
              />
              <input
                value={spec.value}
                onChange={(e) =>
                  setSpecs((s) => s.map((row, i) => (i === index ? { ...row, value: e.target.value } : row)))
                }
                placeholder="Значение"
                className={inputBase}
              />
              <button
                type="button"
                onClick={() => setSpecs((s) => s.filter((_, i) => i !== index))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label="Удалить характеристику"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

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
