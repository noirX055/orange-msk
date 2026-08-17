import { MapPin, Star, Trash2 } from "lucide-react"
import { getAddresses } from "@/lib/account/queries"
import { deleteAddress, setDefaultAddress } from "@/app/account/actions"
import { AddressForm } from "./address-form"

export default async function AddressesPage() {
  const addresses = await getAddresses()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Адреса доставки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Сохранённые адреса подставляются при оформлении заказа.
        </p>
      </div>

      {addresses.length > 0 && (
        <ul className="flex flex-col gap-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex items-start gap-4 rounded-card border border-border p-4"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-navy">
                <MapPin size={18} />
              </span>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{address.label || "Адрес"}</span>
                  {address.is_default && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      <Star size={11} className="fill-primary" />
                      По умолчанию
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {address.city}, {address.street}
                  {address.apartment ? `, ${address.apartment}` : ""}
                </p>
                {address.comment && (
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{address.comment}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                {!address.is_default && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="id" value={address.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                    >
                      Сделать основным
                    </button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <button
                    type="submit"
                    aria-label="Удалить адрес"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-card border border-border p-6">
        <AddressForm />
      </div>
    </div>
  )
}
