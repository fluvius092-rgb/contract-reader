'use client'

import { useEffect, useState } from 'react'
import { isTwa } from '@/lib/isTwa'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

interface Props {
  slot: string
  format?: 'auto' | 'rectangle' | 'horizontal'
  className?: string
}

export function AdBanner({ slot, format = 'auto', className }: Props) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  const [twa, setTwa] = useState(false)

  useEffect(() => {
    if (isTwa()) {
      setTwa(true)
      return
    }
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!publisherId) return null
  // Android TWA では AdSense（Webコンテンツ向け広告）を表示しない（Play Store ポリシー対策）
  if (twa) return null

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
