// src/lib/hooks/useAnalyze.ts
// アップロード → 解析の一連フローを管理するカスタムフック

import { useState, useCallback } from 'react'
import { auth } from '@/lib/firebase'
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
        // 認証済みユーザーの ID トークンを取得（匿名の場合は空）
        const idToken = await auth.currentUser?.getIdToken() ?? null
        const authHeaders: Record<string, string> = idToken
          ? { Authorization: `Bearer ${idToken}` }
          : {}

        // ── Step 1: ファイルをアップロード ──────────────
        const formData = new FormData()
        formData.append('file', file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: authHeaders,
          body: formData,
          signal: AbortSignal.timeout(30_000), // 30秒タイムアウト
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
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({ category, storageRef, mimeType, userQuestion }),
          signal: AbortSignal.timeout(65_000), // 65秒タイムアウト（サーバー側60秒+余裕）
        })

        if (!analyzeRes.ok) {
          const { error } = await analyzeRes.json()
          throw new Error(error ?? '解析に失敗しました')
        }

        const { result } = await analyzeRes.json() as { result: AnalysisResult }

        setState(s => ({ ...s, status: 'done', result }))

      } catch (err) {
        let message: string

        if (err instanceof DOMException && err.name === 'TimeoutError') {
          message = '通信がタイムアウトしました。ネットワーク環境を確認して再試行してください。'
        } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
          message = 'サーバーに接続できません。ネットワーク環境を確認してください。'
        } else {
          message = err instanceof Error ? err.message : '予期しないエラーが発生しました'
        }

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
