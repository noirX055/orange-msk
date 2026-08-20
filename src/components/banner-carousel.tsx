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

  const activeBanners = banners.filter((b) => b.isVisible && Boolean(b.image))

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

  return (
    <section
      aria-label="Баннеры и акции"
      className="group relative w-full overflow-hidden rounded-2xl bg-muted shadow-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Контейнер баннера с закруглением rounded-2xl */}
      <div className="relative h-52 w-full sm:h-72 md:h-88 lg:h-[380px]">
        {activeBanners.map((banner, index) => {
          const isActive = index === currentIndex

          const slideContent = (
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={banner.image}
                alt={banner.title || "Баннер"}
                fill
                priority={index === 0}
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center"
              />
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

      {/* Боковые кнопки-стрелки */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущий баннер"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 group-hover:opacity-100 sm:left-4 sm:h-11 sm:w-11"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующий баннер"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 group-hover:opacity-100 sm:right-4 sm:h-11 sm:w-11"
          >
            <ChevronRight size={22} />
          </button>

          {/* Индикаторы-полоски */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
