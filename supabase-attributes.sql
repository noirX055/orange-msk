-- ============================================================
-- Orange MSK — Справочник характеристик товаров
-- Выполните в Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_attributes (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'select', 'color')),
  category_slug text,
  sort integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id serial PRIMARY KEY,
  attribute_id integer NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  color_hex text,
  sort integer NOT NULL DEFAULT 0,
  UNIQUE (attribute_id, value)
);

CREATE INDEX IF NOT EXISTS product_attributes_category_idx ON public.product_attributes (category_slug, sort);
CREATE INDEX IF NOT EXISTS product_attribute_values_attr_idx ON public.product_attribute_values (attribute_id, sort);

ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read product attributes" ON public.product_attributes;
CREATE POLICY "Public read product attributes"
  ON public.product_attributes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage product attributes" ON public.product_attributes;
CREATE POLICY "Admins manage product attributes"
  ON public.product_attributes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read attribute values" ON public.product_attribute_values;
CREATE POLICY "Public read attribute values"
  ON public.product_attribute_values FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage attribute values" ON public.product_attribute_values;
CREATE POLICY "Admins manage attribute values"
  ON public.product_attribute_values FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Характеристики
INSERT INTO public.product_attributes (slug, name, type, category_slug, sort)
VALUES
  ('color-iphone', 'Цвет iPhone', 'color', 'smartphones', 1),
  ('color-samsung', 'Цвет Samsung', 'color', 'smartphones', 2),
  ('color-dyson', 'Цвет Dyson', 'color', 'home', 3),
  ('storage', 'Встроенная память', 'select', NULL, 4),
  ('ram', 'Оперативная память', 'select', NULL, 5),
  ('screen', 'Экран', 'text', 'smartphones', 6),
  ('processor', 'Процессор', 'text', 'smartphones', 7)
ON CONFLICT (slug) DO NOTHING;

-- Значения: iPhone
INSERT INTO public.product_attribute_values (attribute_id, label, value, color_hex, sort)
SELECT a.id, v.label, v.value, v.color_hex, v.sort
FROM public.product_attributes a
JOIN (VALUES
  ('color-iphone', 'Чёрный', 'black', '#1d1d1f', 1),
  ('color-iphone', 'Белый', 'white', '#f5f5f7', 2),
  ('color-iphone', 'Starlight', 'starlight', '#faf6f2', 3),
  ('color-iphone', 'Midnight', 'midnight', '#232325', 4),
  ('color-iphone', 'Graphite', 'graphite', '#535150', 5),
  ('color-iphone', 'Silver', 'silver', '#e3e4e5', 6),
  ('color-iphone', 'Gold', 'gold', '#fad7bd', 7),
  ('color-iphone', 'Rose Gold', 'rose-gold', '#e8c4b8', 8),
  ('color-iphone', 'Space Gray', 'space-gray', '#4a4a4a', 9),
  ('color-iphone', 'Space Black', 'space-black', '#1b1b1b', 10),
  ('color-iphone', 'Pacific Blue', 'pacific-blue', '#2d4a5e', 11),
  ('color-iphone', 'Sierra Blue', 'sierra-blue', '#9bb5ce', 12),
  ('color-iphone', 'Alpine Green', 'alpine-green', '#576856', 13),
  ('color-iphone', 'Deep Purple', 'deep-purple', '#594f63', 14),
  ('color-iphone', 'Ultramarine', 'ultramarine', '#3f51b5', 15),
  ('color-iphone', 'Teal', 'teal', '#008080', 16),
  ('color-iphone', 'Pink', 'pink', '#ffd7e0', 17),
  ('color-iphone', 'Yellow', 'yellow', '#ffe681', 18),
  ('color-iphone', 'Green', 'green', '#cce4d4', 19),
  ('color-iphone', 'Blue', 'blue', '#a0bce8', 20),
  ('color-iphone', 'Purple', 'purple', '#e5ddea', 21),
  ('color-iphone', '(PRODUCT)RED', 'product-red', '#bf0013', 22),
  ('color-iphone', 'Титан натуральный', 'titan-natural', '#8f8a85', 23),
  ('color-iphone', 'Титан чёрный', 'titan-black', '#3a3a3c', 24),
  ('color-iphone', 'Титан белый', 'titan-white', '#f2f2f2', 25),
  ('color-iphone', 'Титан пустынный', 'titan-desert', '#c4b5a0', 26),
  ('color-iphone', 'Титан синий', 'titan-blue', '#2f3b4a', 27),
  ('color-iphone', 'Титан золотой', 'titan-gold', '#d4af37', 28)
) AS v(attr_slug, label, value, color_hex, sort) ON a.slug = v.attr_slug
ON CONFLICT (attribute_id, value) DO NOTHING;

-- Значения: Samsung
INSERT INTO public.product_attribute_values (attribute_id, label, value, color_hex, sort)
SELECT a.id, v.label, v.value, v.color_hex, v.sort
FROM public.product_attributes a
JOIN (VALUES
  ('color-samsung', 'Phantom Black', 'phantom-black', '#1a1a1a', 1),
  ('color-samsung', 'Graphite', 'graphite', '#525252', 2),
  ('color-samsung', 'Cream', 'cream', '#f5f0e8', 3),
  ('color-samsung', 'Lavender', 'lavender', '#d8c9e6', 4),
  ('color-samsung', 'Green', 'green', '#2d4a3e', 5),
  ('color-samsung', 'Pink Gold', 'pink-gold', '#e8c4b8', 6),
  ('color-samsung', 'Sky Blue', 'sky-blue', '#a8cfe8', 7),
  ('color-samsung', 'Burgundy', 'burgundy', '#5c2d32', 8),
  ('color-samsung', 'Navy', 'navy', '#1f2947', 9),
  ('color-samsung', 'Silver Shadow', 'silver-shadow', '#c0c0c0', 10),
  ('color-samsung', 'Blueblack', 'blueblack', '#0a1628', 11),
  ('color-samsung', 'Coral Red', 'coral-red', '#ff6f61', 12),
  ('color-samsung', 'Mint', 'mint', '#b8e0d2', 13),
  ('color-samsung', 'Titanium Gray', 'titanium-gray', '#8b8d8f', 14),
  ('color-samsung', 'Titanium Violet', 'titanium-violet', '#9b8fa8', 15),
  ('color-samsung', 'Titanium Yellow', 'titanium-yellow', '#f4d03f', 16),
  ('color-samsung', 'Titanium Orange', 'titanium-orange', '#e86233', 17),
  ('color-samsung', 'Titanium Black', 'titanium-black', '#2b2b2b', 18),
  ('color-samsung', 'White', 'white', '#f5f5f5', 19),
  ('color-samsung', 'Blue', 'blue', '#4a90d9', 20)
) AS v(attr_slug, label, value, color_hex, sort) ON a.slug = v.attr_slug
ON CONFLICT (attribute_id, value) DO NOTHING;

-- Значения: Dyson
INSERT INTO public.product_attribute_values (attribute_id, label, value, color_hex, sort)
SELECT a.id, v.label, v.value, v.color_hex, v.sort
FROM public.product_attributes a
JOIN (VALUES
  ('color-dyson', 'Nickel / Copper', 'nickel-copper', '#b87333', 1),
  ('color-dyson', 'Prussian Blue', 'prussian-blue', '#003153', 2),
  ('color-dyson', 'Iron / Fuchsia', 'iron-fuchsia', '#6b3a6b', 3),
  ('color-dyson', 'Purple', 'purple', '#6a5acd', 4),
  ('color-dyson', 'Gold', 'gold', '#cfb53b', 5),
  ('color-dyson', 'Red', 'red', '#c41e3a', 6),
  ('color-dyson', 'White / Silver', 'white-silver', '#e8e8e8', 7),
  ('color-dyson', 'Black / Nickel', 'black-nickel', '#2c2c2c', 8),
  ('color-dyson', 'Vinca Blue', 'vinca-blue', '#4a6fa5', 9),
  ('color-dyson', 'Ceramic Pink', 'ceramic-pink', '#f4c2c2', 10),
  ('color-dyson', 'Yellow', 'yellow', '#ffd700', 11),
  ('color-dyson', 'Bright Nickel', 'bright-nickel', '#c9c0bb', 12),
  ('color-dyson', 'Blue', 'blue', '#0066cc', 13),
  ('color-dyson', 'Black', 'black', '#1a1a1a', 14)
) AS v(attr_slug, label, value, color_hex, sort) ON a.slug = v.attr_slug
ON CONFLICT (attribute_id, value) DO NOTHING;

-- Встроенная память 16 ГБ — 2 ТБ
INSERT INTO public.product_attribute_values (attribute_id, label, value, color_hex, sort)
SELECT a.id, v.label, v.value, NULL, v.sort
FROM public.product_attributes a
JOIN (VALUES
  ('storage', '16 ГБ', '16gb', 1),
  ('storage', '32 ГБ', '32gb', 2),
  ('storage', '64 ГБ', '64gb', 3),
  ('storage', '128 ГБ', '128gb', 4),
  ('storage', '256 ГБ', '256gb', 5),
  ('storage', '512 ГБ', '512gb', 6),
  ('storage', '1 ТБ', '1tb', 7),
  ('storage', '2 ТБ', '2tb', 8)
) AS v(attr_slug, label, value, sort) ON a.slug = v.attr_slug
ON CONFLICT (attribute_id, value) DO NOTHING;

-- Оперативная память 2 — 64 ГБ
INSERT INTO public.product_attribute_values (attribute_id, label, value, color_hex, sort)
SELECT a.id, v.label, v.value, NULL, v.sort
FROM public.product_attributes a
JOIN (VALUES
  ('ram', '2 ГБ', '2gb', 1),
  ('ram', '3 ГБ', '3gb', 2),
  ('ram', '4 ГБ', '4gb', 3),
  ('ram', '6 ГБ', '6gb', 4),
  ('ram', '8 ГБ', '8gb', 5),
  ('ram', '12 ГБ', '12gb', 6),
  ('ram', '16 ГБ', '16gb', 7),
  ('ram', '18 ГБ', '18gb', 8),
  ('ram', '24 ГБ', '24gb', 9),
  ('ram', '32 ГБ', '32gb', 10),
  ('ram', '64 ГБ', '64gb', 11)
) AS v(attr_slug, label, value, sort) ON a.slug = v.attr_slug
ON CONFLICT (attribute_id, value) DO NOTHING;
