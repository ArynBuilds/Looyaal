import { NextResponse } from 'next/server'

export async function GET() {
  const manifest = {
    name: 'Looyaal Barista',
    short_name: 'Barista',
    description: 'Looyaal barista scanner',
    start_url: '/barista/login',
    scope: '/barista/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icons/barista-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icons/barista-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }
  return new NextResponse(JSON.stringify(manifest), {
    headers: { 'Content-Type': 'application/manifest+json' },
  })
}
