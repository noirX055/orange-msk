-- ============================================================
-- Orange MSK — Группы вариантов (цвет / память → разные slug)
-- Выполните в Supabase SQL Editor
-- ============================================================

-- Одинаковый variant_group у товаров, которые отличаются только цветом
-- (одна модель + один объём памяти). Пример: iphone-16-pro-256
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant_group text;

CREATE INDEX IF NOT EXISTS idx_products_variant_group ON public.products (variant_group);

-- Пример для демо-товаров (подставьте свои slug)
-- update public.products set variant_group = 'iphone-16-pro-256'
--   where slug in ('iphone-16-pro-256-black', 'iphone-16-pro-256-titan');
