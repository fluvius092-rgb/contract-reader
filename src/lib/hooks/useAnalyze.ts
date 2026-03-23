// src/lib/hooks/useAnalyze.ts
// アップロード → 解析の一連フローを管理するカスタムフック

import { useState, useCallback } from 'react'
import type { CategoryId, AnalysisResult, UploadState } from '@/types'

export function useAnalyze() {
  const [state, setState] = useState<UploadState>({
    status: 'idle',
    file: null,
    category: null,
    result: null,
    error: null,
  })

  const analyze = useCallback(
    async (file: File, category: CategoryId, userQuestion?: string) => {
      setState({ status: 'uploading', file, category, result: null, error: null })

      try {
        // ── Step 1: ファイルをアップロード ──────────────
        const formData = new FormData()
        formData.append('file', file)
        // userId があれば追加（認証実装後）
        // formData.append('userId', uid)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const { error } = await uploadRes.json()
          throw new Error(error ?? 'アップロードに失敗しました')
        }

        const { storageRef, mimeType } = await uploadRes.json()

        // ── Step 2: AI 解析 ──────────────────────────
        setState(s => ({ ...s, status: 'analyzing' }))

        const analyzeRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, storageRef, mimeType, userQuestion }),
        })

        if (!analyzeRes.ok) {
          const { error } = await analyzeRes.json()
          throw new Error(error ?? '解析に失敗しました')
        }

        const { result } = await analyzeRes.json() as { result: AnalysisResult }

        setState(s => ({ ...s, status: 'done', result }))

      } catch (err) {
        const message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
        setState(s => ({ ...s, status: 'error', error: message }))
      }
    },
    []
  )

  const reset = useCallback(() => {
    setState({ status: 'idle', file: null, category: null, result: null, error: null })
  }, [])

  return { state, analyze, reset }
}
