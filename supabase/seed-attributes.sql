-- Seed script for attribute values
-- iPhone Colors, Samsung Colors, Dyson Colors, Storage (16GB-2TB), RAM (2GB-64GB)
-- Run this in Supabase SQL editor or via migration

-- ============================================================
-- 1. Цвет iPhone (color type, category: iphone)
-- ============================================================
INSERT INTO product_attributes (name, slug, type, category_slug, sort)
VALUES ('Цвет iPhone', 'tsvet-iphone', 'color', 'iphone', 10)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE attr_id int;
BEGIN
  SELECT id INTO attr_id FROM product_attributes WHERE slug = 'tsvet-iphone';

  -- iPhone 15 / 16 series colors
  INSERT INTO product_attribute_values (attribute_id, label, value, color_hex, sort) VALUES
    (attr_id, 'Чёрный',             'chernyj',            '#1D1D1F', 10),
    (attr_id, 'Белый',              'belyj',              '#F5F5F7', 20),
    (attr_id, 'Синий',              'sinij',              '#A7C1D9', 30),
    (attr_id, 'Розовый',            'rozovyj',            '#F9D4C8', 40),
    (attr_id, 'Жёлтый',            'zheltyj',            '#F9E77F', 50),
    (attr_id, 'Зелёный',           'zelenyj',            '#CDEAC0', 60),
    (attr_id, 'Фиолетовый',        'fioletovyj',         '#E5DDEA', 70),
    (attr_id, 'Голубой',            'goluboj',            '#D4E4F7', 80),
    (attr_id, 'Ультрамарин',        'ultramarin',         '#7D85CC', 90),
    (attr_id, 'Бирюзовый',         'biryuzovyj',         '#98D4C8', 100),
    (attr_id, 'Пустынный титан',    'pustynnyj-titan',    '#BFB2A2', 110),
    (attr_id, 'Натуральный титан',  'naturalnyj-titan',   '#C2B8A3', 120),
    (attr_id, 'Белый титан',        'belyj-titan',        '#F2F1EB', 130),
    (attr_id, 'Чёрный титан',       'chernyj-titan',      '#3C3B37', 140),
    (attr_id, 'Синий титан',        'sinij-titan',        '#394F6A', 150),
    (attr_id, 'Золотой',            'zolotoj',            '#F2DFC7', 160),
    (attr_id, 'Серебристый',        'serebristyj',        '#E3E4E6', 170),
    (attr_id, 'Графитовый',         'grafitovyj',         '#4E4E50', 180),
    (attr_id, '(PRODUCT)RED',       'product-red',        '#BF0013', 190),
    (attr_id, 'Сиерра-синий',       'sierra-sinij',       '#A7C1D9', 200),
    (attr_id, 'Космический чёрный', 'kosmicheskij-chernyj','#2E2C2F', 210),
    (attr_id, 'Тёмно-зелёный',     'temno-zelenyj',      '#3B4B3A', 220),
    (attr_id, 'Глубокий фиолет',   'glubokij-fiolet',    '#514B82', 230),
    (attr_id, 'Полуночный',         'polunochnyj',        '#232A31', 240),
    (attr_id, 'Сияющий',            'siyayushchij',       '#E3E0C7', 250)
  ON CONFLICT DO NOTHING;
END$$;


-- ============================================================
-- 2. Цвет Samsung (color type, category: samsung)
-- ============================================================
INSERT INTO product_attributes (name, slug, type, category_slug, sort)
VALUES ('Цвет Samsung', 'tsvet-samsung', 'color', 'samsung', 10)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE attr_id int;
BEGIN
  SELECT id INTO attr_id FROM product_attributes WHERE slug = 'tsvet-samsung';

  INSERT INTO product_attribute_values (attribute_id, label, value, color_hex, sort) VALUES
    -- Galaxy S24 / S25 series
    (attr_id, 'Чёрный Оникс',       'chernyj-oniks',      '#211F20', 10),
    (attr_id, 'Мраморный серый',     'mramornyj-seryj',    '#C4C6C8', 20),
    (attr_id, 'Кобальтовый синий',   'kobaltovyj-sinij',   '#3B5998', 30),
    (attr_id, 'Янтарно-жёлтый',     'yantarno-zheltyj',   '#F0C05A', 40),
    (attr_id, 'Серебристая тень',    'serebristaya-ten',   '#C0C0C0', 50),
    (attr_id, 'Титановый серый',     'titanovyj-seryj',    '#B0ADA5', 60),
    (attr_id, 'Титановый чёрный',    'titanovyj-chernyj',  '#2C2C2C', 70),
    (attr_id, 'Титановый синий',     'titanovyj-sinij',    '#394E6A', 80),
    (attr_id, 'Титановый фиолет',   'titanovyj-fiolet',   '#C4B5C9', 90),
    (attr_id, 'Голубой Айсберг',     'goluboj-ajsberg',    '#A8D8EA', 100),
    (attr_id, 'Мятный',              'myatnyj',            '#AADEAA', 110),
    (attr_id, 'Фиолетовый',         'fioletovyj',         '#B4A7D6', 120),
    (attr_id, 'Кремовый',            'kremovyj',           '#FFF8E7', 130),
    (attr_id, 'Лавандовый',          'lavandovyj',         '#D6CADD', 140),
    (attr_id, 'Зелёный',            'zelenyj',            '#C9E4C5', 150),
    (attr_id, 'Персиковый',          'persikovyj',         '#FFD8BE', 160),
    (attr_id, 'Белый',               'belyj',              '#F5F5F5', 170),
    (attr_id, 'Графитовый',          'grafitovyj',         '#3C3C3C', 180),
    (attr_id, 'Бургунди',            'burgundi',           '#722F37', 190),
    (attr_id, 'Розовое золото',      'rozovoe-zoloto',     '#E8B4B8', 200),
    (attr_id, 'Коралловый',          'korallovyj',         '#FF7F7F', 210),
    (attr_id, 'Navy',                'navy',               '#1B2A4A', 220)
  ON CONFLICT DO NOTHING;
END$$;


-- ============================================================
-- 3. Цвет Dyson (color type, category: dyson)
-- ============================================================
INSERT INTO product_attributes (name, slug, type, category_slug, sort)
VALUES ('Цвет Dyson', 'tsvet-dyson', 'color', 'dyson', 10)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE attr_id int;
BEGIN
  SELECT id INTO attr_id FROM product_attributes WHERE slug = 'tsvet-dyson';

  INSERT INTO product_attribute_values (attribute_id, label, value, color_hex, sort) VALUES
    (attr_id, 'Никель/Медь',             'nikel-med',            '#B87333', 10),
    (attr_id, 'Никель/Фуксия',           'nikel-fuksiya',        '#FF00FF', 20),
    (attr_id, 'Железо/Фуксия',           'zhelezo-fuksiya',      '#48494B', 30),
    (attr_id, 'Фуксия/Никель',           'fuksiya-nikel',        '#E040A0', 40),
    (attr_id, 'Синий/Золотой',            'sinij-zolotoj',        '#1E3A6D', 50),
    (attr_id, 'Синий/Медь',              'sinij-med',            '#2C5C94', 60),
    (attr_id, 'Strawberry Bronze',        'strawberry-bronze',    '#E25B45', 70),
    (attr_id, 'Керамик Поп',             'keramik-pop',          '#FF6B81', 80),
    (attr_id, 'Серебристый/Фуксия',       'serebristyj-fuksiya',  '#C0C0C0', 90),
    (attr_id, 'Пурпурный/Чёрный',        'purpurnyj-chernyj',    '#6B3FA0', 100),
    (attr_id, 'Никель/Серебристый',       'nikel-serebristyj',    '#A8A8A8', 110),
    (attr_id, 'Чёрный/Никель',           'chernyj-nikel',        '#2C2C2C', 120),
    (attr_id, 'Золотой/Бургунди',        'zolotoj-burgundi',     '#D4A259', 130),
    (attr_id, 'Вайнь Голд',              'vajn-gold',            '#996633', 140),
    (attr_id, 'Топаз Оранж',            'topaz-oranzh',         '#FF8F3E', 150),
    (attr_id, 'Прусский синий/Медь',      'prusskij-sinij-med',   '#003366', 160),
    (attr_id, 'Серебристый/Синий',        'serebristyj-sinij',    '#D1D5DB', 170),
    (attr_id, 'Белый/Серебристый',        'belyj-serebristyj',    '#F5F5F5', 180),
    (attr_id, 'Жёлтый/Железо',           'zheltyj-zhelezo',      '#FFD700', 190),
    (attr_id, 'Синий/Никель',             'sinij-nikel',          '#4169E1', 200)
  ON CONFLICT DO NOTHING;
END$$;


-- ============================================================
-- 4. Встроенная память (select type)
-- ============================================================
INSERT INTO product_attributes (name, slug, type, category_slug, sort)
VALUES ('Встроенная память', 'vstroennaya-pamyat', 'select', NULL, 20)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE attr_id int;
BEGIN
  SELECT id INTO attr_id FROM product_attributes WHERE slug = 'vstroennaya-pamyat';

  INSERT INTO product_attribute_values (attribute_id, label, value, color_hex, sort) VALUES
    (attr_id, '16 ГБ',   '16gb',   NULL, 10),
    (attr_id, '32 ГБ',   '32gb',   NULL, 20),
    (attr_id, '64 ГБ',   '64gb',   NULL, 30),
    (attr_id, '128 ГБ',  '128gb',  NULL, 40),
    (attr_id, '256 ГБ',  '256gb',  NULL, 50),
    (attr_id, '512 ГБ',  '512gb',  NULL, 60),
    (attr_id, '1 ТБ',    '1tb',    NULL, 70),
    (attr_id, '2 ТБ',    '2tb',    NULL, 80)
  ON CONFLICT DO NOTHING;
END$$;


-- ============================================================
-- 5. Оперативная память (select type)
-- ============================================================
INSERT INTO product_attributes (name, slug, type, category_slug, sort)
VALUES ('Оперативная память', 'operativnaya-pamyat', 'select', NULL, 30)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE attr_id int;
BEGIN
  SELECT id INTO attr_id FROM product_attributes WHERE slug = 'operativnaya-pamyat';

  INSERT INTO product_attribute_values (attribute_id, label, value, color_hex, sort) VALUES
    (attr_id, '2 ГБ',   '2gb',   NULL, 10),
    (attr_id, '3 ГБ',   '3gb',   NULL, 20),
    (attr_id, '4 ГБ',   '4gb',   NULL, 30),
    (attr_id, '6 ГБ',   '6gb',   NULL, 40),
    (attr_id, '8 ГБ',   '8gb',   NULL, 50),
    (attr_id, '12 ГБ',  '12gb',  NULL, 60),
    (attr_id, '16 ГБ',  '16gb',  NULL, 70),
    (attr_id, '24 ГБ',  '24gb',  NULL, 80),
    (attr_id, '32 ГБ',  '32gb',  NULL, 90),
    (attr_id, '48 ГБ',  '48gb',  NULL, 100),
    (attr_id, '64 ГБ',  '64gb',  NULL, 110)
  ON CONFLICT DO NOTHING;
END$$;
