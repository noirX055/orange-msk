"use client"

import { useActionState, useEffect, useRef } from "react"
import { Plus } from "lucide-react"
import { addAddress, type ActionState } from "@/app/account/actions"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"

const initial: ActionState = { ok: false }

export function AddressForm() {
  const [state, formAction, pending] = useActionState(addAddress, initial)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Новый адрес</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="label" placeholder="Название (Дом, Работа)" className={inputBase} />
        <input name="city" defaultValue="Москва" placeholder="Город" className={inputBase} />
      </div>

      <input name="street" placeholder="Улица и дом *" className={inputBase} required />

      <div className="grid gap-4 sm:grid-cols-2">
        <input name="apartment" placeholder="Квартира / офис" className={inputBase} />
        <input name="comment" placeholder="Комментарий курьеру" className={inputBase} />
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="is_default" className="h-4 w-4 accent-[var(--primary)]" />
        Сделать адресом по умолчанию
      </label>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-navy px-6 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-foreground/30 border-t-navy-foreground" />
        ) : (
          <>
            <Plus size={16} />
            Добавить адрес
          </>
        )}
      </button>
    </form>
  )
}
