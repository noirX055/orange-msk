import React from "react"

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/80 ${className}`}
      {...props}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-card border border-border bg-card">
      {/* Плейсхолдер кнопки избранного */}
      <Skeleton className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full" />

      {/* Плейсхолдер картинки */}
      <div className="relative h-44 w-full bg-muted/50">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Бренд */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
        </div>

        {/* Название (2 строки) */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Цена и кнопка корзины */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        </div>
      </div>
    </article>
  )
}

export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Хлебные крошки */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-3 w-14" />
        <span className="text-xs text-muted-foreground">/</span>
        <Skeleton className="h-3 w-16" />
        <span className="text-xs text-muted-foreground">/</span>
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Заголовок */}
      <div className="mb-6 flex flex-col gap-2">
        <Skeleton className="h-8 w-64 md:w-80" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="flex items-start gap-8">
        {/* Боковая панель фильтров (Desktop) */}
        <aside className="hidden w-64 shrink-0 flex-col gap-6 lg:flex">
          {/* Категории */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/70 p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>

          {/* Фильтр цены */}
          <div className="flex flex-col gap-3 rounded-xl border border-border/70 p-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Бренды */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-border/70 p-4">
            <Skeleton className="h-4 w-20 mb-1" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </aside>

        {/* Основной контент: тулбар + сетка товаров */}
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-3">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductPageSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-14" />
        <span className="text-xs text-muted-foreground">/</span>
        <Skeleton className="h-3 w-16" />
        <span className="text-xs text-muted-foreground">/</span>
        <Skeleton className="h-3 w-16" />
        <span className="text-xs text-muted-foreground">/</span>
        <Skeleton className="h-3 w-24" />
        <span className="text-xs text-muted-foreground">/</span>
        <Skeleton className="h-3 w-32" />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Левая колонка: Галерея */}
        <div className="lg:w-1/2 flex flex-col gap-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-18 w-18 rounded-xl" />
            <Skeleton className="h-18 w-18 rounded-xl" />
            <Skeleton className="h-18 w-18 rounded-xl" />
            <Skeleton className="h-18 w-18 rounded-xl" />
          </div>
        </div>

        {/* Правая колонка: Информация и покупка */}
        <div className="flex flex-1 flex-col gap-6 lg:w-1/2">
          {/* Бренд и статус */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>

          {/* Заголовок */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>

          {/* Рейтинг */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Цена */}
          <div className="flex items-baseline gap-3 rounded-xl border border-border/70 p-4">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Опции: Память */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>

          {/* Опции: Цвет */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          {/* Кнопка покупки */}
          <div className="flex items-center gap-3 pt-2">
            <Skeleton className="h-12 flex-1 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          {/* Преимущества */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Характеристики / Описание вкладки */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 p-6">
        <div className="flex gap-4 border-b border-border/70 pb-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-6">
      {/* Баннер */}
      <Skeleton className="h-[260px] sm:h-[360px] md:h-[420px] w-full rounded-2xl" />

      {/* Категории */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Популярные товары */}
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="h-8 w-40 mb-6" />
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <div className="w-full lg:w-96">
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function FavoritesSkeleton({ inAccount = false }: { inAccount?: boolean }) {
  return (
    <div className={inAccount ? "flex flex-col gap-6" : "mx-auto max-w-7xl px-4 py-8"}>
      {!inAccount && (
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-3 w-14" />
          <span className="text-xs text-muted-foreground">/</span>
          <Skeleton className="h-3 w-20" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

