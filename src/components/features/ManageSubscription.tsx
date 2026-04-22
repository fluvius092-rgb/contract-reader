'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'

export function ManageSubscription() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleManage = async () => {
    setLoading(true)
    setError(null)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) {
        setError('ログインが必要です')
        setLoading(false)
        return
      }
      const res = await fetch('/api/stripe/portal', {
        method:  'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'ポータルの開始に失敗しました')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ポータルの開始に失敗しました')
      setLoading(false)
    }
  }

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={handleManage}
        disabled={loading}
        className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
      >
        {loading ? '移動中...' : 'サブスクリプション管理'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
