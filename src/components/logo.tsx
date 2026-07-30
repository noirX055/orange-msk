export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const wordmark = variant === "dark" ? "text-navy" : "text-navy-foreground"
  const markRing = variant === "dark" ? "ring-navy/10" : "ring-navy-foreground/15"

  return (
    <span className="flex items-center gap-3">
      {/* Знак: тёмно-синий кафель с серифными OM и оранжевой полосой, как в оригинальном лого */}
      <span
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy ring-1 ${markRing}`}
      >
        <span className="absolute inset-x-0 top-[56%] h-[7px] -translate-y-1/2 bg-primary" />
        <span className="relative font-serif text-[22px] leading-none tracking-[-0.04em] text-navy-foreground">
          OM
        </span>
      </span>

      {/* Словесная часть: ORANGE над оранжевой плашкой MSK */}
      <span className="hidden flex-col items-stretch gap-[3px] sm:flex">
        <span
          className={`font-serif text-[19px] font-medium leading-none tracking-[0.2em] ${wordmark}`}
        >
          ORANGE
        </span>
        <span className="bg-primary py-[3px] text-center text-[9px] font-bold leading-none tracking-[0.3em] text-primary-foreground">
          MSK
        </span>
      </span>
    </span>
  )
}
