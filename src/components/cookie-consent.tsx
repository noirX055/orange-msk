"use client"

import { useEffect, useState } from "react"
import { Cookie, X } from "lucide-react"

const COOKIE_CONSENT_KEY = "orange_cookie_consent"

export function CookieConsent() {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const acceptedStorage = localStorage.getItem(COOKIE_CONSENT_KEY)
      const acceptedCookie = typeof document !== "undefined" && document.cookie.includes(`${COOKIE_CONSENT_KEY}=accepted`)

      if (!acceptedStorage && !acceptedCookie) {
        // Показываем с плавной небольшой задержкой после загрузки страницы
        const timer = setTimeout(() => setIsVisible(true), 700)
        return () => clearTimeout(timer)
      }
    } catch {
      // Игнорируем ошибки при отключенном хранилище
    }
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
      document.cookie = `${COOKIE_CONSENT_KEY}=accepted; path=/; max-age=31536000; SameSite=Lax`
    } catch {
      // Игнорируем ошибки
    }
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!mounted || !isVisible) {
    return null
  }

  return (
    <div
      role="region"
      aria-label="Уведомление об использовании файлов cookie"
      className="fixed bottom-20 left-3 right-3 z-[55] animate-in fade-in slide-in-from-bottom-5 duration-300 md:bottom-6 md:left-6 md:right-auto md:max-w-md"
    >
      <div className="relative flex flex-col gap-3.5 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-2xl backdrop-blur-xl md:p-5">
        {/* Кнопка закрытия */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Закрыть уведомление"
          className="absolute right-3 top-3 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={16} />
        </button>

        {/* Заголовок с иконкой */}
        <div className="flex items-center gap-2.5 pr-6">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cookie size={18} className="text-primary" />
          </div>
          <span className="text-sm font-bold text-foreground">
            Мы используем файлы cookie
          </span>
        </div>

        {/* Описание */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          Файлы cookie помогают нам персонализировать сайт, сохранять ваши товары в корзине и анализировать трафик для улучшения сервиса. Продолжая пользоваться сайтом, вы соглашаетесь на их использование.
        </p>

        {/* Кнопки действий */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-center text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            Принять и продолжить
          </button>
        </div>
      </div>
    </div>
  )
}
