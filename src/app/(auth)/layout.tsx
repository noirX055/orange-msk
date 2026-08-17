import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "Вход — Orange MSK",
  description: "Войдите в аккаунт Orange MSK",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/40 px-4 py-12">
      {/* Subtle brand glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(245,150,12,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[440px]">
        {/* Brand mark */}
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="Orange MSK — на главную">
            <Logo />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-navy/[0.06] sm:p-9">
          {children}
        </div>
      </div>
    </div>
  )
}
