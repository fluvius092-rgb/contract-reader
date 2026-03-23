'use client'

import { useEffect } from 'react'

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

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  if (!publisherId) return null

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
