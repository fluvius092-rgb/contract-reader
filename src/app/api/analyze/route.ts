// src/app/api/analyze/route.ts
// メインの解析APIエンドポイント

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { extractText, validateExtractedText } from '@/lib/extract'
import { getSystemPrompt, buildUserMessage } from '@/lib/prompts'
import { adminStorage, adminDb } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rateLimit'
import type { CategoryId, AnalysisResult } from '@/types'

// ── バリデーション ────────────────────────────────────
const RequestSchema = z.object({
  category: z.enum([
    'real_estate', 'mobile', 'insurance', 'loan', 'employment',
  ]),
  storageRef: z.string().min(1), // Firebase Storage のパス
  mimeType: z.string().min(1),
  userQuestion: z.string().optional(),
  userId: z.string().optional(),
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

    // 1. リクエストのバリデーション
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'リクエストの形式が正しくありません', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { category, storageRef, mimeType, userQuestion, userId } =
      parsed.data

    // 2. Firebase Storage からファイルを取得
    const bucket = adminStorage.bucket()
    const file = bucket.file(storageRef)
    const [fileBuffer] = await file.download()

    // 3. テキスト抽出
    const extractedText = await extractText(fileBuffer, mimeType)

    // 4. 抽出結果のバリデーション
    const validation = validateExtractedText(extractedText)
    if (!validation.valid) {
      // ファイルを即削除
      await file.delete().catch(() => {})
      return NextResponse.json(
        { error: validation.message },
        { status: 422 }
      )
    }

    // 5. Claude API 呼び出し（タイムアウト時リトライあり）
    const systemPrompt  = getSystemPrompt(category as CategoryId)
    const userMessage   = buildUserMessage(extractedText, category as CategoryId, userQuestion)

    const message = await callClaudeWithRetry({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    // 6. レスポンスをパース
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

    // 7. Firestore に結果を保存（任意 — 履歴機能用）
    // 保存失敗しても解析結果は返す（フォールバック）
    if (userId) {
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('analyses')
        .add({
          ...result,
          createdAt: new Date(),
          storageRef,
        })
        .catch(e => console.error('[analyze] Firestore save failed:', e))
    }

    // 8. ファイルを即削除（プライバシー保護）
    await file.delete().catch(console.error)

    return NextResponse.json({ result })

  } catch (err) {
    console.error('[analyze] error:', err)
    const message =
      err instanceof Error ? err.message : '解析中にエラーが発生しました'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
