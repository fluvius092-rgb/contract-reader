// src/lib/firebase-admin.ts  ← サーバー側（API Routes）
import * as admin from 'firebase-admin'

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
]

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(
      `[firebase-admin] 環境変数 ${key} が設定されていません。.env.local を確認してください。`
    )
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  })
}

export const adminDb      = admin.firestore()
export const adminStorage = admin.storage()
export const adminAuth    = admin.auth()
