-- Создание таблицы для групп товаров (серий)
CREATE TABLE IF NOT EXISTS public.product_groups (
  id serial PRIMARY KEY,
  name text NOT NULL,
  brand_id integer REFERENCES public.brands(id) ON DELETE CASCADE,
  category_slug text NOT NULL, -- привязка к slug категории
  UNIQUE(name, brand_id, category_slug)
);

-- Включаем RLS
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;

-- Политика на чтение (для всех)
CREATE POLICY "Public read product groups" ON public.product_groups FOR SELECT USING (true);

-- Политики на изменение (только для админов)
CREATE POLICY "Admins can insert product groups" ON public.product_groups FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update product groups" ON public.product_groups FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete product groups" ON public.product_groups FOR DELETE USING (public.is_admin());
