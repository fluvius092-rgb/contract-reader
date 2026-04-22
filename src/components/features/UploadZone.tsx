'use client'

import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import clsx from 'clsx'
import { CATEGORIES } from '@/types'
import type { CategoryId } from '@/types'

interface Props {
  onSubmit: (files: File[], category: CategoryId, question?: string) => void
  isLoading: boolean
  planBadge?: React.ReactNode
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg':      ['.jpg', '.jpeg'],
  'image/png':       ['.png'],
  'image/webp':      ['.webp'],
  'image/heic':      ['.heic'],
}

// プラン別の実上限（最大 60）はサーバー側で判定。
// UI 側の上限はプランごとに props で上書きできるよう将来拡張予定。
const MAX_FILES      = 20
const MAX_FILE_BYTES = 20 * 1024 * 1024  // 20MB

export function UploadZone({ onSubmit, isLoading, planBadge }: Props) {
  const [files, setFiles]       = useState<File[]>([])
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [question, setQuestion] = useState('')
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: File[]) => {
    setFiles(prev => {
      const merged = [...prev, ...incoming]
      // 上限超過分は切り捨て
      return merged.slice(0, MAX_FILES)
    })
  }, [])

  const onDrop = useCallback((accepted: File[]) => {
    addFiles(accepted)
  }, [addFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   ACCEPTED_TYPES,
    maxFiles: MAX_FILES,
    maxSize:  MAX_FILE_BYTES,
    disabled: isLoading,
    noClick:  files.length > 0,  // ファイルがある場合はドロップのみ（ボタンを使わせる）
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ドラッグで並び替え
  const handleDragStart = (index: number) => setDragIndex(index)
  const handleDragOver  = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setFiles(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(index)
  }
  const handleDragEnd = () => setDragIndex(null)

  const handleSubmit = () => {
    if (!files.length || !category) return
    onSubmit(files, category, question || undefined)
  }

  const canSubmit = files.length > 0 && !!category && !isLoading

  return (
    <div className="space-y-5">

      {/* カメラ撮影（hidden input）*/}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={e => {
          const incoming = Array.from(e.target.files ?? [])
          if (incoming.length) addFiles(incoming)
          e.target.value = ''
        }}
      />

      {/* 現在のプラン表示 */}
      {planBadge}

      {/* カメラ撮影ボタン */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={isLoading || files.length >= MAX_FILES}
        className={clsx(
          'w-full py-3 rounded-xl font-semibold text-sm border-2 border-dashed transition-all flex items-center justify-center gap-2',
          isLoading || files.length >= MAX_FILES
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50',
        )}
      >
        <span className="text-lg">📷</span>
        書類を撮影する
        {files.length > 0 && (
          <span className="text-xs font-normal">（追加撮影）</span>
        )}
      </button>

      {/* ドロップゾーン */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center transition-colors',
          files.length === 0 ? 'cursor-pointer' : 'cursor-default',
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50',
          isLoading && 'pointer-events-none opacity-50',
        )}
      >
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div>
            <div className="text-3xl mb-2">📂</div>
            <p className="font-medium text-gray-700">
              {isDragActive ? 'ここにドロップ' : 'PDFまたは画像をドロップ'}
            </p>
            <p className="text-sm text-gray-400 mt-1">または クリックしてファイルを選択</p>
            <p className="text-xs text-gray-400 mt-2">PDF・JPEG・PNG・WebP・HEIC（最大20MB/枚）</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            ここにドロップで追加（{files.length}/{MAX_FILES}枚）
          </p>
        )}
      </div>

      {/* ページプレビュー */}
      {files.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">
            ページ順を確認・並び替えできます（ドラッグ）
          </p>
          <div className="grid grid-cols-4 gap-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={clsx(
                  'relative rounded-lg border bg-gray-50 p-2 text-center cursor-grab select-none transition-opacity',
                  dragIndex === i ? 'opacity-40' : 'opacity-100',
                )}
              >
                <div className="text-2xl mb-1">
                  {file.type === 'application/pdf' ? '📄' : '🖼️'}
                </div>
                <p className="text-xs text-gray-600 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                <span className="absolute top-1 left-1 text-xs bg-blue-100 text-blue-600 rounded px-1 font-medium">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  disabled={isLoading}
                  className="absolute top-1 right-1 text-xs text-red-400 hover:text-red-600 leading-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400',
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

      {/* 追加質問 */}
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
      <div className="space-y-1.5">
        <p className="text-xs text-gray-400 flex items-start gap-1.5">
          <span className="text-green-500 mt-0.5">🔒</span>
          アップロードされたファイルは解析後に即時削除されます。第三者への提供・AI学習への使用は行いません。
        </p>
        <p className="text-xs text-amber-600 flex items-start gap-1.5">
          <span className="mt-0.5">⚠️</span>
          種類の異なる契約書を混在させると解析精度が大幅に低下します。書類の種類ごとに分けて送信してください。
        </p>
        <p className="text-xs text-amber-600 flex items-start gap-1.5">
          <span className="mt-0.5">⚠️</span>
          マイナンバー・口座情報・パスポートなど機密性の高い情報が含まれる場合は、該当箇所を黒塗り・削除してからアップロードすることをお勧めします。
        </p>
        <p className="text-xs text-amber-600 flex items-start gap-1.5">
          <span className="mt-0.5">⚠️</span>
          NDAや業務委託契約など業務上の秘密情報が含まれる契約書は、社内ルールや契約の守秘義務条項をご確認のうえご利用ください。
        </p>
      </div>

      {/* 送信ボタン */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={clsx(
          'w-full py-3 rounded-xl font-semibold text-sm transition-all',
          canSubmit
            ? 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
        )}
      >
        {isLoading
          ? '解析中...'
          : files.length > 1
            ? `${files.length}枚の書類を読み解く`
            : '契約書を読み解く'}
      </button>
    </div>
  )
}
