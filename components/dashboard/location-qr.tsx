'use client'

import { QRCodeSVG } from 'qrcode.react'
import { getLocationQRUrl } from '@/lib/qr'
import { useRef } from 'react'

interface LocationQRProps {
  orgSlug: string
  locationId: string
  locationName: string
}

export function LocationQR({ orgSlug, locationId, locationName }: LocationQRProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  const url = getLocationQRUrl(locationId)

  function downloadQR() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 0, 0, 512, 512)

      const link = document.createElement('a')
      link.download = `qr-${orgSlug}-${locationName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-medium text-gray-700">{locationName}</h3>
      <div ref={qrRef}>
        <QRCodeSVG value={url} size={200} level="H" />
      </div>
      <p className="max-w-[200px] truncate text-xs text-gray-400">{url}</p>
      <button
        onClick={downloadQR}
        className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
      >
        PNG İndir
      </button>
    </div>
  )
}
