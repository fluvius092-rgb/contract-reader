// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '契約書かんたん読み — むずかしい契約書をわかりやすく',
  description: '不動産・携帯・保険・ローン・雇用の契約書をAIが読み解きます。無料で使えます。',
  keywords: ['契約書', '賃貸', '携帯', '保険', 'ローン', '雇用', 'AI', '読み解き'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '契約書かんたん読み',
  },
  formatDetection: { telephone: false },
  themeColor: '#4f46e5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        {/* PWA: Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}
