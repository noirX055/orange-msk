"use server"

import { createClient } from "@supabase/supabase-js"
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
 * 1. Инициация регистрации пользователя:
 * Создает аккаунт с email_confirm = false и отправляет 6-значный код на почту через Selectel SMTP.
 */
export async function startRegistration({
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

    // Проверяем, существует ли уже пользователь
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const existing = listData?.users.find(
      (u) => u.email?.toLowerCase() === trimmedEmail
    )

    // Генерируем 6-значный проверочный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiresAt = Date.now() + 15 * 60 * 1000 // 15 минут

    if (existing) {
      if (existing.email_confirmed_at) {
        return {
          ok: false,
          error: "Пользователь с таким адресом электронной почты уже зарегистрирован.",
        }
      }

      // Если аккаунт был создан, но ещё не подтверждён — обновляем код и пароль
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        existing.id,
        {
          password,
          user_metadata: {
            full_name: trimmedName,
            role: "user",
            verification_code: code,
            code_expires_at: codeExpiresAt,
          },
        }
      )

      if (updateErr) {
        return { ok: false, error: updateErr.message }
      }
    } else {
      // Создаем нового пользователя с email_confirm = false
      const { data: newUser, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: trimmedEmail,
          password,
          email_confirm: false,
          user_metadata: {
            full_name: trimmedName,
            role: "user",
            verification_code: code,
            code_expires_at: codeExpiresAt,
          },
        })

      if (createErr) {
        const msg = createErr.message.toLowerCase()
        if (msg.includes("already registered") || msg.includes("already exists")) {
          return {
            ok: false,
            error: "Пользователь с таким email уже зарегистрирован.",
          }
        }
        return { ok: false, error: createErr.message }
      }

      if (!newUser?.user) {
        return { ok: false, error: "Не удалось создать аккаунт" }
      }
    }

    // Отправляем 6-значный проверочный код на email через настроенный SMTP
    const emailRes = await sendVerificationCodeEmail({
      email: trimmedEmail,
      code,
      userName: trimmedName,
      actionType: "регистрации",
    })

    if (!emailRes.success) {
      console.error("[Auth] Ошибка отправки кода верификации:", emailRes.error)
      return {
        ok: false,
        error: `Не удалось отправить проверочный код: ${emailRes.error || "ошибка почтового сервера"}`,
      }
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Register initiation error:", err)
    return { ok: false, error: err?.message || "Ошибка сервера при регистрации" }
  }
}

/**
 * 2. Проверка кода верификации при регистрации:
 * При совпадении кода подтверждает email_confirm = true и создает профиль.
 */
export async function verifyRegistrationCode({
  email,
  code,
}: {
  email: string
  code: string
}): Promise<RegisterResult> {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedCode = code.trim()

  if (!trimmedEmail || !trimmedCode) {
    return { ok: false, error: "Введите проверочный код" }
  }

  try {
    const supabaseAdmin = getAdminClient()
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const user = listData?.users.find((u) => u.email?.toLowerCase() === trimmedEmail)

    if (!user) {
      return { ok: false, error: "Пользователь не найден. Попробуйте зарегистрироваться заново." }
    }

    const savedCode = user.user_metadata?.verification_code
    const expiresAt = user.user_metadata?.code_expires_at

    if (!savedCode || savedCode !== trimmedCode) {
      return { ok: false, error: "Неверный код подтверждения" }
    }

    if (expiresAt && Date.now() > Number(expiresAt)) {
      return {
        ok: false,
        error: "Срок действия кода истёк. Запросите код повторно.",
      }
    }

    // Подтверждаем email и очищаем проверочный код
    const { error: confirmErr } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          verification_code: null,
          code_expires_at: null,
        },
      }
    )

    if (confirmErr) {
      return { ok: false, error: confirmErr.message }
    }

    // Создаем запись в профилях
    try {
      await supabaseAdmin.from("profiles").upsert(
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || trimmedEmail.split("@")[0],
          role: "user",
        },
        { onConflict: "id" }
      )
    } catch (profileErr) {
      console.warn("Could not upsert profile:", profileErr)
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Verification code error:", err)
    return { ok: false, error: err?.message || "Ошибка сервера при проверке кода" }
  }
}

/**
 * 3. Повторная отправка проверочного кода на email
 */
export async function resendRegistrationCode(email: string): Promise<RegisterResult> {
  const trimmedEmail = email.trim().toLowerCase()

  try {
    const supabaseAdmin = getAdminClient()
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const user = listData?.users.find((u) => u.email?.toLowerCase() === trimmedEmail)

    if (!user) {
      return { ok: false, error: "Пользователь не найден" }
    }

    if (user.email_confirmed_at) {
      return { ok: false, error: "Email уже подтверждён. Вы можете войти в аккаунт." }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const codeExpiresAt = Date.now() + 15 * 60 * 1000

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        verification_code: code,
        code_expires_at: codeExpiresAt,
      },
    })

    const emailRes = await sendVerificationCodeEmail({
      email: trimmedEmail,
      code,
      userName: user.user_metadata?.full_name,
      actionType: "подтверждения почты",
    })

    if (!emailRes.success) {
      return { ok: false, error: emailRes.error || "Не удалось отправить письмо" }
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Resend code error:", err)
    return { ok: false, error: err?.message || "Ошибка сервера" }
  }
}

/**
 * Для обратной совместимости (если где-то вызывается)
 */
export async function registerUser(args: {
  name: string
  email: string
  password: string
}): Promise<RegisterResult> {
  return startRegistration(args)
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
 * Запрос на сброс пароля: формирует ссылку и OTP-код через Supabase Admin API
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
    const emailOtp = data?.properties?.email_otp
    if (!actionLink) {
      return { ok: false, error: "Не удалось сформировать ссылку для сброса пароля" }
    }

    const userName = data.user?.user_metadata?.full_name || undefined

    const emailRes = await sendPasswordResetEmail({
      email: trimmedEmail,
      resetUrl: actionLink,
      code: emailOtp,
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
 * Прямой сброс пароля по 6-значному проверочному коду из письма.
 * Полностью исключает ошибку "Auth session missing", так как валидирует код напрямую на сервере.
 */
export async function resetPasswordWithCode({
  email,
  code,
  newPassword,
}: {
  email: string
  code: string
  newPassword: string
}): Promise<PasswordResetResult> {
  const trimmedEmail = email.trim().toLowerCase()
  const trimmedCode = code.trim()

  if (!trimmedEmail || !trimmedCode || !newPassword) {
    return { ok: false, error: "Заполните все обязательные поля" }
  }

  if (newPassword.length < 6) {
    return { ok: false, error: "Пароль должен содержать не менее 6 символов" }
  }

  try {
    const supabaseAdmin = getAdminClient()
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const user = listData?.users.find((u) => u.email?.toLowerCase() === trimmedEmail)

    if (!user) {
      return { ok: false, error: "Пользователь с таким email не найден" }
    }

    // Проверяем OTP код через Supabase verifyOtp
    const pubKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY
    const client = createClient("https://db.orangemsk.ru", pubKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error: verifyErr } = await client.auth.verifyOtp({
      email: trimmedEmail,
      token: trimmedCode,
      type: "recovery",
    })

    if (verifyErr) {
      console.warn("verifyOtp error:", verifyErr.message)
      return { ok: false, error: "Неверный или истёкший проверочный код. Запросите сброс пароля заново." }
    }

    // Обновляем пароль пользователю через Admin API
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    })

    if (updErr) {
      return { ok: false, error: updErr.message }
    }

    return { ok: true }
  } catch (err: any) {
    console.error("Reset password error:", err)
    return { ok: false, error: err?.message || "Ошибка сервера при смене пароля" }
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
