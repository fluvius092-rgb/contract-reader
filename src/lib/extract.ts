// src/lib/extract.ts
// PDF / 画像からテキストを抽出するユーティリティ

/**
 * PDFバッファからテキストを抽出する
 * サーバーサイド（API Route）で実行する
 */
export async function extractFromPdf(buffer: Buffer): Promise<string> {
  // pdf-parse を動的インポート（サーバー専用）
  const pdfParse = (await import('pdf-parse')).default
  const data = await pdfParse(buffer)
  return data.text.trim()
}

/**
 * 画像バッファからテキストを抽出する（OCR）
 * Tesseract.js を使用。日本語対応。
 */
export async function extractFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const { createWorker } = await import('tesseract.js')

  const worker = await createWorker('jpn+eng', 1, {
    logger: () => {}, // ログ抑制
  })

  // バッファを base64 Data URL に変換
  const base64 = buffer.toString('base64')
  const dataUrl = `data:${mimeType};base64,${base64}`

  const { data } = await worker.recognize(dataUrl)
  await worker.terminate()

  return data.text.trim()
}

/**
 * ファイルの MIME タイプに応じてテキスト抽出を振り分ける
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return extractFromPdf(buffer)
  }

  if (mimeType.startsWith('image/')) {
    return extractFromImage(buffer, mimeType)
  }

  throw new Error(`未対応のファイル形式です: ${mimeType}`)
}

/**
 * 抽出テキストが少なすぎる場合のバリデーション
 */
export function validateExtractedText(text: string): {
  valid: boolean
  message?: string
} {
  if (!text || text.trim().length < 50) {
    return {
      valid: false,
      message: 'テキストが十分に読み取れませんでした。より鮮明な画像またはPDFをお試しください。',
    }
  }
  // 日本語文字が含まれているか確認
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
  if (!hasJapanese && text.length < 200) {
    return {
      valid: false,
      message: '日本語の契約書が読み取れませんでした。ファイルを確認してください。',
    }
  }
  return { valid: true }
}
