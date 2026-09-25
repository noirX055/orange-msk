-- ============================================================
-- Orange MSK — Привязка фильтров каталога к группам товаров
-- Выполните в Supabase SQL Editor (db.orangemsk.ru)
-- ============================================================

-- 1. Добавляем колонку filter_attribute_ids в таблицу product_groups
ALTER TABLE public.product_groups
  ADD COLUMN IF NOT EXISTS filter_attribute_ids integer[] NOT NULL DEFAULT '{}';

-- 2. Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_product_groups_filter_attr_ids 
  ON public.product_groups USING GIN (filter_attribute_ids);

-- 3. Для существующих групп по умолчанию копируем attribute_ids в filter_attribute_ids
UPDATE public.product_groups
SET filter_attribute_ids = attribute_ids
WHERE (filter_attribute_ids IS NULL OR filter_attribute_ids = '{}')
  AND attribute_ids IS NOT NULL 
  AND cardinality(attribute_ids) > 0;
