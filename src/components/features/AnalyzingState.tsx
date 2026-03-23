// src/components/features/AnalyzingState.tsx
'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { label: 'ファイルをアップロード中...', pct: 20 },
  { label: '書面のテキストを読み取り中...', pct: 45 },
  { label: 'AIが内容を解析中...', pct: 75 },
  { label: '結果を整理しています...', pct: 95 },
]

interface Props {
  status: 'uploading' | 'analyzing'
}

export function AnalyzingState({ status }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (status === 'uploading') setStep(0)
    if (status === 'analyzing') setStep(2)

    const timer = setInterval(() => {
      setStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }, 3000)
    return () => clearInterval(timer)
  }, [status])

  const current = STEPS[step]

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* スピナー */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-800 animate-spin" />
      </div>

      {/* ステータスラベル */}
      <div className="text-center space-y-1">
        <p className="font-semibold text-gray-800">{current.label}</p>
        <p className="text-sm text-gray-400">通常10〜20秒ほどかかります</p>
      </div>

      {/* プログレスバー */}
      <div className="w-64 bg-gray-100 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-gray-800 transition-all duration-1000"
          style={{ width: `${current.pct}%` }}
        />
      </div>

      {/* ステップ表示 */}
      <div className="flex gap-1.5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i <= step ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
