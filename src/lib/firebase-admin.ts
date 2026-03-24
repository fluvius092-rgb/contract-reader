// src/lib/firebase-admin.ts  ← サーバー側（API Routes）
import * as admin from 'firebase-admin'

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
    console.error(
      `[firebase-admin] 環境変数が不足しています: ${missing.join(', ')}。.env.local を確認してください。`
    )
    return
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    })
  } catch (err) {
    console.error('[firebase-admin] 初期化に失敗しました:', err)
  }
}

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
