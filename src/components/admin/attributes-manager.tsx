"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Plus, Save, Trash2, X } from "lucide-react"
import {
  createAttribute,
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

export function AttributesManager({
  initialAttributes,
  categories,
}: {
  initialAttributes: ProductAttribute[]
  categories: Category[]
}) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<number | null>(initialAttributes[0]?.id ?? null)
  const [attrEditing, setAttrEditing] = useState<number | "new" | null>(null)
  const [valueEditing, setValueEditing] = useState<number | "new" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [attrName, setAttrName] = useState("")
  const [attrSlug, setAttrSlug] = useState("")
  const [attrType, setAttrType] = useState<"text" | "select" | "color">("select")
  const [attrCategory, setAttrCategory] = useState("")
  const [attrSort, setAttrSort] = useState("0")

  const [valLabel, setValLabel] = useState("")
  const [valValue, setValValue] = useState("")
  const [valHex, setValHex] = useState("#22303f")
  const [valSort, setValSort] = useState("0")

  const activeAttribute = useMemo(
    () => initialAttributes.find((a) => a.id === expandedId) ?? null,
    [initialAttributes, expandedId],
  )

  function resetAttrForm() {
    setAttrEditing(null)
    setAttrName("")
    setAttrSlug("")
    setAttrType("select")
    setAttrCategory("")
    setAttrSort("0")
  }

  function resetValueForm() {
    setValueEditing(null)
    setValLabel("")
    setValValue("")
    setValHex("#22303f")
    setValSort("0")
  }

  function startEditAttribute(attr: ProductAttribute) {
    setAttrEditing(attr.id)
    setAttrName(attr.name)
    setAttrSlug(attr.slug)
    setAttrType(attr.type)
    setAttrCategory(attr.category_slug ?? "")
    setAttrSort(String(attr.sort))
    setError("")
    setMessage("")
  }

  function startNewAttribute() {
    setAttrEditing("new")
    setAttrName("")
    setAttrSlug("")
    setAttrType("select")
    setAttrCategory("")
    setAttrSort("0")
    setExpandedId(null)
    setError("")
    setMessage("")
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
    if (!activeAttribute) return
    setValueEditing("new")
    setValLabel("")
    setValValue("")
    setValHex("#22303f")
    setValSort(String((activeAttribute.values.length + 1) * 10))
    setError("")
    setMessage("")
  }

  async function saveAttribute(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("name", attrName)
    formData.append("slug", attrSlug)
    formData.append("type", attrType)
    formData.append("category_slug", attrCategory)
    formData.append("sort", attrSort)

    const result =
      attrEditing === "new"
        ? await createAttribute({ ok: false }, formData)
        : (formData.append("id", String(attrEditing)), await updateAttribute({ ok: false }, formData))

    if (!result.ok) {
      setError(result.error ?? "Ошибка сохранения")
    } else {
      setMessage(result.message ?? "Сохранено")
      resetAttrForm()
      router.refresh()
    }
    setLoading(false)
  }

  async function removeAttribute(id: number) {
    if (!confirm("Удалить характеристику и все её значения?")) return
    setLoading(true)
    const formData = new FormData()
    formData.append("id", String(id))
    await deleteAttribute(formData)
    if (expandedId === id) setExpandedId(null)
    resetAttrForm()
    router.refresh()
    setLoading(false)
  }

  async function saveValue(e: React.FormEvent) {
    e.preventDefault()
    if (!activeAttribute) return
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("attribute_id", String(activeAttribute.id))
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
    await deleteAttributeValue(formData)
    resetValueForm()
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {message && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={startNewAttribute}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
        >
          <Plus size={16} />
          Новая характеристика
        </button>
      </div>

      {(attrEditing === "new" || typeof attrEditing === "number") && (
        <form onSubmit={saveAttribute} className="rounded-card border border-primary/30 bg-primary/5 p-4">
          <h3 className="mb-3 font-semibold">
            {attrEditing === "new" ? "Новая характеристика" : "Редактирование"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={attrName}
              onChange={(e) => setAttrName(e.target.value)}
              placeholder="Название (напр. Цвет)"
              className={inputClass}
              required
              disabled={loading}
            />
            <input
              value={attrSlug}
              onChange={(e) => setAttrSlug(e.target.value)}
              placeholder="slug (необязательно)"
              className={inputClass}
              disabled={loading}
            />
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
            <input
              type="number"
              value={attrSort}
              onChange={(e) => setAttrSort(e.target.value)}
              placeholder="Порядок"
              className={inputClass}
              disabled={loading}
            />
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
              onClick={resetAttrForm}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-sm"
            >
              <X size={15} />
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-card border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Характеристика</th>
              <th className="px-4 py-3 font-semibold">Тип</th>
              <th className="px-4 py-3 font-semibold">Категория</th>
              <th className="px-4 py-3 font-semibold">Значений</th>
              <th className="px-4 py-3 text-right font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialAttributes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Характеристик пока нет. Создайте первую или выполните SQL-миграцию.
                </td>
              </tr>
            )}
            {initialAttributes.map((attr) => {
              const isOpen = expandedId === attr.id
              const categoryName =
                categories.find((c) => c.slug === attr.category_slug)?.name ?? "Все"
              return (
                <tr key={attr.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/attributes/${attr.id}`}
                      className="flex items-center gap-2 font-semibold hover:text-primary"
                    >
                      <ChevronRight size={16} />
                      {attr.name}
                    </Link>
                    <p className="mt-0.5 pl-6 text-xs text-muted-foreground">{attr.slug}</p>
                  </td>
                  <td className="px-4 py-3">{ATTRIBUTE_TYPE_LABELS[attr.type]}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryName}</td>
                  <td className="px-4 py-3">{attr.values.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/attributes/${attr.id}`}
                        className="rounded-full px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        Изменить
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeAttribute(attr.id)}
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {activeAttribute && (
        <section className="rounded-card border border-border p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Значения: {activeAttribute.name}</h2>
              <p className="text-sm text-muted-foreground">
                {activeAttribute.type === "color"
                  ? "Для каждого цвета — название и HEX/RGB для кружка на карточке товара"
                  : activeAttribute.type === "select"
                    ? "Варианты для выпадающего списка в карточке товара"
                    : "Тип «текст» — значения в списке не используются"}
              </p>
            </div>
            {activeAttribute.type !== "text" && (
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

          {activeAttribute.type === "text" ? (
            <p className="text-sm text-muted-foreground">
              При редактировании товара будет текстовое поле «{activeAttribute.name}».
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
                    {activeAttribute.type === "color" && (
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
                      {activeAttribute.type === "color" && <th className="px-3 py-2">Цвет</th>}
                      <th className="px-3 py-2">Название</th>
                      <th className="px-3 py-2">Код</th>
                      <th className="px-3 py-2 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {activeAttribute.values.length === 0 && (
                      <tr>
                        <td
                          colSpan={activeAttribute.type === "color" ? 4 : 3}
                          className="px-3 py-6 text-center text-muted-foreground"
                        >
                          Список пуст
                        </td>
                      </tr>
                    )}
                    {activeAttribute.values.map((item) => (
                      <tr key={item.id}>
                        {activeAttribute.type === "color" && (
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
      )}
    </div>
  )
}
