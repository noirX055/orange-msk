import fs from "node:fs"
import sharp from "sharp"

const samples = [
  {
    name: "iphone-17e",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/iphone-17e-soft-pink-512gb-01460/0-20106.jpg",
  },
  {
    name: "iphone-17-pro",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/iphone-17-pro-silver-1tb-esim-01511/0-39681.jpg",
  },
  {
    name: "dyson-airwrap",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/stayler-dyson-airwrap-complete-long-hs05-diffuse-strawberry-bronze-blush-pink-40112/0-84042.jpg",
  },
  {
    name: "dyson-supersonic",
    url: "https://db.orangemsk.ru/storage/v1/object/public/products/fen-dyson-supersonic-hd07-blue-rose-s-keysom-40103/0-50117.jpg",
  },
]

for (const item of samples) {
  const res = await fetch(item.url)
  const buf = Buffer.from(await res.arrayBuffer())
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })

  let minX = info.width, maxX = 0, minY = info.height, maxY = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * info.channels
      const r = data[idx], g = data[idx + 1], b = data[idx + 2]
      if (r < 242 || g < 242 || b < 242) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // Safe padding
  minX = Math.max(0, minX - 10)
  minY = Math.max(0, minY - 10)
  maxX = Math.min(info.width - 1, maxX + 10)
  maxY = Math.min(info.height - 1, maxY + 10)

  const cropWidth = maxX - minX + 1
  const cropHeight = maxY - minY + 1

  const extracted = await sharp(buf)
    .extract({ left: minX, top: minY, width: cropWidth, height: cropHeight })
    .toBuffer()

  const resized = await sharp(extracted)
    .resize({ width: 700, height: 700, fit: "inside" })
    .toBuffer({ resolveWithObject: true })

  const outPath = `C:/Users/Artem/.gemini/antigravity/brain/fed0fc55-d59b-4259-830b-6f71c9bae407/scratch/sample-${item.name}-clean.jpg`

  await sharp(resized.data)
    .extend({
      top: Math.floor((800 - resized.info.height) / 2),
      bottom: Math.ceil((800 - resized.info.height) / 2),
      left: Math.floor((800 - resized.info.width) / 2),
      right: Math.ceil((800 - resized.info.width) / 2),
      background: { r: 255, g: 255, b: 255 },
    })
    .jpeg({ quality: 92 })
    .toFile(outPath)

  console.log(item.name, `Original ${info.width}x${info.height} -> Bounding Box ${cropWidth}x${cropHeight} -> 800x800`)
}
