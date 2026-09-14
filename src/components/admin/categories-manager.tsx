"use client"

import { Fragment, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"
import {
  createCategory,
  createGroup,
  deleteCategory,
  deleteGroup,
  updateCategory,
  updateGroup,
} from "@/app/admin/actions"
import type { AdminCategory, AdminGroup } from "@/lib/admin/queries"
import { CategoryVisibilityToggle } from "@/components/admin/category-visibility-toggle"

type Brand = { id: number; name: string }

type EditingCategory = { id: number | "new"; name: string; slug: string }
type EditingGroup = {
  id: number | "new"
  name: string
  brand_id: number | ""
  category_slug: string
}

export function CategoriesManager({
  initialCategories,
  initialGroups,
  brands,
}: {
  initialCategories: AdminCategory[]
  initialGroups: AdminGroup[]
  brands: Brand[]
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
  const [editingGroup, setEditingGroup] = useState<EditingGroup | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const groupsForCategory = (slug: string) =>
    initialGroups.filter((g) => g.category_slug === slug)

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("name", editingCategory.name)
    formData.append("slug", editingCategory.slug)

    let result
    if (editingCategory.id === "new") {
      result = await createCategory({ ok: false }, formData)
    } else {
      formData.append("id", String(editingCategory.id))
      result = await updateCategory({ ok: false }, formData)
    }

    if (!result.ok) setError(result.error || "Ошибка сохранения")
    else setEditingCategory(null)
    setLoading(false)
  }

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("name", editingGroup.name)
    formData.append("brand_id", String(editingGroup.brand_id))
    formData.append("category_slug", editingGroup.category_slug)

    let result
    if (editingGroup.id === "new") {
      result = await createGroup({ ok: false }, formData)
    } else {
      formData.append("id", String(editingGroup.id))
      result = await updateGroup({ ok: false }, formData)
    }

    if (!result.ok) setError(result.error || "Ошибка сохранения")
    else setEditingGroup(null)
    setLoading(false)
  }

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Удалить категорию «${name}»?`)) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(id))
    await deleteCategory(formData)
    setLoading(false)
  }

  const handleDeleteGroup = async (id: number, name: string) => {
    if (!confirm(`Удалить группу «${name}»?`)) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(id))
    await deleteGroup(formData)
    setLoading(false)
  }

  const groupForm = (group: EditingGroup) => (
    <form onSubmit={handleSaveGroup} className="flex flex-wrap items-center gap-2 py-2">
      <input
        type="text"
        value={group.name}
        onChange={(e) => setEditingGroup({ ...group, name: e.target.value })}
        placeholder="Название группы"
        className="h-9 min-w-40 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
        required
        disabled={loading}
      />
      <select
        value={group.brand_id}
        onChange={(e) => setEditingGroup({ ...group, brand_id: Number(e.target.value) })}
        className="h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
        required
        disabled={loading}
      >
        <option value="" disabled>
          Бренд
        </option>
        {brands.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <button
          type="submit"
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50"
        >
          <Save size={16} />
        </button>
        <button
          type="button"
          onClick={() => setEditingGroup(null)}
          disabled={loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
        >
          <X size={16} />
        </button>
      </div>
    </form>
  )

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3 font-semibold">Категория</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Slug</th>
              <th className="px-4 py-3 font-semibold">Групп</th>
              <th className="px-4 py-3 font-semibold">Показ</th>
              <th className="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialCategories.map((category) => {
              const isOpen = expanded.has(category.id)
              const groups = groupsForCategory(category.slug)
              const isEditing = editingCategory?.id === category.id

              return (
                <Fragment key={category.id}>
                  <tr className="transition-colors hover:bg-muted/30">
                    {isEditing ? (
                      <td colSpan={6} className="px-4 py-3">
                        <form onSubmit={handleSaveCategory} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, name: e.target.value })
                            }
                            placeholder="Название"
                            className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                            required
                            disabled={loading}
                          />
                          <input
                            type="text"
                            value={editingCategory.slug}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, slug: e.target.value })
                            }
                            placeholder="Slug"
                            className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                            disabled={loading}
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="submit"
                              disabled={loading}
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              disabled={loading}
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => toggleExpand(category.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            aria-label={isOpen ? "Свернуть" : "Развернуть"}
                          >
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        </td>
                        <td className="px-4 py-3 font-medium">{category.name}</td>
                        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                          {category.slug}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{groups.length}</td>
                        <td className="px-4 py-3">
                          <CategoryVisibilityToggle id={category.id} visible={category.is_visible} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingCategory({
                                  id: category.id,
                                  name: category.name,
                                  slug: category.slug,
                                })
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                              disabled={loading}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                              disabled={loading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>

                  {isOpen && !isEditing && (
                    <tr className="bg-muted/20">
                      <td colSpan={6} className="px-4 py-2 pl-12">
                        <div className="flex flex-col gap-1">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Группы товаров
                          </p>

                          {groups.length === 0 && !editingGroup && (
                            <p className="py-2 text-sm text-muted-foreground">Нет групп</p>
                          )}

                          {groups.map((group) =>
                            editingGroup?.id === group.id ? (
                              <div key={group.id}>{groupForm(editingGroup)}</div>
                            ) : (
                              <div
                                key={group.id}
                                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50"
                              >
                                <div className="min-w-0">
                                  <span className="font-medium">{group.name}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {brands.find((b) => b.id === group.brand_id)?.name ?? "—"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingGroup({
                                        id: group.id,
                                        name: group.name,
                                        brand_id: group.brand_id,
                                        category_slug: group.category_slug,
                                      })
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                                    disabled={loading}
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteGroup(group.id, group.name)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                                    disabled={loading}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}

                          {editingGroup?.id === "new" &&
                          editingGroup.category_slug === category.slug ? (
                            groupForm(editingGroup)
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingGroup({
                                  id: "new",
                                  name: "",
                                  brand_id: brands[0]?.id ?? "",
                                  category_slug: category.slug,
                                })
                              }
                              disabled={loading || brands.length === 0}
                              className="mt-1 flex h-9 items-center gap-2 rounded-lg border border-dashed border-border px-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                            >
                              <Plus size={14} />
                              Добавить группу
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}

            {editingCategory?.id === "new" ? (
              <tr className="bg-muted/10">
                <td colSpan={6} className="px-4 py-3">
                  <form onSubmit={handleSaveCategory} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      placeholder="Название категории"
                      className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                      required
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={editingCategory.slug}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, slug: e.target.value })
                      }
                      placeholder="Slug (опционально)"
                      className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                      disabled={loading}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        disabled={loading}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={6} className="p-4">
                  <button
                    type="button"
                    onClick={() => setEditingCategory({ id: "new", name: "", slug: "" })}
                    disabled={loading}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Добавить категорию
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
