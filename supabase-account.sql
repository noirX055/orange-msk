-- ============================================================
-- Orange MSK — личный кабинет покупателя
-- Таблицы: orders, order_items, favorites, addresses
-- Выполните ПОСЛЕ supabase-setup.sql в Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. Заказы
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'new'
    check (status in ('new', 'processing', 'shipping', 'done', 'cancelled')),
  subtotal integer not null default 0,
  delivery integer not null default 0,
  total integer not null default 0,
  recipient_name text,
  phone text,
  address text,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own orders" on public.orders;
create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Админы видят все заказы (is_admin() определена в supabase-setup.sql)
drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

-- ============================================================
-- 2. Позиции заказа
-- ============================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  name text not null,
  category text,
  color text,
  price integer not null default 0,
  quantity integer not null default 1
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

-- Доступ к позициям — через владение родительским заказом
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Users can insert own order items" on public.order_items;
create policy "Users can insert own order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

-- ============================================================
-- 3. Избранное
-- ============================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create index if not exists favorites_user_id_idx on public.favorites (user_id, created_at desc);

alter table public.favorites enable row level security;

drop policy if exists "Users can view own favorites" on public.favorites;
create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add own favorites" on public.favorites;
create policy "Users can add own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove own favorites" on public.favorites;
create policy "Users can remove own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. Адреса доставки
-- ============================================================
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  city text not null default 'Москва',
  street text not null,
  apartment text,
  comment text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id, created_at desc);

alter table public.addresses enable row level security;

drop policy if exists "Users can view own addresses" on public.addresses;
create policy "Users can view own addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add own addresses" on public.addresses;
create policy "Users can add own addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own addresses" on public.addresses;
create policy "Users can update own addresses"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own addresses" on public.addresses;
create policy "Users can delete own addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 5. Демо-данные для тестового пользователя (user@orange-msk.ru)
--    Безопасно к повторному запуску: чистим прошлые демо-строки.
-- ============================================================
do $$
declare
  demo_user uuid;
  demo_order uuid;
begin
  select id into demo_user from auth.users where email = 'user@orange-msk.ru';

  if demo_user is null then
    raise notice 'Тестовый пользователь не найден — пропускаю демо-данные';
    return;
  end if;

  -- Чистим предыдущие демо-данные, чтобы скрипт был идемпотентным
  delete from public.orders where user_id = demo_user;
  delete from public.favorites where user_id = demo_user;
  delete from public.addresses where user_id = demo_user;

  -- Адрес по умолчанию
  insert into public.addresses (user_id, label, city, street, apartment, is_default)
  values (demo_user, 'Дом', 'Москва', 'ул. Тверская, 12', 'кв. 45', true);

  -- Избранное
  insert into public.favorites (user_id, product_slug) values
    (demo_user, 'iphone-16-pro-256'),
    (demo_user, 'sony-wh-1000xm6'),
    (demo_user, 'macbook-air-13-m4');

  -- Заказ №1 — доставлен
  insert into public.orders (user_id, status, subtotal, delivery, total, recipient_name, phone, address)
  values (demo_user, 'done', 144980, 0, 144980, 'Иван Покупатель', '+7 (900) 000-00-00', 'Москва, ул. Тверская, 12, кв. 45')
  returning id into demo_order;

  insert into public.order_items (order_id, product_slug, name, category, color, price, quantity) values
    (demo_order, 'iphone-16-pro-256', 'iPhone 16 Pro 256 ГБ', 'smartphones', 'Титан', 119990, 1),
    (demo_order, 'apple-airpods-pro-3', 'Apple AirPods Pro 3', 'audio', 'Белый', 24990, 1);

  -- Заказ №2 — в доставке
  insert into public.orders (user_id, status, subtotal, delivery, total, recipient_name, phone, address)
  values (demo_user, 'shipping', 39990, 490, 40480, 'Иван Покупатель', '+7 (900) 000-00-00', 'Москва, ул. Тверская, 12, кв. 45')
  returning id into demo_order;

  insert into public.order_items (order_id, product_slug, name, category, color, price, quantity) values
    (demo_order, 'sony-wh-1000xm6', 'Наушники Sony WH-1000XM6', 'audio', 'Чёрный', 39990, 1);
end $$;
