import { C, S } from './_shared'

const photoBox = (key: number, ar = '1') => <div key={key} style={{ aspectRatio: ar, background: C.body, borderRadius: 2 }} />
const row = (i: number) => (
  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
    <div style={{ flex: 1, height: 3, background: C.ink, borderRadius: 1 }} />
    <div style={{ width: 14, height: 3, background: C.accent, borderRadius: 1 }} />
  </div>
)

export const MENUS: Record<string, React.ReactNode> = {
  // === Originals (14) ===
  'menu-compact-list': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', padding: 4 }}>{Array.from({ length: 6 }).map((_, i) => row(i))}</div>
    </S>
  ),
  'menu-photo-cards': (
    <S>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, height: '100%' }}>
        {Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ background: 'white', border: `1px solid ${C.empty}`, borderRadius: 3, overflow: 'hidden' }}><div style={{ aspectRatio: '2/1', background: C.body }} /><div style={{ padding: 3 }}><div style={{ height: 3, background: C.ink, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.accent, borderRadius: 1, width: '30%', marginTop: 2 }} /></div></div>)}
      </div>
    </S>
  ),
  'menu-category-sections': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%' }}>
        <div><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '40%', marginBottom: 3 }} />{Array.from({ length: 2 }).map((_, i) => row(i))}</div>
        <div><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '35%', marginBottom: 3 }} />{Array.from({ length: 2 }).map((_, i) => row(i))}</div>
      </div>
    </S>
  ),
  'menu-minimal-rows': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%', padding: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 3, borderBottom: `1px dotted ${C.border}` }}><div style={{ flex: 1, height: 3, background: C.ink, borderRadius: 1 }} /><div style={{ flex: 1, height: 1, background: C.body, borderBottom: `1px dotted ${C.border}` }} /><div style={{ width: 14, height: 3, background: C.accent, borderRadius: 1 }} /></div>)}
      </div>
    </S>
  ),
  'menu-featured-hero': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        <div style={{ aspectRatio: '2/1', background: `linear-gradient(135deg, ${C.accentSoft}, ${C.body})`, borderRadius: 3, position: 'relative' }}><div style={{ position: 'absolute', bottom: 3, left: 3 }}><div style={{ height: 4, background: 'white', borderRadius: 1, width: 50 }} /><div style={{ height: 2, background: C.accent, borderRadius: 1, width: 22, marginTop: 2 }} /></div></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{Array.from({ length: 3 }).map((_, i) => row(i))}</div>
      </div>
    </S>
  ),
  'menu-pill-tags': (
    <S>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 4, height: '100%', alignContent: 'flex-start' }}>{Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ padding: '3px 8px', borderRadius: 12, background: i % 3 === 0 ? C.accent : C.empty, height: 14, display: 'flex', alignItems: 'center' }}><div style={{ height: 2.5, width: 18 + (i % 3) * 6, background: i % 3 === 0 ? 'white' : C.ink, borderRadius: 1 }} /></div>)}</div>
    </S>
  ),
  'menu-numbered-list': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ fontFamily: 'serif', fontSize: 14, fontWeight: 800, color: C.accent, fontStyle: 'italic' }}>0{i + 1}</div><div style={{ flex: 1 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '40%', marginTop: 1 }} /></div></div>)}</div>
    </S>
  ),
  'menu-split-price': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, alignItems: 'center' }}><div style={{ height: 3, background: C.ink, borderRadius: 1 }} /><div style={{ background: C.accentSoft, padding: '2px 6px', borderRadius: 2, fontSize: 6, fontWeight: 800, color: C.accent }}>70₺</div></div>)}</div>
    </S>
  ),
  'menu-icon-rows': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 16, background: C.accentSoft, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}></div><div style={{ flex: 1, height: 3, background: C.ink, borderRadius: 1 }} /><div style={{ width: 14, height: 3, background: C.accent, borderRadius: 1 }} /></div>)}</div>
    </S>
  ),
  'menu-stacked-images': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        {Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ position: 'relative', aspectRatio: '5/2', background: C.body, borderRadius: 3, overflow: 'hidden' }}><div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)' }} /><div style={{ position: 'absolute', bottom: 3, left: 4 }}><div style={{ height: 3, background: 'white', borderRadius: 1, width: 32 }} /></div></div>)}
      </div>
    </S>
  ),
  'menu-collapsible': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 4, background: 'white', borderRadius: 3, border: `1px solid ${C.empty}` }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 50 }} /><div style={{ width: 8, height: 8, color: C.ink }}>▼</div></div>
        {Array.from({ length: 2 }).map((_, i) => row(i))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 4, background: 'white', borderRadius: 3, border: `1px solid ${C.empty}` }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: 40 }} /><div style={{ width: 8, height: 8, color: C.ink }}>▶</div></div>
      </div>
    </S>
  ),
  'menu-photo-grid-large': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        {Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ aspectRatio: '5/3', background: C.body, borderRadius: 3, position: 'relative' }}><div style={{ position: 'absolute', bottom: 3, left: 3, display: 'flex', flexDirection: 'column', gap: 2 }}><div style={{ height: 3, background: 'white', borderRadius: 1, width: 30 }} /><div style={{ height: 2, background: 'rgba(255,255,255,0.7)', borderRadius: 1, width: 18 }} /></div></div>)}
      </div>
    </S>
  ),
  'menu-photo-rows': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 4, height: '100%' }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 5 }}><div style={{ width: 18, height: 18, background: C.body, borderRadius: 2, flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ height: 3, background: C.ink, borderRadius: 1, width: '70%' }} /><div style={{ height: 2, background: C.accent, borderRadius: 1, width: '20%', marginTop: 2 }} /></div></div>)}</div>
    </S>
  ),
  'menu-photo-mosaic': (
    <S>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 3, height: '100%' }}>
        <div style={{ background: C.body, borderRadius: 2 }} />
        <div style={{ background: C.accentSoft, borderRadius: 2 }} />
        <div style={{ background: C.accentSoft, borderRadius: 2 }} />
        <div style={{ background: C.body, borderRadius: 2 }} />
      </div>
    </S>
  ),

  // === Designkit explore wave (8) ===
  'menu-day-drift': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.empty, border: `1px solid ${C.border}` }} />
          <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.accent }} />
          <div style={{ flex: 1, height: 12, borderRadius: 6, background: C.empty, border: `1px solid ${C.border}` }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, flex: 1 }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ background: i === 3 ? C.accentSoft : C.body, borderRadius: 2, border: i === 3 ? `1px solid ${C.accent}` : 'none' }} />)}</div>
      </div>
    </S>
  ),
  'menu-story-stream': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 4, height: '100%' }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}><div style={{ width: 18, height: 18, background: C.body, borderRadius: 2 }} /><div style={{ flex: 1 }}><div style={{ height: 4, background: C.emphasis, borderRadius: 1, width: '60%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '90%', marginTop: 2 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '70%', marginTop: 1 }} /></div><div style={{ width: 14, height: 4, background: C.accent, borderRadius: 1 }} /></div>)}</div>
    </S>
  ),
  'menu-swipe-stack': (
    <S>
      <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', width: '60%', height: '75%', background: C.empty, borderRadius: 4, transform: 'rotate(-4deg) translateY(-3px)' }} />
        <div style={{ position: 'absolute', width: '60%', height: '75%', background: C.body, borderRadius: 4, transform: 'rotate(2deg) translateY(2px)' }} />
        <div style={{ position: 'relative', width: '60%', height: '75%', background: 'white', border: `2px solid ${C.emphasis}`, borderRadius: 4, padding: 4 }}><div style={{ height: '50%', background: C.body, borderRadius: 2, marginBottom: 3 }} /><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '60%' }} /><div style={{ height: 2, background: C.accent, borderRadius: 1, width: '30%', marginTop: 2 }} /></div>
        <div style={{ position: 'absolute', bottom: 2, display: 'flex', gap: 4 }}><div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fee', border: '1px solid #ef4444' }} /><div style={{ width: 12, height: 12, borderRadius: '50%', background: C.accentSoft, border: `1px solid ${C.accent}` }} /></div>
      </div>
    </S>
  ),
  'menu-mosaic-wall': (
    <S>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 3, height: '100%' }}>
        <div style={{ gridColumn: '1/3', gridRow: '1/3', background: C.body, borderRadius: 3, position: 'relative' }}><div style={{ position: 'absolute', bottom: 2, left: 3, height: 2.5, background: 'white', borderRadius: 1, width: '50%' }} /></div>
        <div style={{ background: C.body, borderRadius: 3 }} />
        <div style={{ background: C.accentSoft, borderRadius: 3, border: `1px solid ${C.accent}` }} />
        <div style={{ background: C.body, borderRadius: 3 }} />
        <div style={{ gridColumn: '2/4', background: C.body, borderRadius: 3 }} />
      </div>
    </S>
  ),
  'menu-conversation': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: 4, height: '100%' }}>
        <div style={{ alignSelf: 'flex-end', background: C.accent, padding: '3px 6px', borderRadius: '6px 6px 1px 6px' }}><div style={{ height: 2, width: 30, background: 'rgba(255,255,255,0.7)', borderRadius: 1 }} /></div>
        {Array.from({ length: 2 }).map((_, i) => <div key={i} style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}><div style={{ width: 10, height: 10, background: C.body, borderRadius: '50%', flexShrink: 0 }} /><div style={{ background: 'white', border: `1px solid ${C.empty}`, padding: '3px 5px', borderRadius: '1px 6px 6px 6px', display: 'flex', gap: 4, alignItems: 'center' }}><div style={{ width: 12, height: 12, background: C.body, borderRadius: 2 }} /><div><div style={{ height: 2.5, background: C.emphasis, borderRadius: 1, width: 30 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: 40, marginTop: 1.5 }} /></div></div></div>)}
      </div>
    </S>
  ),
  'menu-carousel-trays': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%' }}>
        <div><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '30%', marginBottom: 3 }} /><div style={{ display: 'flex', gap: 3 }}><div style={{ width: '38%', aspectRatio: '1', background: C.body, borderRadius: 2 }} /><div style={{ width: '38%', aspectRatio: '1', background: C.body, borderRadius: 2 }} /><div style={{ width: '20%', aspectRatio: '1', background: C.empty, borderRadius: 2 }} /></div></div>
        <div><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '25%', marginBottom: 3 }} /><div style={{ display: 'flex', gap: 3 }}><div style={{ width: '38%', aspectRatio: '1', background: C.accentSoft, borderRadius: 2, border: `1px solid ${C.accent}` }} /><div style={{ width: '38%', aspectRatio: '1', background: C.body, borderRadius: 2 }} /><div style={{ width: '20%', aspectRatio: '1', background: C.empty, borderRadius: 2 }} /></div></div>
      </div>
    </S>
  ),
  'menu-magazine-spread': (
    <S>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: 4, height: '100%' }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}><div style={{ flex: 1, background: C.body, borderRadius: 2 }} /><div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '70%' }} /><div style={{ height: 2.5, background: C.accent, borderRadius: 1, width: '30%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '90%', marginTop: 2 }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '70%' }} /></div></div>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}><div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}><div style={{ height: 3, background: C.emphasis, borderRadius: 1, width: '65%' }} /><div style={{ height: 2.5, background: C.accent, borderRadius: 1, width: '25%' }} /><div style={{ height: 2, background: C.body, borderRadius: 1, width: '85%', marginTop: 2 }} /></div><div style={{ flex: 1, background: C.body, borderRadius: 2 }} /></div>
      </div>
    </S>
  ),
}
