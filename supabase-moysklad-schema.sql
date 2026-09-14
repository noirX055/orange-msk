-- ============================================================
-- Orange MSK — Схема для интеграции с МойСклад
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================================

-- 1. Поля для товаров (products)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS moysklad_id text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS path_name text;

-- Уникальный индекс по moysklad_id для быстрого upsert при вебхуках
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_moysklad_id ON public.products(moysklad_id) WHERE moysklad_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- 2. Поля для заказов (orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS moysklad_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS moysklad_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS moysklad_sync_status text DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS moysklad_sync_error text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS moysklad_synced_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_orders_moysklad_id ON public.orders(moysklad_id);
CREATE INDEX IF NOT EXISTS idx_orders_moysklad_status ON public.orders(moysklad_sync_status);

COMMENT ON COLUMN public.products.moysklad_id IS 'UUID товара в МойСклад (используется для Real-Time Webhooks)';
COMMENT ON COLUMN public.products.path_name IS 'Полный путь папок товара в МойСклад';
