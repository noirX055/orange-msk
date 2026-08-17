"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Banner } from "@/lib/banners/types"

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  if (banners.length === 0) return null

  const scroll = (direction: number) => {
    const track = trackRef.current
    if (!track) return
    track.scrollBy({ left: track.clientWidth * 0.8 * direction, behavior: "smooth" })
  }

  return (
    <section aria-label="Акции и предложения" className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {banners.map((banner, index) => {
          const dark = banner.textColor === "dark"

          const tile = (
            <div
              className="relative flex h-full w-full flex-col overflow-hidden rounded-card transition-transform duration-300 hover:-translate-y-0.5"
              style={{ backgroundColor: banner.bgColor }}
            >
              {/* Мягкое свечение сверху — объём, как на референсе */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_45%)]" />

              {/* Фото товара: крупно, прижато к низу, с лёгким выходом за край */}
              {banner.image && (
                <div className="pointer-events-none absolute inset-x-3 -bottom-[3%] top-[34%]">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    sizes="300px"
                    priority={index === 0}
                    className="object-contain object-bottom"
                  />
                </div>
              )}

              {/* Текст поверх фото */}
              <div className={`relative z-10 flex flex-col gap-2 p-6 ${dark ? "text-navy" : "text-white"}`}>
                <h3 className="text-2xl font-bold leading-tight tracking-tight text-balance">
                  {banner.title}
                </h3>
                {banner.subtitle && (
                  <p className="whitespace-pre-line text-sm font-medium leading-relaxed opacity-90">
                    {banner.subtitle}
                  </p>
                )}
              </div>
            </div>
          )

          return (
            <div
              key={banner.id}
              className="aspect-[3/4.2] w-[240px] shrink-0 snap-start sm:w-[264px] lg:w-[290px]"
            >
              {banner.href ? (
                <Link href={banner.href} className="block h-full">
                  {tile}
                </Link>
              ) : (
                tile
              )}
            </div>
          )
        })}
      </div>

      {/* Стрелки по бокам (как на референсе) */}
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Прокрутить назад"
        className="absolute -left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-navy shadow-md transition-colors hover:border-primary hover:text-primary md:-left-4"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Прокрутить вперёд"
        className="absolute -right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-navy shadow-md transition-colors hover:border-primary hover:text-primary md:-right-4"
      >
        <ChevronRight size={20} />
      </button>
    </section>
  )
}
