"use client"

import Image from "next/image"
import { useState } from "react"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-80 w-full overflow-hidden rounded-card border border-border bg-muted md:h-[420px]">
        <Image
          src={images[active] || "/placeholder.svg"}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain p-6"
        />
      </div>
      <div className="flex gap-3">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(index)}
            onPointerEnter={() => setActive(index)}
            aria-label={`Показать фото ${index + 1}`}
            aria-current={index === active}
            className={`relative h-20 flex-1 overflow-hidden rounded-lg border bg-muted transition-colors ${
              index === active ? "border-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <Image src={src || "/placeholder.svg"} alt="" fill sizes="120px" className="object-contain p-2" />
          </button>
        ))}
      </div>
    </div>
  )
}
