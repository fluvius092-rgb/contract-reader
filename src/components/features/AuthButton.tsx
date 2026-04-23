'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'

export function AuthButton() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  if (user === undefined) return null

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {user.photoURL && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt=""
            className="w-7 h-7 rounded-full border border-gray-200"
          />
        )}
        <button
          onClick={async () => {
            setSigningOut(true)
            await signOut(auth)
            setSigningOut(false)
          }}
          disabled={signingOut}
          className="text-xs text-gray-500 hover:text-gray-800 disabled:opacity-50"
        >
          ログアウト
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/auth"
      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
    >
      ログイン / 登録
    </Link>
  )
}
