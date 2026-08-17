-- ============================================================
-- Orange MSK — починка входа: "Database error querying schema"
-- Выполните в Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================
--
-- Причина: тестовые пользователи вставлены в auth.users напрямую,
-- и часть строковых токен-колонок осталась NULL. GoTrue (auth-сервер
-- на Go) не умеет читать NULL в строковые поля и падает при логине.
-- Лечение: заменить NULL на пустую строку ''.

update auth.users
set
  confirmation_token       = coalesce(confirmation_token, ''),
  recovery_token           = coalesce(recovery_token, ''),
  email_change             = coalesce(email_change, ''),
  email_change_token_new   = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change             = coalesce(phone_change, ''),
  phone_change_token       = coalesce(phone_change_token, ''),
  reauthentication_token   = coalesce(reauthentication_token, '')
where email in ('user@orange-msk.ru', 'admin@orange-msk.ru');

-- Проверка: обе строки должны вернуться, все поля — не NULL
select email, email_confirmed_at is not null as confirmed
from auth.users
where email in ('user@orange-msk.ru', 'admin@orange-msk.ru');
