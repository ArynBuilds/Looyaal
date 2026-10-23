import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
}

export const metadata: Metadata = {
  title: 'Looyaal Barista',
  manifest: '/api/barista/manifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black',
    title: 'Barista',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    apple: '/icons/barista-192.png',
  },
}

export default function BaristaRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
