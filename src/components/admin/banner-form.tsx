"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Save, Upload, X, Link as LinkIcon, Smartphone, Monitor } from "lucide-react"
import { createBanner, updateBanner, type BannerActionState } from "@/app/admin/banner-actions"
import type { Banner } from "@/lib/banners/types"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"
const labelBase = "text-[0.85rem] font-bold text-foreground/90"

const initial: BannerActionState = { ok: false }

export function BannerForm({ banner }: { banner?: Banner }) {
  const isEdit = Boolean(banner)
  const action = isEdit ? updateBanner : createBanner
  const [state, formAction, pending] = useActionState(action, initial)

  const [existingImage, setExistingImage] = useState(banner?.image ?? "")
  const [newImage, setNewImage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [existingMobileImage, setExistingMobileImage] = useState(banner?.imageMobile ?? "")
  const [newMobileImage, setNewMobileImage] = useState<string>("")
  const mobileFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (newImage) URL.revokeObjectURL(newImage)
      if (newMobileImage) URL.revokeObjectURL(newMobileImage)
    }
  }, [newImage, newMobileImage])

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setNewImage(URL.createObjectURL(file))
  }

  function onPickMobileFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setNewMobileImage(URL.createObjectURL(file))
  }

  const previewImage = newImage || existingImage
  const previewMobileImage = newMobileImage || existingMobileImage

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <form action={formAction} className="flex flex-col gap-6">
        {isEdit && <input type="hidden" name="id" value={banner!.id} />}
        <input type="hidden" name="existing_image" value={existingImage} />
        <input type="hidden" name="existing_image_mobile" value={existingMobileImage} />
        <input type="hidden" name="title" value={banner?.title || "Баннер"} />

        <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold">Настройки баннера</h2>

          {/* 1. Десктопное фото */}
          <div className="flex flex-col gap-3">
            <label className={labelBase}>
              <span className="flex items-center gap-1.5">
                <Monitor size={16} className="text-primary" />
                Фото баннера для ПК (Десктоп) *
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-5 py-2.5 text-sm font-semibold transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                <Upload size={18} />
                {previewImage ? "Заменить фото ПК" : "Загрузить фото ПК"}
              </button>
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setExistingImage("")
                    setNewImage("")
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <X size={16} />
                  Удалить
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
            <p className="text-xs text-muted-foreground">
              Размер для ПК: <strong>2400 × 770 px</strong> (пропорция 3.1:1).
            </p>
          </div>

          {/* 2. Мобильное фото */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-muted/30 p-4">
            <label className={labelBase}>
              <span className="flex items-center gap-1.5">
                <Smartphone size={16} className="text-primary" />
                Фото баннера для смартфонов (Мобильное фото)
              </span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => mobileFileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold transition-all hover:border-primary hover:text-primary dark:bg-card"
              >
                <Upload size={18} />
                {previewMobileImage ? "Заменить фото для телефонов" : "Загрузить фото для телефонов"}
              </button>
              {previewMobileImage && (
                <button
                  type="button"
                  onClick={() => {
                    setExistingMobileImage("")
                    setNewMobileImage("")
                    if (mobileFileInputRef.current) mobileFileInputRef.current.value = ""
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <X size={16} />
                  Удалить
                </button>
              )}
            </div>
            <input
              ref={mobileFileInputRef}
              type="file"
              name="image_mobile"
              accept="image/*"
              onChange={onPickMobileFile}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">
              Размер для телефонов: <strong>1080 × 675 px</strong> (пропорция 16:10) или <strong>1080 × 1080 px</strong>. Если не загружено, используется версия для ПК.
            </p>
          </div>

          {/* 3. Ссылка URL */}
          <div className="flex flex-col gap-2">
            <label htmlFor="href" className={labelBase}>
              <span className="flex items-center gap-1.5">
                <LinkIcon size={16} className="text-primary" />
                Ссылка перехода (URL)
              </span>
            </label>
            <input
              id="href"
              name="href"
              defaultValue={banner?.href}
              className={inputBase}
              placeholder="напр. /catalog?category=smartphones или https://..."
            />
          </div>

          {/* 4. Флаг видимости */}
          <label className="mt-2 flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="is_visible"
              defaultChecked={banner?.isVisible ?? true}
              className="h-4 w-4 rounded accent-primary"
            />
            Показывать баннер на сайте
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
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-navy px-8 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/20 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-foreground/30 border-t-navy-foreground" />
            ) : (
              <>
                <Save size={16} />
                {isEdit ? "Сохранить изменения" : "Создать баннер"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Живой предпросмотр */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <div>
          <p className={`${labelBase} mb-1.5 flex items-center gap-1.5`}>
            <Monitor size={15} /> ПК версия (Десктоп)
          </p>
          <div className="aspect-[16/5] w-full overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm">
            {previewImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewImage}
                alt="Превью ПК"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                Фото ПК не загружено
              </div>
            )}
          </div>
        </div>

        <div>
          <p className={`${labelBase} mb-1.5 flex items-center gap-1.5`}>
            <Smartphone size={15} /> Мобильная версия (Смартфоны)
          </p>
          <div className="aspect-[16/10] w-full max-w-[200px] overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm">
            {previewMobileImage || previewImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewMobileImage || previewImage}
                alt="Превью Телефон"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                Мобильное фото не загружено
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
