// デバッグ用：実際にAnthropic APIを叩いて生エラーを返す
// ⚠️ 動作確認後すぐに削除すること

import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? ''
  const envInfo = {
    hasKey:           key.length > 0,
    length:           key.length,
    startsCorrectly:  key.startsWith('sk-ant-api03-'),
    nodeEnv:          process.env.NODE_ENV,
    vercelEnv:        process.env.VERCEL_ENV ?? 'unknown',
    haikuModel:       process.env.CLAUDE_MODEL_HAIKU  ?? 'claude-haiku-4-5-20251001',
    sonnetModel:      process.env.CLAUDE_MODEL_SONNET ?? 'claude-sonnet-4-6',
  }

  try {
    const anthropic = new Anthropic({ apiKey: key, timeout: 30_000 })
    const res = await anthropic.messages.create({
      model:      envInfo.haikuModel,
      max_tokens: 10,
      messages:   [{ role: 'user', content: 'hi' }],
    })
    return NextResponse.json({
      ok:    true,
      env:   envInfo,
      reply: { id: res.id, model: res.model, stopReason: res.stop_reason },
    })
  } catch (err) {
    const e = err as { status?: number; type?: string; message?: string; error?: unknown }
    return NextResponse.json({
      ok:      false,
      env:     envInfo,
      status:  e.status,
      type:    e.type,
      message: e.message,
      detail:  e.error,
    })
  }
}
