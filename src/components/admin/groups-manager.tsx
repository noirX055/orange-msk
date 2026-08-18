"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, X, Save } from "lucide-react"
import { createGroup, updateGroup, deleteGroup } from "@/app/admin/actions"

type Brand = { id: number; name: string }
type Category = { slug: string; name: string }
type Group = { id: number; name: string; brand_id: number; category_slug: string }

export function GroupsManager({
  initialGroups,
  brands,
  categories,
  fixedBrandId,
}: {
  initialGroups: Group[]
  brands: Brand[]
  categories: Category[]
  fixedBrandId?: number
}) {
  const [editingId, setEditingId] = useState<number | "new" | null>(null)
  const [editName, setEditName] = useState("")
  const [editBrandId, setEditBrandId] = useState<number | "">("")
  const [editCategorySlug, setEditCategorySlug] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEdit = (group: Group) => {
    setEditingId(group.id)
    setEditName(group.name)
    setEditBrandId(group.brand_id)
    setEditCategorySlug(group.category_slug)
    setError("")
  }

  const handleNew = () => {
    setEditingId("new")
    setEditName("")
    setEditBrandId(fixedBrandId || brands[0]?.id || "")
    setEditCategorySlug(categories[0]?.slug || "")
    setError("")
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditName("")
    setEditBrandId("")
    setEditCategorySlug("")
    setError("")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("name", editName)
    formData.append("brand_id", String(editBrandId))
    formData.append("category_slug", editCategorySlug)

    let result
    if (editingId === "new") {
      result = await createGroup({ ok: false }, formData)
    } else {
      formData.append("id", String(editingId))
      result = await updateGroup({ ok: false }, formData)
    }

    if (!result.ok) {
      setError(result.error || "Произошла ошибка")
    } else {
      setEditingId(null)
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить эту группу?")) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(id))
    await deleteGroup(formData)
    setLoading(false)
  }

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
              <th className="px-4 py-3 font-semibold">Название</th>
              {!fixedBrandId && <th className="px-4 py-3 font-semibold">Бренд</th>}
              <th className="px-4 py-3 font-semibold">Категория</th>
              <th className="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialGroups.map((group) => (
              <tr key={group.id} className="transition-colors hover:bg-muted/30">
                {editingId === group.id ? (
                  <td colSpan={fixedBrandId ? 3 : 4} className="px-4 py-3">
                    <form onSubmit={handleSave} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Название (напр. iPhone 16)"
                        className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                        required
                        disabled={loading}
                      />
                      {!fixedBrandId && (
                        <select
                          value={editBrandId}
                          onChange={(e) => setEditBrandId(Number(e.target.value))}
                          className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                          required
                          disabled={loading}
                        >
                          <option value="" disabled>Выберите бренд</option>
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      )}
                      <select
                        value={editCategorySlug}
                        onChange={(e) => setEditCategorySlug(e.target.value)}
                        className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                        required
                        disabled={loading}
                      >
                        <option value="" disabled>Выберите категорию</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
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
                          onClick={handleCancel}
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
                    <td className="px-4 py-3 font-medium">{group.name}</td>
                    {!fixedBrandId && (
                      <td className="px-4 py-3 text-muted-foreground">
                        {brands.find((b) => b.id === group.brand_id)?.name || "Неизвестно"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-muted-foreground">
                      {categories.find((c) => c.slug === group.category_slug)?.name || group.category_slug}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(group)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          disabled={loading}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id)}
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
            ))}

            {editingId === "new" ? (
              <tr className="bg-muted/10">
                <td colSpan={fixedBrandId ? 3 : 4} className="px-4 py-3">
                  <form onSubmit={handleSave} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Название (напр. iPhone 16)"
                      className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                      required
                      disabled={loading}
                    />
                    {!fixedBrandId && (
                      <select
                        value={editBrandId}
                        onChange={(e) => setEditBrandId(Number(e.target.value))}
                        className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                        required
                        disabled={loading}
                      >
                        <option value="" disabled>Выберите бренд</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={editCategorySlug}
                      onChange={(e) => setEditCategorySlug(e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                      required
                      disabled={loading}
                    >
                      <option value="" disabled>Выберите категорию</option>
                      {categories.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
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
                        onClick={handleCancel}
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
                <td colSpan={fixedBrandId ? 3 : 4} className="p-4">
                  <button
                    onClick={handleNew}
                    disabled={loading}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Добавить группу
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
