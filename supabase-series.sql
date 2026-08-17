-- ============================================================
-- Orange MSK — серия/модель товара
-- Добавляет колонку products.series (фильтр «Серия» на витрине,
-- поиск/группировка в админке). Выполните ПОСЛЕ supabase-admin.sql.
-- Идемпотентно.
-- ============================================================

alter table public.products
  add column if not exists series text;

-- Проставляем серию существующим товарам (по slug). Безопасно к повторному запуску.
update public.products set series = 'iPhone 16'      where slug in ('iphone-16-pro-256', 'iphone-16-128', 'iphone-16-plus-256', 'iphone-16-pro-max-512');
update public.products set series = 'MacBook Air'    where slug in ('macbook-air-13-m4', 'macbook-air-15-m4');
update public.products set series = 'MacBook Pro'    where slug in ('macbook-pro-14-m4-pro', 'macbook-pro-16-m4-max');
update public.products set series = 'Studio Display' where slug = 'apple-studio-display-27';
update public.products set series = 'AirPods'        where slug in ('apple-airpods-pro-3', 'apple-airpods-4-anc', 'apple-airpods-max-usbc');
update public.products set series = 'Apple Watch'    where slug in ('apple-watch-series-11', 'apple-watch-ultra-3');
update public.products set series = 'Galaxy S25'     where slug = 'samsung-galaxy-s25-ultra';
update public.products set series = 'Redmi Note 14'  where slug = 'xiaomi-redmi-note-14-pro';
update public.products set series = 'TUF Gaming'     where slug = 'asus-tuf-gaming-a15';
update public.products set series = 'Odyssey'        where slug = 'samsung-odyssey-g5-27';
update public.products set series = 'UltraGear'      where slug = 'lg-ultragear-32';
update public.products set series = 'WH-1000'        where slug = 'sony-wh-1000xm6';
update public.products set series = 'V15'            where slug = 'dyson-v15-detect';
