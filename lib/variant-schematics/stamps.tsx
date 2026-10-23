import { C, S } from './_shared'

const dot = (filled: boolean, key: number) => (
  <div key={key} style={{ aspectRatio: '1', borderRadius: '50%', background: filled ? C.accent : C.empty, border: filled ? 'none' : `1px solid ${C.border}` }} />
)
const sq = (filled: boolean, key: number, radius = '20%') => (
  <div key={key} style={{ aspectRatio: '1', borderRadius: radius, background: filled ? C.accent : C.empty, border: filled ? 'none' : `1px solid ${C.border}` }} />
)
const line = (w: string = '70%', color: string = C.ink, h: number = 3) => (
  <div style={{ height: h, width: w, background: color, borderRadius: 1.5 }} />
)

export const STAMPS: Record<string, React.ReactNode> = {
  // === Originals ===
  'stamp-minimal-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{line('30%')}<div style={{ width: 18, height: 4, background: C.accent, borderRadius: 2 }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, flex: 1 }}>{Array.from({ length: 10 }).map((_, i) => sq(i < 4, i))}</div>
        <div style={{ height: 2, background: C.empty, borderRadius: 1 }}><div style={{ width: '40%', height: '100%', background: C.accent, borderRadius: 1 }} /></div>
      </div>
    </S>
  ),
  'stamp-minimal-02': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
        {line('25%', C.ink, 2)}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}><div style={{ fontSize: 32, fontWeight: 800, color: C.accent, lineHeight: 0.85 }}>04</div><div style={{ fontSize: 14, color: C.body, fontWeight: 400 }}>/10</div></div>
        <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 14, marginTop: 'auto' }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: i < 4 ? '100%' : '40%', background: i < 4 ? C.accent : C.empty, borderRadius: 1 }} />)}</div>
      </div>
    </S>
  ),
  'stamp-minimal-03': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontSize: 18, fontWeight: 800, color: C.emphasis }}>4<span style={{ color: C.body, fontWeight: 400 }}>/10</span></div>{line('30%', C.accent, 3)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i < 4 ? C.accent : C.empty }} />)}</div>
        <div style={{ height: 1, background: C.empty }}><div style={{ width: '40%', height: '100%', background: C.accent }} /></div>
      </div>
    </S>
  ),
  'stamp-minimal-04': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.emphasis }}>4 <span style={{ color: C.body, fontSize: 14, fontWeight: 400 }}>of 10</span></div>
        <div style={{ display: 'flex', gap: 3, width: '90%' }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: 6, background: i < 4 ? C.accent : C.empty, borderRadius: 2 }} />)}</div>
      </div>
    </S>
  ),
  'stamp-realistic-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div>{line('40%', C.ink, 2)}{line('25%', C.body, 2)}</div><div style={{ width: 16, height: 16, background: C.accent, borderRadius: 3 }} /></div>
        <div style={{ height: 1.5, background: `linear-gradient(90deg, ${C.accent}, transparent)`, borderRadius: 1 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3, flex: 1 }}>{Array.from({ length: 10 }).map((_, i) => sq(i < 4, i))}</div>
      </div>
    </S>
  ),
  'stamp-realistic-02': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        <div style={{ background: C.accent, padding: 4, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ width: '40%', height: 4, background: 'white', borderRadius: 1 }} /><div style={{ background: 'rgba(255,255,255,0.3)', padding: '2px 5px', borderRadius: 2, fontSize: 8, fontWeight: 800, color: 'white' }}>4/10</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3, flex: 1 }}>{Array.from({ length: 10 }).map((_, i) => sq(i < 4, i))}</div>
      </div>
    </S>
  ),
  'stamp-realistic-03': (
    <S>
      <div style={{ display: 'flex', gap: 6, height: '100%' }}>
        <div style={{ width: '35%', background: `linear-gradient(135deg, ${C.accent}, ${C.ink})`, borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}><div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>4</div><div style={{ fontSize: 7, opacity: 0.8 }}>/ 10</div></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>{line('45%', C.body, 2)}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2, flex: 1 }}>{Array.from({ length: 10 }).map((_, i) => sq(i < 4, i))}</div></div>
      </div>
    </S>
  ),
  'stamp-playful-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <div style={{ height: 3, background: `linear-gradient(90deg, ${C.accent}, ${C.accentSoft}, ${C.accent})`, borderRadius: 1 }} />
        <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: C.emphasis }}>4 / 10</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, flex: 1 }}>{Array.from({ length: 10 }).map((_, i) => dot(i < 4, i))}</div>
      </div>
    </S>
  ),
  'stamp-playful-02': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}><div style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>4</div><div style={{ fontSize: 9, color: C.body }}>/ 10</div></div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'hidden' }}>{Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: i < 4 ? C.accent : C.empty, border: i < 4 ? 'none' : `1.5px dotted ${C.border}` }} />)}</div>
        <div style={{ marginTop: 'auto', background: C.accentSoft, padding: 3, borderRadius: 2, height: 8 }} />
      </div>
    </S>
  ),
  'stamp-playful-03': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 24, height: 24, borderRadius: '50%', background: C.accent, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>4</div><div style={{ flex: 1 }}>{line('70%', C.ink, 3)}{line('50%', C.body, 2)}</div></div>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0 }}>{Array.from({ length: 6 }).map((_, i) => (<div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: i < 4 ? C.accent : C.empty, flexShrink: 0 }} />{i < 5 && <div style={{ flex: 1, height: 1.5, background: i < 3 ? C.accent : C.border }} />}</div>))}</div>
      </div>
    </S>
  ),
  'stamp-gold-card': (
    <S>
      <div style={{ background: `linear-gradient(135deg, #1a1a2e 0%, ${C.accent} 50%, #1a1a2e 100%)`, height: '100%', borderRadius: 4, padding: 6, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{line('35%', 'white', 3)}<div style={{ width: 16, height: 12, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }} /></div>
        <div style={{ display: 'flex', gap: 3 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: '50%', background: i < 4 ? 'white' : 'rgba(255,255,255,0.15)' }} />)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 7, color: 'rgba(255,255,255,0.7)' }}><span>4 left</span><span>VIP</span></div>
      </div>
    </S>
  ),
  'stamp-coffee-cup': (
    <S>
      <div style={{ display: 'flex', gap: 6, height: '100%', alignItems: 'center' }}>
        <svg width="32" height="40" viewBox="0 0 80 100" fill="none" style={{ flexShrink: 0 }}>
          <path d="M10 15 H55 V85 Q55 95 45 95 H20 Q10 95 10 85 Z" fill={C.empty} stroke={C.border} strokeWidth="2" />
          <path d="M55 30 Q75 30 75 50 Q75 70 55 70" stroke={C.border} strokeWidth="2" fill="none" />
          <rect x="10" y="55" width="45" height="40" fill={C.accent} opacity="0.7" />
        </svg>
        <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 800, color: C.emphasis }}>4<span style={{ fontSize: 9, color: C.body, fontWeight: 400 }}>/10</span></div>{line('80%', C.body, 2)}<div style={{ display: 'flex', gap: 2, marginTop: 4 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i < 4 ? C.accent : C.empty }} />)}</div></div>
      </div>
    </S>
  ),
  'stamp-neon-glow': (
    <S>
      <div style={{ background: '#1a1a2e', height: '100%', borderRadius: 4, padding: 6, border: `1.5px solid ${C.accent}`, boxShadow: `0 0 8px ${C.accent}, inset 0 0 8px rgba(245,158,11,0.3)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}><div style={{ fontSize: 9, fontWeight: 700, color: C.accent, textShadow: `0 0 4px ${C.accent}` }}>SADAKAT</div><div style={{ fontSize: 9, fontWeight: 800, color: C.accent }}>4/10</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '20%', background: i < 4 ? C.accent : 'transparent', border: `1px solid ${C.accent}`, opacity: i < 4 ? 1 : 0.3, boxShadow: i < 4 ? `0 0 4px ${C.accent}` : 'none' }} />)}</div>
      </div>
    </S>
  ),
  'stamp-passport': (
    <S>
      <div style={{ background: '#fbf8f1', height: '100%', borderRadius: 3, padding: 5, position: 'relative', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: 3, marginBottom: 4 }}><div style={{ fontSize: 7, fontFamily: 'monospace', color: '#3a2c19', letterSpacing: '0.15em' }}>PASAPORT</div><div style={{ fontSize: 8, color: C.accent, fontWeight: 700 }}>4/10</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', border: `1px ${i < 4 ? 'solid' : 'dashed'} ${i < 4 ? C.accent : C.border}`, background: i < 4 ? 'rgba(245,158,11,0.15)' : 'transparent' }} />)}</div>
      </div>
    </S>
  ),

  // === V2 reworks (kept ones — distinct enough to differentiate) ===
  'stamp-minimal-01-v2': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>{line('25%', C.body, 2)}<div style={{ width: 16, height: 8, borderRadius: 4, background: C.accent }} /></div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.emphasis, letterSpacing: '-0.05em' }}>4 <span style={{ fontSize: 10, color: C.body, fontWeight: 400 }}>/ 10</span></div>
        <div style={{ position: 'relative', height: 4, background: C.empty, borderRadius: 2 }}><div style={{ width: '40%', height: '100%', background: C.accent, borderRadius: 2 }} /><div style={{ position: 'absolute', inset: '-3px 0', display: 'flex', justifyContent: 'space-between' }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: 1.5, height: 10, background: i < 4 ? C.accent : C.border }} />)}</div></div>
      </div>
    </S>
  ),
  'stamp-minimal-02-v2': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 8, borderRadius: 4, background: C.accent }} />
        {line('40%', C.body, 2)}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}><div style={{ fontSize: 28, fontWeight: 800, color: C.accent, lineHeight: 0.85, letterSpacing: '-0.06em' }}>04</div><div style={{ paddingBottom: 4 }}><div style={{ fontSize: 11, color: C.emphasis }}>/ 10</div></div></div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 3, paddingTop: 4, borderTop: `1px solid ${C.empty}` }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < 4 ? C.accent : 'transparent', border: i < 4 ? 'none' : `1px solid ${C.border}` }} />)}</div>
      </div>
    </S>
  ),
  'stamp-realistic-01-v2': (
    <S>
      <div style={{ background: '#faf5ec', height: '100%', borderRadius: 4, padding: 5, position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}><div>{line('60%', C.body, 2)}{line('45%', C.ink, 3)}</div><div style={{ width: 14, height: 7, borderRadius: 3, background: C.accent }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, margin: '4px 0' }}><div style={{ flex: 1, height: 1, background: 'rgba(60,40,20,0.2)' }} /><div style={{ fontSize: 7, fontWeight: 700, color: '#2b1d10' }}>04 / 10</div><div style={{ flex: 1, height: 1, background: 'rgba(60,40,20,0.2)' }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2.5 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', background: i < 4 ? C.accent : 'transparent', border: i < 4 ? 'none' : `1px dashed rgba(60,40,20,0.35)` }} />)}</div>
      </div>
    </S>
  ),
  'stamp-realistic-03-v2': (
    <S>
      <div style={{ background: `radial-gradient(140% 80% at 50% 0%, ${C.accent} 0%, #110a04 100%)`, height: '100%', borderRadius: 4, padding: 5, color: '#f4e8d4', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 4, border: '0.5px solid rgba(255,210,140,0.35)', borderRadius: 3, pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', marginBottom: 4 }}><div style={{ fontSize: 6, opacity: 0.7, letterSpacing: '0.3em' }}>· ALMANAC ·</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', background: i < 4 ? C.accent : 'transparent', border: i < 4 ? 'none' : '1px dashed rgba(255,210,140,0.3)', boxShadow: i < 4 ? 'inset 0 -1px 1px rgba(0,0,0,0.3)' : 'none' }} />)}</div>
      </div>
    </S>
  ),
  'stamp-playful-01-v2': (
    <S>
      <div style={{ background: `linear-gradient(160deg, ${C.accentSoft} 0%, ${C.bg} 70%)`, height: '100%', borderRadius: 4, padding: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 4 }}><div style={{ fontSize: 16, fontWeight: 800, color: C.emphasis }}>4 <span style={{ color: C.body, fontWeight: 500, fontSize: 10 }}>/ 10</span></div><div style={{ width: 14, height: 7, borderRadius: 3, background: C.accent }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', background: i < 4 ? `radial-gradient(circle at 30% 25%, white, ${C.accent} 60%)` : C.empty, boxShadow: i < 4 ? `0 1px 3px rgba(245,158,11,0.4)` : 'none' }} />)}</div>
      </div>
    </S>
  ),
  'stamp-playful-02-v2': (
    <S>
      <div style={{ height: '100%', padding: 5, backgroundImage: `radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1.5px)`, backgroundSize: '8px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><div style={{ fontSize: 9, fontWeight: 800, color: C.emphasis }}>Sticker</div><div style={{ width: 14, height: 7, borderRadius: 3, background: C.accent }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '20% 22% 18% 24%', background: i < 4 ? `radial-gradient(circle at 30% 30%, ${C.accentSoft}, ${C.accent})` : 'transparent', border: i < 4 ? '1.5px solid white' : `1.5px dashed ${C.border}`, transform: i < 4 ? `rotate(${(i * 11) % 7 - 3}deg)` : 'none', boxShadow: i < 4 ? '0 1px 2px rgba(0,0,0,0.15)' : 'none' }} />)}</div>
      </div>
    </S>
  ),
  'stamp-playful-03-v2': (
    <S>
      <div style={{ background: `linear-gradient(140deg, #1a1a2e, ${C.accent} 50%, ${C.accentSoft})`, height: '100%', borderRadius: 4, padding: 5, color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontSize: 6, letterSpacing: '0.3em', opacity: 0.85 }}>COFFEE CARD</div><div style={{ fontSize: 6, opacity: 0.7 }}>· ★ ·</div></div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}><div style={{ fontSize: 28, fontWeight: 900, lineHeight: 0.85 }}>4</div><div style={{ fontSize: 12, opacity: 0.7 }}>of 10</div></div>
        <div style={{ position: 'absolute', bottom: 5, left: 5, right: 5, display: 'flex', gap: 2 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 1.5, background: i < 4 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)' }} />)}</div>
      </div>
    </S>
  ),
  'stamp-coffee-cup-v2': (
    <S>
      <div style={{ display: 'flex', gap: 6, height: '100%', alignItems: 'center', position: 'relative' }}>
        <svg width="34" height="42" viewBox="0 0 96 120" fill="none" style={{ flexShrink: 0 }}>
          <ellipse cx="38" cy="113" rx="32" ry="3" fill="rgba(0,0,0,0.08)" />
          <path d="M14 22 H62 V92 Q62 108 50 108 H26 Q14 108 14 92 Z" fill={C.empty} stroke={C.border} strokeWidth="1.5" />
          <path d="M62 38 Q86 38 86 60 Q86 82 62 82" stroke={C.border} strokeWidth="2" fill="none" />
          <rect x="14" y="50" width="48" height="55" fill={C.accent} />
          <path d="M14 48 q12 -4 24 0 t24 0" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
        <div style={{ flex: 1 }}><div style={{ fontSize: 6, color: C.body, letterSpacing: '0.2em' }}>BEDAVA KAHVE</div><div style={{ fontSize: 18, fontWeight: 800, color: C.emphasis, letterSpacing: '-0.04em' }}>4<span style={{ fontSize: 10, color: C.body, fontWeight: 400 }}>/10</span></div><div style={{ display: 'flex', gap: 2, marginTop: 5 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 1.5, background: i < 4 ? C.accent : C.empty }} />)}</div></div>
      </div>
    </S>
  ),
  'stamp-neon-glow-v2': (
    <S>
      <div style={{ background: `radial-gradient(120% 90% at 50% 0%, #15131f 0%, #0b0a14 100%)`, height: '100%', borderRadius: 4, padding: 6, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 5, borderRadius: 3, border: `1.5px solid ${C.accent}`, boxShadow: `0 0 8px ${C.accent}, inset 0 0 8px rgba(245,158,11,0.4)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 6, color: 'rgba(244,240,255,0.5)', letterSpacing: '0.4em' }}>· OPEN LATE ·</div>
          <div style={{ fontFamily: 'cursive', fontStyle: 'italic', fontSize: 14, color: C.accent, textShadow: `0 0 6px ${C.accent}` }}>Loyalty</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2.5, marginTop: 4 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', border: `1px solid ${C.accent}`, background: i < 4 ? 'rgba(0,0,0,0.4)' : 'transparent', opacity: i < 4 ? 1 : 0.3, boxShadow: i < 4 ? `0 0 4px ${C.accent}` : 'none' }} />)}</div>
        </div>
      </div>
    </S>
  ),
  'stamp-passport-v2': (
    <S>
      <div style={{ background: '#f7f0e1', height: '100%', borderRadius: 3, padding: 5, position: 'relative', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 12, height: 12, background: 'linear-gradient(225deg, #e8dcc1 50%, transparent 50%)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><div style={{ fontFamily: 'monospace', fontSize: 6, fontWeight: 800, color: '#3a2c19', letterSpacing: '0.2em' }}>LOYALTY PASSPORT</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4 }}>{Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', border: `1.5px ${i < 4 ? 'solid' : 'dashed'} ${i < 4 ? C.accent : C.border}`, transform: i < 4 ? `rotate(${(i * 19) % 12 - 6}deg)` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i < 4 && <div style={{ fontFamily: 'monospace', fontSize: 5, fontWeight: 800, color: C.accent }}>IST</div>}</div>)}</div>
      </div>
    </S>
  ),
}
