import { C, S } from './_shared'

export const SANA_OZEL: Record<string, React.ReactNode> = {
  // === Originals (10) ===
  'sana-ozel-01': (
    <S>
      <div style={{ padding: 4, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}><div style={{ width: 6, height: 6, color: C.accent }}>✦</div><div style={{ height: 2.5, background: C.accent, borderRadius: 1, width: 36 }} /></div>
        {Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 4, marginBottom: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: 50 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 30, marginTop: 2 }} /></div><div style={{ background: C.accentSoft, padding: '2px 5px', borderRadius: 2, fontSize: 6, fontWeight: 800, color: C.accent }}>%20</div></div>)}
      </div>
    </S>
  ),
  'sana-ozel-02': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.ink})`, height: '100%', borderRadius: 3, padding: 5, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><div style={{ height: 3, background: 'rgba(255,255,255,0.7)', borderRadius: 1, width: 24, marginBottom: 3 }} /><div style={{ height: 5, background: 'white', borderRadius: 1, width: 50 }} /></div>
        <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>%20</div>
      </div>
    </S>
  ),
  'sana-ozel-03': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 12, height: 12, background: C.accent, borderRadius: 2 }} /><div style={{ flex: 1 }}><div style={{ height: 3, background: C.ink, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', marginTop: 1 }} /></div><div style={{ fontSize: 7, fontWeight: 800, color: C.accent }}>%{15 + i * 5}</div></div>)}</div>
    </S>
  ),
  'sana-ozel-04': (
    <S>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}><div style={{ width: 10, height: 10, background: C.accent, borderRadius: '50%' }} /><div style={{ fontSize: 8, fontWeight: 800, color: C.accent }}>%{15 + i * 5}</div></div>)}</div>
    </S>
  ),
  'sana-ozel-05': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 4, display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 26, height: 26, borderRadius: '50%', background: C.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900 }}>%{15 + i * 5}</div><div style={{ flex: 1 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '50%', marginTop: 2 }} /></div></div>)}</div>
    </S>
  ),
  'sana-ozel-06': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ display: 'flex', borderRadius: 3, overflow: 'hidden' }}><div style={{ background: C.accent, color: 'white', padding: 4, fontSize: 8, fontWeight: 800 }}>%{15 + i * 5}</div><div style={{ flex: 1, background: 'white', border: `1px solid ${C.empty}`, borderLeft: 'none', padding: 4 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', marginTop: 2 }} /></div></div>)}</div>
    </S>
  ),
  'sana-ozel-07': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: '#1a1a2e', border: `1px solid ${C.accent}`, boxShadow: `0 0 6px rgba(245,158,11,0.3)`, borderRadius: 3, padding: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ height: 3, background: C.accent, borderRadius: 1, width: 40 }} /><div style={{ fontSize: 8, fontWeight: 800, color: C.accent, textShadow: `0 0 4px ${C.accent}` }}>%{15 + i * 5}</div></div>)}</div>
    </S>
  ),
  'sana-ozel-08': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1.5px dashed ${C.accent}`, borderRadius: 3, padding: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}><div style={{ position: 'absolute', left: -3, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.bg }} /><div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.bg }} /><div><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: 40 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 26, marginTop: 1 }} /></div><div style={{ fontSize: 8, fontWeight: 800, color: C.accent }}>%{15 + i * 5}</div></div>)}</div>
    </S>
  ),
  'sana-ozel-09': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.body}, ${C.empty})`, height: '100%', padding: 4, position: 'relative' }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', borderRadius: 3, padding: 5, border: '1px solid rgba(255,255,255,0.4)' }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: 50 }} /><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}><div style={{ height: 2, background: C.body, borderRadius: 1, width: 30 }} /><div style={{ fontSize: 9, fontWeight: 800, color: C.accent }}>%20</div></div></div>
      </div>
    </S>
  ),
  'sana-ozel-10': (
    <S>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, height: '100%' }}>
        <div style={{ gridColumn: '1/3', gridRow: '1/3', background: C.accent, borderRadius: 3, position: 'relative' }}><div style={{ position: 'absolute', bottom: 3, left: 3, color: 'white', fontSize: 11, fontWeight: 900 }}>%30</div></div>
        <div style={{ background: C.accentSoft, borderRadius: 3 }} />
        <div style={{ background: C.accentSoft, borderRadius: 3 }} />
      </div>
    </S>
  ),

  // === Designkit explore wave (8) ===
  'sana-ozel-reveal-scratch': (
    <S>
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '85%', height: '70%', background: `repeating-linear-gradient(45deg, ${C.accent} 0 6px, ${C.ink} 6px 12px)`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em' }}>KAZIYIP AÇ</div>
        <div style={{ position: 'absolute', width: '50%', height: '35%', background: C.accentSoft, border: `1.5px dashed ${C.accent}`, borderRadius: 3, transform: 'rotate(-3deg) translate(20%, -25%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ height: 4, background: C.accent, borderRadius: 1, width: '60%' }} /></div>
      </div>
    </S>
  ),
  'sana-ozel-why-you': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 5, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}><div style={{ width: 12, height: 12, background: C.accent, borderRadius: '50%', flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 6, color: C.accent, letterSpacing: '0.2em', fontWeight: 700 }}>ÇÜNKÜ</div><div style={{ height: 2, background: C.body, borderRadius: 1, width: '90%', marginTop: 2 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '70%', marginTop: 1 }} /></div></div>
        <div style={{ height: 1, background: C.empty }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>%20</div><div style={{ flex: 1 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '65%' }} /></div></div>
        <div style={{ height: 5, background: C.accent, borderRadius: 2, marginTop: 'auto' }} />
      </div>
    </S>
  ),
  'sana-ozel-countdown': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.ink}, ${C.accent})`, height: '100%', borderRadius: 4, padding: 5, color: 'white', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 3 }}>
          {[12, 34, 56].map((n, i) => <div key={i} style={{ textAlign: 'center', flex: 1 }}><div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1, color: C.accentSoft }}>{n}</div><div style={{ fontSize: 4, opacity: 0.7, letterSpacing: '0.15em', marginTop: 2 }}>{['SAAT', 'DK', 'SN'][i]}</div></div>)}
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><div style={{ fontSize: 12, fontWeight: 800 }}>%20</div><div style={{ height: 3, background: 'rgba(255,255,255,0.85)', borderRadius: 1, flex: 1 }} /></div>
      </div>
    </S>
  ),
  'sana-ozel-stack': (
    <S>
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '75%', height: '70%', background: C.empty, borderRadius: 4, transform: 'rotate(-5deg) translateY(4px)' }} />
        <div style={{ position: 'absolute', width: '75%', height: '70%', background: C.body, borderRadius: 4, transform: 'rotate(3deg)' }} />
        <div style={{ position: 'relative', width: '75%', height: '70%', background: 'white', border: `2px solid ${C.accent}`, borderRadius: 4, padding: 5 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '60%' }} /><div style={{ height: 8, background: C.accent, borderRadius: 2, width: '40%', marginTop: 3 }} /></div>
        <div style={{ position: 'absolute', bottom: 2, display: 'flex', gap: 3 }}>{[true, false, false].map((a, i) => <div key={i} style={{ width: 6, height: 4, borderRadius: 2, background: a ? C.accent : C.border }} />)}</div>
      </div>
    </S>
  ),
  'sana-ozel-spotlight': (
    <S>
      <div style={{ background: `linear-gradient(135deg, ${C.ink}, ${C.accent} 60%, ${C.accentSoft})`, height: '100%', borderRadius: 4, padding: 5, color: 'white', position: 'relative' }}>
        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 6, height: '85%', background: `radial-gradient(circle, white 30%, transparent 30%) repeat-y`, backgroundSize: '6px 8px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontSize: 5, letterSpacing: '0.4em', opacity: 0.8 }}>· VIP ·</div><div style={{ fontSize: 5, letterSpacing: '0.2em', opacity: 0.7 }}>NO. 4A2F</div></div>
        <div style={{ height: 7, background: 'white', borderRadius: 1, width: '70%', marginTop: 5 }} />
        <div style={{ height: 5, background: 'rgba(255,255,255,0.85)', borderRadius: 1, width: '50%', marginTop: 3 }} />
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.4)', marginTop: 6, paddingTop: 3, display: 'flex', justifyContent: 'space-between', fontSize: 5, letterSpacing: '0.2em' }}><span style={{ opacity: 0.85, fontWeight: 700 }}>2D 4S</span><span style={{ fontWeight: 700 }}>QR →</span></div>
      </div>
    </S>
  ),
  'sana-ozel-conversation': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}><div style={{ width: 14, height: 14, background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, borderRadius: '50%', flexShrink: 0 }} /><div style={{ background: 'white', border: `1px solid ${C.empty}`, padding: '4px 6px', borderRadius: '1px 6px 6px 6px' }}><div style={{ height: 2, background: C.body, borderRadius: 1, width: 50 }} /></div></div>
        <div style={{ alignSelf: 'flex-start', background: C.accent, padding: '4px 6px', borderRadius: '6px 6px 6px 1px', marginLeft: 18, color: 'white' }}><div style={{ height: 3, background: 'white', borderRadius: 1, width: 35 }} /><div style={{ height: 4, background: C.accentSoft, borderRadius: 1, width: 18, marginTop: 2 }} /></div>
      </div>
    </S>
  ),
  'sana-ozel-timeline': (
    <S>
      <div style={{ display: 'flex', gap: 5, padding: 4, height: '100%' }}>
        <div style={{ position: 'relative', width: 6, flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: 2.5, top: 4, bottom: 4, width: 1.5, background: C.empty }} />
          <div style={{ position: 'absolute', left: 0, top: '8%', width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
          <div style={{ position: 'absolute', left: 0, top: '46%', width: 6, height: 6, borderRadius: '50%', background: 'white', border: `1.5px solid ${C.accent}` }} />
          <div style={{ position: 'absolute', left: 0, top: '82%', width: 6, height: 6, borderRadius: '50%', background: 'white', border: `1.5px solid ${C.body}` }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 5, color: C.accent, letterSpacing: '0.15em', fontWeight: 700 }}>BUGÜN</div><div style={{ height: 2.5, background: C.emphasis, borderRadius: 1, width: '70%', marginTop: 2 }} /></div>
          <div><div style={{ fontSize: 5, color: C.accent, letterSpacing: '0.15em', fontWeight: 700 }}>YARIN</div><div style={{ height: 2.5, background: C.emphasis, borderRadius: 1, width: '60%', marginTop: 2 }} /></div>
          <div><div style={{ fontSize: 5, color: C.body, letterSpacing: '0.15em', fontWeight: 700 }}>BU HAFTA</div><div style={{ height: 2.5, background: C.body, borderRadius: 1, width: '55%', marginTop: 2 }} /></div>
        </div>
      </div>
    </S>
  ),
  'sana-ozel-gift': (
    <S>
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', gap: 5, padding: 4 }}>
        <div style={{ position: 'relative', width: 32, aspectRatio: '1', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.ink}, ${C.accent})`, borderRadius: 3 }} />
          <div style={{ position: 'absolute', inset: 0, left: '40%', right: '40%', background: C.accentSoft }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '40%', bottom: '40%', background: C.accentSoft }} />
        </div>
        <div style={{ flex: 1 }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '50%', marginTop: 2 }} /></div>
      </div>
    </S>
  ),
}
