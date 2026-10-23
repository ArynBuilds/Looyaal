import { C, S } from './_shared'

export const CAMPAIGNS: Record<string, React.ReactNode> = {
  // === Originals (10) ===
  'campaign-banner-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 3, padding: 4 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '50%', marginTop: 2 }} /></div>)}</div>
    </S>
  ),
  'campaign-banner-02': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, borderRadius: 3, padding: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}><div><div style={{ height: 3, background: 'white', borderRadius: 1, width: 40 }} /><div style={{ height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 1, width: 22, marginTop: 2 }} /></div><div style={{ fontSize: 13, fontWeight: 900 }}>%20</div></div>)}</div>
    </S>
  ),
  'campaign-card-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 4, display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 18, height: 18, background: C.accentSoft, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.accent, fontSize: 10 }}>★</div><div style={{ flex: 1 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', marginTop: 2 }} /></div></div>)}</div>
    </S>
  ),
  'campaign-inline-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} /><div style={{ flex: 1, height: 2.5, background: C.ink, borderRadius: 1 }} /><div style={{ fontSize: 7, fontWeight: 800, color: C.accent }}>%{15 + i * 5}</div></div>)}</div>
    </S>
  ),
  'campaign-countdown-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 1 }).map((_, i) => <div key={i} style={{ background: '#1a1a2e', borderRadius: 3, padding: 5, color: 'white' }}><div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 3 }}>{['12', '34', '56'].map((n, j) => <div key={j} style={{ fontSize: 11, fontWeight: 900, color: C.accent }}>{n}</div>)}</div><div style={{ height: 3, background: C.body, borderRadius: 1, width: '60%' }} /></div>)}</div>
    </S>
  ),
  'campaign-split-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ display: 'flex', borderRadius: 3, overflow: 'hidden' }}><div style={{ width: '40%', background: C.body }} /><div style={{ flex: 1, background: 'white', border: `1px solid ${C.empty}`, borderLeft: 'none', padding: 4 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '80%' }} /><div style={{ height: 2, background: C.accent, borderRadius: 1, width: '40%', marginTop: 2 }} /></div></div>)}</div>
    </S>
  ),
  'campaign-neon-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: '#1a1a2e', border: `1px solid ${C.accent}`, boxShadow: `0 0 6px rgba(245,158,11,0.3)`, borderRadius: 3, padding: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ height: 3, background: C.accent, borderRadius: 1, width: 40 }} /><div style={{ fontSize: 9, fontWeight: 800, color: C.accent, textShadow: `0 0 4px ${C.accent}` }}>%{20 + i * 5}</div></div>)}</div>
    </S>
  ),
  'campaign-ticket-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1.5px dashed ${C.accent}`, borderRadius: 3, padding: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}><div style={{ position: 'absolute', left: -3, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.bg }} /><div style={{ position: 'absolute', right: -3, top: '50%', transform: 'translateY(-50%)', width: 5, height: 5, borderRadius: '50%', background: C.bg }} /><div><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: 40 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 26, marginTop: 1 }} /></div><div style={{ fontSize: 8, fontWeight: 800, color: C.accent }}>%{15 + i * 5}</div></div>)}</div>
    </S>
  ),
  'campaign-fullbleed-01': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ position: 'relative', flex: 1, background: `linear-gradient(135deg, ${C.accent}, ${C.ink})`, borderRadius: 3, padding: 5, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div style={{ height: 4, background: 'white', borderRadius: 1, width: 40 }} /><div style={{ fontSize: 13, fontWeight: 900 }}>%{20 + i * 5}</div></div>)}</div>
    </S>
  ),
  'campaign-mosaic-01': (
    <S>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, height: '100%' }}>
        <div style={{ gridRow: '1/3', background: `linear-gradient(135deg, ${C.accent}, ${C.accentSoft})`, borderRadius: 3, position: 'relative' }}><div style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 12, fontWeight: 900, color: 'white' }}>%30</div></div>
        <div style={{ background: C.empty, borderRadius: 3 }} />
        <div style={{ background: C.empty, borderRadius: 3 }} />
      </div>
    </S>
  ),

  // === Designkit explore wave (3) ===
  'campaign-front-page': (
    <S>
      <div style={{ background: 'white', border: `1px solid ${C.emphasis}`, padding: 4, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${C.emphasis}`, paddingBottom: 2 }}><div style={{ fontSize: 6, fontWeight: 800, color: C.emphasis, letterSpacing: '0.15em' }}>SAYI 24</div><div style={{ fontSize: 5, color: C.body }}>26 NIS</div></div>
        <div style={{ height: 6, background: C.emphasis, borderRadius: 1, width: '90%' }} />
        <div style={{ height: 6, background: C.emphasis, borderRadius: 1, width: '70%' }} />
        <div style={{ display: 'flex', gap: 4 }}><div style={{ flex: 1, height: 16, background: C.body, borderRadius: 1 }} /><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ height: 1.5, background: C.ink, borderRadius: 1, width: i === 2 ? '60%' : '100%' }} />)}</div></div>
      </div>
    </S>
  ),
  'campaign-coupon-stack': (
    <S>
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '78%', height: '60%', background: C.empty, border: `1.5px dashed ${C.border}`, borderRadius: 4, transform: 'rotate(-3deg) translateY(8px)' }} />
        <div style={{ position: 'absolute', width: '78%', height: '60%', background: C.accentSoft, border: `1.5px dashed ${C.accent}`, borderRadius: 4, transform: 'rotate(2deg) translateY(4px)' }} />
        <div style={{ position: 'relative', width: '78%', height: '60%', background: 'white', border: `1.5px dashed ${C.accent}`, borderRadius: 4, padding: 4, display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 2px 6px rgba(245,158,11,0.2)' }}><div style={{ flex: 1 }}><div style={{ fontSize: 5, color: C.accent, letterSpacing: '0.2em', fontWeight: 700 }}>KUPON</div><div style={{ height: 2.5, background: C.emphasis, borderRadius: 1, width: '70%', marginTop: 2 }} /></div><div style={{ width: 1, height: '70%', borderLeft: `1.5px dashed ${C.border}` }} /><div style={{ fontSize: 16, fontWeight: 900, color: C.accent }}>%20</div></div>
      </div>
    </S>
  ),
  'campaign-product-showcase': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, padding: 3, display: 'flex', gap: 4 }}><div style={{ width: '38%', aspectRatio: '1', background: `linear-gradient(135deg, ${C.accentSoft}, ${C.body})`, borderRadius: 2, position: 'relative' }}><div style={{ position: 'absolute', top: 2, right: 2, background: C.accent, color: 'white', padding: '1px 3px', borderRadius: 1.5, fontSize: 5, fontWeight: 800 }}>−%{15 + i * 5}</div></div><div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}><div><div style={{ fontSize: 5, color: C.accent, letterSpacing: '0.15em', fontWeight: 700 }}>YENİ</div><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '80%', marginTop: 2 }} /></div><div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}><div style={{ fontSize: 9, fontWeight: 800, color: C.accent }}>85₺</div><div style={{ fontSize: 6, color: C.body, textDecoration: 'line-through' }}>110₺</div></div></div></div>)}</div>
    </S>
  ),
}
