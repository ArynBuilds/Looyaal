'use client'

import { useEffect, useRef, useState } from 'react'
import { ScanLine } from 'lucide-react'

interface ScannerProps {
  onScan: (data: string) => void
}

export function Scanner({ onScan }: ScannerProps) {
  const videoRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null)

  useEffect(() => {
    let mounted = true

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!mounted || !videoRef.current) return

        // Prefer the rear ultra-wide lens when available. iPhone 13+ Pro's
        // 1x wide camera physically cannot focus on a QR held closer than
        // ~10cm — the reason iOS' native Camera app auto-switches to ultra-wide
        // for macro distance. Safari getUserMedia doesn't do that switch, so
        // we pick the ultra-wide ourselves. Labels are in English on iOS
        // regardless of system language; on Android labels vary so this is
        // best-effort and silently falls back to facingMode: 'environment'.
        let cameraConstraint: string | { facingMode: string } = { facingMode: 'environment' }
        try {
          const cameras = await Html5Qrcode.getCameras()
          const back = cameras.filter((c) => /back|rear|environment/i.test(c.label))
          const candidates = back.length > 0 ? back : cameras
          const ultraWide = candidates.find((c) => /ultra\s*wide|0\.5\s*x/i.test(c.label))
          if (ultraWide) cameraConstraint = ultraWide.id
        } catch {
          // Permission denied or enumeration unavailable — fall back to facingMode.
        }

        const scanner = new Html5Qrcode('barista-scanner', {
          verbose: false,
          useBarCodeDetectorIfSupported: true,
        })
        scannerRef.current = scanner

        // Scan box scales with viewport so customer phones held at any angle
        // still land their QR inside the decode region. 70% of the shorter
        // viewport side, capped at 320px.
        const qrboxFn = (vw: number, vh: number) => {
          const edge = Math.floor(Math.min(vw, vh) * 0.7)
          const size = Math.min(320, Math.max(200, edge))
          return { width: size, height: size }
        }

        await scanner.start(
          cameraConstraint,
          {
            fps: 25,
            qrbox: qrboxFn,
            aspectRatio: 1.0,
            disableFlip: false,
          },
          (decoded) => {
            if (mounted) onScan(decoded)
          },
          () => {} // ignore errors during scanning
        )
      } catch {
        if (mounted) setError('Kamera erisimi reddedildi')
      }
    }

    startScanner()

    return () => {
      mounted = false
      scannerRef.current?.stop().catch(() => {})
    }
  }, [onScan])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ScanLine className="w-12 h-12 text-white/20 mb-3" />
        <p className="text-sm text-red-400">{error}</p>
        <p className="text-xs text-white/30 mt-1">Kamera izni verin ve sayfayi yenileyin</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div id="barista-scanner" ref={videoRef} className="rounded-2xl overflow-hidden" />
      <p className="text-center text-xs text-white/40 mt-3">Musterinin QR kodunu tarayin</p>
    </div>
  )
}
