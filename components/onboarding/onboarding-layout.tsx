'use client'

import Link from 'next/link'

// Shared layout for all onboarding steps
// Light bg matching dashboard, progress bar, back button, smooth transitions

interface OnboardingLayoutProps {
  step: number
  totalSteps: number
  title: string
  subtitle?: string
  onBack?: () => void
  // Optional: takes over the logo click instead of the default href="/" navigation.
  // Used by the onboarding flow to sign the user out before returning to landing,
  // so a half-finished signup can't be "logged back in" by clicking Giriş Yap.
  onLogoClick?: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  preview?: React.ReactNode
  wide?: boolean
}

export function OnboardingLayout({ step, totalSteps, title, subtitle, onBack, onLogoClick, children, footer, preview, wide }: OnboardingLayoutProps) {
  const progress = ((step) / totalSteps) * 100

  return (
    <div style={{
      minHeight: '100dvh',
      background: `
        radial-gradient(ellipse 1200px 800px at 85% -10%, rgba(251,56,6,0.22), transparent 60%),
        radial-gradient(ellipse 900px 600px at -10% 20%, rgba(251,56,6,0.08), transparent 60%),
        #F5ECE2
      `,
      color: '#18181b',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Progress bar */}
      <div style={{ height: 2, background: '#e5e5e5', flexShrink: 0 }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#FB3806',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>

      {/* Top bar: back button + brand home + step counter */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        flexShrink: 0,
      }}>
        {onBack ? (
          <button onClick={onBack} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 14,
            cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            Geri
          </button>
        ) : <div />}
        {onLogoClick ? (
          <button onClick={onLogoClick} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: '#18181b',
            letterSpacing: '-0.02em',
            fontFamily: 'inherit',
          }}>
            <img src="/looyaal-logo.svg" alt="Looyaal" width={18} height={18} />
            looyaal
          </button>
        ) : (
          <Link href="/login" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 700,
            color: '#18181b',
            letterSpacing: '-0.02em',
          }}>
            <img src="/looyaal-logo.svg" alt="Looyaal" width={18} height={18} />
            looyaal
          </Link>
        )}
        <span style={{ fontSize: 12, color: '#a1a1aa' }}>{step}/{totalSteps}</span>
      </div>

      {/* Content area — split when preview is provided and viewport wide enough */}
      <div className="onboarding-body" style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', gap: 48, padding: '0 24px 24px', width: '100%', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ flex: wide ? '1 1 820px' : '1 1 480px', maxWidth: wide ? 820 : 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 32, width: '100%' }}>
            <h1 style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#18181b',
              lineHeight: 1.2,
            }}>{title}</h1>
            {subtitle && (
              <p style={{
                fontSize: 14,
                color: '#71717a',
                marginTop: 8,
                lineHeight: 1.5,
              }}>{subtitle}</p>
            )}
          </div>

          {/* Step content */}
          <div style={{ width: '100%' }}>
            {children}
          </div>
        </div>

        {preview && (
          <aside className="onboarding-preview-pane" style={{ display: 'none', flex: '0 0 auto', alignItems: 'center', justifyContent: 'center' }}>
            {preview}
          </aside>
        )}
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          :global(.onboarding-preview-pane) { display: flex !important; }
        }
      `}</style>

      {/* Footer */}
      {footer && (
        <div style={{
          padding: '16px 24px 24px',
          maxWidth: 480,
          width: '100%',
          margin: '0 auto',
          flexShrink: 0,
        }}>
          {footer}
        </div>
      )}
    </div>
  )
}

// Shared primary button
export function OnboardingButton({ label, onClick, disabled, loading, variant = 'primary' }: {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const styles = {
    primary: {
      background: '#FB3806',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'white',
      color: '#71717a',
      border: '1px solid #e5e5e5',
    },
    ghost: {
      background: 'transparent',
      color: '#a1a1aa',
      border: 'none',
    },
  }
  const s = styles[variant]

  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      width: '100%',
      padding: '14px 24px',
      borderRadius: 12,
      fontSize: 15,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: '150ms ease',
      ...s,
    }}>
      {loading ? (
        <div style={{ width: 20, height: 20, border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#FB3806', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      ) : label}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  )
}

// Visual option card (for multi-choice questions)
export function OptionCard({ selected, onClick, children }: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%',
      padding: '16px',
      borderRadius: 12,
      background: selected ? 'rgba(251,56,6,0.08)' : 'white',
      border: selected ? '2px solid #FB3806' : '2px solid #e5e5e5',
      cursor: 'pointer',
      textAlign: 'left',
      transition: '150ms ease',
      color: '#18181b',
    }}>
      {children}
    </button>
  )
}
