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

-- Стартовые характеристики (идемпотентно)
INSERT INTO public.product_attributes (slug, name, type, category_slug, sort)
VALUES
  ('color', 'Цвет', 'color', 'smartphones', 1),
  ('memory', 'Память', 'select', 'smartphones', 2),
  ('screen', 'Экран', 'text', 'smartphones', 3),
  ('processor', 'Процессор', 'text', 'smartphones', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.product_attribute_values (attribute_id, label, value, color_hex, sort)
SELECT a.id, v.label, v.value, v.color_hex, v.sort
FROM public.product_attributes a
JOIN (VALUES
  ('color', 'Чёрный', 'black', '#22303f', 1),
  ('color', 'Белый', 'white', '#f5f5f5', 2),
  ('color', 'Титан', 'titan', '#8f8a85', 3),
  ('color', 'Синий', 'blue', '#2b3f63', 4),
  ('memory', '128 ГБ', '128gb', NULL, 1),
  ('memory', '256 ГБ', '256gb', NULL, 2),
  ('memory', '512 ГБ', '512gb', NULL, 3),
  ('memory', '1 ТБ', '1tb', NULL, 4)
) AS v(attr_slug, label, value, color_hex, sort) ON a.slug = v.attr_slug
ON CONFLICT (attribute_id, value) DO NOTHING;
