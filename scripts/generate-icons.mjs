// scripts/generate-icons.mjs
// SVGアイコンから各サイズのPNGを生成する
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SVG_PATH = resolve(ROOT, 'public/icons/icon.svg')
const OUT_DIR = resolve(ROOT, 'public/icons')

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

const svgBuffer = readFileSync(SVG_PATH)

for (const size of SIZES) {
  const outPath = resolve(OUT_DIR, `icon-${size}.png`)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath)
  console.log(`✓ icon-${size}.png`)
}

console.log('\nDone! All icons generated.')
