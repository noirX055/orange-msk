-- Добавление видимости категорий на витрине
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_categories_visible ON public.categories (is_visible);
