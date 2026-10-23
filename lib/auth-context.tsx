'use client'

import { createContext, useContext } from 'react'

interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  org_id: string
}

interface AuthOrg {
  id: string
  name: string
  slug: string
  primary_color: string
  pwa_theme: string
}

interface AuthContextType {
  user: AuthUser
  org: AuthOrg
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({
  user,
  org,
  children,
}: {
  user: AuthUser
  org: AuthOrg
  children: React.ReactNode
}) {
  return (
    <AuthContext.Provider value={{ user, org }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
