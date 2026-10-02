-- ============================================================
-- Orange MSK — Интеграция с Яндекс.Маркет Partner API
-- Выполните этот скрипт в Supabase SQL Editor (или Dashboard)
-- ============================================================

-- 1. Таблица настроек подключения к Яндекс.Маркет
CREATE TABLE IF NOT EXISTS public.yandex_market_settings (
  id text PRIMARY KEY DEFAULT 'default',
  api_key text,
  campaign_id text,
  business_id text,
  warehouse_id text,
  feed_url text DEFAULT 'https://orangemsk.ru/yandex-feed.xml',
  auto_sync_prices boolean DEFAULT false,
  auto_sync_stocks boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Вставляем запись по умолчанию, если таблица пуста
INSERT INTO public.yandex_market_settings (id, feed_url)
VALUES ('default', 'https://orangemsk.ru/yandex-feed.xml')
ON CONFLICT (id) DO NOTHING;

-- 2. Таблица логов синхронизации
CREATE TABLE IF NOT EXISTS public.yandex_market_sync_logs (
  id bigserial PRIMARY KEY,
  action text NOT NULL,              -- sync_prices, sync_stocks, push_catalog, feed_refresh
  status text NOT NULL,              -- success, error, warning
  items_count integer DEFAULT 0,
  message text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Индекс для быстрой выборки последних логов
CREATE INDEX IF NOT EXISTS idx_ym_sync_logs_created_at
  ON public.yandex_market_sync_logs (created_at DESC);

-- 3. Политики безопасности (RLS)
ALTER TABLE public.yandex_market_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yandex_market_sync_logs ENABLE ROW LEVEL SECURITY;

-- Разрешаем доступ только администраторам
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'yandex_market_settings' AND policyname = 'Admin full access to yandex_market_settings'
  ) THEN
    CREATE POLICY "Admin full access to yandex_market_settings"
      ON public.yandex_market_settings
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'yandex_market_sync_logs' AND policyname = 'Admin full access to yandex_market_sync_logs'
  ) THEN
    CREATE POLICY "Admin full access to yandex_market_sync_logs"
      ON public.yandex_market_sync_logs
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END$$;
