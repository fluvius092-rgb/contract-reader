// src/app/history/page.tsx
// 過去の解析履歴ページ（認証済みユーザー向け）
'use client'

import { useEffect, useState } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { CATEGORIES } from '@/types'
import type { AnalysisResult } from '@/types'
import Link from 'next/link'

interface HistoryItem extends AnalysisResult {
  id: string
  createdAt: { seconds: number }
}

function formatDate(seconds: number) {
  return new Date(seconds * 1000).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPage() {
  const [items, setItems]     = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setUserId(user?.uid ?? null)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    const load = async () => {
      try {
        const q = query(
          collection(db, 'users', userId, 'analyses'),
          orderBy('createdAt', 'desc'),
          limit(30)
        )
        const snap = await getDocs(q)
        setItems(snap.docs.map(d => {
          const data = d.data()
          // Firestore Timestamp を { seconds } 形式に正規化
          const createdAt = data.createdAt?.seconds != null
            ? { seconds: data.createdAt.seconds }
            : { seconds: Math.floor(Date.now() / 1000) }
          return { id: d.id, ...data, createdAt } as HistoryItem
        }))
      } catch (err) {
        console.error('[history] Firestore query failed:', err)
        setError('履歴の読み込みに失敗しました。再読み込みしてください。')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600">← 戻る</Link>
          <span className="font-bold text-gray-900">解析履歴</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {loading && (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !userId && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3">
            <p className="text-gray-600">履歴を保存するにはログインが必要です</p>
            <Link
              href="/auth"
              className="inline-block bg-gray-900 text-white text-sm px-5 py-2 rounded-full"
            >
              ログイン / 新規登録
            </Link>
          </div>
        )}

        {!loading && userId && items.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            まだ解析履歴がありません
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map(item => {
              const cat = CATEGORIES.find(c => c.id === item.category)
              return (
                <li key={item.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: cat ? `${cat.color}20` : '#f3f4f6',
                        color: cat?.color ?? '#374151',
                      }}
                    >
                      {cat?.emoji} {cat?.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(item.createdAt.seconds)}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-gray-900">{item.doc_type}</p>
                  <ul className="space-y-1">
                    {item.summary.slice(0, 2).map((s, i) => (
                      <li key={i} className="text-xs text-gray-500 flex gap-1.5">
                        <span>▸</span>{s}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
