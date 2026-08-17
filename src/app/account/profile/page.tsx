import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/account/queries"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = await getProfile()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
        <p className="mt-1 text-sm text-muted-foreground">Личные данные для оформления заказов.</p>
      </div>

      <div className="rounded-card border border-border p-6">
        <ProfileForm
          fullName={profile?.full_name ?? ""}
          phone={profile?.phone ?? ""}
          email={user?.email ?? ""}
        />
      </div>
    </div>
  )
}
