"use server"

import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    throw new Error("Supabase URL или Service Role Key не заданы в переменных окружения")
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export type RegisterResult = {
  ok: boolean
  error?: string
}

/**
 * Регистрация пользователя на стороне сервера с автоматическим подтверждением email.
 * Обходит SMTP-отправку писем в GoTrue/Supabase, что критично для self-hosted Supabase без почтового сервера.
 */
export async function registerUser({
  name,
  email,
  password,
}: {
  name: string
  email: string
  password: string
}): Promise<RegisterResult> {
  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()

  if (!trimmedEmail || !password) {
    return { ok: false, error: "Заполните все обязательные поля" }
  }

  if (password.length < 6) {
    return { ok: false, error: "Пароль должен содержать не менее 6 символов" }
  }

  try {
    const supabaseAdmin = getAdminClient()

    // 1. Создание пользователя через Admin API с автоподтверждением email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: trimmedName,
        role: "user",
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return { ok: false, error: "Пользователь с таким email уже зарегистрирован." }
      }
      return { ok: false, error: error.message }
    }

    if (!data.user) {
      return { ok: false, error: "Не удалось создать аккаунт" }
    }

    // 2. Создание профиля в таблице profiles
    try {
      await supabaseAdmin.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: trimmedName,
          role: "user",
        },
        { onConflict: "id" }
      )
    } catch (profileErr) {
      console.warn("Could not upsert profile:", profileErr)
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Register error:", err)
    return { ok: false, error: err?.message || "Ошибка сервера при регистрации" }
  }
}

/**
 * Автоматическое подтверждение существующего аккаунта (если был создан ранее без подтверждения)
 */
export async function confirmExistingUser(email: string): Promise<boolean> {
  try {
    const supabaseAdmin = getAdminClient()
    const { data } = await supabaseAdmin.auth.admin.listUsers()
    const user = data?.users.find((u) => u.email?.toLowerCase() === email.trim().toLowerCase())
    if (user && !user.email_confirmed_at) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      })
      return true
    }
  } catch (e) {
    console.warn("Error auto-confirming user:", e)
  }
  return false
}
