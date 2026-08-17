"use client"

import { useActionState } from "react"
import { Check } from "lucide-react"
import { updateProfile, type ActionState } from "@/app/account/actions"

const inputBase =
  "h-12 w-full rounded-xl border border-border bg-muted/50 px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(245,150,12,0.12)]"

const initial: ActionState = { ok: false }

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string
  phone: string
  email: string
}) {
  const [state, formAction, pending] = useActionState(updateProfile, initial)

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="full_name" className="text-[0.8rem] font-semibold text-foreground/80">
          Имя
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={fullName}
          placeholder="Иван Иванов"
          autoComplete="name"
          className={inputBase}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className="text-[0.8rem] font-semibold text-foreground/80">
          Телефон
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={phone}
          placeholder="+7 (900) 000-00-00"
          autoComplete="tel"
          inputMode="tel"
          className={inputBase}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[0.8rem] font-semibold text-foreground/80">
          Email
        </label>
        <input
          id="email"
          value={email}
          disabled
          className={`${inputBase} cursor-not-allowed opacity-60`}
        />
        <p className="text-xs text-muted-foreground/70">Email нельзя изменить</p>
      </div>

      {state.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check size={16} />
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-fit items-center justify-center rounded-xl bg-navy px-8 text-sm font-semibold text-navy-foreground shadow-lg shadow-navy/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy-foreground/30 border-t-navy-foreground" />
        ) : (
          "Сохранить"
        )}
      </button>
    </form>
  )
}
