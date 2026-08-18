"use client"

import Image from "next/image"
import { useState } from "react"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-5">
      <div className="relative h-[350px] w-full overflow-hidden md:h-[420px]">
        <Image
          src={images[active] || "/placeholder.svg"}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain mix-blend-multiply"
        />
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-3">
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
    </div>
  )
}
