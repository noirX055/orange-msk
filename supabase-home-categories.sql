-- ============================================================
-- Orange MSK — карусель категорий на главной странице
-- Таблица home_categories, RLS, Storage bucket category-images, сид.
-- Идемпотентно.
-- ============================================================

-- 1. Таблица карточек категорий главной страницы
create table if not exists public.home_categories (
  id uuid primary key default gen_random_uuid(),
  category_label text not null default 'Категория',
  title text not null default 'Товар',
  image text not null default '',
  price_from text not null default '',
  href text not null default '/catalog',
  is_visible boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_categories_sort_idx on public.home_categories (sort);

alter table public.home_categories enable row level security;

-- Публичный просмотр
drop policy if exists "Public can view home_categories" on public.home_categories;
create policy "Public can view home_categories"
  on public.home_categories for select
  using (true);

-- Управление для администраторов
drop policy if exists "Admins can insert home_categories" on public.home_categories;
create policy "Admins can insert home_categories"
  on public.home_categories for insert
  with check (true);

drop policy if exists "Admins can update home_categories" on public.home_categories;
create policy "Admins can update home_categories"
  on public.home_categories for update
  using (true)
  with check (true);

drop policy if exists "Admins can delete home_categories" on public.home_categories;
create policy "Admins can delete home_categories"
  on public.home_categories for delete
  using (true);

-- 2. Storage — бакет для изображений категорий
insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read category images" on storage.objects;
create policy "Public read category images"
  on storage.objects for select
  using (bucket_id = 'category-images');

drop policy if exists "Admins manage category images" on storage.objects;
create policy "Admins manage category images"
  on storage.objects for all
  using (bucket_id = 'category-images')
  with check (bucket_id = 'category-images');

-- 3. Начальные данные по макету
insert into public.home_categories (category_label, title, image, price_from, href, is_visible, sort)
values
  ('Смартфоны', 'iPhone 16', '/categories/smartphone.png', 'от 99 900 ₽', '/catalog?category=apple&series=iPhone+16', true, 10),
  ('Смартфоны', 'iPhone 15', '/categories/smartphone.png', 'от 79 900 ₽', '/catalog?category=apple&series=iPhone+15', true, 20),
  ('Ноутбуки', 'MacBook', '/categories/laptop.png', 'от 129 900 ₽', '/catalog?category=apple&series=MacBook', true, 30),
  ('Планшеты', 'iPad', '/categories/laptop.png', 'от 59 900 ₽', '/catalog?category=apple&series=iPad', true, 40),
  ('Смарт-часы', 'Apple Watch', '/categories/whatch.png', 'от 39 900 ₽', '/catalog?category=apple&series=Apple+Watch', true, 50),
  ('Наушники', 'AirPods', '/categories/audi.png', 'от 19 900 ₽', '/catalog?category=apple&series=AirPods', true, 60)
on conflict do nothing;

NOTIFY pgrst, 'reload schema';
