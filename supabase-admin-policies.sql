-- Политики для того, чтобы администратор мог изменять данные в таблицах

-- Таблица товаров
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

-- Таблица брендов
CREATE POLICY "Admins can insert brands" ON public.brands FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update brands" ON public.brands FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete brands" ON public.brands FOR DELETE USING (public.is_admin());

-- Таблица категорий
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin());
