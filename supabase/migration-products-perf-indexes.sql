-- ============================================================
-- Индексы для частых запросов к public.products
-- Основание: статистика pg_stat_statements от 2026-10-12
-- Выполнить в Supabase Studio → SQL Editor (это безопасно повторять).
-- Таблица небольшая (~6 тыс. строк), поэтому создание индексов займёт
-- доли секунды. Обычный CREATE INDEX используется вместо CONCURRENTLY,
-- потому что SQL Editor выполняет скрипт внутри транзакции.
-- ============================================================

-- 1. Список товаров в админке: getAllProducts() в src/lib/admin/queries.ts
--    ORDER BY created_at DESC NULLS LAST, страницы по 1000 через LIMIT/OFFSET.
--    По статистике ~19 300 вызовов, в среднем 11 мс, максимум 67 мс.
create index if not exists idx_products_created_at_desc
  on public.products (created_at desc nulls last);

-- 2. Витрина, фиды и sitemap: WHERE is_visible = $1 ORDER BY sort
--    Здесь нужен составной индекс, а не частичный (WHERE is_visible = true):
--    PostgREST передаёт значение параметром ($1), и при общем (generic)
--    плане частичный индекс не может быть использован.
create index if not exists idx_products_visible_sort
  on public.products (is_visible, sort);

-- Обновляем статистику планировщика
analyze public.products;
