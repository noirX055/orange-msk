"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/components/favorites-provider"

export function FavoriteButton({
  slug,
  className,
  size = 18,
}: {
  slug: string
  className?: string
  size?: number
}) {
  const { isFavorite, toggle } = useFavorites()
  const active = isFavorite(slug)

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggle(slug)
      }}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      className={`flex items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : "bg-background/90 text-muted-foreground hover:text-primary"
      } ${className ?? ""}`}
    >
      <Heart size={size} className={active ? "fill-primary" : ""} />
    </button>
  )
}
