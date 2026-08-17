"use client"

export function ConfirmSubmit({
  children,
  confirmText,
  className,
}: {
  children: React.ReactNode
  confirmText: string
  className?: string
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault()
      }}
      className={className}
    >
      {children}
    </button>
  )
}
