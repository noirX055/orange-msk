-- ============================================================
-- Orange MSK — починка RLS: рекурсия в политике админа
-- Выполните в Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================
--
-- Причина: политика "Admins can view all profiles" делала подзапрос
-- к самой profiles внутри политики profiles → бесконечная рекурсия
-- (infinite recursion detected in policy for relation "profiles").
-- Лечение: вынести проверку роли в SECURITY DEFINER-функцию, которая
-- читает profiles в обход RLS.

-- 1. Функция проверки роли (в обход RLS)
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

-- 2. Пересоздаём политику без рекурсии
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());
