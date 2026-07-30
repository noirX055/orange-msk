"use client"

import Image from "next/image"
import { useState, type PointerEvent } from "react"
import { ProductVisual } from "@/components/product-visual"

export function ProductHoverGallery({
  images,
  alt,
  category,
  className = "",
}: {
  images: string[]
  alt: string
  category: string
  className?: string
}) {
  const [active, setActive] = useState(0)
  const [hovered, setHovered] = useState(false)

  if (images.length === 0) {
    return <ProductVisual category={category} size="md" className={className} />
  }

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - left) / width
    const index = Math.min(images.length - 1, Math.max(0, Math.floor(ratio * images.length)))
    setActive(index)
  }

  return (
    <div
      className={`relative overflow-hidden bg-muted ${className}`}
      onPointerEnter={() => setHovered(true)}
      onPointerMove={handleMove}
      onPointerLeave={() => {
        setHovered(false)
        setActive(0)
      }}
    >
      {images.map((src, index) => (
        <Image
          key={src}
          src={src || "/placeholder.svg"}
          alt={index === 0 ? alt : `${alt} — фото ${index + 1}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-contain p-3 transition-opacity duration-200 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          priority={false}
        />
      ))}

      {images.length > 1 && (
        <div
          className={`absolute inset-x-3 bottom-2 flex gap-1 transition-opacity duration-200 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          {images.map((src, index) => (
            <span
              key={src}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index === active ? "bg-primary" : "bg-navy/15"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
