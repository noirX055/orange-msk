-- ============================================================
-- Orange MSK — админ-панель
-- Таблица products, политики администрирования заказов,
-- бакет Storage для изображений товаров.
-- Выполните ПОСЛЕ supabase-setup.sql и supabase-account.sql
-- ============================================================

-- ============================================================
-- 1. Товары
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  brand text not null,
  series text,
  variant_group text,
  category text not null,
  price integer not null default 0,
  old_price integer,
  rating numeric not null default 0,
  reviews integer not null default 0,
  in_stock boolean not null default true,
  is_visible boolean not null default true,
  badge text,
  colors jsonb not null default '[]'::jsonb,
  specs jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  description text not null default '',
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_slug_idx on public.products (slug);

alter table public.products enable row level security;

-- Товары видны всем (публичная витрина)
drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
  on public.products for select
  using (true);

-- Изменять товары могут только админы (is_admin() из supabase-setup.sql)
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
  on public.products for delete
  using (public.is_admin());

-- Триггер updated_at (функция handle_updated_at из supabase-setup.sql)
drop trigger if exists on_product_updated on public.products;
create trigger on_product_updated
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 2. Сид товаров (идемпотентно — обновляет при повторном запуске)
-- ============================================================
insert into public.products
  (slug, name, brand, category, price, old_price, rating, reviews, in_stock, badge, colors, specs, sort)
values
  ('iphone-16-pro-256', 'iPhone 16 Pro 256 ГБ', 'Apple', 'smartphones', 119990, 134990, 4.9, 412, true, 'Хит',
   '[{"name":"Титан","hex":"#8f8a85"},{"name":"Чёрный","hex":"#22303f"},{"name":"Песочный","hex":"#d8c7a9"}]'::jsonb,
   '[{"label":"Экран","value":"6.3\" Super Retina XDR, 120 Гц"},{"label":"Процессор","value":"Apple A18 Pro"},{"label":"Память","value":"8 / 256 ГБ"},{"label":"Камера","value":"48 + 48 + 12 Мп"},{"label":"Батарея","value":"3582 мАч"}]'::jsonb, 1),

  ('samsung-galaxy-s25-ultra', 'Samsung Galaxy S25 Ultra 512 ГБ', 'Samsung', 'smartphones', 124490, null, 4.8, 289, true, 'Новинка',
   '[{"name":"Титан серый","hex":"#6b7280"},{"name":"Синий","hex":"#2b3f63"}]'::jsonb,
   '[{"label":"Экран","value":"6.9\" Dynamic AMOLED 2X, 120 Гц"},{"label":"Процессор","value":"Snapdragon 8 Elite"},{"label":"Память","value":"12 / 512 ГБ"},{"label":"Камера","value":"200 + 50 + 12 + 10 Мп"},{"label":"Батарея","value":"5000 мАч"}]'::jsonb, 2),

  ('xiaomi-redmi-note-14-pro', 'Xiaomi Redmi Note 14 Pro 256 ГБ', 'Xiaomi', 'smartphones', 27990, 32990, 4.6, 934, true, 'Скидка',
   '[{"name":"Чёрный","hex":"#1f2937"},{"name":"Лавандовый","hex":"#b8a8c8"}]'::jsonb,
   '[{"label":"Экран","value":"6.67\" AMOLED, 120 Гц"},{"label":"Процессор","value":"MediaTek Helio G100"},{"label":"Память","value":"8 / 256 ГБ"},{"label":"Камера","value":"200 + 8 + 2 Мп"},{"label":"Батарея","value":"5500 мАч"}]'::jsonb, 3),

  ('macbook-air-13-m4', 'MacBook Air 13" M4 16/512 ГБ', 'Apple', 'laptops', 139990, null, 4.9, 158, true, 'Хит',
   '[{"name":"Серый космос","hex":"#4b5563"},{"name":"Серебристый","hex":"#d4d7db"}]'::jsonb,
   '[{"label":"Экран","value":"13.6\" Liquid Retina, 2560×1664"},{"label":"Процессор","value":"Apple M4, 10 ядер"},{"label":"Память","value":"16 ГБ / SSD 512 ГБ"},{"label":"Вес","value":"1.24 кг"},{"label":"Автономность","value":"до 18 часов"}]'::jsonb, 4),

  ('asus-tuf-gaming-a15', 'ASUS TUF Gaming A15 RTX 4060', 'ASUS', 'laptops', 109990, 119990, 4.7, 211, true, 'Скидка',
   '[{"name":"Чёрный","hex":"#22303f"}]'::jsonb,
   '[{"label":"Экран","value":"15.6\" IPS, 144 Гц"},{"label":"Процессор","value":"AMD Ryzen 7 7435HS"},{"label":"Видеокарта","value":"GeForce RTX 4060 8 ГБ"},{"label":"Память","value":"16 ГБ / SSD 1 ТБ"},{"label":"Вес","value":"2.2 кг"}]'::jsonb, 5),

  ('samsung-odyssey-g5-27', 'Монитор Samsung Odyssey G5 27"', 'Samsung', 'monitors', 24990, null, 4.7, 342, true, null,
   '[{"name":"Чёрный","hex":"#1f2937"}]'::jsonb,
   '[{"label":"Диагональ","value":"27\""},{"label":"Разрешение","value":"2560×1440 QHD"},{"label":"Частота","value":"165 Гц"},{"label":"Матрица","value":"VA, изогнутая 1000R"},{"label":"Порты","value":"HDMI 2.0, DisplayPort 1.2"}]'::jsonb, 6),

  ('lg-ultragear-32', 'Монитор LG UltraGear 32" 4K', 'LG', 'monitors', 64990, 71990, 4.8, 97, false, 'Скидка',
   '[{"name":"Чёрный","hex":"#22303f"}]'::jsonb,
   '[{"label":"Диагональ","value":"31.5\""},{"label":"Разрешение","value":"3840×2160 4K"},{"label":"Частота","value":"144 Гц"},{"label":"Матрица","value":"Nano IPS"},{"label":"Порты","value":"HDMI 2.1, DisplayPort, USB-C"}]'::jsonb, 7),

  ('sony-wh-1000xm6', 'Наушники Sony WH-1000XM6', 'Sony', 'audio', 39990, null, 4.9, 528, true, 'Новинка',
   '[{"name":"Чёрный","hex":"#1f2937"},{"name":"Бежевый","hex":"#ded3c4"}]'::jsonb,
   '[{"label":"Тип","value":"Накладные, закрытые"},{"label":"Шумоподавление","value":"Активное, адаптивное"},{"label":"Кодеки","value":"LDAC, AAC, SBC"},{"label":"Автономность","value":"до 30 часов"},{"label":"Вес","value":"250 г"}]'::jsonb, 8),

  ('apple-airpods-pro-3', 'Apple AirPods Pro 3', 'Apple', 'audio', 24990, null, 4.8, 764, true, null,
   '[{"name":"Белый","hex":"#f1f2f4"}]'::jsonb,
   '[{"label":"Тип","value":"Внутриканальные TWS"},{"label":"Чип","value":"Apple H3"},{"label":"Защита","value":"IP57"},{"label":"Автономность","value":"до 8 часов + кейс"},{"label":"Зарядка","value":"USB-C, MagSafe, Qi"}]'::jsonb, 9),

  ('apple-watch-series-11', 'Apple Watch Series 11 46 мм', 'Apple', 'wearables', 49990, null, 4.8, 183, true, null,
   '[{"name":"Чёрный","hex":"#22303f"},{"name":"Серебристый","hex":"#d4d7db"},{"name":"Оранжевый","hex":"#f5960c"}]'::jsonb,
   '[{"label":"Корпус","value":"46 мм, алюминий"},{"label":"Экран","value":"LTPO3 OLED, Always-On"},{"label":"Датчики","value":"ЭКГ, SpO2, температура"},{"label":"Защита","value":"50 м, IP6X"},{"label":"Автономность","value":"до 24 часов"}]'::jsonb, 10),

  ('dyson-v15-detect', 'Пылесос Dyson V15 Detect', 'Dyson', 'home', 69990, 79990, 4.7, 126, true, 'Скидка',
   '[{"name":"Жёлто-никелевый","hex":"#f5960c"}]'::jsonb,
   '[{"label":"Тип","value":"Вертикальный беспроводной"},{"label":"Мощность всасывания","value":"240 АВт"},{"label":"Автономность","value":"до 60 минут"},{"label":"Пылесборник","value":"0.77 л"},{"label":"Фильтр","value":"HEPA, полная фильтрация"}]'::jsonb, 11),

  ('samsung-ww90-washer', 'Стиральная машина Samsung WW90 9 кг', 'Samsung', 'home', 54990, null, 4.6, 74, true, null,
   '[{"name":"Белый","hex":"#f1f2f4"}]'::jsonb,
   '[{"label":"Загрузка","value":"9 кг"},{"label":"Отжим","value":"1400 об/мин"},{"label":"Класс","value":"A+++"},{"label":"Программы","value":"14, включая пар"},{"label":"Габариты","value":"60×55×85 см"}]'::jsonb, 12)
on conflict (slug) do update set
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  price = excluded.price,
  old_price = excluded.old_price,
  rating = excluded.rating,
  reviews = excluded.reviews,
  in_stock = excluded.in_stock,
  badge = excluded.badge,
  colors = excluded.colors,
  specs = excluded.specs,
  sort = excluded.sort;

-- Описания (вынесены отдельно для читаемости)
update public.products set description =
  'Флагманский смартфон с чипом A18 Pro, титановым корпусом и системой камер 48 Мп. Экран ProMotion 120 Гц и до 27 часов воспроизведения видео.'
  where slug = 'iphone-16-pro-256';
update public.products set description =
  'Смартфон с S Pen, дисплеем Dynamic AMOLED 2X и камерой 200 Мп. Snapdragon 8 Elite для игр и монтажа видео на ходу.'
  where slug = 'samsung-galaxy-s25-ultra';
update public.products set description =
  'Сбалансированный смартфон среднего класса: AMOLED-экран 120 Гц, камера 200 Мп и быстрая зарядка 45 Вт.'
  where slug = 'xiaomi-redmi-note-14-pro';
update public.products set description =
  'Тонкий и бесшумный ноутбук на чипе M4 с автономностью до 18 часов. Идеален для работы, учёбы и монтажа.'
  where slug = 'macbook-air-13-m4';
update public.products set description =
  'Игровой ноутбук с экраном 144 Гц, Ryzen 7 и GeForce RTX 4060. Усиленная система охлаждения для долгих сессий.'
  where slug = 'asus-tuf-gaming-a15';
update public.products set description =
  'Изогнутый игровой монитор 1000R с разрешением QHD и частотой 165 Гц. Поддержка AMD FreeSync Premium.'
  where slug = 'samsung-odyssey-g5-27';
update public.products set description =
  '4K-монитор для работы с графикой и игр: 144 Гц, покрытие DCI-P3 95% и поддержка HDR10.'
  where slug = 'lg-ultragear-32';
update public.products set description =
  'Беспроводные наушники с лучшим в классе шумоподавлением, LDAC и автономностью до 30 часов.'
  where slug = 'sony-wh-1000xm6';
update public.products set description =
  'TWS-наушники с адаптивным звуком, шумоподавлением и защитой IP57. Зарядный кейс с USB-C.'
  where slug = 'apple-airpods-pro-3';
update public.products set description =
  'Умные часы с ярким дисплеем Always-On, датчиком температуры и расширенным отслеживанием сна.'
  where slug = 'apple-watch-series-11';
update public.products set description =
  'Беспроводной пылесос с лазерной подсветкой пыли и датчиком частиц. Показывает статистику уборки на экране.'
  where slug = 'dyson-v15-detect';
update public.products set description =
  'Стиральная машина с инверторным мотором, паровой обработкой и загрузкой 9 кг. Тихая работа и класс A+++.'
  where slug = 'samsung-ww90-washer';

-- ============================================================
-- 3. Администрирование заказов (дополняет supabase-account.sql)
-- ============================================================
drop policy if exists "Admins can update all orders" on public.orders;
create policy "Admins can update all orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete all orders" on public.orders;
create policy "Admins can delete all orders"
  on public.orders for delete
  using (public.is_admin());

drop policy if exists "Admins can update all order items" on public.order_items;
create policy "Admins can update all order items"
  on public.order_items for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete all order items" on public.order_items;
create policy "Admins can delete all order items"
  on public.order_items for delete
  using (public.is_admin());

drop policy if exists "Admins can insert any order items" on public.order_items;
create policy "Admins can insert any order items"
  on public.order_items for insert
  with check (public.is_admin());

-- ============================================================
-- 4. Storage — бакет для изображений товаров
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Публичное чтение изображений
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Загрузка/изменение/удаление — только админам
drop policy if exists "Admins manage product images" on storage.objects;
create policy "Admins manage product images"
  on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
