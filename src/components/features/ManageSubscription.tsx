'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { PlanGate } from './PlanGate'

type Plan = 'free' | 'sub_light' | 'sub_std'

interface UserData {
  plan?: Plan
  stripeCustomerId?: string
  oneTimeCredits?: number
}

export function ManageSubscription() {
  const [user, setUser]         = useState<User | null | undefined>(undefined)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError]     = useState<string | null>(null)
  const [showPlanGate, setShowPlanGate]   = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  useEffect(() => {
    if (!user) { setUserData(null); return }
    return onSnapshot(doc(db, 'users', user.uid), snap => {
      setUserData(snap.exists() ? (snap.data() as UserData) : {})
    })
  }, [user])

  if (!user || user === undefined) return null

  const plan = userData?.plan ?? 'free'
  const credits = userData?.oneTimeCredits ?? 0
  const isSubscribed = plan === 'sub_light' || plan === 'sub_std'
  const hasOneTimeCredit = credits > 0

  const handlePortal = async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const idToken = await auth.currentUser?.getIdToken()
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
      const res = await fetch(`${basePath}/api/stripe/portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'ポータルの開始に失敗しました')
      }
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'エラーが発生しました')
      setPortalLoading(false)
    }
  }

  return (
    <>
      {isSubscribed ? (
        <div className="text-center">
          <button
            type="button"
            onClick={handlePortal}
            disabled={portalLoading}
            className="text-xs text-indigo-600 hover:underline disabled:opacity-50"
          >
            {portalLoading ? '移動中...' : 'サブスクリプション管理'}
          </button>
          {portalError && <p className="text-xs text-red-500 mt-1">{portalError}</p>}
        </div>
      ) : hasOneTimeCredit ? (
        <div className="text-center">
          <span className="text-xs text-gray-600">
            残りクレジット: {credits}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPlanGate(true)}
          className="text-xs text-indigo-600 hover:underline"
        >
          プランに加入
        </button>
      )}

      {/* PlanGate モーダル */}
      {showPlanGate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowPlanGate(false) }}
        >
          <div className="w-full max-w-sm">
            <PlanGate
              variant="promo"
              currentPlan="free"
              onClose={() => setShowPlanGate(false)}
              existingOneTimeCredits={credits}
            />
          </div>
        </div>
      )}
    </>
  )
}
