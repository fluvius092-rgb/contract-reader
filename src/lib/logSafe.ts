// src/lib/logSafe.ts
// エラーログから秘密情報（APIキー、トークン、パス等）を除去するユーティリティ

const SENSITIVE_PATTERNS: Array<[RegExp, string]> = [
  [/sk-ant-[a-zA-Z0-9_-]+/g, 'sk-ant-***'],
  [/AIza[0-9A-Za-z_-]{20,}/g, 'AIza***'],
  [/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer ***'],
  [/"private_key"\s*:\s*"[^"]*"/g, '"private_key":"***"'],
  [/-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/g, '***PRIVATE_KEY***'],
  [/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '***JWT***'],
]

function redact(s: string): string {
  let out = s
  for (const [re, rep] of SENSITIVE_PATTERNS) out = out.replace(re, rep)
  return out
}

export function safeErrorInfo(err: unknown): { message: string; status?: number; name?: string } {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: redact(err.message).slice(0, 500),
      status: (err as { status?: number }).status,
    }
  }
  return { message: redact(String(err)).slice(0, 500) }
}

export function logError(context: string, err: unknown): void {
  const info = safeErrorInfo(err)
  console.error(`[${context}]`, info)
}
