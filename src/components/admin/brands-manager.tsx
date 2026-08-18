"use client"
import Link from "next/link"
import { useState } from "react"
import { Plus, Pencil, Trash2, X, Save, List } from "lucide-react"
import { createBrand, updateBrand, deleteBrand } from "@/app/admin/actions"

type Brand = { id: number; slug: string; name: string }

export function BrandsManager({ initialBrands }: { initialBrands: Brand[] }) {
  const [editingId, setEditingId] = useState<number | "new" | null>(null)
  const [editName, setEditName] = useState("")
  const [editSlug, setEditSlug] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id)
    setEditName(brand.name)
    setEditSlug(brand.slug)
    setError("")
  }

  const handleNew = () => {
    setEditingId("new")
    setEditName("")
    setEditSlug("")
    setError("")
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditName("")
    setEditSlug("")
    setError("")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("name", editName)
    formData.append("slug", editSlug)

    let result
    if (editingId === "new") {
      result = await createBrand({ ok: false }, formData)
    } else {
      formData.append("id", String(editingId))
      result = await updateBrand({ ok: false }, formData)
    }

    if (!result.ok) {
      setError(result.error || "Произошла ошибка")
    } else {
      setEditingId(null)
    }
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот бренд?")) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(id))
    await deleteBrand(formData)
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
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialBrands.map((brand) => (
              <tr key={brand.id} className="transition-colors hover:bg-muted/30">
                {editingId === brand.id ? (
                  <td colSpan={3} className="px-4 py-3">
                    <form onSubmit={handleSave} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Название (напр. Apple)"
                        className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                        required
                        disabled={loading}
                      />
                      <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
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
                    <td className="px-4 py-3 font-medium">{brand.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{brand.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/settings/brands/${brand.id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          title="Группы товаров"
                        >
                          <List size={16} />
                        </Link>
                        <button
                          onClick={() => handleEdit(brand)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          disabled={loading}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
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
                <td colSpan={3} className="px-4 py-3">
                  <form onSubmit={handleSave} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Название (напр. Apple)"
                      className="h-9 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
                      required
                      disabled={loading}
                    />
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      placeholder="Slug (опционально, сгенерируется)"
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
                <td colSpan={3} className="p-4">
                  <button
                    onClick={handleNew}
                    disabled={loading}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Добавить бренд
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
