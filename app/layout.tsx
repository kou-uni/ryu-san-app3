import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_JP } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _notoSansJp = Noto_Sans_JP({ subsets: ['latin'], variable: '--font-noto-sans-jp' })

export const metadata: Metadata = {
  title: '長崎県茂木町の魅力の記録',
  description: '長崎県茂木町の魅力的なコンテンツを取材・記録するアプリケーション',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={_notoSansJp.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
