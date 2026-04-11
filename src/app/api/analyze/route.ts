// src/app/api/analyze/route.ts
// メインの解析APIエンドポイント

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { extractText, validateExtractedText } from '@/lib/extract'
import { getSystemPrompt, buildUserMessage } from '@/lib/prompts'
import { adminStorage, adminDb, verifyIdToken } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimit'
import type { CategoryId, AnalysisResult } from '@/types'

// storageRef は tmp/{uid}/{uuid}.pdf または tmp/{uid}/{uuid}.img のみ許可
// パストラバーサル攻撃（../）を防ぐ
const STORAGE_REF_PATTERN = /^tmp\/[a-zA-Z0-9]+\/[0-9a-f-]+\.(pdf|img)$/

// ── バリデーション ────────────────────────────────────
const RequestSchema = z.object({
  category: z.enum([
    'real_estate', 'mobile', 'insurance', 'loan', 'employment',
  ]),
  storageRef: z.string().regex(STORAGE_REF_PATTERN, 'storageRef の形式が不正です'),
  mimeType: z.enum([
    'application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  ]),
  userQuestion: z.string().max(500).optional(),
})

// ── Anthropic クライアント ─────────────────────────────
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  timeout: 55_000, // Vercelの60秒制限に合わせて55秒
})

// ── Claude API リトライ付き呼び出し ───────────────────
async function callClaudeWithRetry(
  params: Anthropic.MessageCreateParamsNonStreaming,
  maxRetries = 2
): Promise<Anthropic.Message> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await anthropic.messages.create(params)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      const isRetryable =
        lastError.message.toLowerCase().includes('timeout') ||
        lastError.message.toLowerCase().includes('request timeout') ||
        (err as { status?: number })?.status === 529 || // Overloaded
        (err as { status?: number })?.status === 500
      if (!isRetryable || attempt === maxRetries) throw lastError
      // 指数バックオフ: 1秒 → 2秒
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
    }
  }
  throw lastError
}

// ── POST ハンドラ ─────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 0. レートリミットチェック
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    const rl = checkRateLimit(ip)
    if (!rl.ok) {
      return NextResponse.json(
        { error: `リクエストが多すぎます。${rl.retryAfter}秒後に再試行してください。` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    // 1. 認証トークン検証（任意 — 匿名ユーザーも利用可）
    const userId = await verifyIdToken(req)

    // 2. リクエストのバリデーション
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'リクエストの形式が正しくありません' }, { status: 400 })
    }
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'リクエストの形式が正しくありません' }, // details は外部に返さない
        { status: 400 }
      )
    }

    const { category, storageRef, mimeType, userQuestion } = parsed.data

    // 3. storageRef が認証済みユーザーのパスと一致することを確認
    // 例: tmp/anonymous/xxx.pdf または tmp/{userId}/xxx.pdf
    const expectedPrefix = `tmp/${userId ?? 'anonymous'}/`
    if (!storageRef.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: '不正なファイルパスです' },
        { status: 403 }
      )
    }

    // 4. Firebase Storage からファイルを取得
    const bucket = adminStorage.bucket()
    const file = bucket.file(storageRef)
    const [fileBuffer] = await file.download()

    // 5. テキスト抽出
    const extractedText = await extractText(fileBuffer, mimeType)

    // 6. 抽出結果のバリデーション
    const validation = validateExtractedText(extractedText)
    if (!validation.valid) {
      // ファイルを即削除
      await file.delete().catch(() => {})
      return NextResponse.json(
        { error: validation.message },
        { status: 422 }
      )
    }

    // 7. Claude API 呼び出し（タイムアウト時リトライあり）
    const systemPrompt  = getSystemPrompt(category as CategoryId)
    const userMessage   = buildUserMessage(extractedText, category as CategoryId, userQuestion)

    const message = await callClaudeWithRetry({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    // 8. レスポンスをパース
    const rawContent = message.content[0]
    if (rawContent.type !== 'text') {
      throw new Error('Claude から予期しない形式のレスポンスが返されました')
    }

    let result: AnalysisResult
    try {
      // JSON だけ取り出す（余分な文字を除去）
      const jsonText = rawContent.text
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      result = JSON.parse(jsonText)
    } catch {
      throw new Error('AI の出力を解析できませんでした。再試行してください。')
    }

    // 9. Firestore に結果を保存（任意 — 履歴機能用、認証済みユーザーのみ）
    // 保存失敗しても解析結果は返す（フォールバック）
    if (userId) {
      adminDb
        .collection('users')
        .doc(userId)
        .collection('analyses')
        .add({
          ...result,
          createdAt: new Date(),
          // storageRef は削除済みなので保存不要
        })
        .catch((e: unknown) => console.error('[analyze] Firestore save failed:', e))
    }

    // 10. ファイルを即削除（プライバシー保護）
    await file.delete().catch((e: unknown) => console.error('[analyze] Storage delete failed:', e))

    return NextResponse.json({ result })

  } catch (err) {
    console.error('[analyze] error:', err)

    // エラー種別に応じたユーザー向けメッセージ
    const errMsg = err instanceof Error ? err.message : String(err)
    const status = (err as { status?: number })?.status

    let userMessage: string
    let httpStatus = 500

    if (errMsg.includes('Firebase Admin') || errMsg.includes('環境変数')) {
      userMessage = 'サーバーの設定に問題があります。管理者に連絡してください。'
      httpStatus = 503
    } else if (status === 529 || errMsg.toLowerCase().includes('overloaded')) {
      userMessage = 'AIサーバーが混み合っています。しばらく待ってから再試行してください。'
      httpStatus = 503
    } else if (errMsg.toLowerCase().includes('timeout')) {
      userMessage = '解析に時間がかかりすぎました。ファイルサイズを小さくするか、再試行してください。'
      httpStatus = 504
    } else if (status === 401 || errMsg.toLowerCase().includes('api key')) {
      userMessage = 'AI APIの認証に失敗しました。管理者に連絡してください。'
      httpStatus = 503
    } else if (errMsg.includes('JSON') || errMsg.includes('パース') || errMsg.includes('解析できません')) {
      userMessage = 'AIの出力を解析できませんでした。再試行してください。'
    } else {
      userMessage = '解析中にエラーが発生しました。再試行してください。'
    }

    return NextResponse.json({ error: userMessage }, { status: httpStatus })
  }
}
