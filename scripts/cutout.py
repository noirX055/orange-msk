"""Вырезание светлого фона у каталожных фото -> прозрачный PNG.

Заливка от четырёх углов (flood fill) по связной области с допуском,
чтобы не «продырявить» светлые части самого товара (белый корпус и т.п.).
Затем лёгкое сглаживание альфы и подрезка светлой каймы.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

SENTINEL = (255, 0, 255)  # маловероятный в фото цвет-маркер


def cutout(src: str, dst: str, thresh: int = 42) -> None:
    im = Image.open(src).convert("RGB")
    w, h = im.size

    marked = im.copy()
    for corner in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(marked, corner, SENTINEL, thresh=thresh)

    rgba = im.convert("RGBA")
    mpx = marked.load()
    px = rgba.load()

    # Собираем альфу: фон (маркер) -> 0
    alpha = Image.new("L", (w, h), 255)
    apx = alpha.load()
    for y in range(h):
        for x in range(w):
            if mpx[x, y] == SENTINEL:
                apx[x, y] = 0

    # Лёгкое размытие альфы для мягкого края, затем подрезаем полутени
    alpha = alpha.filter(ImageFilter.GaussianBlur(0.8))
    apx = alpha.load()
    for y in range(h):
        for x in range(w):
            a = apx[x, y]
            if a < 128:
                apx[x, y] = 0
            else:
                apx[x, y] = 255 if a > 200 else int((a - 128) / (255 - 128) * 255)

    rgba.putalpha(alpha)

    # Обрезаем прозрачные поля -> товар занимает весь кадр
    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    rgba.save(dst)
    print(f"{src} -> {dst}  size={rgba.size}")


if __name__ == "__main__":
    pairs = [(sys.argv[i], sys.argv[i + 1]) for i in range(1, len(sys.argv), 2)]
    for s, d in pairs:
        cutout(s, d)
