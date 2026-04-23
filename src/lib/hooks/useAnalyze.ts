// src/lib/hooks/useAnalyze.ts

import { useState, useCallback } from 'react'
import { auth } from '@/lib/firebase'
import type { CategoryId, AnalysisResult, UploadState } from '@/types'

export function useAnalyze() {
  const [state, setState] = useState<UploadState>({
    status:             'idle',
    file:               null,
    category:           null,
    result:             null,
    error:              null,
    planRequired:       false,
    serviceUnavailable: false,
  })

  const analyze = useCallback(
    async (files: File[], category: CategoryId, userQuestion?: string) => {
      setState({ status: 'uploading', file: files[0] ?? null, category, result: null, error: null, planRequired: false, serviceUnavailable: false })

      try {
        const idToken = await auth.currentUser?.getIdToken() ?? null
        const authHeaders: Record<string, string> = idToken
          ? { Authorization: `Bearer ${idToken}` }
          : {}

        // ── Step 1: 複数ファイルを一括アップロード ────────
        const formData = new FormData()
        for (const file of files) {
          formData.append('files', file)
        }

        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
        const uploadRes = await fetch(`${basePath}/api/upload`, {
          method:  'POST',
          headers: authHeaders,
          body:    formData,
          signal:  AbortSignal.timeout(60_000),
        })

        if (!uploadRes.ok) {
          const { error } = await uploadRes.json()
          throw new Error(error ?? 'アップロードに失敗しました')
        }

        const { files: uploaded } = await uploadRes.json() as {
          files: Array<{ ref: string; mimeType: string }>
        }

        // ── Step 2: AI 解析 ──────────────────────────
        setState(s => ({ ...s, status: 'analyzing' }))

        const analyzeRes = await fetch(`${basePath}/api/analyze`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body:    JSON.stringify({ category, files: uploaded, userQuestion }),
          signal:  AbortSignal.timeout(120_000), // 分割処理があるため余裕を持たせる
        })

        if (!analyzeRes.ok) {
          const body = await analyzeRes.json()
          const err  = new Error(body.error ?? '解析に失敗しました') as Error & { planRequired?: boolean; serviceUnavailable?: boolean }
          err.planRequired       = body.planRequired       ?? false
          err.serviceUnavailable = body.serviceUnavailable ?? false
          throw err
        }

        const { result } = await analyzeRes.json() as { result: AnalysisResult }
        setState(s => ({ ...s, status: 'done', result }))

      } catch (err) {
        let message: string

        if (err instanceof DOMException && err.name === 'TimeoutError') {
          message = '通信がタイムアウトしました。枚数を減らして再試行してください。'
        } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
          message = 'サーバーに接続できません。ネットワーク環境を確認してください。'
        } else {
          message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
        }

        const planRequired       = (err as { planRequired?: boolean }).planRequired ?? false
        const serviceUnavailable = (err as { serviceUnavailable?: boolean }).serviceUnavailable ?? false
        setState(s => ({ ...s, status: 'error', error: message, planRequired, serviceUnavailable }))
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setState({ status: 'idle', file: null, category: null, result: null, error: null, planRequired: false, serviceUnavailable: false })
  }, [])

  return { state, analyze, reset }
}
