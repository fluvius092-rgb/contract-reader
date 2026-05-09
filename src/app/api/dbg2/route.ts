import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? ''
  return NextResponse.json({
    length:  key.length,
    first8:  key.substring(0, 8),
    last4:   key.substring(key.length - 4),
    sha8:    Buffer.from(key).toString('base64').substring(0, 12),
  })
}
