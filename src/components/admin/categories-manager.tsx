"use client"

import { Fragment, useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Layers,
  Pencil,
  Plus,
  Save,
  SlidersHorizontal,
  Trash2,
  Unlink,
  X,
} from "lucide-react"
import {
  createCategory,
  createGroup,
  deleteCategory,
  deleteGroup,
  updateCategory,
  updateGroup,
  bulkSetParentGroup,
  renameParentGroup,
  dissolveParentGroup,
  updateGroupAttributes,
} from "@/app/admin/actions"
import type { AdminCategory, AdminGroup } from "@/lib/admin/queries"
import type { ProductAttribute } from "@/lib/admin/attributes-types"
import { CategoryVisibilityToggle } from "@/components/admin/category-visibility-toggle"

type Brand = { id: number; name: string }

type EditingCategory = { id: number | "new"; name: string; slug: string }
type EditingGroup = {
  id: number | "new"
  name: string
  brand_id: number | ""
  category_slug: string
  parent_group: string
}

export function CategoriesManager({
  initialCategories,
  initialGroups,
  brands,
  attributes = [],
}: {
  initialCategories: AdminCategory[]
  initialGroups: AdminGroup[]
  brands: Brand[]
  attributes?: ProductAttribute[]
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null)
  const [editingGroup, setEditingGroup] = useState<EditingGroup | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<Set<number>>(new Set())
  const [bulkParentGroupName, setBulkParentGroupName] = useState("")
  const [renamingParent, setRenamingParent] = useState<{
    category_slug: string
    old_name: string
    new_name: string
  } | null>(null)
  const [attrModal, setAttrModal] = useState<{
    groupId?: number
    groupName: string
    parentGroup?: string
    categorySlug: string
    selectedAttributeIds: number[]
    selectedFilterIds: number[]
    applyToAllInParent: boolean
  } | null>(null)
  const [attrSearch, setAttrSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

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

  const parentGroupsForCategory = (slug: string) =>
    Array.from(
      new Set(
        initialGroups
          .filter((g) => g.category_slug === slug && g.parent_group?.trim())
          .map((g) => g.parent_group!.trim())
      )
    ).sort()

  const toggleSelectGroup = (id: number) => {
    setSelectedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    setLoading(true)
    setError("")
    setMessage("")

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
    else {
      setEditingCategory(null)
      if (result.message) setMessage(result.message)
    }
    setLoading(false)
  }

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("name", editingGroup.name)
    formData.append("brand_id", String(editingGroup.brand_id))
    formData.append("category_slug", editingGroup.category_slug)
    if (editingGroup.parent_group.trim()) {
      formData.append("parent_group", editingGroup.parent_group.trim())
    }

    let result
    if (editingGroup.id === "new") {
      result = await createGroup({ ok: false }, formData)
    } else {
      formData.append("id", String(editingGroup.id))
      result = await updateGroup({ ok: false }, formData)
    }

    if (!result.ok) setError(result.error || "Ошибка сохранения")
    else {
      setEditingGroup(null)
      if (result.message) setMessage(result.message)
    }
    setLoading(false)
  }

  const handleUniteGroups = async (categorySlug: string) => {
    const parentName = bulkParentGroupName.trim()
    if (!parentName) {
      setError("Укажите название общей группы (например, Айфоны)")
      return
    }
    setLoading(true)
    setError("")
    setMessage("")

    const ids = Array.from(selectedGroups).filter((id) => {
      const g = initialGroups.find((item) => item.id === id)
      return g && g.category_slug === categorySlug
    })

    const formData = new FormData()
    formData.append("ids", JSON.stringify(ids))
    formData.append("parent_group", parentName)

    const result = await bulkSetParentGroup({ ok: false }, formData)
    if (!result.ok) {
      setError(result.error || "Ошибка объединения групп")
    } else {
      setMessage(result.message || `Группы объединены в общую группу «${parentName}»`)
      setSelectedGroups(new Set())
      setBulkParentGroupName("")
    }
    setLoading(false)
  }

  const handleRemoveFromParent = async (categorySlug: string) => {
    setLoading(true)
    setError("")
    setMessage("")

    const ids = Array.from(selectedGroups).filter((id) => {
      const g = initialGroups.find((item) => item.id === id)
      return g && g.category_slug === categorySlug
    })

    const formData = new FormData()
    formData.append("ids", JSON.stringify(ids))
    formData.append("parent_group", "")

    const result = await bulkSetParentGroup({ ok: false }, formData)
    if (!result.ok) {
      setError(result.error || "Ошибка удаления из общей группы")
    } else {
      setMessage("Группы убраны из общей группы")
      setSelectedGroups(new Set())
    }
    setLoading(false)
  }

  const handleRenameParent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renamingParent) return
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("category_slug", renamingParent.category_slug)
    formData.append("old_name", renamingParent.old_name)
    formData.append("new_name", renamingParent.new_name.trim())

    const result = await renameParentGroup({ ok: false }, formData)
    if (!result.ok) {
      setError(result.error || "Ошибка переименования")
    } else {
      setMessage(result.message || "Общая группа переименована")
      setRenamingParent(null)
    }
    setLoading(false)
  }

  const handleDissolveParent = async (categorySlug: string, parentName: string) => {
    if (!confirm(`Расформировать общую группу «${parentName}»? Группы товаров останутся, но перестанут быть объединены.`)) {
      return
    }
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    formData.append("category_slug", categorySlug)
    formData.append("parent_group", parentName)

    await dissolveParentGroup(formData)
    setMessage(`Общая группа «${parentName}» расформирована`)
    setLoading(false)
  }

  const handleOpenAttrModalForGroup = (group: AdminGroup) => {
    const attrIds = group.attribute_ids ?? []
    const filterIds =
      group.filter_attribute_ids && group.filter_attribute_ids.length > 0
        ? group.filter_attribute_ids
        : attrIds

    setAttrModal({
      groupId: group.id,
      groupName: group.name,
      parentGroup: group.parent_group ?? undefined,
      categorySlug: group.category_slug,
      selectedAttributeIds: attrIds,
      selectedFilterIds: filterIds,
      applyToAllInParent: false,
    })
    setAttrSearch("")
  }

  const handleOpenAttrModalForParent = (parentName: string, categorySlug: string) => {
    const parentGroups = initialGroups.filter(
      (g) => g.category_slug === categorySlug && g.parent_group === parentName
    )
    const existingAttrIds = parentGroups.find((g) => g.attribute_ids?.length)?.attribute_ids ?? []
    const existingFilterIds =
      parentGroups.find((g) => g.filter_attribute_ids?.length)?.filter_attribute_ids ??
      existingAttrIds

    setAttrModal({
      groupName: `Все группы «${parentName}»`,
      parentGroup: parentName,
      categorySlug,
      selectedAttributeIds: existingAttrIds,
      selectedFilterIds: existingFilterIds,
      applyToAllInParent: true,
    })
    setAttrSearch("")
  }

  const handleSaveAttributes = async () => {
    if (!attrModal) return
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData()
    if (attrModal.groupId) {
      formData.append("group_id", String(attrModal.groupId))
    }
    if (attrModal.parentGroup) {
      formData.append("parent_group", attrModal.parentGroup)
    }
    formData.append("category_slug", attrModal.categorySlug)
    formData.append("attribute_ids", JSON.stringify(attrModal.selectedAttributeIds))
    formData.append("filter_attribute_ids", JSON.stringify(attrModal.selectedFilterIds))
    if (attrModal.applyToAllInParent) {
      formData.append("apply_to_all_in_parent", "1")
    }

    const res = await updateGroupAttributes({ ok: false }, formData)
    if (!res.ok) {
      setError(res.error || "Ошибка сохранения характеристик")
    } else {
      setMessage(res.message || "Характеристики и фильтры группы сохранены")
      setAttrModal(null)
    }
    setLoading(false)
  }

  const filteredAttrs = useMemo(() => {
    if (!attrSearch.trim()) return attributes
    const q = attrSearch.toLowerCase().trim()
    return attributes.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.values?.some((v) => v.label.toLowerCase().includes(q))
    )
  }, [attributes, attrSearch])

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

  const groupForm = (group: EditingGroup) => {
    const parentOpts = parentGroupsForCategory(group.category_slug)
    return (
      <form onSubmit={handleSaveGroup} className="flex flex-wrap items-center gap-2 py-2">
        <input
          type="text"
          value={group.name}
          onChange={(e) => setEditingGroup({ ...group, name: e.target.value })}
          placeholder="Название группы (напр. iPhone 15 Pro)"
          className="h-9 min-w-40 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
          required
          disabled={loading}
        />
        <input
          type="text"
          list={`datalist-parents-${group.category_slug}`}
          value={group.parent_group}
          onChange={(e) => setEditingGroup({ ...group, parent_group: e.target.value })}
          placeholder="Общая группа (напр. Айфоны)"
          className="h-9 min-w-36 flex-1 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary"
          disabled={loading}
        />
        <datalist id={`datalist-parents-${group.category_slug}`}>
          {parentOpts.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
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
            title="Сохранить"
          >
            <Save size={16} />
          </button>
          <button
            type="button"
            onClick={() => setEditingGroup(null)}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
            title="Отмена"
          >
            <X size={16} />
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
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

              const categoryParentNames = Array.from(
                new Set(
                  groups
                    .map((g) => g.parent_group?.trim())
                    .filter((p): p is string => Boolean(p))
                )
              ).sort()
              const standaloneCategoryGroups = groups.filter(
                (g) => !g.parent_group || !g.parent_group.trim()
              )
              const selectedInThisCategory = groups.filter((g) =>
                selectedGroups.has(g.id)
              )

              const renderGroupRow = (group: AdminGroup) => {
                const isSelected = selectedGroups.has(group.id)
                return editingGroup?.id === group.id ? (
                  <div key={group.id}>{groupForm(editingGroup)}</div>
                ) : (
                  <div
                    key={group.id}
                    className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 transition-colors ${
                      isSelected
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectGroup(group.id)}
                        className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                        aria-label={`Выбрать ${group.name}`}
                      />
                      <span className="font-medium truncate">{group.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {brands.find((b) => b.id === group.brand_id)?.name ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAttrModalForGroup(group)}
                        className={`flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors ${
                          (group.attribute_ids?.length ?? 0) > 0
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        title="Настроить характеристики и фильтры каталога для этой группы"
                      >
                        <SlidersHorizontal size={13} />
                        {(group.attribute_ids?.length ?? 0) > 0 ? (
                          <span>
                            {group.attribute_ids?.length} хар.
                            {(group.filter_attribute_ids?.length ?? 0) > 0 && (
                              <span className="ml-1 opacity-75">
                                • {group.filter_attribute_ids?.length} фил.
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>Фильтры и хар-ки</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingGroup({
                            id: group.id,
                            name: group.name,
                            brand_id: group.brand_id,
                            category_slug: group.category_slug,
                            parent_group: group.parent_group ?? "",
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        disabled={loading}
                        title="Редактировать группу"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        disabled={loading}
                        title="Удалить группу"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              }

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
                        <td className="px-4 py-3 text-muted-foreground">
                          {groups.length}
                          {categoryParentNames.length > 0 && (
                            <span className="ml-1.5 text-xs text-muted-foreground/80">
                              ({categoryParentNames.length} общих)
                            </span>
                          )}
                        </td>
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
                      <td colSpan={6} className="px-4 py-3 pl-12">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Группы товаров категории «{category.name}»
                            </p>
                            {groups.length > 1 && (
                              <span className="text-xs text-muted-foreground">
                                Выберите группы чекбоксами для объединения
                              </span>
                            )}
                          </div>

                          {/* Панель массового объединения групп */}
                          {selectedInThisCategory.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
                              <span className="text-xs font-semibold text-primary">
                                Выбрано: {selectedInThisCategory.length}
                              </span>
                              <input
                                type="text"
                                list={`parent-groups-bar-${category.slug}`}
                                value={bulkParentGroupName}
                                onChange={(e) => setBulkParentGroupName(e.target.value)}
                                placeholder="Название общей группы (напр. Айфоны)"
                                className="h-8 min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
                                disabled={loading}
                              />
                              <datalist id={`parent-groups-bar-${category.slug}`}>
                                {categoryParentNames.map((p) => (
                                  <option key={p} value={p} />
                                ))}
                              </datalist>
                              <button
                                type="button"
                                onClick={() => handleUniteGroups(category.slug)}
                                disabled={loading || !bulkParentGroupName.trim()}
                                className="h-8 rounded-lg bg-navy px-3 text-xs font-semibold text-navy-foreground hover:brightness-110 disabled:opacity-50 transition-colors"
                              >
                                Объединить в общую группу
                              </button>
                              {selectedInThisCategory.some((g) => g.parent_group) && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromParent(category.slug)}
                                  disabled={loading}
                                  className="h-8 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                                >
                                  Убрать из общей
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedGroups(new Set())}
                                className="text-xs text-muted-foreground hover:underline ml-auto"
                              >
                                Снять выбор
                              </button>
                            </div>
                          )}

                          {groups.length === 0 && !editingGroup && (
                            <p className="py-2 text-sm text-muted-foreground">В этой категории пока нет групп</p>
                          )}

                          {/* Карточки общих групп */}
                          {categoryParentNames.map((parentName) => {
                            const parentItems = groups.filter(
                              (g) => g.parent_group?.trim() === parentName
                            )
                            const isRenaming =
                              renamingParent?.category_slug === category.slug &&
                              renamingParent?.old_name === parentName

                            return (
                              <div
                                key={parentName}
                                className="rounded-xl border border-border/80 bg-background/90 p-3 shadow-sm"
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 mb-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Folder size={16} className="text-primary shrink-0" />
                                    {isRenaming ? (
                                      <form
                                        onSubmit={handleRenameParent}
                                        className="flex items-center gap-2 flex-1 max-w-sm"
                                      >
                                        <input
                                          type="text"
                                          value={renamingParent.new_name}
                                          onChange={(e) =>
                                            setRenamingParent({
                                              ...renamingParent,
                                              new_name: e.target.value,
                                            })
                                          }
                                          className="h-7 w-full rounded border border-border px-2 text-xs font-semibold outline-none focus:border-primary"
                                          required
                                          autoFocus
                                        />
                                        <button
                                          type="submit"
                                          className="text-xs text-primary hover:underline font-semibold"
                                        >
                                          ОК
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setRenamingParent(null)}
                                          className="text-xs text-muted-foreground hover:underline"
                                        >
                                          Отмена
                                        </button>
                                      </form>
                                    ) : (
                                      <>
                                        <span className="font-semibold text-sm text-foreground truncate">
                                          {parentName}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                                          {parentItems.length} поз.
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {!isRenaming && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenAttrModalForParent(parentName, category.slug)
                                        }
                                        title="Настроить характеристики и фильтры для всех групп этого блока"
                                        className="flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                      >
                                        <SlidersHorizontal size={13} />
                                        <span>Фильтры и хар-ки</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setRenamingParent({
                                            category_slug: category.slug,
                                            old_name: parentName,
                                            new_name: parentName,
                                          })
                                        }
                                        title="Переименовать общую группу"
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDissolveParent(category.slug, parentName)
                                        }
                                        title="Расформировать общую группу"
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Unlink size={13} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-col gap-1 pl-1">
                                  {parentItems.map(renderGroupRow)}
                                </div>
                              </div>
                            )
                          })}

                          {/* Группы без общей группы */}
                          {categoryParentNames.length > 0 && standaloneCategoryGroups.length > 0 && (
                            <div className="mt-1">
                              <p className="text-xs font-semibold text-muted-foreground mb-1.5 pl-1">
                                Другие группы (без общей группы):
                              </p>
                              <div className="flex flex-col gap-1">
                                {standaloneCategoryGroups.map(renderGroupRow)}
                              </div>
                            </div>
                          )}

                          {/* Если нет ни одной общей группы, просто выводим список */}
                          {categoryParentNames.length === 0 && (
                            <div className="flex flex-col gap-1">
                              {groups.map(renderGroupRow)}
                            </div>
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
                                  parent_group: "",
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

      {attrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="text-lg font-bold">Характеристики и фильтры</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Группа: <span className="font-semibold text-foreground">{attrModal.groupName}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttrModal(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              {attrModal.parentGroup && (
                <label className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={attrModal.applyToAllInParent}
                    onChange={(e) =>
                      setAttrModal({ ...attrModal, applyToAllInParent: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <span>Применить сразу ко всем группам в «{attrModal.parentGroup}»</span>
                </label>
              )}

              <input
                type="text"
                value={attrSearch}
                onChange={(e) => setAttrSearch(e.target.value)}
                placeholder="Поиск по названию характеристики..."
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary"
              />

              {/* ── Конфигуратор (спецификации карточки) ── */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Конфигуратор (характеристики в карточке товара)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  Какие характеристики можно переключать в карточке товара (например: Цвет, Память, SIM-карта).
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredAttrs.length === 0 ? (
                    <p className="text-center py-4 text-xs text-muted-foreground">
                      Характеристики не найдены.
                    </p>
                  ) : (
                    filteredAttrs.map((attr) => {
                      const isChecked = attrModal.selectedAttributeIds.includes(attr.id)
                      return (
                        <label
                          key={attr.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                            isChecked
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const next = isChecked
                                  ? attrModal.selectedAttributeIds.filter((id) => id !== attr.id)
                                  : [...attrModal.selectedAttributeIds, attr.id]
                                setAttrModal({
                                  ...attrModal,
                                  selectedAttributeIds: next,
                                  selectedFilterIds: isChecked
                                    ? attrModal.selectedFilterIds.filter((id) => id !== attr.id)
                                    : attrModal.selectedFilterIds,
                                })
                              }}
                              className="h-4 w-4 rounded accent-primary cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{attr.name}</span>
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                  {attr.type === "color" ? "Цвет" : attr.type === "select" ? "Список" : "Текст"}
                                </span>
                              </div>
                              {attr.values && attr.values.length > 0 && (
                                <p className="text-[11px] text-muted-foreground truncate max-w-md mt-0.5">
                                  {attr.values.map((v) => v.label).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          {isChecked && (
                            <span className="text-xs font-semibold text-primary shrink-0">✓</span>
                          )}
                        </label>
                      )
                    })
                  )}
                </div>
              </div>

              {/* ── Фильтры каталога ── */}
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Фильтры каталога (боковая панель)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                  Какие характеристики покупатели смогут использовать для фильтрации в каталоге. Можно выбирать только из характеристик, добавленных в конфигуратор выше.
                </p>
                {attrModal.selectedAttributeIds.length === 0 ? (
                  <p className="text-center py-4 text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                    Сначала выберите характеристики в конфигураторе выше.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {attrModal.selectedAttributeIds.map((attrId) => {
                      const attr = attributes.find((a) => a.id === attrId)
                      if (!attr) return null
                      const isFilter = attrModal.selectedFilterIds.includes(attrId)
                      return (
                        <label
                          key={attrId}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                            isFilter
                              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                              : "border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={isFilter}
                              onChange={() => {
                                const next = isFilter
                                  ? attrModal.selectedFilterIds.filter((id) => id !== attrId)
                                  : [...attrModal.selectedFilterIds, attrId]
                                setAttrModal({ ...attrModal, selectedFilterIds: next })
                              }}
                              className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{attr.name}</span>
                                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
                                  {attr.type === "color" ? "Цвет" : attr.type === "select" ? "Список" : "Текст"}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isFilter && (
                            <span className="text-xs font-semibold text-emerald-600 shrink-0">В фильтрах</span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border p-4 bg-muted/20">
              <div className="text-xs text-muted-foreground space-x-3">
                <span>Конфигуратор: <strong className="text-foreground">{attrModal.selectedAttributeIds.length}</strong></span>
                <span>Фильтры: <strong className="text-emerald-600">{attrModal.selectedFilterIds.length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttrModal(null)}
                  disabled={loading}
                  className="h-9 rounded-lg border border-border px-4 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttributes}
                  disabled={loading}
                  className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-colors disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
