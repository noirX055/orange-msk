"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Banner } from "@/lib/banners/types"

export function BannerCarousel({ banners = [] }: { banners?: Banner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const activeBanners = banners.filter((b) => b.isVisible && Boolean(b.image || b.imageMobile))

  // Автопрокрутка слайдера каждые 5 секунд
  useEffect(() => {
    if (isPaused || activeBanners.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, activeBanners.length])

  if (activeBanners.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
  }

  // Нативные touch-жесты для мобильных устройств (свайп пальцем)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false)
    if (touchStartXRef.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchStartXRef.current - touchEndX

    // Порог свайпа 40px
    if (deltaX > 40) {
      handleNext()
    } else if (deltaX < -40) {
      handlePrev()
    }

    touchStartXRef.current = null
  }

  return (
    <section
      aria-label="Баннеры и акции"
      className="group relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-muted shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Адаптивный пропорциональный контейнер: на мобильных 16:10 или 2.2:1 */}
      <div className="relative aspect-[16/10] w-full sm:aspect-auto sm:h-72 md:h-88 lg:h-[380px]">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex

          const slideContent = (
            <div className="relative h-full w-full overflow-hidden">
              {banner.imageMobile ? (
                <>
                  {/* Мобильная версия фото (телефоны < 640px) */}
                  <div className="relative h-full w-full sm:hidden">
                    <Image
                      src={banner.imageMobile}
                      alt={banner.title || "Баннер"}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover object-center"
                    />
                  </div>
                  {/* Десктопная версия фото (ПК >= 640px) */}
                  <div className="relative hidden h-full w-full sm:block">
                    <Image
                      src={banner.image || banner.imageMobile}
                      alt={banner.title || "Баннер"}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover object-center"
                    />
                  </div>
                </>
              ) : (
                <div className="relative h-full w-full">
                  <Image
                    src={banner.image}
                    alt={banner.title || "Баннер"}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-cover object-center"
                  />
                </div>
              )}
            </div>
          )

          return (
            <div
              key={banner.id}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out ${
                isActive ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
              }`}
            >
              {banner.href ? (
                <Link href={banner.href} className="block h-full w-full">
                  {slideContent}
                </Link>
              ) : (
                slideContent
              )}
            </div>
          )
        })}
      </div>

      {/* Боковые кнопки-стрелки (скрыты на мелких экранах, доступны на планшетах/ПК) */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущий баннер"
            className="absolute left-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 group-hover:opacity-100 sm:flex sm:left-4 sm:h-11 sm:w-11"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующий баннер"
            className="absolute right-2 top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 group-hover:opacity-100 sm:flex sm:right-4 sm:h-11 sm:w-11"
          >
            <ChevronRight size={22} />
          </button>

          {/* Индикаторы-точки внизу */}
          <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center gap-1.5 sm:bottom-4 sm:gap-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-6 sm:w-7 bg-white" : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
