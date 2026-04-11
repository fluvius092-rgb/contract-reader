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
    const file     = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      )
    }

    // MIME タイプチェック
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'PDF または画像ファイル（JPEG, PNG, WebP, HEIC）のみ対応しています' },
        { status: 415 }
      )
    }

    // ファイルサイズチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは20MB以下にしてください' },
        { status: 413 }
      )
    }

    // Storage パス（解析後に削除するので tmp/ 配下）
    // uid はトークンから取得（クライアント送信値は使わない）
    const ext        = file.type === 'application/pdf' ? 'pdf' : 'img'
    const uid        = userId ?? 'anonymous'
    const storageRef = `tmp/${uid}/${randomUUID()}.${ext}`

    // バッファに変換してアップロード
    const arrayBuffer = await file.arrayBuffer()
    const buffer      = Buffer.from(arrayBuffer)

    const bucket      = adminStorage.bucket()
    const fileRef     = bucket.file(storageRef)

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        // 24時間後に自動削除（Firebase Storage のオブジェクトライフサイクルルールと組み合わせる）
        metadata: { deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
      },
    })

    return NextResponse.json({
      storageRef,
      mimeType: file.type,
      fileName: file.name,
      fileSize: file.size,
    })

  } catch (err) {
    console.error('[upload] error:', err)

    const errMsg = err instanceof Error ? err.message : String(err)
    let userMessage = 'アップロードに失敗しました。再試行してください。'
    let httpStatus = 500

    if (errMsg.includes('Firebase Admin') || errMsg.includes('環境変数')) {
      userMessage = 'サーバーの設定に問題があります。管理者に連絡してください。'
      httpStatus = 503
    } else if (errMsg.toLowerCase().includes('storage')) {
      userMessage = 'ファイル保存に失敗しました。再試行してください。'
    }

    return NextResponse.json({ error: userMessage }, { status: httpStatus })
  }
}
