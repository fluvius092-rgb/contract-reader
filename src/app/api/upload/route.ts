// src/app/api/upload/route.ts
// ファイルをFirebase Storageにアップロードするエンドポイント

import { NextRequest, NextResponse } from 'next/server'
import { adminStorage, verifyIdToken } from '@/lib/firebase-admin'
import { randomUUID } from 'crypto'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  try {
    // 認証トークン検証（任意 — 匿名ユーザーも利用可）
    const userId = await verifyIdToken(req)

    const formData = await req.formData()
    const rawFiles = formData.getAll('files') as File[]

    if (!rawFiles.length) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }
    if (rawFiles.length > 60) {
      return NextResponse.json({ error: '一度にアップロードできるのは60枚までです' }, { status: 400 })
    }

    const uid    = userId ?? 'anonymous'
    const bucket = adminStorage.bucket()

    const uploaded = await Promise.all(rawFiles.map(async file => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw Object.assign(
          new Error('PDF または画像ファイル（JPEG, PNG, WebP, HEIC）のみ対応しています'),
          { httpStatus: 415 },
        )
      }
      if (file.size > MAX_FILE_SIZE) {
        throw Object.assign(
          new Error('ファイルサイズは20MB以下にしてください'),
          { httpStatus: 413 },
        )
      }

      const ext        = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1]
      const storageRef = `tmp/${uid}/${randomUUID()}.${ext}`
      const buffer     = Buffer.from(await file.arrayBuffer())

      await bucket.file(storageRef).save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: { deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        },
      })

      return { ref: storageRef, mimeType: file.type, fileName: file.name, fileSize: file.size }
    }))

    return NextResponse.json({ files: uploaded })

  } catch (err) {
    console.error('[upload] error:', err)

    const errMsg   = err instanceof Error ? err.message : String(err)
    const httpStatus = (err as { httpStatus?: number })?.httpStatus ?? 500
    let userMessage  = 'アップロードに失敗しました。再試行してください。'

    if (httpStatus === 415) {
      userMessage = errMsg
    } else if (httpStatus === 413) {
      userMessage = errMsg
    } else if (errMsg.includes('Firebase Admin') || errMsg.includes('環境変数')) {
      userMessage = 'サーバーの設定に問題があります。管理者に連絡してください。'
    }

    return NextResponse.json({ error: userMessage }, { status: httpStatus })
  }
}
