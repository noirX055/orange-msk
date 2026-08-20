-- Создание публичного бакета для изображений баннеров
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banner-images',
  'banner-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Разрешить публичный просмотр всех изображений в бакете banner-images
CREATE POLICY "Public Read Access for banner-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'banner-images');

-- Разрешить вставку/загрузку файлов для аутентифицированных пользователей и анонимных пользователей админки
CREATE POLICY "Public Upload Access for banner-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banner-images');

-- Разрешить обновление файлов в бакете banner-images
CREATE POLICY "Public Update Access for banner-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banner-images');

-- Разрешить удаление файлов из бакета banner-images
CREATE POLICY "Public Delete Access for banner-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'banner-images');
