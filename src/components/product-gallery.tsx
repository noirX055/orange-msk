"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { X } from "lucide-react"

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-foreground hover:text-background md:right-8 md:top-8"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
          <div className="relative h-[90vh] w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[active] || "/placeholder.svg"}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  )
}
