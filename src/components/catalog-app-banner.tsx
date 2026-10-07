import Image from "next/image"
import Link from "next/link"
import { MessageCircle, ArrowRight } from "lucide-react"

export function CatalogAppBanner() {
  return (
    <section aria-labelledby="catalog-banner-title" className="w-full pt-2 sm:pt-4">
      <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/40 p-5 sm:p-8 md:p-10 lg:p-12">
        <div className="grid items-center gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Левая колонка: Текст и кнопки */}
          <div className="flex flex-col items-start lg:col-span-7">
            <h2
              id="catalog-banner-title"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[1.15]"
            >
              Найти товар можно{" "}
              <span className="block text-primary">за пару минут</span>
            </h2>

            <p className="mt-3 sm:mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              На сайте удобные фильтры, категории, подборки и характеристики. А если
              нужна помощь — проконсультируем по телефону или чату.
            </p>

            <div className="mt-6 sm:mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/catalog"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] hover:bg-primary/90"
              >
                Открыть каталог
                <ArrowRight size={18} />
              </Link>

              <a
                href="https://t.me/OrangeLenengradka"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 px-6 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-accent"
              >
                <MessageCircle size={18} className="text-primary" />
                Получить консультацию
              </a>
            </div>
          </div>

          {/* Правая колонка: Векторный мокап MacBook Silver */}
          <div className="relative flex w-full items-center justify-center lg:col-span-5">
            <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px]">
              <Image
                src="/Silver.svg"
                alt="Orange MSK на экране MacBook"
                width={2048}
                height={1241}
                className="h-auto w-full max-w-full object-contain drop-shadow-2xl"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
