// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const APP_URL = 'https://contract-reader-qv4c.vercel.app'

export const metadata: Metadata = {
  title: '契約書かんたん読み — むずかしい契約書をわかりやすく',
  description: '不動産・携帯・保険・ローン・雇用の契約書をAIが読み解きます。PDF・画像をアップロードするだけ。無料・登録不要。',
  keywords: ['契約書', '賃貸', '携帯', '保険', 'ローン', '雇用', 'AI', '読み解き', '無料', 'PDF', 'OCR'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '契約書かんたん読み',
  },
  formatDetection: { telephone: false },
  themeColor: '#4f46e5',
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: '契約書かんたん読み — むずかしい契約書をわかりやすく',
    description: '不動産・携帯・保険・ローン・雇用の契約書をAIが読み解きます。PDF・画像をアップロードするだけ。無料・登録不要。',
    siteName: '契約書かんたん読み',
    images: [{ url: `${APP_URL}/icons/icon-512.png`, width: 512, height: 512 }],
  },
  twitter: {
    card: 'summary',
    title: '契約書かんたん読み',
    description: '契約書をAIがわかりやすく解説。無料・登録不要。',
    images: [`${APP_URL}/icons/icon-512.png`],
  },
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
        {/* AdSense 審査用 meta タグ */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID} />
        )}
        {/* AdSense — beforeInteractive でHTMLに直接出力（クローラー検出用） */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="beforeInteractive"
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
