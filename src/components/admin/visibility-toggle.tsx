"use client"

import { useState, useTransition, useEffect } from "react"
import { toggleProductVisibility } from "@/app/admin/actions"

// Ползунок видимости товара на витрине с мгновенной плавной анимацией
export function VisibilityToggle({ id, visible }: { id: string; visible: boolean }) {
  const [currentVisible, setCurrentVisible] = useState(visible)
  const [isPending, startTransition] = useTransition()

  // Синхронизируем, если данные обновились на сервере
  useEffect(() => {
    setCurrentVisible(visible)
  }, [visible])

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isPending) return

    const nextState = !currentVisible
    // Мгновенный отклик в интерфейсе
    setCurrentVisible(nextState)

    startTransition(async () => {
      const formData = new FormData()
      formData.append("id", id)
      formData.append("visible", nextState ? "1" : "0")
      try {
        await toggleProductVisibility(formData)
      } catch (err) {
        // Если ошибка — возвращаем прежнее состояние
        setCurrentVisible(!nextState)
      }
    })
  }

  return (
    <button
      type="button"
      role="switch"
      onClick={handleToggle}
      disabled={isPending}
      aria-checked={currentVisible}
      aria-label={currentVisible ? "Скрыть товар с витрины" : "Показать товар на витрине"}
      title={currentVisible ? "Виден на витрине (нажмите, чтобы скрыть)" : "Скрыт с витрины (нажмите, чтобы показать)"}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        currentVisible ? "bg-primary" : "bg-border"
      } ${isPending ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${
          currentVisible ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}
