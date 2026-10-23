import { C, S } from './_shared'

export const CHALLENGES: Record<string, React.ReactNode> = {
  // === Originals (5) ===
  'challenge-card-01': (
    <S>
      <div style={{ background: 'white', border: `2px solid ${C.accent}`, borderRadius: 3, padding: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '60%' }} /><div style={{ width: 12, height: 12, background: C.accent, borderRadius: 2 }} /></div>
        <div style={{ height: 2, background: C.body, borderRadius: 1, width: '90%' }} />
        <div style={{ height: 5, background: C.empty, borderRadius: 2.5, marginTop: 'auto' }}><div style={{ width: '66%', height: '100%', background: C.accent, borderRadius: 2.5 }} /></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6, color: C.body }}><span>2/3</span><span>3 GUN</span></div>
      </div>
    </S>
  ),
  'challenge-banner-01': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, height: '100%', borderRadius: 3, padding: 5, color: 'white', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.3)', borderRadius: '50%' }} />
        <div style={{ flex: 1 }}><div style={{ height: 4, background: 'white', borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 1, width: '50%', marginTop: 2 }} /><div style={{ height: 3, background: 'rgba(255,255,255,0.95)', borderRadius: 1, width: '40%', marginTop: 3 }} /></div>
      </div>
    </S>
  ),
  'challenge-minimal-01': (
    <S>
      <div style={{ padding: 4, height: '100%' }}>
        <div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '60%' }} />
        <div style={{ height: 2, background: C.body, borderRadius: 1, width: '80%', marginTop: 3 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6 }}><div style={{ flex: 1, height: 2, background: C.empty }}><div style={{ width: '66%', height: '100%', background: C.accent }} /></div><div style={{ fontSize: 7, fontWeight: 700, color: C.accent }}>2/3</div></div>
      </div>
    </S>
  ),
  'challenge-ticket-01': (
    <S>
      <div style={{ background: 'white', border: `1.5px dashed ${C.accent}`, borderRadius: 3, padding: 5, height: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', left: -3, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.bg }} />
        <div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.bg }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '50%' }} /><div style={{ fontSize: 8, fontWeight: 800, color: C.accent }}>2/3</div></div>
        <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ flex: 1, height: 6, background: i < 2 ? C.accent : C.empty, borderRadius: 1 }} />)}</div>
      </div>
    </S>
  ),
  'challenge-glass-01': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.body}, ${C.empty})`, height: '100%', padding: 4, position: 'relative' }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', borderRadius: 3, padding: 5, border: '1px solid rgba(255,255,255,0.4)', height: 'calc(100% - 8px)' }}>
          <div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '60%' }} />
          <div style={{ height: 2, background: C.body, borderRadius: 1, width: '80%', marginTop: 3 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}><div style={{ fontSize: 9, fontWeight: 800, color: C.accent }}>2/3</div></div>
        </div>
      </div>
    </S>
  ),

  // === Designkit explore wave (5) ===
  'challenge-xp-bar': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '50%' }} /><div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, color: 'white', padding: '2px 6px', borderRadius: 2, fontSize: 7, fontWeight: 800 }}>2/3</div></div>
        <div style={{ position: 'relative', height: 9, background: C.empty, borderRadius: 4.5, marginTop: 4 }}>
          <div style={{ position: 'absolute', inset: '0 33% 0 0', background: `linear-gradient(90deg, ${C.accent}, ${C.accentSoft})`, borderRadius: 4.5 }} />
          <div style={{ position: 'absolute', left: '67%', top: -2, bottom: -2, width: 2, background: 'white', boxShadow: `0 0 4px white` }} />
          {[33, 67].map(p => <div key={p} style={{ position: 'absolute', left: `${p}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 1.5, height: 5, background: C.body }} />)}
        </div>
      </div>
    </S>
  ),
  'challenge-step-map': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%' }}>
        <div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '60%', marginBottom: 6 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}>✓</div>
          <div style={{ flex: 1, height: 2, background: C.accent }} />
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800 }}>✓</div>
          <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${C.accent} 50%, ${C.empty} 50%)` }} />
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'white', border: `2px solid ${C.accent}`, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, boxShadow: `0 0 0 3px rgba(245,158,11,0.15)` }}>3</div>
        </div>
      </div>
    </S>
  ),
  'challenge-calendar-grid': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '40%' }} /><div style={{ fontSize: 7, fontWeight: 800, color: C.accent }}>2/3</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {[C.body, C.accent, C.body, C.accent, C.accentSoft, C.empty, C.empty].map((bg, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: 1.5, background: bg, border: bg === C.accentSoft ? `1px solid ${C.accent}` : bg === C.empty ? `1px dashed ${C.border}` : 'none' }} />)}
        </div>
        <div style={{ height: 2, background: C.empty, borderRadius: 1, marginTop: 4 }}><div style={{ width: '40%', height: '100%', background: C.accent, borderRadius: 1 }} /></div>
      </div>
    </S>
  ),
  'challenge-habit-tracker': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '50%' }} />
        {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 11, height: 11, borderRadius: 2, background: i < 2 ? C.accent : 'transparent', border: i < 2 ? 'none' : `1.5px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 6, fontWeight: 800 }}>{i < 2 && '✓'}</div><div style={{ flex: 1, height: 2.5, background: i < 2 ? C.body : C.ink, borderRadius: 1 }} /></div>)}
        <div style={{ height: 2, background: C.empty, borderRadius: 1, marginTop: 'auto' }}><div style={{ width: '66%', height: '100%', background: C.accent, borderRadius: 1 }} /></div>
      </div>
    </S>
  ),
  'challenge-countdown-coin': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
          <svg viewBox="0 0 38 38" style={{ width: '100%', height: '100%' }}>
            <circle cx="19" cy="19" r="16" stroke={C.empty} strokeWidth="4" fill="none" />
            <circle cx="19" cy="19" r="16" stroke={C.accent} strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset="33" strokeLinecap="round" transform="rotate(-90 19 19)" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: 12, fontWeight: 800, color: C.emphasis, lineHeight: 1 }}>2</div><div style={{ fontSize: 5, color: C.body, marginTop: 1 }}>/ 3</div></div>
        </div>
        <div style={{ flex: 1 }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '50%', marginTop: 3 }} /><div style={{ height: 2.5, background: C.accent, borderRadius: 1, width: '30%', marginTop: 3 }} /></div>
      </div>
    </S>
  ),
}
