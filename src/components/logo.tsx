export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const wordmark = variant === "dark" ? "text-navy" : "text-navy-foreground"

  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-10 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-navy">
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-primary" />
        <span className="relative font-serif text-lg leading-none tracking-tight text-navy-foreground">
          OM
        </span>
      </span>
      <span className="hidden flex-col leading-none sm:flex">
        <span className={`font-serif text-lg font-semibold tracking-[0.18em] ${wordmark}`}>
          ORANGE
        </span>
        <span className="text-[0.7rem] font-semibold tracking-[0.42em] text-primary">MSK</span>
      </span>
    </span>
  )
}
