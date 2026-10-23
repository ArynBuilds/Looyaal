// Shared palette + wrapper for variant schematics.
// Schematics are abstract editor-only previews — neutral grays + amber accent.
// They never use brand color so the editor stays scannable regardless of org.

export const C = {
  bg: '#f8f8fa',
  body: '#d0d0d4',
  ink: '#6b7280',
  emphasis: '#1a1a2e',
  accent: '#f59e0b',
  accentSoft: '#fef3c7',
  empty: '#e5e7eb',
  border: '#cbd5e1',
} as const

export function S({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '100%', aspectRatio: '4 / 3', background: C.bg, borderRadius: 6, padding: 8, overflow: 'hidden', position: 'relative' }}>
      {children}
    </div>
  )
}
