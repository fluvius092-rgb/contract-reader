// src/components/features/UploadZone.tsx
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import clsx from 'clsx'
import { CATEGORIES } from '@/types'
import type { CategoryId } from '@/types'

interface Props {
  onSubmit: (file: File, category: CategoryId, question?: string) => void
  isLoading: boolean
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg':  ['.jpg', '.jpeg'],
  'image/png':   ['.png'],
  'image/webp':  ['.webp'],
  'image/heic':  ['.heic'],
}

export function UploadZone({ onSubmit, isLoading }: Props) {
  const [file, setFile]         = useState<File | null>(null)
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [question, setQuestion] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: isLoading,
  })

  const handleSubmit = () => {
    if (!file || !category) return
    onSubmit(file, category, question || undefined)
  }

  const canSubmit = !!file && !!category && !isLoading

  return (
    <div className="space-y-5">

      {/* ドロップゾーン */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50',
          isLoading && 'pointer-events-none opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">{file ? '📄' : '📂'}</div>
        {file ? (
          <div>
            <p className="font-medium text-gray-800">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {(file.size / 1024).toFixed(0)} KB
            </p>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); setFile(null) }}
              className="mt-2 text-xs text-red-500 underline"
            >
              削除
            </button>
          </div>
        ) : (
          <div>
            <p className="font-medium text-gray-700">
              {isDragActive ? 'ここにドロップ' : 'PDFまたは画像をドロップ'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              または クリックしてファイルを選択
            </p>
            <p className="text-xs text-gray-400 mt-2">
              PDF・JPEG・PNG・WebP・HEIC（最大20MB）
            </p>
          </div>
        )}
      </div>

      {/* カテゴリ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          書類のカテゴリ <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              disabled={isLoading}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                category === cat.id
                  ? 'text-white border-transparent'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              )}
              style={
                category === cat.id
                  ? { backgroundColor: cat.color, borderColor: cat.color }
                  : {}
              }
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 追加質問（任意） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          特に確認したい点（任意）
        </label>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="例: 解約金はいくらですか？"
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        />
      </div>

      {/* プライバシー説明 */}
      <p className="text-xs text-gray-400 flex items-start gap-1.5">
        <span className="text-green-500 mt-0.5">🔒</span>
        アップロードされたファイルは解析後に即時削除されます。第三者への提供・AI学習への使用は行いません。
      </p>

      {/* 送信ボタン */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={clsx(
          'w-full py-3 rounded-xl font-semibold text-sm transition-all',
          canSubmit
            ? 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        )}
      >
        {isLoading ? '解析中...' : '契約書を読み解く'}
      </button>
    </div>
  )
}
