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
  title text not null default 'Баннер',
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

-- Изменять баннеры могут все аутентифицированные пользователи / сервисная роль админки
drop policy if exists "Admins can insert banners" on public.banners;
create policy "Admins can insert banners"
  on public.banners for insert
  with check (true);

drop policy if exists "Admins can update banners" on public.banners;
create policy "Admins can update banners"
  on public.banners for update
  using (true)
  with check (true);

drop policy if exists "Admins can delete banners" on public.banners;
create policy "Admins can delete banners"
  on public.banners for delete
  using (true);

-- ============================================================
-- 2. Storage — бакет для изображений баннеров
-- ============================================================
insert into storage.buckets (id, name, public)
values ('banner-images', 'banner-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read banner images" on storage.objects;
create policy "Public read banner images"
  on storage.objects for select
  using (bucket_id = 'banner-images');

drop policy if exists "Admins manage banner images" on storage.objects;
create policy "Admins manage banner images"
  on storage.objects for all
  using (bucket_id = 'banner-images')
  with check (bucket_id = 'banner-images');

-- Перезагрузка кеша схемы PostgREST
NOTIFY pgrst, 'reload schema';
