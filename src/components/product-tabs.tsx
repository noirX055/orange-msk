"use client"

import { useState } from "react"

type Spec = { label: string; value: string }

export function ProductTabs({
  description,
  specs,
}: {
  description: string
  specs: Spec[]
}) {
  const [activeTab, setActiveTab] = useState<"specs" | "desc">("specs")

  return (
    <div className="flex flex-col gap-6">
      {/* Контейнер вкладок с легким фоном, как на референсе */}
      <div className="flex w-fit items-center gap-8 rounded-2xl bg-muted/60 px-6">
        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`relative py-4 text-base font-semibold transition-colors ${
            activeTab === "specs" ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
          }`}
        >
          Характеристики
          {activeTab === "specs" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("desc")}
          className={`relative py-4 text-base font-semibold transition-colors ${
            activeTab === "desc" ? "text-primary" : "text-muted-foreground hover:text-foreground/80"
          }`}
        >
          Описание
          {activeTab === "desc" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-primary" />
          )}
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "specs" ? (
          specs.length > 0 ? (
            <dl className="overflow-hidden rounded-card border border-border shadow-sm">
              {specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`flex flex-col gap-1 px-5 py-3.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 ${
                    index % 2 === 0 ? "bg-muted/40" : "bg-card"
                  }`}
                >
                  <dt className="text-muted-foreground sm:w-1/2">{spec.label}</dt>
                  <dd className="font-medium sm:w-1/2 sm:text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="rounded-card border border-border p-8 text-center text-muted-foreground shadow-sm">
              Характеристики пока не добавлены.
            </div>
          )
        ) : (
          <div className="rounded-card border border-border bg-card p-6 shadow-sm md:p-8">
            <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {description || "Описание пока не добавлено."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
