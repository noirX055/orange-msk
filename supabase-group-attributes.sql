-- ============================================================
-- Orange MSK — Привязка характеристик к группам товаров
-- Выполните в Supabase SQL Editor
-- ============================================================

-- Добавляем колонку для хранения массива ID характеристик из таблицы product_attributes
ALTER TABLE public.product_groups
  ADD COLUMN IF NOT EXISTS attribute_ids integer[] NOT NULL DEFAULT '{}';

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_product_groups_attribute_ids 
  ON public.product_groups USING GIN (attribute_ids);
