"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import type { HomeCategoryCard } from "@/lib/home-categories/types"

export function CategoryCarousel({
  cards,
}: {
  cards: HomeCategoryCard[]
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    window.addEventListener("resize", checkScroll)
    return () => {
      el.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [checkScroll, cards])

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 240 // card width + gap
    const offset = direction === "left" ? -cardWidth * 2 : cardWidth * 2
    el.scrollBy({ left: offset, behavior: "smooth" })
  }

  if (!cards || cards.length === 0) return null

  return (
    <div className="relative group/carousel">
      {/* Кнопка прокрутки влево */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Прокрутить назад"
          className="absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 p-2.5 text-foreground shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:border-primary active:scale-95 sm:flex"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* Кнопка прокрутки вправо */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Прокрутить вперед"
          className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 p-2.5 text-foreground shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:border-primary active:scale-95 sm:flex"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      )}

      {/* Лента карточек */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className="group relative flex h-[350px] w-[210px] shrink-0 snap-start flex-col justify-between rounded-[28px] border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md sm:w-[220px]"
          >
            {/* Верх: категория и название */}
            <div className="flex flex-col items-start">
              <span className="text-xs font-semibold text-muted-foreground/80 tracking-wide">
                {card.categoryLabel}
              </span>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {card.title}
              </h3>
            </div>

            {/* Центр: фото товара */}
            <div className="relative my-auto flex h-[190px] w-full items-center justify-center overflow-hidden">
              {card.image ? (
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="200px"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Нет фото
                </div>
              )}
            </div>

            {/* Низ: цена «от ...» и круглая оранжевая кнопка со стрелкой */}
            <div className="mt-auto flex items-center justify-between pt-1">
              <span className="text-sm font-bold tracking-tight text-foreground">
                {card.priceFrom}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-transform duration-200 group-hover:scale-110 group-hover:shadow-md">
                <ArrowRight size={16} strokeWidth={2.5} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
