-- Миграция: защита целостности slug категорий и групп
-- 1. Приведение всех существующих данных к нижнему регистру
UPDATE public.categories SET slug = lower(trim(slug));
UPDATE public.product_groups SET category_slug = lower(trim(category_slug));
UPDATE public.products SET category = lower(trim(category));

-- 2. Триггер для автоматического приведения slug к нижнему регистру при любой вставке или обновлении
CREATE OR REPLACE FUNCTION public.normalize_category_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    NEW.slug := lower(trim(NEW.slug));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_categories_slug ON public.categories;
CREATE TRIGGER trg_normalize_categories_slug
BEFORE INSERT OR UPDATE OF slug ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.normalize_category_slug();

CREATE OR REPLACE FUNCTION public.normalize_group_category_slug()
RETURNS trigger AS $$
BEGIN
  IF NEW.category_slug IS NOT NULL THEN
    NEW.category_slug := lower(trim(NEW.category_slug));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_product_groups_category_slug ON public.product_groups;
CREATE TRIGGER trg_normalize_product_groups_category_slug
BEFORE INSERT OR UPDATE OF category_slug ON public.product_groups
FOR EACH ROW EXECUTE FUNCTION public.normalize_group_category_slug();

-- 3. Ограничения проверки (CHECK constraints), запрещающие заглавные буквы
ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_slug_lower_check;
ALTER TABLE public.categories
  ADD CONSTRAINT categories_slug_lower_check CHECK (slug = lower(slug));

ALTER TABLE public.product_groups
  DROP CONSTRAINT IF EXISTS product_groups_category_slug_lower_check;
ALTER TABLE public.product_groups
  ADD CONSTRAINT product_groups_category_slug_lower_check CHECK (category_slug = lower(category_slug));
