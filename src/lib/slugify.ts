const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  є: "ye", і: "i", ї: "yi", ґ: "g", ў: "u",
}

/**
 * Преобразует строку в безопасный URL-слаг / ключ хранилища:
 * - транслитерирует кириллицу в латиницу;
 * - приводит к нижнему регистру;
 * - заменяет пробелы и спецсимволы на дефисы;
 * - удаляет дублирующиеся и краевые дефисы;
 * - оставляет только символы [a-z0-9-].
 */
export function slugify(text: string): string {
  if (!text) return ""

  const translit = text
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC_MAP[char] || char)
    .join("")

  return translit
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}
