import sharp from "sharp"

export interface NormalizeImageOptions {
  /** Размер итогового квадратного холста (по умолчанию 800) */
  canvasSize?: number
  /** Максимальный размер полезной области контента внутри холста (по умолчанию 700) */
  contentMaxSize?: number
  /** Безопасный отступ вокруг контента (по умолчанию 15) */
  padding?: number
  /** Качество JPEG на выходе (1-100, по умолчанию 92) */
  quality?: number
  /** Фоновый цвет холста (по умолчанию белый #ffffff) */
  background?: { r: number; g: number; b: number }
}

/**
 * Автоматически нормализует и центрирует фотографию товара:
 * 1. Корректирует ориентацию по EXIF (.rotate()).
 * 2. Сводит прозрачные каналы PNG/WebP на чистый белый фон.
 * 3. Находит реальную полезную область объекта (bounding box) на белом фоне.
 * 4. Обрезает лишние пустые поля с безопасным отступом.
 * 5. Пропорционально масштабирует изображение товара до 700x700 без искажений.
 * 6. Центрирует изображение на идеальном квадратном холсте 800x800.
 * 7. Кодирует в оптимизированный JPEG (92% качество).
 */
export async function normalizeProductImage(
  input: Buffer | Uint8Array,
  options: NormalizeImageOptions = {}
): Promise<Buffer> {
  const canvasSize = options.canvasSize ?? 800
  const contentMaxSize = options.contentMaxSize ?? 700
  const pad = options.padding ?? 15
  const quality = options.quality ?? 92
  const bg = options.background ?? { r: 255, g: 255, b: 255 }

  const baseImage = sharp(input).rotate().flatten({ background: bg })
  const { data: raw, info } = await baseImage.raw().toBuffer({ resolveWithObject: true })

  let minX = info.width
  let maxX = 0
  let minY = info.height
  let maxY = 0

  const threshold = 245 // порог светлого/белого фона

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels
      const r = raw[idx]
      const g = raw[idx + 1]
      const b = raw[idx + 2]

      if (r < threshold || g < threshold || b < threshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // Если контент не обнаружен (например, полностью белый фон), берем всю картинку
  if (maxX <= minX || maxY <= minY) {
    minX = 0
    minY = 0
    maxX = info.width - 1
    maxY = info.height - 1
  }

  // Безопасный отступ вокруг контента
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(info.width - 1, maxX + pad)
  maxY = Math.min(info.height - 1, maxY + pad)

  const cropW = Math.max(1, maxX - minX + 1)
  const cropH = Math.max(1, maxY - minY + 1)

  // Извлекаем полезный контент
  const extracted = await sharp(input)
    .rotate()
    .flatten({ background: bg })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .toBuffer()

  // Вписываем в квадрат contentMaxSize x contentMaxSize (700x700)
  const resized = await sharp(extracted)
    .resize({
      width: contentMaxSize,
      height: contentMaxSize,
      fit: "inside",
      withoutEnlargement: false,
    })
    .toBuffer({ resolveWithObject: true })

  // Вычисляем симметричные отступы до 800x800
  const topPad = Math.floor((canvasSize - resized.info.height) / 2)
  const botPad = Math.ceil((canvasSize - resized.info.height) / 2)
  const leftPad = Math.floor((canvasSize - resized.info.width) / 2)
  const rightPad = Math.ceil((canvasSize - resized.info.width) / 2)

  // Центрируем на квадратном белом холсте 800x800
  return sharp(resized.data)
    .extend({
      top: Math.max(0, topPad),
      bottom: Math.max(0, botPad),
      left: Math.max(0, leftPad),
      right: Math.max(0, rightPad),
      background: bg,
    })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer()
}
