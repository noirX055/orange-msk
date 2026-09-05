-- ============================================================
-- Демо-данные для мэтчинга: линейка iPhone 17 Pro Max
-- Модель с полным переключением Цветов x Памяти x SIM-карт
-- Выполните в Supabase SQL Editor
-- ============================================================

-- 1. Снимаем ограничение NOT NULL со старой колонки code, если она есть
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'code'
  ) THEN
    ALTER TABLE public.products ALTER COLUMN code DROP NOT NULL;
    ALTER TABLE public.products ALTER COLUMN code SET DEFAULT gen_random_uuid()::text;
  END IF;
END$$;

-- 2. Добавляем серию "iPhone 17 Pro Max" в справочник групп (если есть таблица product_groups)
DO $$
DECLARE apple_id int;
BEGIN
  SELECT id INTO apple_id FROM public.brands WHERE name = 'Apple' LIMIT 1;
  IF apple_id IS NOT NULL THEN
    INSERT INTO public.product_groups (name, brand_id, category_slug)
    VALUES ('iPhone 17 Pro Max', apple_id, 'smartphones')
    ON CONFLICT (name, brand_id, category_slug) DO NOTHING;
  END IF;
END$$;

-- 3. Добавляем товары линейки iPhone 17 Pro Max
INSERT INTO public.products (
  code, slug, name, brand, series, variant_group, category, price, old_price, rating, reviews, in_stock, is_visible, badge, colors, specs, sort
) VALUES

-- 256 ГБ | nano-SIM + eSIM
(
  'iphone-17-pro-max-256-desert-sim',
  'iphone-17-pro-max-256-desert-sim',
  'iPhone 17 Pro Max 256 ГБ Пустынный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 149990, 159990, 5.0, 42, true, true, 'Новинка',
  '[{"name":"Пустынный титан","hex":"#c4b5a0"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  1
),
(
  'iphone-17-pro-max-256-natural-sim',
  'iphone-17-pro-max-256-natural-sim',
  'iPhone 17 Pro Max 256 ГБ Натуральный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 149990, 159990, 4.9, 38, true, true, 'Новинка',
  '[{"name":"Натуральный титан","hex":"#8f8a85"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  2
),
(
  'iphone-17-pro-max-256-black-sim',
  'iphone-17-pro-max-256-black-sim',
  'iPhone 17 Pro Max 256 ГБ Чёрный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 149990, 159990, 4.9, 51, true, true, 'Хит',
  '[{"name":"Чёрный титан","hex":"#22303f"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  3
),
(
  'iphone-17-pro-max-256-white-sim',
  'iphone-17-pro-max-256-white-sim',
  'iPhone 17 Pro Max 256 ГБ Белый титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 149990, 159990, 4.9, 29, true, true, 'Новинка',
  '[{"name":"Белый титан","hex":"#f2f2f2"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  4
),

-- 256 ГБ | 2x nano-SIM (Dual SIM)
(
  'iphone-17-pro-max-256-desert-dualsim',
  'iphone-17-pro-max-256-desert-dualsim',
  'iPhone 17 Pro Max 256 ГБ Пустынный титан (2x nano-SIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 154990, null, 4.9, 21, true, true, null,
  '[{"name":"Пустынный титан","hex":"#c4b5a0"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"2x nano-SIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  5
),
(
  'iphone-17-pro-max-256-black-dualsim',
  'iphone-17-pro-max-256-black-dualsim',
  'iPhone 17 Pro Max 256 ГБ Чёрный титан (2x nano-SIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 154990, null, 5.0, 34, true, true, 'Хит',
  '[{"name":"Чёрный титан","hex":"#22303f"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"2x nano-SIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  6
),

-- 256 ГБ | eSIM (eSIM only / US)
(
  'iphone-17-pro-max-256-natural-esim',
  'iphone-17-pro-max-256-natural-esim',
  'iPhone 17 Pro Max 256 ГБ Натуральный титан (eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 144990, null, 4.8, 15, true, true, null,
  '[{"name":"Натуральный титан","hex":"#8f8a85"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"256 ГБ"},{"label":"SIM-карта","value":"eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  7
),

-- 512 ГБ | nano-SIM + eSIM
(
  'iphone-17-pro-max-512-desert-sim',
  'iphone-17-pro-max-512-desert-sim',
  'iPhone 17 Pro Max 512 ГБ Пустынный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 169990, 179990, 5.0, 62, true, true, 'Хит',
  '[{"name":"Пустынный титан","hex":"#c4b5a0"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"512 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  8
),
(
  'iphone-17-pro-max-512-black-sim',
  'iphone-17-pro-max-512-black-sim',
  'iPhone 17 Pro Max 512 ГБ Чёрный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 169990, 179990, 4.9, 44, true, true, null,
  '[{"name":"Чёрный титан","hex":"#22303f"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"512 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  9
),
(
  'iphone-17-pro-max-512-natural-sim',
  'iphone-17-pro-max-512-natural-sim',
  'iPhone 17 Pro Max 512 ГБ Натуральный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 169990, null, 4.9, 31, true, true, null,
  '[{"name":"Натуральный титан","hex":"#8f8a85"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"512 ГБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  10
),

-- 512 ГБ | 2x nano-SIM
(
  'iphone-17-pro-max-512-black-dualsim',
  'iphone-17-pro-max-512-black-dualsim',
  'iPhone 17 Pro Max 512 ГБ Чёрный титан (2x nano-SIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 174990, null, 5.0, 27, true, true, null,
  '[{"name":"Чёрный титан","hex":"#22303f"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"512 ГБ"},{"label":"SIM-карта","value":"2x nano-SIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  11
),

-- 1 ТБ | nano-SIM + eSIM
(
  'iphone-17-pro-max-1tb-desert-sim',
  'iphone-17-pro-max-1tb-desert-sim',
  'iPhone 17 Pro Max 1 ТБ Пустынный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 194990, 209990, 5.0, 18, true, true, 'Хит',
  '[{"name":"Пустынный титан","hex":"#c4b5a0"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"1 ТБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  12
),
(
  'iphone-17-pro-max-1tb-black-sim',
  'iphone-17-pro-max-1tb-black-sim',
  'iPhone 17 Pro Max 1 ТБ Чёрный титан (nano-SIM + eSIM)',
  'Apple', 'iPhone 17 Pro Max', 'iphone-17-pro-max', 'smartphones', 194990, 209990, 5.0, 23, true, true, null,
  '[{"name":"Чёрный титан","hex":"#22303f"}]'::jsonb,
  '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A19 Pro"},{"label":"Память","value":"1 ТБ"},{"label":"SIM-карта","value":"nano-SIM + eSIM"},{"label":"Камера","value":"48 + 48 + 48 Мп"}]'::jsonb,
  13
)

ON CONFLICT (slug) DO UPDATE SET
  code = excluded.code,
  name = excluded.name,
  brand = excluded.brand,
  series = excluded.series,
  variant_group = excluded.variant_group,
  category = excluded.category,
  price = excluded.price,
  old_price = excluded.old_price,
  rating = excluded.rating,
  reviews = excluded.reviews,
  in_stock = excluded.in_stock,
  is_visible = excluded.is_visible,
  badge = excluded.badge,
  colors = excluded.colors,
  specs = excluded.specs,
  sort = excluded.sort;
