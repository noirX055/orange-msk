-- ============================================================
-- Orange MSK — Поддержка онлайн-оплаты через ЮКасса
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================================

-- 1. Добавляем поле payment_id для связи заказа с платежом ЮКасса
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id text;

-- 2. Обновляем constraint статусов — добавляем pending_payment
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'pending_payment', 'processing', 'shipping', 'done', 'cancelled', 'refunded'));

-- 3. Индекс для быстрого поиска по payment_id (используется в webhook)
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
