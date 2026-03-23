// next.config.js
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  fallbacks: {
    document: '/offline.html',
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'tesseract.js', 'sharp'],
  },
  // .well-known/assetlinks.json を静的ファイルとして配信
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
