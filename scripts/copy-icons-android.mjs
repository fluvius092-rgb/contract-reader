// scripts/copy-icons-android.mjs
// PWA アイコンを Android mipmap ディレクトリにコピー
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SVG_PATH = resolve(ROOT, 'public/icons/icon.svg')
const ANDROID_RES = resolve(ROOT, 'android/app/src/main/res')

// Android mipmap サイズ対応表
const MIPMAP_SIZES = {
  'mipmap-mdpi':    48,
  'mipmap-hdpi':    72,
  'mipmap-xhdpi':   96,
  'mipmap-xxhdpi':  144,
  'mipmap-xxxhdpi': 192,
}

const svgBuffer = readFileSync(SVG_PATH)

for (const [dir, size] of Object.entries(MIPMAP_SIZES)) {
  const outPath = resolve(ANDROID_RES, dir, 'ic_launcher.png')
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outPath)
  console.log(`✓ ${dir}/ic_launcher.png (${size}x${size})`)
}

console.log('\nDone! Android icons generated.')
