"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

type Banner = {
  id: string
  discount: string
  titleBefore: string
  titleAfter: string
  text: string
  href: string
  image: string
  imageAlt: string
  thumb: string
  thumbTitle: string
  badges: [string, string]
}

const banners: Banner[] = [
  {
    id: "smartphones",
    discount: "50%",
    titleBefore: "Скидка",
    titleAfter: "на коллекцию смартфонов",
    text: "Флагманы Apple, Samsung и Xiaomi в наличии в Москве. Проверяем устройство при вас, доставляем за 2 часа.",
    href: "/catalog?category=smartphones",
    image: "/banners/smartphones.png",
    imageAlt: "Четыре флагманских смартфона в ряд",
    thumb: "/banners/thumb-smartphone.png",
    thumbTitle: "iPhone 16 Pro Edition",
    badges: ["Оригинал", "Гарантия 2 года"],
  },
  {
    id: "laptops",
    discount: "30%",
    titleBefore: "Экономия до",
    titleAfter: "на ноутбуках для работы",
    text: "MacBook, ASUS и Lenovo с процессорами нового поколения. Рассрочка 0% на 24 месяца и настройка в подарок.",
    href: "/catalog?category=laptops",
    image: "/banners/laptops.png",
    imageAlt: "Два тонких алюминиевых ноутбука",
    thumb: "/banners/thumb-laptop.png",
    thumbTitle: "MacBook Air 13 M3",
    badges: ["Рассрочка 0%", "Настройка"],
  },
  {
    id: "audio",
    discount: "40%",
    titleBefore: "Аудиотехника со скидкой",
    titleAfter: "до конца недели",
    text: "Наушники и колонки с активным шумоподавлением. Слушаем перед покупкой в шоуруме на Тверской.",
    href: "/catalog?category=audio",
    image: "/banners/audio.png",
    imageAlt: "Беспроводные наушники и наушники-вкладыши",
    thumb: "/banners/thumb-audio.png",
    thumbTitle: "Sony WH-1000XM5",
    badges: ["Тест в шоуруме", "Trade-in"],
  },
]

export function BannerCarousel() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((index: number) => {
    setActive((index + banners.length) % banners.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % banners.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Акции и предложения"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-card border border-border bg-card">
        <div
          ref={trackRef}
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              role="group"
              aria-roledescription="слайд"
              aria-label={`${index + 1} из ${banners.length}`}
              aria-hidden={index !== active}
              className="w-full shrink-0"
            >
              <div className="flex flex-col items-center gap-6 p-6 md:flex-row md:gap-10 md:p-10 lg:p-12">
                <div className="flex w-full flex-col gap-5 md:w-[46%]">
                  <h2 className="font-serif text-2xl font-bold leading-tight text-balance text-navy md:text-3xl lg:text-4xl">
                    {banner.titleBefore}{" "}
                    <span className="inline-block rounded-xl bg-primary px-2.5 py-0.5 align-middle text-primary-foreground">
                      {banner.discount}
                    </span>{" "}
                    {banner.titleAfter}
                  </h2>
                  <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                    {banner.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={banner.href}
                      tabIndex={index === active ? 0 : -1}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-background p-2 pr-5 transition-colors hover:border-primary"
                    >
                      <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={banner.thumb || "/placeholder.svg"}
                          alt=""
                          width={80}
                          height={80}
                          className="h-10 w-10 object-contain"
                        />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-bold leading-snug text-navy">
                          {banner.thumbTitle}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                          Смотреть
                          <ArrowRight size={13} />
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="relative w-full overflow-hidden rounded-2xl bg-muted md:w-[54%]">
                  <Image
                    src={banner.image || "/placeholder.svg"}
                    alt={banner.imageAlt}
                    width={1024}
                    height={640}
                    priority={index === 0}
                    className="h-44 w-full object-cover md:h-56 lg:h-64"
                  />
                  <span className="absolute bottom-12 left-4 rounded-lg bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-md">
                    {banner.badges[0]}
                  </span>
                  <span className="absolute bottom-4 left-8 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md">
                    {banner.badges[1]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          aria-label="Предыдущий слайд"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-navy transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Слайд ${index + 1}`}
              aria-current={index === active}
              className={`h-2 rounded-full transition-all ${
                index === active ? "w-7 bg-primary" : "w-2 bg-border hover:bg-primary/50"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          aria-label="Следующий слайд"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-navy transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  )
}
