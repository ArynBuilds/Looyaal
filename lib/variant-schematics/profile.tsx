import { C, S } from './_shared'

export const PROFILE: Record<string, React.ReactNode> = {
  'profile-card-01': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%', textAlign: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, margin: '0 auto 4px' }} />
        <div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '50%', margin: '0 auto' }} />
        <div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', margin: '3px auto 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 6 }}>{[23, 4].map((n, i) => <div key={i}><div style={{ fontSize: 9, fontWeight: 800, color: C.accent }}>{n}</div><div style={{ fontSize: 4, color: C.body }}>{['VISIT', 'AWARD'][i]}</div></div>)}</div>
      </div>
    </S>
  ),
  'profile-minimal-01': (
    <S>
      <div style={{ padding: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 22, height: 22, borderRadius: '50%', background: C.body }} /><div><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 40 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 26, marginTop: 2 }} /></div></div>
        {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderTop: `1px solid ${C.empty}` }}><div style={{ height: 2, background: C.ink, borderRadius: 1, width: 30 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 20 }} /></div>)}
      </div>
    </S>
  ),
  'profile-hero-01': (
    <S>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '40%', background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, borderRadius: '3px 3px 0 0' }} />
        <div style={{ flex: 1, background: 'white', border: `1px solid ${C.empty}`, borderTop: 'none', borderRadius: '0 0 3px 3px', padding: 4, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'white', border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}><div style={{ width: '100%', height: '100%', borderRadius: '50%', background: C.body }} /></div>
          <div style={{ marginTop: 18, textAlign: 'center' }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 50, margin: '0 auto' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 35, margin: '3px auto 0' }} /></div>
        </div>
      </div>
    </S>
  ),
  'profile-split-01': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, height: '100%', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: '40%', background: C.body, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white' }} /></div>
        <div style={{ flex: 1, padding: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '50%', marginTop: 3 }} /><div style={{ height: 2.5, background: C.accent, borderRadius: 1, width: '40%', marginTop: 5 }} /></div>
      </div>
    </S>
  ),
}
