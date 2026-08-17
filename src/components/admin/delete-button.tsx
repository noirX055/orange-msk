"use client"

import { Trash2 } from "lucide-react"

export function DeleteButton({
  confirmText = "Удалить?",
  label = "Удалить",
}: {
  confirmText?: string
  label?: string
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault()
      }}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <Trash2 size={16} />
    </button>
  )
}
