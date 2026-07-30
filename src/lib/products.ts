export type Category = {
  slug: string
  name: string
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  price: number
  oldPrice?: number
  rating: number
  reviews: number
  inStock: boolean
  badge?: "Новинка" | "Хит" | "Скидка"
  colors: { name: string; hex: string }[]
  description: string
  specs: { label: string; value: string }[]
}

export const categories: Category[] = [
  { slug: "smartphones", name: "Смартфоны" },
  { slug: "laptops", name: "Ноутбуки" },
  { slug: "monitors", name: "Мониторы" },
  { slug: "audio", name: "Аудио" },
  { slug: "wearables", name: "Гаджеты" },
  { slug: "home", name: "Техника для дома" },
]

export const products: Product[] = [
  {
    id: "1",
    slug: "iphone-16-pro-256",
    name: "iPhone 16 Pro 256 ГБ",
    brand: "Apple",
    category: "smartphones",
    price: 119990,
    oldPrice: 134990,
    rating: 4.9,
    reviews: 412,
    inStock: true,
    badge: "Хит",
    colors: [
      { name: "Титан", hex: "#8f8a85" },
      { name: "Чёрный", hex: "#22303f" },
      { name: "Песочный", hex: "#d8c7a9" },
    ],
    description:
      "Флагманский смартфон с чипом A18 Pro, титановым корпусом и системой камер 48 Мп. Экран ProMotion 120 Гц и до 27 часов воспроизведения видео.",
    specs: [
      { label: "Экран", value: "6.3\" Super Retina XDR, 120 Гц" },
      { label: "Процессор", value: "Apple A18 Pro" },
      { label: "Память", value: "8 / 256 ГБ" },
      { label: "Камера", value: "48 + 48 + 12 Мп" },
      { label: "Батарея", value: "3582 мАч" },
    ],
  },
  {
    id: "2",
    slug: "samsung-galaxy-s25-ultra",
    name: "Samsung Galaxy S25 Ultra 512 ГБ",
    brand: "Samsung",
    category: "smartphones",
    price: 124490,
    rating: 4.8,
    reviews: 289,
    inStock: true,
    badge: "Новинка",
    colors: [
      { name: "Титан серый", hex: "#6b7280" },
      { name: "Синий", hex: "#2b3f63" },
    ],
    description:
      "Смартфон с S Pen, дисплеем Dynamic AMOLED 2X и камерой 200 Мп. Snapdragon 8 Elite для игр и монтажа видео на ходу.",
    specs: [
      { label: "Экран", value: "6.9\" Dynamic AMOLED 2X, 120 Гц" },
      { label: "Процессор", value: "Snapdragon 8 Elite" },
      { label: "Память", value: "12 / 512 ГБ" },
      { label: "Камера", value: "200 + 50 + 12 + 10 Мп" },
      { label: "Батарея", value: "5000 мАч" },
    ],
  },
  {
    id: "3",
    slug: "xiaomi-redmi-note-14-pro",
    name: "Xiaomi Redmi Note 14 Pro 256 ГБ",
    brand: "Xiaomi",
    category: "smartphones",
    price: 27990,
    oldPrice: 32990,
    rating: 4.6,
    reviews: 934,
    inStock: true,
    badge: "Скидка",
    colors: [
      { name: "Чёрный", hex: "#1f2937" },
      { name: "Лавандовый", hex: "#b8a8c8" },
    ],
    description:
      "Сбалансированный смартфон среднего класса: AMOLED-экран 120 Гц, камера 200 Мп и быстрая зарядка 45 Вт.",
    specs: [
      { label: "Экран", value: "6.67\" AMOLED, 120 Гц" },
      { label: "Процессор", value: "MediaTek Helio G100" },
      { label: "Память", value: "8 / 256 ГБ" },
      { label: "Камера", value: "200 + 8 + 2 Мп" },
      { label: "Батарея", value: "5500 мАч" },
    ],
  },
  {
    id: "4",
    slug: "macbook-air-13-m4",
    name: "MacBook Air 13\" M4 16/512 ГБ",
    brand: "Apple",
    category: "laptops",
    price: 139990,
    rating: 4.9,
    reviews: 158,
    inStock: true,
    badge: "Хит",
    colors: [
      { name: "Серый космос", hex: "#4b5563" },
      { name: "Серебристый", hex: "#d4d7db" },
    ],
    description:
      "Тонкий и бесшумный ноутбук на чипе M4 с автономностью до 18 часов. Идеален для работы, учёбы и монтажа.",
    specs: [
      { label: "Экран", value: "13.6\" Liquid Retina, 2560×1664" },
      { label: "Процессор", value: "Apple M4, 10 ядер" },
      { label: "Память", value: "16 ГБ / SSD 512 ГБ" },
      { label: "Вес", value: "1.24 кг" },
      { label: "Автономность", value: "до 18 часов" },
    ],
  },
  {
    id: "5",
    slug: "asus-tuf-gaming-a15",
    name: "ASUS TUF Gaming A15 RTX 4060",
    brand: "ASUS",
    category: "laptops",
    price: 109990,
    oldPrice: 119990,
    rating: 4.7,
    reviews: 211,
    inStock: true,
    badge: "Скидка",
    colors: [{ name: "Чёрный", hex: "#22303f" }],
    description:
      "Игровой ноутбук с экраном 144 Гц, Ryzen 7 и GeForce RTX 4060. Усиленная система охлаждения для долгих сессий.",
    specs: [
      { label: "Экран", value: "15.6\" IPS, 144 Гц" },
      { label: "Процессор", value: "AMD Ryzen 7 7435HS" },
      { label: "Видеокарта", value: "GeForce RTX 4060 8 ГБ" },
      { label: "Память", value: "16 ГБ / SSD 1 ТБ" },
      { label: "Вес", value: "2.2 кг" },
    ],
  },
  {
    id: "6",
    slug: "samsung-odyssey-g5-27",
    name: "Монитор Samsung Odyssey G5 27\"",
    brand: "Samsung",
    category: "monitors",
    price: 24990,
    rating: 4.7,
    reviews: 342,
    inStock: true,
    colors: [{ name: "Чёрный", hex: "#1f2937" }],
    description:
      "Изогнутый игровой монитор 1000R с разрешением QHD и частотой 165 Гц. Поддержка AMD FreeSync Premium.",
    specs: [
      { label: "Диагональ", value: "27\"" },
      { label: "Разрешение", value: "2560×1440 QHD" },
      { label: "Частота", value: "165 Гц" },
      { label: "Матрица", value: "VA, изогнутая 1000R" },
      { label: "Порты", value: "HDMI 2.0, DisplayPort 1.2" },
    ],
  },
  {
    id: "7",
    slug: "lg-ultragear-32",
    name: "Монитор LG UltraGear 32\" 4K",
    brand: "LG",
    category: "monitors",
    price: 64990,
    oldPrice: 71990,
    rating: 4.8,
    reviews: 97,
    inStock: false,
    badge: "Скидка",
    colors: [{ name: "Чёрный", hex: "#22303f" }],
    description:
      "4K-монитор для работы с графикой и игр: 144 Гц, покрытие DCI-P3 95% и поддержка HDR10.",
    specs: [
      { label: "Диагональ", value: "31.5\"" },
      { label: "Разрешение", value: "3840×2160 4K" },
      { label: "Частота", value: "144 Гц" },
      { label: "Матрица", value: "Nano IPS" },
      { label: "Порты", value: "HDMI 2.1, DisplayPort, USB-C" },
    ],
  },
  {
    id: "8",
    slug: "sony-wh-1000xm6",
    name: "Наушники Sony WH-1000XM6",
    brand: "Sony",
    category: "audio",
    price: 39990,
    rating: 4.9,
    reviews: 528,
    inStock: true,
    badge: "Новинка",
    colors: [
      { name: "Чёрный", hex: "#1f2937" },
      { name: "Бежевый", hex: "#ded3c4" },
    ],
    description:
      "Беспроводные наушники с лучшим в классе шумоподавлением, LDAC и автономностью до 30 часов.",
    specs: [
      { label: "Тип", value: "Накладные, закрытые" },
      { label: "Шумоподавление", value: "Активное, адаптивное" },
      { label: "Кодеки", value: "LDAC, AAC, SBC" },
      { label: "Автономность", value: "до 30 часов" },
      { label: "Вес", value: "250 г" },
    ],
  },
  {
    id: "9",
    slug: "apple-airpods-pro-3",
    name: "Apple AirPods Pro 3",
    brand: "Apple",
    category: "audio",
    price: 24990,
    rating: 4.8,
    reviews: 764,
    inStock: true,
    colors: [{ name: "Белый", hex: "#f1f2f4" }],
    description:
      "TWS-наушники с адаптивным звуком, шумоподавлением и защитой IP57. Зарядный кейс с USB-C.",
    specs: [
      { label: "Тип", value: "Внутриканальные TWS" },
      { label: "Чип", value: "Apple H3" },
      { label: "Защита", value: "IP57" },
      { label: "Автономность", value: "до 8 часов + кейс" },
      { label: "Зарядка", value: "USB-C, MagSafe, Qi" },
    ],
  },
  {
    id: "10",
    slug: "apple-watch-series-11",
    name: "Apple Watch Series 11 46 мм",
    brand: "Apple",
    category: "wearables",
    price: 49990,
    rating: 4.8,
    reviews: 183,
    inStock: true,
    colors: [
      { name: "Чёрный", hex: "#22303f" },
      { name: "Серебристый", hex: "#d4d7db" },
      { name: "Оранжевый", hex: "#f5960c" },
    ],
    description:
      "Умные часы с ярким дисплеем Always-On, датчиком температуры и расширенным отслеживанием сна.",
    specs: [
      { label: "Корпус", value: "46 мм, алюминий" },
      { label: "Экран", value: "LTPO3 OLED, Always-On" },
      { label: "Датчики", value: "ЭКГ, SpO2, температура" },
      { label: "Защита", value: "50 м, IP6X" },
      { label: "Автономность", value: "до 24 часов" },
    ],
  },
  {
    id: "11",
    slug: "dyson-v15-detect",
    name: "Пылесос Dyson V15 Detect",
    brand: "Dyson",
    category: "home",
    price: 69990,
    oldPrice: 79990,
    rating: 4.7,
    reviews: 126,
    inStock: true,
    badge: "Скидка",
    colors: [{ name: "Жёлто-никелевый", hex: "#f5960c" }],
    description:
      "Беспроводной пылесос с лазерной подсветкой пыли и датчиком частиц. Показывает статистику уборки на экране.",
    specs: [
      { label: "Тип", value: "Вертикальный беспроводной" },
      { label: "Мощность всасывания", value: "240 АВт" },
      { label: "Автономность", value: "до 60 минут" },
      { label: "Пылесборник", value: "0.77 л" },
      { label: "Фильтр", value: "HEPA, полная фильтрация" },
    ],
  },
  {
    id: "12",
    slug: "samsung-ww90-washer",
    name: "Стиральная машина Samsung WW90 9 кг",
    brand: "Samsung",
    category: "home",
    price: 54990,
    rating: 4.6,
    reviews: 74,
    inStock: true,
    colors: [{ name: "Белый", hex: "#f1f2f4" }],
    description:
      "Стиральная машина с инверторным мотором, паровой обработкой и загрузкой 9 кг. Тихая работа и класс A+++.",
    specs: [
      { label: "Загрузка", value: "9 кг" },
      { label: "Отжим", value: "1400 об/мин" },
      { label: "Класс", value: "A+++" },
      { label: "Программы", value: "14, включая пар" },
      { label: "Габариты", value: "60×55×85 см" },
    ],
  },
]

export function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value)
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug)
}

export function getCategoryName(slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug
}

const galleryByCategory: Record<string, string[]> = {
  smartphones: [
    "/products/smartphones/1.png",
    "/products/smartphones/2.png",
    "/products/smartphones/3.png",
  ],
  laptops: ["/products/laptops/1.png", "/products/laptops/2.png", "/products/laptops/3.png"],
  monitors: ["/products/monitors/1.png", "/products/monitors/2.png", "/products/monitors/3.png"],
  audio: ["/products/audio/1.png", "/products/audio/2.png", "/products/audio/3.png"],
  wearables: ["/products/wearables/1.png", "/products/wearables/2.png", "/products/wearables/3.png"],
  home: ["/products/home/1.png", "/products/home/2.png", "/products/home/3.png"],
}

export function getProductImages(product: Product) {
  const gallery = galleryByCategory[product.category] ?? []
  // товары одной категории показывают снимки в разном порядке
  const offset = product.id.length % Math.max(gallery.length, 1)
  return [...gallery.slice(offset), ...gallery.slice(0, offset)]
}

export function getRelated(product: Product, limit = 4) {
  return products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .concat(products.filter((item) => item.category !== product.category))
    .slice(0, limit)
}
