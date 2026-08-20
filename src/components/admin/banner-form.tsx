"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Save, Upload, X } from "lucide-react"
import { createBanner, updateBanner, type BannerActionState } from "@/app/admin/banner-actions"
import type { Banner } from "@/lib/banners/types"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"
const labelBase = "text-[0.8rem] font-semibold text-foreground/80"

const initial: BannerActionState = { ok: false }

export function BannerForm({ banner }: { banner?: Banner }) {
  const isEdit = Boolean(banner)
  const action = isEdit ? updateBanner : createBanner
  const [state, formAction, pending] = useActionState(action, initial)

  const [title, setTitle] = useState(banner?.title ?? "")
  const [subtitle, setSubtitle] = useState(banner?.subtitle ?? "")
  const [bgColor, setBgColor] = useState(banner?.bgColor ?? "#5bb6d1")
  const [textColor, setTextColor] = useState<"light" | "dark">(banner?.textColor ?? "light")
  const [existingImage, setExistingImage] = useState(banner?.image ?? "")
  const [newImage, setNewImage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (newImage) URL.revokeObjectURL(newImage)
    }
  }, [newImage])

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setNewImage(URL.createObjectURL(file))
  }

  const previewImage = newImage || existingImage
  const dark = textColor === "dark"

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form action={formAction} className="flex flex-col gap-6">
        {isEdit && <input type="hidden" name="id" value={banner!.id} />}
        <input type="hidden" name="existing_image" value={existingImage} />

        <section className="flex flex-col gap-4 rounded-card border border-border p-6">
          <h2 className="text-lg font-bold">Содержимое</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="title" className={labelBase}>Название баннера</label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className={inputBase}
              placeholder="напр. Dyson Airwrap"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="subtitle" className={labelBase}>Подзаголовок</label>
            <textarea
              id="subtitle"
              name="subtitle"
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              rows={3}
              className={`${inputBase} h-auto py-3`}
              placeholder="Каждая строка — с новой строки"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="href" className={labelBase}>Ссылка при клике</label>
            <input
              id="href"
              name="href"
              defaultValue={banner?.href}
              className={inputBase}
              placeholder="/catalog?category=laptops"
            />
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-card border border-border p-6">
          <h2 className="text-lg font-bold">Оформление</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="bg_color" className={labelBase}>Цвет фона</label>
              <div className="flex items-center gap-3">
                <input
                  id="bg_color"
                  type="color"
                  value={bgColor}
                  onChange={(event) => setBgColor(event.target.value)}
                  className="h-12 w-14 shrink-0 cursor-pointer rounded-lg border border-border"
                  aria-label="Цвет фона"
                />
                <input
                  name="bg_color"
                  value={bgColor}
                  onChange={(event) => setBgColor(event.target.value)}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="text_color" className={labelBase}>Цвет текста</label>
              <select
                id="text_color"
                name="text_color"
                value={textColor}
                onChange={(event) => setTextColor(event.target.value as "light" | "dark")}
                className={inputBase}
              >
                <option value="light">Светлый (на тёмном фоне)</option>
                <option value="dark">Тёмный (на светлом фоне)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={labelBase}>Изображение</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                <Upload size={16} />
                Загрузить фото
              </button>
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setExistingImage("")
                    setNewImage("")
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-red-600"
                >
                  <X size={15} />
                  Убрать
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={onPickFile}
              className="hidden"
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              name="is_visible"
              defaultChecked={banner?.isVisible ?? true}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Показывать на сайте
          </label>
        </section>

        {state.error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <div>
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
                {isEdit ? "Сохранить" : "Создать баннер"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Живое превью слайда */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className={`${labelBase} mb-2`}>Предпросмотр баннера</p>
        <div className="aspect-[16/9] w-full max-w-[320px] overflow-hidden rounded-2xl border border-border shadow-md" style={{ backgroundColor: bgColor }}>
          {previewImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewImage}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
              Загрузите фото баннера
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
