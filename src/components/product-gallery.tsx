"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden"
    else document.body.style.overflow = "unset"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  return (
    <div className="flex flex-col gap-5">
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative h-[350px] w-full cursor-zoom-in overflow-hidden rounded-xl md:h-[420px]"
        aria-label="Увеличить фото"
      >
        <Image
          src={images[active] || "/placeholder.svg"}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain mix-blend-multiply transition-transform hover:scale-105"
        />
      </button>

      {images.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(index)}
              onPointerEnter={() => setActive(index)}
              aria-label={`Показать фото ${index + 1}`}
              aria-current={index === active}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl transition-all ${
                index === active
                  ? "ring-2 ring-foreground ring-offset-2"
                  : "border border-border hover:border-foreground/40"
              }`}
            >
              <Image src={src || "/placeholder.svg"} alt="" fill sizes="80px" className="object-contain p-1 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative flex w-[90vw] max-w-[550px] flex-col rounded-2xl bg-background p-1.5 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white dark:bg-black p-4 group">
              <Image
                src={images[active] || "/placeholder.svg"}
                alt={alt}
                fill
                className="object-contain mix-blend-multiply dark:mix-blend-normal"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActive((a) => (a === 0 ? images.length - 1 : a - 1))
                    }}
                    className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 text-black opacity-0 backdrop-blur-sm transition-all hover:bg-black/20 group-hover:opacity-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:left-4 sm:h-12 sm:w-12"
                    aria-label="Предыдущее фото"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActive((a) => (a === images.length - 1 ? 0 : a + 1))
                    }}
                    className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 text-black opacity-0 backdrop-blur-sm transition-all hover:bg-black/20 group-hover:opacity-100 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:right-4 sm:h-12 sm:w-12"
                    aria-label="Следующее фото"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
