"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Plus, Save, Trash2, X, Pencil } from "lucide-react"
import {
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  updateAttributeValue,
  deleteAttributeValue,
} from "@/app/admin/attribute-actions"
import {
  ATTRIBUTE_TYPE_LABELS,
  type ProductAttribute,
  type ProductAttributeValue,
} from "@/lib/admin/attributes-types"

type Category = { slug: string; name: string }

const inputClass =
  "h-9 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary disabled:opacity-60"

export function AttributeDetail({
  attribute,
  categories,
}: {
  attribute: ProductAttribute
  categories: Category[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // Attribute editing state
  const [editingAttr, setEditingAttr] = useState(false)
  const [attrName, setAttrName] = useState(attribute.name)
  const [attrSlug, setAttrSlug] = useState(attribute.slug)
  const [attrType, setAttrType] = useState<"text" | "select" | "color">(attribute.type)
  const [attrCategory, setAttrCategory] = useState(attribute.category_slug ?? "")
  const [attrSort, setAttrSort] = useState(String(attribute.sort))

  // Value editing state
  const [valueEditing, setValueEditing] = useState<number | "new" | null>(null)
  const [valLabel, setValLabel] = useState("")
  const [valValue, setValValue] = useState("")
  const [valHex, setValHex] = useState("#22303f")
  const [valSort, setValSort] = useState("0")

  function resetValueForm() {
    setValueEditing(null)
    setValLabel("")
    setValValue("")
    setValHex("#22303f")
    setValSort("0")
  }

  function startEditValue(item: ProductAttributeValue) {
    setValueEditing(item.id)
    setValLabel(item.label)
    setValValue(item.value)
    setValHex(item.color_hex ?? "#22303f")
    setValSort(String(item.sort))
    setError("")
    setMessage("")
  }

  function startNewValue() {
    setValueEditing("new")
    setValLabel("")
    setValValue("")
    setValHex("#22303f")
    setValSort(String((attribute.values.length + 1) * 10))
    setError("")
    setMessage("")
  }

  async function saveAttribute(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("id", String(attribute.id))
    formData.append("name", attrName)
    formData.append("slug", attrSlug)
    formData.append("type", attrType)
    formData.append("category_slug", attrCategory)
    formData.append("sort", attrSort)

    const result = await updateAttribute({ ok: false }, formData)

    if (!result.ok) {
      setError(result.error ?? "Ошибка сохранения")
    } else {
      setMessage(result.message ?? "Сохранено")
      setEditingAttr(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function removeAttribute() {
    if (!confirm("Удалить характеристику и все её значения?")) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(attribute.id))
    await deleteAttribute(formData)
    // deleteAttribute redirects to /admin/attributes
  }

  async function saveValue(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("attribute_id", String(attribute.id))
    formData.append("label", valLabel)
    formData.append("value", valValue)
    formData.append("color_hex", valHex)
    formData.append("sort", valSort)

    const result =
      valueEditing === "new"
        ? await createAttributeValue({ ok: false }, formData)
        : (formData.append("id", String(valueEditing)), await updateAttributeValue({ ok: false }, formData))

    if (!result.ok) {
      setError(result.error ?? "Ошибка сохранения")
    } else {
      setMessage(result.message ?? "Сохранено")
      resetValueForm()
      router.refresh()
    }
    setLoading(false)
  }

  async function removeValue(id: number) {
    if (!confirm("Удалить это значение?")) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(id))
    formData.append("attribute_id", String(attribute.id))
    await deleteAttributeValue(formData)
    resetValueForm()
    router.refresh()
    setLoading(false)
  }

  const categoryName =
    categories.find((c) => c.slug === attribute.category_slug)?.name ?? "Все категории"

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>
      )}

      {/* Attribute info / edit section */}
      <section className="rounded-card border border-border p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Параметры характеристики</h2>
          <div className="flex gap-2">
            {!editingAttr && (
              <button
                type="button"
                onClick={() => setEditingAttr(true)}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
              >
                <Pencil size={14} />
                Редактировать
              </button>
            )}
            <button
              type="button"
              onClick={removeAttribute}
              className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 size={14} />
              Удалить
            </button>
          </div>
        </div>

        {editingAttr ? (
          <form onSubmit={saveAttribute}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Название</label>
                <input
                  value={attrName}
                  onChange={(e) => setAttrName(e.target.value)}
                  placeholder="Название (напр. Цвет)"
                  className={inputClass}
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Slug</label>
                <input
                  value={attrSlug}
                  onChange={(e) => setAttrSlug(e.target.value)}
                  placeholder="slug"
                  className={inputClass}
                  disabled={loading}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Тип</label>
                <select
                  value={attrType}
                  onChange={(e) => setAttrType(e.target.value as "text" | "select" | "color")}
                  className={inputClass}
                  disabled={loading}
                >
                  <option value="select">Список значений</option>
                  <option value="color">Цвет (название + RGB)</option>
                  <option value="text">Свободный текст</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Категория</label>
                <select
                  value={attrCategory}
                  onChange={(e) => setAttrCategory(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                >
                  <option value="">Все категории</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Порядок</label>
                <input
                  type="number"
                  value={attrSort}
                  onChange={(e) => setAttrSort(e.target.value)}
                  className={inputClass}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-navy-foreground"
              >
                <Save size={15} />
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAttr(false)
                  setAttrName(attribute.name)
                  setAttrSlug(attribute.slug)
                  setAttrType(attribute.type)
                  setAttrCategory(attribute.category_slug ?? "")
                  setAttrSort(String(attribute.sort))
                }}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-sm"
              >
                <X size={15} />
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-xs text-muted-foreground">Название</span>
              <p className="font-medium">{attribute.name}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Slug</span>
              <p className="font-mono text-xs">{attribute.slug}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Тип</span>
              <p>{ATTRIBUTE_TYPE_LABELS[attribute.type]}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Категория</span>
              <p>{categoryName}</p>
            </div>
          </div>
        )}
      </section>

      {/* Values section */}
      <section className="rounded-card border border-border p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Значения ({attribute.values.length})</h2>
            <p className="text-sm text-muted-foreground">
              {attribute.type === "color"
                ? "Для каждого цвета — название и HEX/RGB для кружка на карточке товара"
                : attribute.type === "select"
                  ? "Варианты для выпадающего списка в карточке товара"
                  : "Тип «текст» — значения в списке не используются"}
            </p>
          </div>
          {attribute.type !== "text" && (
            <button
              type="button"
              onClick={startNewValue}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary"
            >
              <Plus size={14} />
              Добавить значение
            </button>
          )}
        </div>

        {attribute.type === "text" ? (
          <p className="text-sm text-muted-foreground">
            При редактировании товара будет текстовое поле «{attribute.name}».
          </p>
        ) : (
          <>
            {(valueEditing === "new" || typeof valueEditing === "number") && (
              <form onSubmit={saveValue} className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex min-w-[140px] flex-1 flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Название</label>
                    <input
                      value={valLabel}
                      onChange={(e) => setValLabel(e.target.value)}
                      placeholder="Чёрный / 256 ГБ"
                      className={inputClass}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex min-w-[120px] flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Код (slug)</label>
                    <input
                      value={valValue}
                      onChange={(e) => setValValue(e.target.value)}
                      placeholder="black"
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                  {attribute.type === "color" && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-muted-foreground">RGB / HEX</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={valHex}
                          onChange={(e) => setValHex(e.target.value)}
                          className="h-9 w-12 cursor-pointer rounded-lg border border-border"
                          disabled={loading}
                        />
                        <input
                          value={valHex}
                          onChange={(e) => setValHex(e.target.value)}
                          className={`${inputClass} w-28 font-mono text-xs`}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex w-20 flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Порядок</label>
                    <input
                      type="number"
                      value={valSort}
                      onChange={(e) => setValSort(e.target.value)}
                      className={inputClass}
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-9 items-center gap-1 rounded-lg bg-navy px-4 text-sm font-semibold text-navy-foreground"
                  >
                    <Save size={15} />
                    Сохранить
                  </button>
                  <button type="button" onClick={resetValueForm} className="flex h-9 items-center px-3 text-sm">
                    Отмена
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    {attribute.type === "color" && <th className="px-3 py-2">Цвет</th>}
                    <th className="px-3 py-2">Название</th>
                    <th className="px-3 py-2">Код</th>
                    {attribute.type === "color" && <th className="px-3 py-2">HEX</th>}
                    <th className="px-3 py-2">Порядок</th>
                    <th className="px-3 py-2 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {attribute.values.length === 0 && (
                    <tr>
                      <td
                        colSpan={attribute.type === "color" ? 6 : 4}
                        className="px-3 py-6 text-center text-muted-foreground"
                      >
                        Список пуст
                      </td>
                    </tr>
                  )}
                  {attribute.values.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      {attribute.type === "color" && (
                        <td className="px-3 py-2">
                          <span
                            className="inline-block h-7 w-7 rounded-full border border-border shadow-inner"
                            style={{ backgroundColor: item.color_hex ?? "#ccc" }}
                            title={item.color_hex ?? undefined}
                          />
                        </td>
                      )}
                      <td className="px-3 py-2 font-medium">{item.label}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.value}</td>
                      {attribute.type === "color" && (
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.color_hex}</td>
                      )}
                      <td className="px-3 py-2 text-muted-foreground">{item.sort}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startEditValue(item)}
                            className="rounded-full px-2 py-1 text-xs hover:bg-muted"
                          >
                            Изменить
                          </button>
                          <button
                            type="button"
                            onClick={() => removeValue(item.id)}
                            className="rounded-full p-1 text-red-600 hover:bg-red-50"
                            aria-label="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
