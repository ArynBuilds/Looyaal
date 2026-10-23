'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Already logged in? Bounce — proxy routes to onboarding if incomplete.
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace('/hub')
    })
  }, [router, supabase.auth])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/hub')
    router.refresh()
  }

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ padding: '24px 32px' }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image src="/looyaal-logo.svg" alt="Looyaal" width={28} height={28} priority />
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--fg)', letterSpacing: '-0.02em' }}>looyaal</span>
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(130,70,30,0.15)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.02em' }}>
              Tekrar hoş geldin
            </h1>
            <p style={{ marginTop: 8, fontSize: 14, color: 'var(--fg-dim)' }}>
              Looyaal hesabına giriş yap
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(251,56,6,0.08)',
                border: '1px solid rgba(251,56,6,0.3)',
                color: 'var(--brand)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@cafe.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  color: 'var(--fg)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--fg-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  color: 'var(--fg)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginTop: 8,
                background: loading ? '#9F2804' : 'var(--brand)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--brand)', textDecoration: 'none' }}>
              Şifreni mi unuttun?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
