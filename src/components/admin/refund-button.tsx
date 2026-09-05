"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { refundOrder, type AdminActionState } from "@/app/admin/actions"
import { ConfirmSubmit } from "@/components/admin/confirm-submit"
import { formatPrice } from "@/lib/products"

const initialState: AdminActionState = { ok: false }

function SubmitButton({ total }: { total: number }) {
  const { pending } = useFormStatus()

  return (
    <ConfirmSubmit
      confirmText={`Оформить полный возврат ${formatPrice(total)}? Деньги вернутся покупателю, чек возврата отправит ЮKassa.`}
      className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-purple-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        `Вернуть ${formatPrice(total)}`
      )}
    </ConfirmSubmit>
  )
}

export function RefundButton({ orderId, total }: { orderId: string; total: number }) {
  const [state, action] = useActionState(refundOrder, initialState)

  return (
    <form action={action} className="rounded-card border border-purple-200 bg-purple-50/50 p-5">
      <input type="hidden" name="id" value={orderId} />
      <h2 className="font-bold text-purple-900">Возврат оплаты</h2>
      <p className="mt-1 text-xs leading-relaxed text-purple-900/80">
        Полный возврат через ЮKassa. Чек возврата сформируется автоматически и отправится
        покупателю на email.
      </p>
      <SubmitButton total={total} />
      {state.error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && state.message && (
        <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          {state.message}
        </p>
      )}
    </form>
  )
}
