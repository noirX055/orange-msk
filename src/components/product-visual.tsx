import {
  Headphones,
  Laptop,
  Monitor,
  Smartphone,
  Watch,
  WashingMachine,
  type LucideIcon,
} from "lucide-react"

const iconByCategory: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  laptops: Laptop,
  monitors: Monitor,
  audio: Headphones,
  wearables: Watch,
  home: WashingMachine,
}

export function ProductVisual({
  category,
  size = "md",
  className = "",
}: {
  category: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const Icon = iconByCategory[category] ?? Smartphone
  const iconSize = size === "lg" ? 96 : size === "sm" ? 24 : 48

  return (
    <div
      className={`flex items-center justify-center bg-muted text-muted-foreground/70 ${className}`}
      aria-hidden="true"
    >
      <Icon width={iconSize} height={iconSize} strokeWidth={1.25} />
    </div>
  )
}
