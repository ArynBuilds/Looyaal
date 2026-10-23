import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { supabaseUrl, supabaseFetchOptions } from './lib/supabase/url'
import { getInstallState } from './lib/install'

// Routes that require an authenticated owner/staff session
const DASHBOARD_ROUTES = [
  '/customers',
  '/loyalty',
  '/subscriptions',
  '/campaigns',
  '/influencers',
  '/reviews',
  '/locations',
  '/analytics',
  '/settings',
  '/hub',
  '/editor',
]

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

function isBaristaRoute(pathname: string): boolean {
  return pathname.startsWith('/barista/') && pathname !== '/barista/login' && pathname !== '/barista/setup'
}

// Single-cafe mode: the root URL serves this install's customer app.
// The org slug never changes after setup, so cache it for the process lifetime.
let cachedSlug: string | null = null

async function rootResponse(request: NextRequest): Promise<NextResponse> {
  if (!cachedSlug) {
    const state = await getInstallState()
    if (!state.hasOwner) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    if (!state.onboarded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    cachedSlug = state.orgSlug
  }
  const url = request.nextUrl.clone()
  url.pathname = `/${cachedSlug}`
  return NextResponse.rewrite(url)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === '/') return rootResponse(request)

  const needsAuth = isDashboardRoute(pathname) || isBaristaRoute(pathname)
  if (!needsAuth && pathname !== '/login') return NextResponse.next({ request })

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
      ...supabaseFetchOptions,
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Logged-in users hitting /login go straight to the dashboard
  if (pathname === '/login') {
    if (user) return NextResponse.redirect(new URL('/hub', request.url))
    return supabaseResponse
  }

  if (!user) {
    const target = isBaristaRoute(pathname) ? '/barista/login' : '/login'
    return NextResponse.redirect(new URL(target, request.url))
  }

  // Owners who haven't finished the app builder go back to onboarding
  if (isDashboardRoute(pathname)) {
    const { data: userData } = await supabase
      .from('users')
      .select('organizations(onboarding_completed)')
      .eq('id', user.id)
      .single()

    const org = userData?.organizations as unknown as { onboarding_completed: boolean } | null
    if (org && !org.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
