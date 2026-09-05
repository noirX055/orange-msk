-- ============================================================
-- Orange MSK — Создание аккаунта менеджера для админ-панели
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  user_email text := 'manager@orange-msk.ru';
  user_pass text := 'Or@nge!Msk#7xK9$vL2';
  user_name text := 'Менеджер Магазина';
BEGIN
  -- 1. Если пользователь уже существует — обновляем пароль и роль
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    UPDATE auth.users
    SET
      encrypted_password = crypt(user_pass, gen_salt('bf')),
      raw_user_meta_data = jsonb_build_object('full_name', user_name, 'role', 'admin'),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now(),
      confirmation_token = coalesce(confirmation_token, ''),
      recovery_token = coalesce(recovery_token, ''),
      email_change = coalesce(email_change, ''),
      email_change_token_new = coalesce(email_change_token_new, ''),
      email_change_token_current = coalesce(email_change_token_current, ''),
      phone_change = coalesce(phone_change, ''),
      phone_change_token = coalesce(phone_change_token, ''),
      reauthentication_token = coalesce(reauthentication_token, '')
    WHERE email = user_email
    RETURNING id INTO new_user_id;

    -- Обновляем профиль с правами администратора
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, user_name, 'admin')
    ON CONFLICT (id) DO UPDATE SET
      full_name = excluded.full_name,
      role = 'admin',
      updated_at = now();

  ELSE
    -- 2. Если пользователя нет — создаём новую запись в auth.users
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password, email_confirmed_at,
      raw_user_meta_data, raw_app_meta_data,
      created_at, updated_at,
      confirmation_token, recovery_token, email_change,
      email_change_token_new, email_change_token_current,
      phone_change, phone_change_token, reauthentication_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      crypt(user_pass, gen_salt('bf')),
      now(),
      jsonb_build_object('full_name', user_name, 'role', 'admin'),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      now(), now(),
      '', '', '', '', '', '', '', ''
    );

    -- Создаём профиль с правами администратора
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (new_user_id, user_name, 'admin')
    ON CONFLICT (id) DO UPDATE SET
      full_name = excluded.full_name,
      role = 'admin',
      updated_at = now();
  END IF;
END$$;

-- Проверка созданного пользователя
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role,
  u.email_confirmed_at IS NOT NULL AS is_confirmed
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'manager@orange-msk.ru';
