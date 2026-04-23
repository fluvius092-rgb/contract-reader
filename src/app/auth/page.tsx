// src/app/auth/page.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  signInWithPopup, GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router   = useRouter()
  const [mode, setMode]       = useState<'login' | 'signup'>('login')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'エラーが発生しました'
      setError(
        msg.includes('email-already-in-use') ? 'このメールアドレスは登録済みです' :
        msg.includes('wrong-password')        ? 'パスワードが正しくありません' :
        msg.includes('user-not-found')        ? 'このメールアドレスは登録されていません' :
        msg.includes('weak-password')         ? 'パスワードは6文字以上にしてください' :
        msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 w-full max-w-sm space-y-5">

        <div className="text-center space-y-1">
          <span className="text-3xl">📋</span>
          <h1 className="font-bold text-gray-900">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h1>
          <p className="text-xs text-gray-500">解析履歴を保存できます</p>
        </div>

        {/* Google ログイン */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2a10.3 10.3 0 0 0-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.97 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9.01 9.01 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.95L3.97 7.28C4.68 5.16 6.66 3.58 9 3.58z"/>
          </svg>
          Googleで続ける
        </button>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">または</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        {/* メール + パスワード */}
        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="パスワード（6文字以上）"
            required
            minLength={6}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? '処理中...' : mode === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          {mode === 'login' ? (
            <>アカウントがない方は{' '}
              <button onClick={() => setMode('signup')} className="text-blue-500 underline">新規登録</button>
            </>
          ) : (
            <>すでにアカウントをお持ちの方は{' '}
              <button onClick={() => setMode('login')} className="text-blue-500 underline">ログイン</button>
            </>
          )}
        </p>

        <p className="text-center">
          <Link href="/" className="text-xs text-gray-400 underline">ログインせず使う</Link>
        </p>
      </div>
    </div>
  )
}
