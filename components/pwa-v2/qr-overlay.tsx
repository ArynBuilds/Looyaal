'use client'

// QR Overlay — Generates QR, shows countdown, polls for barista confirmation
// Used for stamps, campaign claims, reward redemptions

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QrOverlayProps {
  title: string                    // "Puan Kazan" or "Kampanya Kullan"
  subtitle?: string                // e.g., "%25 indirim"
  orgSlug: string
  customerId: string
  type: 'stamp' | 'campaign' | 'reward' | 'subscription' | 'offer'
  campaignId?: string
  offerId?: string                 // for offer type — uses /offer/claim instead of /qr/generate
  redemptionId?: string            // for reward type — pre-created by /reward/claim
  onConfirmed: () => void          // called when barista confirms
  onClose: () => void
}

export function QrOverlay({ title, subtitle, orgSlug, customerId, type, campaignId, offerId, redemptionId, onConfirmed, onClose }: QrOverlayProps) {
  const [qrPayload, setQrPayload] = useState<string | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(120)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  // Generate QR on mount
  useEffect(() => {
    async function generate() {
      try {
        let res: Response
        if (type === 'offer' && offerId) {
          // Offer claims use dedicated endpoint (atomic claim + QR)
          res = await fetch(`/api/public/${orgSlug}/offer/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, offerId }),
          })
        } else {
          res = await fetch(`/api/public/${orgSlug}/qr/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, type, campaignId, redemptionId }),
          })
        }
        if (res.ok) {
          const data = await res.json()
          setQrPayload(data.qrPayload)
          setToken(data.token)
          setExpiresAt(data.expiresAt)
        } else {
          const errData = await res.json().catch(() => null)
          setError(errData?.error || 'QR oluşturulamadı')
        }
      } catch {
        setError('Bağlantı hatası')
      }
    }
    generate()
  }, [orgSlug, customerId, type, campaignId, offerId, redemptionId])

  // Auto-focus close button + Escape key handler
  useEffect(() => {
    closeBtnRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Generate QR image from payload
  useEffect(() => {
    if (!qrPayload) return
    QRCode.toDataURL(qrPayload, {
      // PNG render resolution. Larger than display size so retina screens
      // get a sharp downscale rather than blurry upscale.
      width: 360,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      // Level 'L' (7% redundancy) is plenty for an ephemeral on-screen QR
      // that lives ~2 minutes and never gets scratched. 'H' (30%) would only
      // matter for QR codes printed on physical surfaces. Dropping the EC
      // level can roughly halve the module count.
      errorCorrectionLevel: 'L',
    }).then(url => setQrDataUrl(url)).catch(() => {})
  }, [qrPayload])

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return
    const update = () => {
      const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left <= 0) {
        setError('QR suresi doldu')
        if (pollRef.current) clearInterval(pollRef.current)
      }
    }
    update()
    countdownRef.current = setInterval(update, 1000)
    return () => { if (countdownRef.current) clearInterval(countdownRef.current) }
  }, [expiresAt])

  // Poll for barista confirmation
  useEffect(() => {
    if (!token) return
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/${orgSlug}/qr/status?token=${token}`)
        if (res.ok) {
          const data = await res.json()
          if (data.used) {
            setConfirmed(true)
            if (pollRef.current) clearInterval(pollRef.current)
            setTimeout(() => onConfirmed(), 1500)
          }
        }
      } catch { /* silent */ }
    }, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [token, orgSlug, onConfirmed])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div role="dialog" aria-modal="true" aria-label="QR Code" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'overlayIn 0.25s ease-out',
      padding: 'var(--space-2xl)',
    }}>
      {/* Close button */}
      <button ref={closeBtnRef} onClick={onClose} aria-label="Kapat" style={{
        position: 'absolute',
        top: 'var(--space-xl)',
        right: 'var(--space-xl)',
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: '50%',
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </button>

      {/* Title */}
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--font-size-h1)',
        fontWeight: 'var(--font-weight-heading)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-xs)',
      }}>{title}</p>
      {subtitle && (
        <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-brand)', fontWeight: 600, marginBottom: 'var(--space-xl)' }}>{subtitle}</p>
      )}

      {/* QR Code or status */}
      {confirmed ? (
        <div style={{
          width: 200,
          height: 200,
          borderRadius: 'var(--radius-card)',
          background: 'var(--color-brand)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          <p style={{ color: 'white', fontSize: 'var(--font-size-body)', fontWeight: 600, marginTop: 'var(--space-sm)' }}>Onaylandi!</p>
        </div>
      ) : error ? (
        <div style={{
          width: 200,
          height: 200,
          borderRadius: 'var(--radius-card)',
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-body)', fontWeight: 600, textAlign: 'center' }}>{error}</p>
          <button onClick={onClose} style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-sm) var(--space-lg)',
            borderRadius: 'var(--radius-button)',
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-label)',
            color: 'var(--color-text-secondary)',
          }}>Kapat</button>
        </div>
      ) : qrDataUrl ? (
        <div style={{
          width: 280,
          height: 280,
          borderRadius: 'var(--radius-card)',
          background: 'white',
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px var(--color-brand-glow-strong)',
          animation: 'qrPulse 2s ease-in-out infinite',
        }}>
          <img src={qrDataUrl} alt="QR Code" style={{ width: '100%', height: '100%', borderRadius: 4 }} />
        </div>
      ) : (
        <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid var(--color-brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {/* Countdown */}
      {!confirmed && !error && (
        <p style={{
          fontSize: 'var(--font-size-body)',
          color: secondsLeft < 30 ? 'var(--color-danger)' : 'var(--color-text-muted)',
          marginTop: 'var(--space-lg)',
          fontWeight: 500,
        }}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      )}

      {/* Instruction */}
      {!confirmed && !error && (
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-faint)',
          marginTop: 'var(--space-sm)',
          textAlign: 'center',
        }}>
          Bu kodu baristaya gosterin
        </p>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes overlayIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes qrPulse { 0%, 100% { box-shadow: 0 4px 24px var(--color-brand-glow); } 50% { box-shadow: 0 4px 40px var(--color-brand-glow-strong); } }
      `}</style>
    </div>
  )
}
