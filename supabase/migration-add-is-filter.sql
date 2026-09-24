-- ============================================================
-- Orange MSK — Миграция: Добавление колонки is_filter в product_attributes
-- Выполните в Supabase SQL Editor (db.orangemsk.ru)
-- ============================================================

-- 1. Добавляем колонку is_filter (флаг участия в фильтрах каталога)
ALTER TABLE public.product_attributes
ADD COLUMN IF NOT EXISTS is_filter boolean NOT NULL DEFAULT false;

-- 2. Индекс для быстрой выборки активных фильтров
CREATE INDEX IF NOT EXISTS product_attributes_is_filter_idx
ON public.product_attributes (is_filter, sort);

-- 3. Включаем в фильтрах базовые характеристики (цвет, память, SIM)
UPDATE public.product_attributes
SET is_filter = true
WHERE slug IN (
  'tsvet-iphone', 'tsvet-samsung', 'tsvet-dyson',
  'color-iphone', 'color-samsung', 'color-dyson',
  'storage', 'ram', 'sim'
)
OR name ILIKE '%цвет%'
OR name ILIKE '%памят%'
OR name ILIKE '%sim%'
OR name ILIKE '%сим%';
