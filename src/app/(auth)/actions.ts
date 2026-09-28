"use server"

import { getAdminClient } from "@/lib/supabase/admin"
import {
  sendPasswordResetEmail,
  sendVerificationCodeEmail,
  type SendEmailResult,
} from "@/lib/email"

export type RegisterResult = {
  ok: boolean
  error?: string
}

export type PasswordResetResult = {
  ok: boolean
  error?: string
}

/**
 * Регистрация пользователя на стороне сервера с автоматическим подтверждением email.
 * Обходит SMTP-отправку писем в GoTrue/Supabase, что критично для self-hosted Supabase.
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

/**
 * Запрос на сброс пароля: формирует безопасную ссылку через Supabase Admin API
 * и отправляет фирменное письмо через настроенный SMTP (Selectel)
 */
export async function requestPasswordReset(email: string): Promise<PasswordResetResult> {
  const trimmedEmail = email.trim().toLowerCase()
  if (!trimmedEmail) {
    return { ok: false, error: "Укажите адрес электронной почты" }
  }

  try {
    const supabaseAdmin = getAdminClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://orangemsk.ru"

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: trimmedEmail,
      options: {
        redirectTo: `${siteUrl}/reset-password`,
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes("not found")) {
        // Защита от перебора: возвращаем успех, даже если пользователя нет
        return { ok: true }
      }
      return { ok: false, error: error.message }
    }

    const actionLink = data?.properties?.action_link
    if (!actionLink) {
      return { ok: false, error: "Не удалось сформировать ссылку для сброса пароля" }
    }

    const userName = data.user?.user_metadata?.full_name || undefined

    const emailRes = await sendPasswordResetEmail({
      email: trimmedEmail,
      resetUrl: actionLink,
      userName,
    })

    if (!emailRes.success) {
      return { ok: false, error: emailRes.error || "Не удалось отправить письмо" }
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Password reset request error:", err)
    return { ok: false, error: err?.message || "Ошибка сервера" }
  }
}

/**
 * Отправка произвольного 6-значного кода верификации
 */
export async function sendEmailVerificationCode({
  email,
  userName,
  actionType = "подтверждения",
}: {
  email: string
  userName?: string
  actionType?: string
}): Promise<SendEmailResult & { code?: string }> {
  const trimmedEmail = email.trim().toLowerCase()
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  const result = await sendVerificationCodeEmail({
    email: trimmedEmail,
    code,
    userName,
    actionType,
  })

  return {
    ...result,
    code: result.success ? code : undefined,
  }
}
