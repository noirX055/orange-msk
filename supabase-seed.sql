-- ============================================================
-- Orange MSK — создание тестовых пользователей
-- Выполните ПОСЛЕ supabase-setup.sql в Supabase SQL Editor
-- ============================================================

-- Тестовый пользователь
-- Email: user@orange-msk.ru | Пароль: user1234
insert into auth.users (
  instance_id, id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'user@orange-msk.ru',
  crypt('user1234', gen_salt('bf')),
  now(),
  '{"full_name": "Иван Покупатель", "role": "user"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  now(), now(),
  '', '', '', '', '', '', '', ''
);

-- Тестовый админ
-- Email: admin@orange-msk.ru | Пароль: admin1234
insert into auth.users (
  instance_id, id, aud, role,
  email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, raw_app_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change,
  email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'admin@orange-msk.ru',
  crypt('admin1234', gen_salt('bf')),
  now(),
  '{"full_name": "Анна Администратор", "role": "admin"}'::jsonb,
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  now(), now(),
  '', '', '', '', '', '', '', ''
);
