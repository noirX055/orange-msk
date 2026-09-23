"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ImagePlus, Loader2, Save, Upload } from "lucide-react"
import type { HomeCategoryCard } from "@/lib/home-categories/types"
import {
  createHomeCategoryCard,
  updateHomeCategoryCard,
  type HomeCategoryActionState,
} from "@/app/admin/home-category-actions"

export function HomeCategoryForm({
  card,
}: {
  card?: HomeCategoryCard | null
}) {
  const isEditing = Boolean(card)

  const action = isEditing
    ? updateHomeCategoryCard.bind(null, card!.id)
    : createHomeCategoryCard

  const [state, formAction, isPending] = useActionState<HomeCategoryActionState, FormData>(
    action,
    { ok: false },
  )

  const [previewUrl, setPreviewUrl] = useState<string>(card?.image || "")
  const [imageUrl, setImageUrl] = useState<string>(card?.image || "")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <form action={formAction} className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/home-categories"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Назад к списку
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEditing ? "Сохранить" : "Создать карточку"}
        </button>
      </div>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
          {state.error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-5">
          {/* Категория (метка) и Название */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category_label" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Метка категории *
              </label>
              <input
                id="category_label"
                name="category_label"
                type="text"
                required
                defaultValue={card?.categoryLabel ?? "Смартфоны"}
                placeholder="напр. Смартфоны, Ноутбуки"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Отображается мелким шрифтом сверху карточки
              </p>
            </div>

            <div>
              <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Название серии / товара *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={card?.title ?? "iPhone 16"}
                placeholder="напр. iPhone 16, MacBook"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Главный крупный заголовок карточки
              </p>
            </div>
          </div>

          {/* Изображение */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Изображение товара
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {/* Превью */}
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-muted/30">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Предпросмотр"
                    fill
                    sizes="144px"
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus size={28} />
                    <span className="text-xs">Нет фото</span>
                  </div>
                )}
              </div>

              {/* Поля загрузки */}
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <label
                    htmlFor="image_file"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Upload size={16} />
                    Выбрать файл с устройства
                  </label>
                  <input
                    id="image_file"
                    name="image_file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Рекомендуется PNG с прозрачным фоном или JPG на белом фоне
                  </p>
                </div>

                <div>
                  <label htmlFor="image_url" className="mb-1 block text-xs text-muted-foreground">
                    Или укажите прямую ссылку / существующий путь к фото:
                  </label>
                  <input
                    id="image_url"
                    name="image_url"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      setPreviewUrl(e.target.value)
                    }}
                    placeholder="/categories/smartphone.png или https://..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Цена «от» и Ссылка */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="price_from" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Цена «от»
              </label>
              <input
                id="price_from"
                name="price_from"
                type="text"
                defaultValue={card?.priceFrom ?? "от 99 900 ₽"}
                placeholder="напр. от 99 900 ₽"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Текст цены внизу слева карточки
              </p>
            </div>

            <div>
              <label htmlFor="href" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ссылка для перехода *
              </label>
              <input
                id="href"
                name="href"
                type="text"
                required
                defaultValue={card?.href ?? "/catalog?category=apple&series=iPhone+16"}
                placeholder="/catalog?category=apple&series=iPhone+16"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Куда ведет карточка при клике
              </p>
            </div>
          </div>

          {/* Порядок и Видимость */}
          <div className="grid gap-5 sm:grid-cols-2 pt-2 border-t border-border">
            <div>
              <label htmlFor="sort" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Порядок сортировки
              </label>
              <input
                id="sort"
                name="sort"
                type="number"
                defaultValue={card?.sort ?? 10}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Меньшее число отображается раньше в карусели
              </p>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                id="is_visible"
                name="is_visible"
                type="checkbox"
                defaultChecked={card ? card.isVisible : true}
                className="h-5 w-5 rounded-md border-border text-primary accent-[var(--primary)] focus:ring-primary"
              />
              <label htmlFor="is_visible" className="cursor-pointer text-sm font-medium select-none">
                Отображать карточку на главной
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
