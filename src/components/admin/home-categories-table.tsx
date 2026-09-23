"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import type { HomeCategoryCard } from "@/lib/home-categories/types"
import {
  deleteHomeCategoryCard,
  toggleHomeCategoryCardVisibility,
} from "@/app/admin/home-category-actions"

export function HomeCategoriesTable({
  cards,
}: {
  cards: HomeCategoryCard[]
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleToggle = async (id: string, current: boolean) => {
    setLoadingId(id)
    try {
      await toggleHomeCategoryCardVisibility(id, !current)
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Удалить карточку «${title}»?`)) return
    setLoadingId(id)
    try {
      await deleteHomeCategoryCard(id)
    } finally {
      setLoadingId(null)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-muted-foreground">Карточек пока нет</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Создайте первую карточку для карусели на главной странице
        </p>
        <Link
          href="/admin/home-categories/new"
          className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:brightness-110"
        >
          <Plus size={16} />
          Добавить карточку
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3.5">Фото</th>
              <th className="px-4 py-3.5">Название</th>
              <th className="px-4 py-3.5">Категория</th>
              <th className="px-4 py-3.5">Цена</th>
              <th className="px-4 py-3.5">Ссылка</th>
              <th className="px-4 py-3.5 text-center">Порядок</th>
              <th className="px-4 py-3.5 text-center">Видимость</th>
              <th className="px-4 py-3.5 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cards.map((card) => {
              const isLoading = loadingId === card.id
              return (
                <tr
                  key={card.id}
                  className={`transition-colors hover:bg-muted/40 ${
                    !card.isVisible ? "opacity-60 bg-muted/20" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/40">
                      {card.image ? (
                        <Image
                          src={card.image}
                          alt={card.title}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          Нет фото
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {card.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      {card.categoryLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {card.priceFrom || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">
                    <a
                      href={card.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-primary hover:underline"
                    >
                      {card.href}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">
                    {card.sort}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggle(card.id, card.isVisible)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        card.isVisible
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                      title={card.isVisible ? "Скрыть карточку" : "Показать карточку"}
                    >
                      {card.isVisible ? (
                        <>
                          <Eye size={13} />
                          Видна
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} />
                          Скрыта
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/home-categories/${card.id}/edit`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Редактировать"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleDelete(card.id, card.title)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
