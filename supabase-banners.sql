-- ============================================================
-- Orange MSK — баннеры главной страницы (промо-плитки)
-- Таблица banners, RLS, бакет Storage banner-images, сид.
-- Выполните ПОСЛЕ supabase-admin.sql. Идемпотентно.
-- ============================================================

-- ============================================================
-- 1. Таблица баннеров
-- ============================================================
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text not null default '',
  bg_color text not null default '#22303f',
  text_color text not null default 'light' check (text_color in ('light', 'dark')),
  image text not null default '',
  href text not null default '',
  is_visible boolean not null default true,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists banners_sort_idx on public.banners (sort);

alter table public.banners enable row level security;

-- Баннеры видны всем (публичная витрина фильтрует is_visible на уровне запроса)
drop policy if exists "Public can view banners" on public.banners;
create policy "Public can view banners"
  on public.banners for select
  using (true);

-- Изменять баннеры могут только админы (is_admin() из supabase-setup.sql)
drop policy if exists "Admins can insert banners" on public.banners;
create policy "Admins can insert banners"
  on public.banners for insert
  with check (public.is_admin());

drop policy if exists "Admins can update banners" on public.banners;
create policy "Admins can update banners"
  on public.banners for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete banners" on public.banners;
create policy "Admins can delete banners"
  on public.banners for delete
  using (public.is_admin());

-- Триггер updated_at (функция handle_updated_at из supabase-setup.sql)
drop trigger if exists on_banner_updated on public.banners;
create trigger on_banner_updated
  before update on public.banners
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 2. Сид баннеров (из референса). Картинки — локальные ассеты /public;
--    админ может заменить их загрузкой в бакет banner-images.
--    Идемпотентно: чистим прежний сид по known-заголовкам.
-- ============================================================
delete from public.banners
  where title in ('MacBook Neo', 'Dyson', 'Apple Watch S11', 'AirPods Pro 3');

insert into public.banners (title, subtitle, bg_color, text_color, image, href, is_visible, sort)
values
  ('MacBook Neo', E'Работай быстрее. Думай шире.\nЛёгкость. Мощь. Скорость.',
   '#5bb6d1', 'light', '/banners/cutouts/laptops.png', '/catalog?category=laptops', true, 1),
  ('Dyson', E'Забота о волосах на новом уровне.',
   '#d94f86', 'light', '/banners/cutouts/home.png', '/catalog?category=home', true, 2),
  ('Apple Watch S11', E'Контроль в каждом моменте.\nЖиви в ритме.',
   '#111318', 'light', '/banners/cutouts/wearables.png', '/catalog?category=wearables', true, 3),
  ('AirPods Pro 3', E'Совершенство в каждом звуке.\nТишина, которая звучит роскошно.',
   '#5cc0d4', 'light', '/banners/cutouts/audio.png', '/catalog?category=audio', true, 4);

-- Миграция ранее засеянных баннеров на вырезанные (прозрачные) изображения.
-- Безопасно для БД, где баннеры уже есть: меняет только путь картинки.
update public.banners set image = '/banners/cutouts/laptops.png'   where image = '/products/laptops/1.png';
update public.banners set image = '/banners/cutouts/home.png'      where image = '/products/home/1.png';
update public.banners set image = '/banners/cutouts/wearables.png' where image = '/products/wearables/1.png';
update public.banners set image = '/banners/cutouts/audio.png'     where image = '/products/audio/1.png';

-- ============================================================
-- 3. Storage — бакет для изображений баннеров
-- ============================================================
insert into storage.buckets (id, name, public)
values ('banner-images', 'banner-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read banner images" on storage.objects;
create policy "Public read banner images"
  on storage.objects for select
  using (bucket_id = 'banner-images');

drop policy if exists "Admins manage banner images" on storage.objects;
create policy "Admins manage banner images"
  on storage.objects for all
  using (bucket_id = 'banner-images' and public.is_admin())
  with check (bucket_id = 'banner-images' and public.is_admin());
