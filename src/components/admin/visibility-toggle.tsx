"use client"

import { useRef } from "react"
import { toggleProductVisibility } from "@/app/admin/actions"

// Ползунок видимости товара на витрине. При переключении отправляет форму
// с желаемым состоянием (скрытые товары не показываются на сайте).
export function VisibilityToggle({ id, visible }: { id: string; visible: boolean }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={toggleProductVisibility}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="visible" value={visible ? "0" : "1"} />
      <button
        type="submit"
        role="switch"
        aria-checked={visible}
        aria-label={visible ? "Скрыть товар с витрины" : "Показать товар на витрине"}
        title={visible ? "Виден на витрине" : "Скрыт с витрины"}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          visible ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            visible ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </form>
  )
}
