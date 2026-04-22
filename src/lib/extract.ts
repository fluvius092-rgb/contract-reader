// src/lib/extract.ts

/**
 * PDFバッファからテキストを抽出する（サーバーサイド専用）
 */
export async function extractFromPdf(buffer: Buffer): Promise<{ text: string; numPages: number }> {
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return { text: data.text.trim(), numPages: data.numpages }
}

// A4 300dpi 1ページ相当 ≈ 2480×3508 ≈ 8.7MP。複数ページ合成を防ぐため 12MP を上限とする。
const MAX_IMAGE_PIXELS = 12_000_000

export async function validateImageSize(buffer: Buffer): Promise<void> {
  const sharp = (await import('sharp')).default
  const { width = 0, height = 0 } = await sharp(buffer).metadata()
  if (width * height > MAX_IMAGE_PIXELS) {
    throw Object.assign(
      new Error(`画像サイズが大きすぎます（上限 ${Math.round(MAX_IMAGE_PIXELS / 1_000_000)}MP）。1ページずつ個別にアップロードしてください。`),
      { httpStatus: 413 },
    )
  }
}

/**
 * 画像バッファを Claude Vision 用の base64 文字列に変換する
 * OCR は行わず、Claude に直接渡す
 */
export function imageToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}
