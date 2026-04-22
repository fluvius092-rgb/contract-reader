// src/app/api/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { extractFromPdf, imageToBase64, validateImageSize } from '@/lib/extract'
import { getSystemPrompt, buildUserMessage, buildVisionMessages, buildMergeMessage } from '@/lib/prompts'
import { adminStorage, adminDb, verifyIdToken } from '@/lib/firebase-admin'
import { checkBurstLimit, checkDailyLimit } from '@/lib/rateLimit'
import { logError } from '@/lib/logSafe'
import { AnalysisResultSchema } from '@/lib/analysisSchema'
import type { CategoryId, AnalysisResult } from '@/types'

const CLAUDE_MODEL_HAIKU  = process.env.CLAUDE_MODEL_HAIKU  ?? 'claude-haiku-4-5-20251001'
const CLAUDE_MODEL_SONNET = process.env.CLAUDE_MODEL_SONNET ?? 'claude-sonnet-4-6'
const MAX_IMAGES_PER_CALL = 20  // Claude API の1回あたり上限

// storageRef は tmp/{uid}/{uuid}.pdf または tmp/{uid}/{uuid}.{ext} のみ許可
const STORAGE_REF_PATTERN = /^tmp\/[a-zA-Z0-9]+\/[0-9a-f-]+\.(pdf|jpg|jpeg|png|webp|heic)$/i

// ── バリデーション ────────────────────────────────────
const StorageRefItem = z.object({
  ref:      z.string().regex(STORAGE_REF_PATTERN, 'storageRef の形式が不正です'),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']),
})

const RequestSchema = z.object({
  category:     z.enum(['real_estate', 'mobile', 'insurance', 'loan', 'employment', 'other']),
  files:        z.array(StorageRefItem).min(1).max(60),
  userQuestion: z.string().max(500).optional(),
})

// ── Anthropic クライアント ─────────────────────────────
const anthropic = new Anthropic({
  apiKey:  process.env.ANTHROPIC_API_KEY!,
  timeout: 55_000,
})

// ── リトライ付き Claude 呼び出し ──────────────────────
async function callClaude(
  params: Anthropic.MessageCreateParamsNonStreaming,
  maxRetries = 2,
): Promise<Anthropic.Message> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await anthropic.messages.create(params)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const status = (err as { status?: number })?.status
      const isRetryable =
        lastError.message.toLowerCase().includes('timeout') ||
        status === 529 || status === 500
      if (!isRetryable || attempt === maxRetries) throw lastError
      const base = 1000 * (attempt + 1)
      const jitter = Math.floor(Math.random() * 500) - 250
      await new Promise(r => setTimeout(r, base + jitter))
    }
  }
  throw lastError
}

// ── JSON パース + スキーマ検証 ────────────────────────
function parseAndValidate(text: string): AnalysisResult {
  const jsonText = text
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  const parsed = JSON.parse(jsonText)
  const validated = AnalysisResultSchema.safeParse(parsed)
  if (!validated.success) {
    logError('analyze:schema', validated.error)
    throw new Error('AIの出力を解析できませんでした。再試行してください。')
  }
  return validated.data
}

// ── 画像を Vision で解析（最大20枚/回）─────────────────
async function analyzeImages(
  images: Array<{ base64: string; mimeType: string }>,
  systemPrompt: string,
  category: CategoryId,
  model: string,
  userQuestion?: string,
): Promise<string> {
  const content = buildVisionMessages(images, category, userQuestion)
  const message = await callClaude({
    model,
    max_tokens: 4096,
    system:     systemPrompt,
    messages:   [{ role: 'user', content }],
  })
  const raw = message.content[0]
  if (raw.type !== 'text') throw new Error('Claude から予期しない形式のレスポンスが返されました')
  return raw.text
}

// ── POST ハンドラ ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 0. バーストリミット（IP）
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    const burst = checkBurstLimit(ip)
    if (!burst.ok) {
      return NextResponse.json(
        { error: `リクエストが多すぎます。${burst.retryAfter}秒後に再試行してください。` },
        { status: 429, headers: { 'Retry-After': String(burst.retryAfter) } },
      )
    }

    // 1. 認証
    const userId = await verifyIdToken(req)

    // 2. 日次制限
    const daily = await checkDailyLimit(ip, userId)
    if (!daily.ok) {
      return NextResponse.json(
        {
          error:        `解析上限に達しました。${daily.retryAfter}にリセットされます。`,
          planRequired: true,
        },
        { status: 429 },
      )
    }

    // 3. リクエストバリデーション
    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
    }
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
    }

    const { category, files, userQuestion } = parsed.data
    const expectedPrefix = `tmp/${userId ?? 'anonymous'}/`

    // 4. storageRef の所有者チェック
    for (const f of files) {
      if (!f.ref.startsWith(expectedPrefix)) {
        return NextResponse.json({ error: '不正なファイルパスです' }, { status: 403 })
      }
    }

    const CLAUDE_MODEL = (['one_time', 'sub_light', 'sub_std'] as const).includes(daily.plan as 'one_time' | 'sub_light' | 'sub_std')
      ? CLAUDE_MODEL_SONNET
      : CLAUDE_MODEL_HAIKU

    const { maxPages } = daily

    // 5. Firebase Storage から全ファイルをダウンロード
    const bucket = adminStorage.bucket()
    const fileBuffers = await Promise.all(
      files.map(async f => {
        const [buf] = await bucket.file(f.ref).download()
        return { buf, mimeType: f.mimeType, ref: f.ref }
      }),
    )

    const systemPrompt = getSystemPrompt(category as CategoryId)
    let result: AnalysisResult

    // 6. PDF と画像で処理を分岐
    const pdfFiles   = fileBuffers.filter(f => f.mimeType === 'application/pdf')
    const imageFiles = fileBuffers.filter(f => f.mimeType !== 'application/pdf')

    if (pdfFiles.length > 0 && imageFiles.length === 0) {
      // ── PDF のみ: テキスト抽出 → Claude ─────────────
      const extracted = await Promise.all(pdfFiles.map(f => extractFromPdf(f.buf)))
      const totalPages = extracted.reduce((sum, e) => sum + e.numPages, 0)
      if (totalPages > maxPages) {
        await Promise.all(fileBuffers.map(f => bucket.file(f.ref).delete().catch(() => {})))
        return NextResponse.json(
          { error: `ご利用プランの上限（${maxPages}ページ）を超えています。プランをアップグレードしてください。`, planRequired: true },
          { status: 403 },
        )
      }
      const combined = extracted.map(e => e.text).join('\n\n')
      if (combined.trim().length < 50) {
        await Promise.all(fileBuffers.map(f => bucket.file(f.ref).delete().catch(() => {})))
        return NextResponse.json(
          { error: 'PDFからテキストを読み取れませんでした。スキャンPDFの場合は画像としてアップロードしてください。' },
          { status: 422 },
        )
      }
      const userMsg = buildUserMessage(combined, category as CategoryId, userQuestion)
      const message = await callClaude({
        model:      CLAUDE_MODEL,
        max_tokens: 4096,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: userMsg }],
      })
      const raw = message.content[0]
      if (raw.type !== 'text') throw new Error('Claude から予期しない形式のレスポンスが返されました')
      result = parseAndValidate(raw.text)

    } else {
      // ── 画像（Vision）: 20枚ずつ分割 → 統合 ─────────
      // 各画像のピクセル数チェック（複数ページ合成画像を排除）
      await Promise.all(imageFiles.map(f => validateImageSize(f.buf)))

      if (imageFiles.length > maxPages) {
        await Promise.all(fileBuffers.map(f => bucket.file(f.ref).delete().catch(() => {})))
        return NextResponse.json(
          { error: `ご利用プランの上限（${maxPages}ページ）を超えています。プランをアップグレードしてください。`, planRequired: true },
          { status: 403 },
        )
      }
      const images = imageFiles.map(f => ({
        base64:   imageToBase64(f.buf),
        mimeType: f.mimeType,
      }))

      // 20枚ずつチャンクに分割
      const chunks: Array<typeof images> = []
      for (let i = 0; i < images.length; i += MAX_IMAGES_PER_CALL) {
        chunks.push(images.slice(i, i + MAX_IMAGES_PER_CALL))
      }

      if (chunks.length === 1) {
        // 20枚以下: そのまま1回のAPIコール
        const text = await analyzeImages(chunks[0], systemPrompt, category as CategoryId, CLAUDE_MODEL, userQuestion)
        result = parseAndValidate(text)
      } else {
        // 21枚以上: チャンクごとに解析 → 統合サマリー
        const partTexts = await Promise.all(
          chunks.map(chunk => analyzeImages(chunk, systemPrompt, category as CategoryId, CLAUDE_MODEL, userQuestion)),
        )
        const mergeMsg = buildMergeMessage(partTexts, category as CategoryId, userQuestion)
        const mergeMessage = await callClaude({
          model:      CLAUDE_MODEL,
          max_tokens: 4096,
          system:     systemPrompt,
          messages:   [{ role: 'user', content: mergeMsg }],
        })
        const raw = mergeMessage.content[0]
        if (raw.type !== 'text') throw new Error('Claude から予期しない形式のレスポンスが返されました')
        result = parseAndValidate(raw.text)
      }
    }

    // 7. カウント確定 + Firestore 保存 + Storage 削除（並列）
    const commitPromise  = daily.commit().catch((e: unknown) => logError('analyze:commit', e))

    const savePromise = userId
      ? adminDb.collection('users').doc(userId).collection('analyses')
          .add({ ...result, createdAt: new Date() })
          .catch((e: unknown) => logError('analyze:firestore', e))
      : Promise.resolve()

    const deletePromise = Promise.all(
      fileBuffers.map(f => bucket.file(f.ref).delete().catch((e: unknown) => logError('analyze:storage-delete', e))),
    )

    await Promise.all([commitPromise, savePromise, deletePromise])

    return NextResponse.json({ result, remaining: daily.remaining })

  } catch (err) {
    logError('analyze', err)

    const errMsg = err instanceof Error ? err.message : String(err)
    const status = (err as { status?: number })?.status
    const thrownHttpStatus = (err as { httpStatus?: number })?.httpStatus

    let userMessage: string
    let httpStatus = thrownHttpStatus ?? 500

    if (thrownHttpStatus === 413) {
      userMessage = errMsg
    } else if (errMsg.includes('Firebase Admin') || errMsg.includes('環境変数')) {
      userMessage = 'サーバーの設定に問題があります。管理者に連絡してください。'
      httpStatus = 503
      return NextResponse.json({ error: userMessage, serviceUnavailable: true }, { status: httpStatus })
    } else if (status === 529 || errMsg.toLowerCase().includes('overloaded')) {
      userMessage = 'AIサーバーが混み合っています。しばらく待ってから再試行してください。'
      httpStatus = 503
    } else if (errMsg.toLowerCase().includes('timeout')) {
      userMessage = '解析に時間がかかりすぎました。枚数を減らして再試行してください。'
      httpStatus = 504
    } else if (status === 401 || errMsg.toLowerCase().includes('api key')) {
      userMessage = 'AI APIの認証に失敗しました。管理者に連絡してください。'
      httpStatus = 503
      return NextResponse.json({ error: userMessage, serviceUnavailable: true }, { status: httpStatus })
    } else if (errMsg.includes('解析できません')) {
      userMessage = 'AIの出力を解析できませんでした。再試行してください。'
    } else {
      userMessage = '解析中にエラーが発生しました。再試行してください。'
    }

    return NextResponse.json({ error: userMessage }, { status: httpStatus })
  }
}
