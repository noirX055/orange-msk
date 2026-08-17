"use client"

import { useRef } from "react"
import { ORDER_STATUS, type OrderStatus } from "@/lib/account/types"
import { updateOrderStatus } from "@/app/admin/actions"

const statuses = Object.keys(ORDER_STATUS) as OrderStatus[]

export function StatusSelect({ id, status }: { id: string; status: OrderStatus }) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={updateOrderStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-9 rounded-lg border border-border bg-muted/50 px-3 text-xs font-medium outline-none transition-colors focus:border-primary"
      >
        {statuses.map((value) => (
          <option key={value} value={value}>
            {ORDER_STATUS[value].label}
          </option>
        ))}
      </select>
    </form>
  )
}
