"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Banner } from "@/lib/banners/types"

const defaultBanners: Banner[] = [
  {
    id: "dyson-hero",
    title: "Инновационная техника Dyson",
    subtitle: "Мощь, стиль и безупречный результат в каждом устройстве",
    bgColor: "#0F172A",
    textColor: "light",
    image: "/banners/dyson.png",
    href: "/catalog?brand=Dyson",
    isVisible: true,
    sort: 1,
  },
  {
    id: "smartphone-hero",
    title: "Новый флагманский уровень",
    subtitle: "Смартфоны последнего поколения по лучшим ценам",
    bgColor: "#1E293B",
    textColor: "light",
    image: "/banners/smartphones.png",
    href: "/catalog?category=smartphones",
    isVisible: true,
    sort: 2,
  },
  {
    id: "laptop-hero",
    title: "Мощность без компромиссов",
    subtitle: "Профессиональные ноутбуки для работы и творчества",
    bgColor: "#0F172A",
    textColor: "light",
    image: "/banners/laptops.png",
    href: "/catalog?category=laptops",
    isVisible: true,
    sort: 3,
  },
  {
    id: "audio-hero",
    title: "Погружение в звук",
    subtitle: "Наушники с умным активным шумоподавлением",
    bgColor: "#18181B",
    textColor: "light",
    image: "/banners/audio.png",
    href: "/catalog?category=audio",
    isVisible: true,
    sort: 4,
  },
]

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const displayBanners = banners && banners.length > 0 ? banners : defaultBanners
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-play slider every 5 seconds
  useEffect(() => {
    if (isPaused || displayBanners.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, displayBanners.length])

  if (displayBanners.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayBanners.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayBanners.length)
  }

  return (
    <section
      aria-label="Баннеры и акции"
      className="group relative w-full overflow-hidden rounded-3xl bg-[#0F172A] shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Slide Container */}
      <div className="relative h-56 w-full sm:h-72 md:h-80 lg:h-96">
        {displayBanners.map((banner, index) => {
          const isActive = index === currentIndex
          const darkText = banner.textColor === "dark"

          const slideContent = (
            <div className="relative h-full w-full overflow-hidden" style={{ backgroundColor: banner.bgColor }}>
              {/* Full Image background / banner graphic */}
              {banner.image && (
                <div className="absolute inset-0">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-cover object-center"
                  />
                  {/* Subtle dark gradient overlay on left for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent md:w-3/4" />
                </div>
              )}

              {/* Text overlay */}
              <div
                className={`relative z-10 flex h-full max-w-xl flex-col justify-center p-6 sm:p-10 md:p-12 ${
                  darkText ? "text-slate-900" : "text-white"
                }`}
              >
                <span className="mb-2 inline-flex w-fit rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground backdrop-blur-md">
                  Акция
                </span>
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="mt-2 text-sm font-medium leading-relaxed opacity-90 sm:text-base md:text-lg">
                    {banner.subtitle}
                  </p>
                )}
                {banner.href && (
                  <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-md transition-transform hover:scale-105 sm:text-sm">
                    Подробнее
                  </span>
                )}
              </div>
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

      {/* Navigation Buttons (Left & Right arrows) */}
      {displayBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущий баннер"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 group-hover:opacity-100 sm:left-4 sm:h-12 sm:w-12"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующий баннер"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-black/70 group-hover:opacity-100 sm:right-4 sm:h-12 sm:w-12"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicator Pagination Dots */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
            {displayBanners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
