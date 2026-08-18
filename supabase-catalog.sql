-- ============================================================
-- Orange MSK — таблицы каталога товаров
-- Выполнить в SQL Editor Supabase Studio
-- ============================================================

-- 1. Бренды
CREATE TABLE IF NOT EXISTS public.brands (
  id serial PRIMARY KEY,
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (true);

-- 2. Категории (с вложенностью)
CREATE TABLE IF NOT EXISTS public.categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  parent_id int REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

-- 3. Товары
CREATE TABLE IF NOT EXISTS public.products (
  id serial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  sku text,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  brand_id int REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id int REFERENCES public.categories(id) ON DELETE SET NULL,
  group_path text,
  price int NOT NULL DEFAULT 0,
  old_price int,
  in_stock boolean NOT NULL DEFAULT true,
  is_visible boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  specs jsonb NOT NULL DEFAULT '[]',
  images text[] NOT NULL DEFAULT '{}',
  is_traceable boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read visible products" ON public.products FOR SELECT USING (true);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products(is_visible);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);

-- Триггер updated_at для products
CREATE OR REPLACE FUNCTION public.handle_products_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_product_updated ON public.products;
CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_products_updated_at();
