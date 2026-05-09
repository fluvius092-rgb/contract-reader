'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { isTwa } from '@/lib/isTwa'

// AdSense の JS ライブラリを読み込む。TWA 環境ではロードしない（Play Store ポリシー対策）。
export function AdSenseLoader() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    setShouldLoad(!isTwa())
  }, [])

  if (!publisherId || !shouldLoad) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
