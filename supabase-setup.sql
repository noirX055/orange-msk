-- ============================================================
-- Orange MSK — настройка базы данных Supabase
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================================

-- 1. Таблица профилей пользователей
-- Связана с auth.users по id, заполняется автоматически через триггер
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Включаем Row Level Security
alter table public.profiles enable row level security;

-- 2a. Проверка роли админа.
-- SECURITY DEFINER: функция выполняется с правами владельца и читает
-- profiles в обход RLS. Без этого политика, ссылающаяся на profiles
-- изнутри самой profiles, вызывает бесконечную рекурсию.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 3. Политики доступа

-- Любой аутентифицированный пользователь может видеть свой профиль
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Пользователь может обновлять свой профиль (кроме роли)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Админы могут видеть все профили (без рекурсии — через is_admin())
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 4. Триггер: автоматически создаёт профиль при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Удаляем триггер если существует и создаём заново
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Триггер: обновляет updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();
