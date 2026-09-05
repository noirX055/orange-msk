-- ============================================================
-- Orange MSK — Статус «refunded» для возвратов через ЮKassa
-- Выполните в Supabase SQL Editor, если orders_status_check ещё без refunded
-- ============================================================

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new', 'pending_payment', 'processing', 'shipping', 'done', 'cancelled', 'refunded'));
