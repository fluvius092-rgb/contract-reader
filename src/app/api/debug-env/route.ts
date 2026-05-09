// デバッグ用：環境変数の存在確認のみ（値は返さない）
// ⚠️ 動作確認後すぐに削除すること

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? ''
  return NextResponse.json({
    hasKey:           key.length > 0,
    length:           key.length,
    startsCorrectly:  key.startsWith('sk-ant-api03-'),
    hasWhitespace:    key !== key.trim(),
    hasNewline:       key.includes('\n') || key.includes('\r'),
    nodeEnv:          process.env.NODE_ENV,
    vercelEnv:        process.env.VERCEL_ENV ?? 'unknown',
  })
}
