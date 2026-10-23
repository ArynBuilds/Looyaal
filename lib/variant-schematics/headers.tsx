import { C, S } from './_shared'

export const HEADERS: Record<string, React.ReactNode> = {
  // === Originals ===
  'header-photo-01': (
    <S>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: C.body, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 4, left: 4, display: 'flex', gap: 3, alignItems: 'center' }}>
          <div style={{ width: 10, height: 10, background: 'white', borderRadius: 2 }} />
          <div><div style={{ height: 3, background: 'white', borderRadius: 1, width: 24 }} /><div style={{ height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 1, width: 16, marginTop: 2 }} /></div>
        </div>
      </div>
    </S>
  ),
  'header-photo-02': (
    <S>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: C.body, borderRadius: 3, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ width: 12, height: 12, background: 'white', borderRadius: 2, margin: '0 auto 3px' }} />
          <div style={{ height: 4, background: 'white', borderRadius: 1, width: 38 }} />
        </div>
      </div>
    </S>
  ),
  'header-photo-03': (
    <S>
      <div style={{ display: 'flex', height: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ flex: 1, background: '#fff', padding: 5, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
          <div style={{ width: 10, height: 10, background: C.accent, borderRadius: 2 }} />
          <div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} />
          <div style={{ height: 2, background: C.body, borderRadius: 1, width: '50%' }} />
        </div>
        <div style={{ width: '40%', background: C.body }} />
      </div>
    </S>
  ),
  'header-logo-01': (
    <S>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, height: '100%' }}>
        <div style={{ width: 28, height: 28, background: C.accent, borderRadius: 4, flexShrink: 0 }} />
        <div><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 50 }} /><div style={{ height: 3, background: C.body, borderRadius: 1, width: 30, marginTop: 3 }} /></div>
      </div>
    </S>
  ),
  'header-logo-02': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 5 }}>
        <div style={{ width: 32, height: 32, background: C.accent, borderRadius: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
        <div style={{ height: 5, background: C.emphasis, borderRadius: 1, width: 60 }} />
        <div style={{ height: 3, background: C.body, borderRadius: 1, width: 30 }} />
      </div>
    </S>
  ),
  'header-logo-03': (
    <S>
      <div style={{ padding: 8, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 24, background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, borderRadius: '50%', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }} />
          <div><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 50 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 28, marginTop: 2 }} /></div>
        </div>
        <div style={{ marginTop: 8, height: 2, background: `linear-gradient(90deg, ${C.accent}, transparent)`, borderRadius: 1 }} />
      </div>
    </S>
  ),
  'header-minimal-01': (
    <S>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, padding: 8, height: '100%' }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.accent, lineHeight: 0.85, opacity: 0.9 }}>K</div>
        <div style={{ paddingBottom: 4 }}><div style={{ height: 5, background: C.emphasis, borderRadius: 1, width: 50 }} /><div style={{ height: 3, background: C.body, borderRadius: 1, width: 28, marginTop: 3 }} /></div>
      </div>
    </S>
  ),
  'header-minimal-02': (
    <S>
      <div style={{ padding: 8, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 5, height: 5, borderRadius: '50%', background: C.accent }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 30 }} /></div>
        <div style={{ height: 7, background: C.emphasis, borderRadius: 1, width: 70, marginTop: 5 }} />
      </div>
    </S>
  ),
  'header-gradient-01': (
    <S>
      <div style={{ height: '100%', background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft}, ${C.accent})`, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.85)', borderRadius: 4 }} />
        <div style={{ height: 5, background: 'white', borderRadius: 1, width: 60 }} />
        <div style={{ height: 3, background: 'rgba(255,255,255,0.7)', borderRadius: 1, width: 30 }} />
      </div>
    </S>
  ),
  'header-gradient-02': (
    <S>
      <div style={{ padding: 6, height: '100%' }}>
        <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.accentSoft}, ${C.accent})` }} />
          <div style={{ padding: 6, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 18, height: 18, background: C.accent, borderRadius: 2 }} /><div style={{ flex: 1 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', marginTop: 2 }} /></div><div style={{ padding: '2px 5px', borderRadius: 8, background: C.accentSoft, fontSize: 5, color: C.accent, fontWeight: 700 }}>Açık</div></div>
        </div>
      </div>
    </S>
  ),

  // === Creative directions ===
  'header-marquee': (
    <S>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: C.emphasis, padding: '4px 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 8, fontSize: 7, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', letterSpacing: '0.1em' }}><span>BEAN THEORY ✦ ISTANBUL ✦ OPEN NOW ✦</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 18, height: 18, background: C.accent, borderRadius: 3 }} /><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 40 }} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}><div style={{ width: 4, height: 4, borderRadius: '50%', background: C.accent }} /><div style={{ fontSize: 6, fontWeight: 700, color: C.accent, letterSpacing: '0.15em' }}>LIVE</div></div>
        </div>
      </div>
    </S>
  ),
  'header-stamp-crown': (
    <S>
      <div style={{ height: '100%', padding: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 5 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < 6 ? `radial-gradient(circle at 35% 35%, ${C.accentSoft}, ${C.accent} 70%, ${C.ink})` : 'transparent', border: i < 6 ? 'none' : `1px solid ${C.border}` }} />)}</div>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.accent, border: `2px solid ${C.accent}`, marginBottom: 4 }} />
        <div style={{ height: 5, background: C.emphasis, borderRadius: 1, width: 60 }} />
        <div style={{ fontSize: 5, color: C.body, letterSpacing: '0.25em', marginTop: 3, fontWeight: 700 }}>6 OF 10 EARNED</div>
      </div>
    </S>
  ),
  'header-liquid': (
    <S>
      <div style={{ height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 3 }}>
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M0,0 L200,0 L200,60 Q150,80 100,65 Q50,50 0,75 Z" fill={C.accent} opacity="0.95" />
          <path d="M0,0 L200,0 L200,40 Q140,60 100,45 Q40,30 0,55 Z" fill={C.accentSoft} opacity="0.6" />
        </svg>
        <div style={{ position: 'absolute', bottom: 4, left: 4, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.body, border: '2px solid white', position: 'relative', top: 4 }} />
          <div style={{ paddingBottom: 2 }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 36 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 22, marginTop: 2 }} /></div>
        </div>
      </div>
    </S>
  ),
  'header-vertical': (
    <S>
      <div style={{ display: 'flex', height: '100%', borderBottom: `1px solid ${C.empty}` }}>
        <div style={{ width: '20%', background: C.accent, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', color: 'white', fontSize: 8, fontWeight: 900, letterSpacing: '0.3em' }}>BEAN</div>
        </div>
        <div style={{ flex: 1, padding: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 5, color: C.body, letterSpacing: '0.3em', fontWeight: 700 }}><span>ISSUE 24</span><span style={{ color: C.accent }}>● OPEN</span></div>
          <div><div style={{ width: 14, height: 14, background: C.body, borderRadius: 2, marginBottom: 3 }} /><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '80%' }} /></div>
        </div>
      </div>
    </S>
  ),
}
