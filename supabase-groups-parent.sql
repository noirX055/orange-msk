-- Добавление колонки parent_group для объединения групп в общую группу (например, "Айфоны")
ALTER TABLE public.product_groups
  ADD COLUMN IF NOT EXISTS parent_group text;

CREATE INDEX IF NOT EXISTS idx_product_groups_parent ON public.product_groups(parent_group);
