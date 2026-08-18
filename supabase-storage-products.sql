-- 1. Создание бакета products, если он еще не создан (выполнять от имени postgres/supabase_admin, или через Storage UI)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- 2. Разрешаем чтение всем (Public)
drop policy if exists "Public read products bucket" on storage.objects;
create policy "Public read products bucket"
on storage.objects for select
using ( bucket_id = 'products' );

-- 3. Разрешаем загрузку, удаление, обновление админам
drop policy if exists "Admins can upload products" on storage.objects;
create policy "Admins can upload products"
on storage.objects for insert
with check ( bucket_id = 'products' and public.is_admin() );

drop policy if exists "Admins can update products" on storage.objects;
create policy "Admins can update products"
on storage.objects for update
using ( bucket_id = 'products' and public.is_admin() );

drop policy if exists "Admins can delete products" on storage.objects;
create policy "Admins can delete products"
on storage.objects for delete
using ( bucket_id = 'products' and public.is_admin() );
