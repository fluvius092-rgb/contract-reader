// src/lib/firebase-admin.ts  ← サーバー側（API Routes）
import * as admin from 'firebase-admin'
import type { NextRequest } from 'next/server'

function initializeFirebaseAdmin() {
  if (admin.apps.length) return

  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  ] as const

  const missing = requiredEnvVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    // 秘密鍵の詳細は出力しない
    throw new Error(
      `Firebase Admin の環境変数が不足しています: ${missing.join(', ')}`
    )
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  })
}

// モジュール読み込み時に初期化（失敗時は即 throw してデプロイ時に検出）
initializeFirebaseAdmin()

function getFirebaseAdmin() {
  if (!admin.apps.length) {
    throw new Error(
      'Firebase Admin が初期化されていません。環境変数を確認してください。'
    )
  }
  return admin
}

export const adminDb      = new Proxy({} as admin.firestore.Firestore, {
  get(_, prop) { return Reflect.get(getFirebaseAdmin().firestore(), prop) },
})
export const adminStorage = new Proxy({} as admin.storage.Storage, {
  get(_, prop) { return Reflect.get(getFirebaseAdmin().storage(), prop) },
})
export const adminAuth    = new Proxy({} as admin.auth.Auth, {
  get(_, prop) { return Reflect.get(getFirebaseAdmin().auth(), prop) },
})

/**
 * Authorization: Bearer <token> ヘッダーを検証し、uid を返す。
 * トークンがない・無効な場合は null を返す（匿名ユーザーは許可）。
 */
export async function verifyIdToken(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    return decoded.uid
  } catch {
    return null
  }
}
