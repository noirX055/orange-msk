-- ============================================================
-- Orange MSK — техника Apple (10 позиций)
-- Выполните ПОСЛЕ supabase-admin.sql (нужна таблица public.products).
-- Идемпотентно: повторный запуск обновляет существующие строки.
-- ============================================================

insert into public.products
  (slug, name, brand, category, price, old_price, rating, reviews, in_stock, badge, colors, specs, sort)
values
  ('iphone-16-128', 'iPhone 16 128 ГБ', 'Apple', 'smartphones', 89990, null, 4.8, 356, true, null,
   '[{"name":"Ультрамарин","hex":"#4a5aa8"},{"name":"Бирюзовый","hex":"#7fb4b0"},{"name":"Розовый","hex":"#e8b7c2"},{"name":"Чёрный","hex":"#22303f"},{"name":"Белый","hex":"#f1f2f4"}]'::jsonb,
   '[{"label":"Экран","value":"6.1\" Super Retina XDR OLED"},{"label":"Процессор","value":"Apple A18"},{"label":"Память","value":"8 / 128 ГБ"},{"label":"Камера","value":"48 + 12 Мп"},{"label":"Батарея","value":"до 22 часов видео"}]'::jsonb, 13),

  ('iphone-16-plus-256', 'iPhone 16 Plus 256 ГБ', 'Apple', 'smartphones', 104990, null, 4.8, 189, true, null,
   '[{"name":"Ультрамарин","hex":"#4a5aa8"},{"name":"Бирюзовый","hex":"#7fb4b0"},{"name":"Чёрный","hex":"#22303f"},{"name":"Белый","hex":"#f1f2f4"}]'::jsonb,
   '[{"label":"Экран","value":"6.7\" Super Retina XDR OLED"},{"label":"Процессор","value":"Apple A18"},{"label":"Память","value":"8 / 256 ГБ"},{"label":"Камера","value":"48 + 12 Мп"},{"label":"Батарея","value":"до 27 часов видео"}]'::jsonb, 14),

  ('iphone-16-pro-max-512', 'iPhone 16 Pro Max 512 ГБ', 'Apple', 'smartphones', 154990, 164990, 4.9, 275, true, 'Хит',
   '[{"name":"Титан","hex":"#8f8a85"},{"name":"Чёрный титан","hex":"#22303f"},{"name":"Песочный титан","hex":"#d8c7a9"},{"name":"Белый титан","hex":"#e8e6e1"}]'::jsonb,
   '[{"label":"Экран","value":"6.9\" Super Retina XDR, ProMotion 120 Гц"},{"label":"Процессор","value":"Apple A18 Pro"},{"label":"Память","value":"8 / 512 ГБ"},{"label":"Камера","value":"48 + 48 + 12 Мп"},{"label":"Батарея","value":"до 33 часов видео"}]'::jsonb, 15),

  ('macbook-air-15-m4', 'MacBook Air 15" M4 16/512 ГБ', 'Apple', 'laptops', 159990, null, 4.9, 92, true, null,
   '[{"name":"Серый космос","hex":"#4b5563"},{"name":"Серебристый","hex":"#d4d7db"},{"name":"Звёздный свет","hex":"#ede4d3"},{"name":"Полночь","hex":"#1f2937"}]'::jsonb,
   '[{"label":"Экран","value":"15.3\" Liquid Retina, 2880×1864"},{"label":"Процессор","value":"Apple M4, 10 ядер"},{"label":"Память","value":"16 ГБ / SSD 512 ГБ"},{"label":"Вес","value":"1.51 кг"},{"label":"Автономность","value":"до 18 часов"}]'::jsonb, 16),

  ('macbook-pro-14-m4-pro', 'MacBook Pro 14" M4 Pro 24/512 ГБ', 'Apple', 'laptops', 229990, null, 4.9, 64, true, 'Новинка',
   '[{"name":"Космический чёрный","hex":"#2b2b2e"},{"name":"Серебристый","hex":"#d4d7db"}]'::jsonb,
   '[{"label":"Экран","value":"14.2\" Liquid Retina XDR, 120 Гц"},{"label":"Процессор","value":"Apple M4 Pro, 12 ядер"},{"label":"Память","value":"24 ГБ / SSD 512 ГБ"},{"label":"Порты","value":"3× Thunderbolt 5, HDMI, SDXC"},{"label":"Автономность","value":"до 22 часов"}]'::jsonb, 17),

  ('macbook-pro-16-m4-max', 'MacBook Pro 16" M4 Max 36/1024 ГБ', 'Apple', 'laptops', 349990, null, 4.9, 41, true, null,
   '[{"name":"Космический чёрный","hex":"#2b2b2e"},{"name":"Серебристый","hex":"#d4d7db"}]'::jsonb,
   '[{"label":"Экран","value":"16.2\" Liquid Retina XDR, 120 Гц"},{"label":"Процессор","value":"Apple M4 Max, 16 ядер"},{"label":"Память","value":"36 ГБ / SSD 1 ТБ"},{"label":"Вес","value":"2.14 кг"},{"label":"Автономность","value":"до 24 часов"}]'::jsonb, 18),

  ('apple-studio-display-27', 'Apple Studio Display 27" 5K', 'Apple', 'monitors', 189990, null, 4.7, 53, true, null,
   '[{"name":"Серебристый","hex":"#d4d7db"}]'::jsonb,
   '[{"label":"Диагональ","value":"27\""},{"label":"Разрешение","value":"5120×2880 5K Retina"},{"label":"Яркость","value":"600 нит"},{"label":"Камера","value":"12 Мп Ultra Wide"},{"label":"Порты","value":"Thunderbolt 3, 3× USB-C"}]'::jsonb, 19),

  ('apple-airpods-4-anc', 'Apple AirPods 4 с шумоподавлением', 'Apple', 'audio', 17990, 19990, 4.7, 421, true, 'Скидка',
   '[{"name":"Белый","hex":"#f1f2f4"}]'::jsonb,
   '[{"label":"Тип","value":"Вкладыши TWS"},{"label":"Чип","value":"Apple H2"},{"label":"Шумоподавление","value":"Активное, адаптивное"},{"label":"Автономность","value":"до 5 часов + кейс"},{"label":"Зарядка","value":"USB-C, Qi"}]'::jsonb, 20),

  ('apple-airpods-max-usbc', 'Apple AirPods Max USB-C', 'Apple', 'audio', 62990, null, 4.7, 138, true, null,
   '[{"name":"Синий","hex":"#5b7ba6"},{"name":"Фиолетовый","hex":"#8a7fb0"},{"name":"Звёздный свет","hex":"#ede4d3"},{"name":"Оранжевый","hex":"#f5960c"},{"name":"Полночь","hex":"#1f2937"}]'::jsonb,
   '[{"label":"Тип","value":"Накладные, закрытые"},{"label":"Чип","value":"Apple H1"},{"label":"Шумоподавление","value":"Активное + прозрачность"},{"label":"Автономность","value":"до 20 часов"},{"label":"Вес","value":"385 г"}]'::jsonb, 21),

  ('apple-watch-ultra-3', 'Apple Watch Ultra 3 49 мм', 'Apple', 'wearables', 89990, null, 4.9, 77, true, 'Новинка',
   '[{"name":"Натуральный титан","hex":"#8f8a85"},{"name":"Чёрный титан","hex":"#22303f"}]'::jsonb,
   '[{"label":"Корпус","value":"49 мм, титан"},{"label":"Экран","value":"LTPO2 OLED, до 3000 нит"},{"label":"Связь","value":"GPS + Cellular, 5G"},{"label":"Защита","value":"100 м, EN13319"},{"label":"Автономность","value":"до 42 часов (72 в экономии)"}]'::jsonb, 22)
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
  'Смартфон с чипом A18, системой камер 48 Мп и кнопкой «Камера». Экран Super Retina XDR и до 22 часов воспроизведения видео.'
  where slug = 'iphone-16-128';
update public.products set description =
  'Большой экран 6.7", чип A18 и увеличенная автономность до 27 часов видео. Камера 48 Мп с двукратным оптическим зумом.'
  where slug = 'iphone-16-plus-256';
update public.products set description =
  'Топовый iPhone с титановым корпусом, A18 Pro и тройной камерой 48 Мп. Дисплей 6.9" ProMotion 120 Гц и рекордная автономность.'
  where slug = 'iphone-16-pro-max-512';
update public.products set description =
  'Просторный 15-дюймовый ноутбук на чипе M4: бесшумный, тонкий, с автономностью до 18 часов. Для работы и творчества.'
  where slug = 'macbook-air-15-m4';
update public.products set description =
  'Профессиональный ноутбук с дисплеем Liquid Retina XDR 120 Гц и чипом M4 Pro. Полный набор портов Thunderbolt 5, HDMI и SD.'
  where slug = 'macbook-pro-14-m4-pro';
update public.products set description =
  'Максимальная производительность M4 Max для монтажа 8K и 3D. Экран 16.2" Liquid Retina XDR и до 24 часов работы.'
  where slug = 'macbook-pro-16-m4-max';
update public.products set description =
  '27-дюймовый монитор 5K Retina с яркостью 600 нит, камерой 12 Мп и системой из шести динамиков. Питание ноутбука по одному кабелю.'
  where slug = 'apple-studio-display-27';
update public.products set description =
  'Вкладыши AirPods 4 с активным шумоподавлением, чипом H2 и адаптивным звуком. Компактный зарядный кейс с USB-C.'
  where slug = 'apple-airpods-4-anc';
update public.products set description =
  'Накладные наушники с фирменным звуком, активным шумоподавлением и режимом прозрачности. Алюминиевые чашки и разъём USB-C.'
  where slug = 'apple-airpods-max-usbc';
update public.products set description =
  'Самые прочные Apple Watch: титановый корпус 49 мм, дисплей до 3000 нит и автономность до 72 часов. Для спорта и приключений.'
  where slug = 'apple-watch-ultra-3';
