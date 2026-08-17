"use client"

import { useState } from "react"
import { AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"

type FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  autoComplete?: string
  inputMode?: "text" | "email" | "numeric"
  required?: boolean
  helper?: string
  password?: boolean
}

export function AuthField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  required,
  helper,
  password,
}: FieldProps) {
  const [show, setShow] = useState(false)
  const resolvedType = password ? (show ? "text" : "password") : type

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[0.8rem] font-semibold text-foreground/80">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={resolvedType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          className={password ? `${inputBase} pr-12` : inputBase}
        />
        {password && (
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={show ? "Скрыть пароль" : "Показать пароль"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {helper && <p className="text-xs text-muted-foreground/70">{helper}</p>}
    </div>
  )
}

export function AuthAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <AlertCircle size={18} className="mt-px shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export function AuthSubmit({
  id,
  loading,
  children,
}: {
  id?: string
  loading: boolean
  children: React.ReactNode
}) {
  return (
    <button
      id={id}
      type="submit"
      disabled={loading}
      className="group mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-navy text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:shadow-xl hover:shadow-navy/30 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-foreground/30 border-t-navy-foreground" />
      ) : (
        <>
          {children}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  )
}
