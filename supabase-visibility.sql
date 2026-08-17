-- ============================================================
-- Orange MSK — видимость товаров на витрине
-- Добавляет колонку products.is_visible (ползунок «Показ» в админке).
-- Выполните ПОСЛЕ supabase-admin.sql. Идемпотентно.
-- ============================================================

alter table public.products
  add column if not exists is_visible boolean not null default true;
