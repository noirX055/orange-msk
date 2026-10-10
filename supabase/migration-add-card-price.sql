-- ============================================================
-- Orange MSK — Миграция: Добавление колонки card_price
-- Выполните в Supabase SQL Editor (db.orangemsk.ru)
-- ============================================================

-- 1. Добавляем колонку card_price (цена при оплате картой)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS card_price integer;

-- Комментарий к колонке
COMMENT ON COLUMN public.products.card_price IS 'Цена при оплате картой (+15% с округлением до сотен рублей)';

-- 2. Заполняем card_price ТОЛЬКО для товаров, у которых уже есть цена (price > 0)
-- ВАЖНО: колонка price не изменяется, меняется исключительно новая колонка card_price.
-- Формула: ROUND((price * 1.15) / 100.0) * 100
UPDATE public.products
SET card_price = (ROUND((price * 1.15) / 100.0) * 100)::integer
WHERE price IS NOT NULL AND price > 0;
