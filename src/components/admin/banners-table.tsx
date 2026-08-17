"use client"

import Link from "next/link"
import { ChevronDown, ChevronUp, Pencil } from "lucide-react"
import type { Banner } from "@/lib/banners/types"
import {
  deleteBanner,
  moveBanner,
  toggleBannerVisibility,
} from "@/app/admin/banner-actions"
import { DeleteButton } from "@/components/admin/delete-button"

export function BannersTable({ banners }: { banners: Banner[] }) {
  if (banners.length === 0) {
    return (
      <p className="rounded-card border border-border px-4 py-12 text-center text-sm text-muted-foreground">
        Баннеров пока нет.{" "}
        <Link href="/admin/banners/new" className="text-primary hover:underline">
          Добавить первый
        </Link>
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-card border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Порядок</th>
            <th className="px-4 py-3 font-semibold">Баннер</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Ссылка</th>
            <th className="px-4 py-3 font-semibold">Показ</th>
            <th className="px-4 py-3 text-right font-semibold">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {banners.map((banner, index) => (
            <tr key={banner.id} className="transition-colors hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="Поднять"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </form>
                  <form action={moveBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button
                      type="submit"
                      disabled={index === banners.length - 1}
                      aria-label="Опустить"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </form>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border text-[10px] font-bold"
                    style={{ backgroundColor: banner.bgColor }}
                  >
                    {banner.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={banner.image} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span className={banner.textColor === "dark" ? "text-navy" : "text-white"}>
                        Aa
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{banner.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{banner.subtitle}</p>
                  </div>
                </div>
              </td>

              <td className="hidden max-w-56 px-4 py-3 md:table-cell">
                <span className="truncate text-xs text-muted-foreground">{banner.href || "—"}</span>
              </td>

              <td className="px-4 py-3">
                <form action={toggleBannerVisibility}>
                  <input type="hidden" name="id" value={banner.id} />
                  <input type="hidden" name="visible" value={banner.isVisible ? "0" : "1"} />
                  <button
                    type="submit"
                    role="switch"
                    aria-checked={banner.isVisible}
                    aria-label={banner.isVisible ? "Скрыть баннер" : "Показать баннер"}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      banner.isVisible ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        banner.isVisible ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </form>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    aria-label="Редактировать"
                  >
                    <Pencil size={16} />
                  </Link>
                  <form action={deleteBanner}>
                    <input type="hidden" name="id" value={banner.id} />
                    <DeleteButton confirmText={`Удалить баннер «${banner.title}»?`} />
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
