import { C, S } from './_shared'

export const ACTIVITY: Record<string, React.ReactNode> = {
  'activity-timeline-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 16, height: 16, borderRadius: '50%', background: C.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}>3</div><div style={{ flex: 1 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '60%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', marginTop: 1 }} /></div></div>
        <div style={{ position: 'relative', paddingLeft: 8 }}>
          <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 1, background: C.empty }} />
          {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 8, marginBottom: 3, position: 'relative' }}><div style={{ position: 'absolute', left: 0, width: 5, height: 5, borderRadius: '50%', background: C.accent }} /><div style={{ flex: 1 }}><div style={{ height: 2.5, background: C.ink, borderRadius: 1, width: '70%' }} /><div style={{ height: 1.5, background: C.body, borderRadius: 1, width: '40%', marginTop: 1 }} /></div></div>)}
        </div>
      </div>
    </S>
  ),
  'activity-compact-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>{[23, 4, 2].map((n, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 2, padding: 3, textAlign: 'center' }}><div style={{ fontSize: 11, fontWeight: 800, color: C.accent }}>{n}</div><div style={{ fontSize: 4, color: C.body, letterSpacing: '0.1em', marginTop: 1 }}>{['VISIT', 'WEEK', 'AWARD'][i]}</div></div>)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: 3, background: 'white', borderRadius: 2 }}><div style={{ height: 2, background: C.ink, borderRadius: 1, width: '50%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '20%' }} /></div>)}</div>
      </div>
    </S>
  ),
  'activity-streak-01': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, height: '100%', borderRadius: 3, padding: 5, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>3</div>
        <div style={{ fontSize: 6, letterSpacing: '0.25em' }}>STREAK</div>
        <div style={{ display: 'flex', gap: 2 }}>{Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i < 3 ? 'white' : 'rgba(255,255,255,0.4)' }} />)}</div>
      </div>
    </S>
  ),
  'activity-minimal-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 5, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>{['23', '4', '2'].map((n, i) => <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 800, color: C.emphasis }}>{n}</div><div style={{ fontSize: 4, color: C.body, letterSpacing: '0.1em', marginTop: 1 }}>{['VISIT', 'WEEK', 'AWARD'][i]}</div></div>)}</div>
        <div style={{ height: 1, background: C.empty }} />
        {Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accent }} /><div style={{ flex: 1, height: 2, background: C.ink, borderRadius: 1 }} /><div style={{ width: 14, height: 2, background: C.body, borderRadius: 1 }} /></div>)}
      </div>
    </S>
  ),
  'activity-achievement-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>
        <div style={{ display: 'flex', gap: 3, justifyContent: 'space-around' }}>{[true, true, false].map((unlocked, i) => <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: unlocked ? `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})` : C.empty, border: unlocked ? 'none' : `1.5px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: unlocked ? 'white' : C.body, fontSize: 12, boxShadow: unlocked ? `0 2px 6px rgba(245,158,11,0.4)` : 'none' }}>{unlocked ? '★' : '?'}</div>)}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 10, height: 10, background: C.accentSoft, borderRadius: 2 }} /><div style={{ flex: 1, height: 2.5, background: C.ink, borderRadius: 1 }} /></div>)}</div>
      </div>
    </S>
  ),
}
