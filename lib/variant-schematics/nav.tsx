import { C, S } from './_shared'

const navItem = (active: boolean, key: number) => (
  <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
    <div style={{ width: 10, height: 10, borderRadius: 2, background: active ? C.accent : C.body }} />
    <div style={{ width: 14, height: 1.5, background: active ? C.accent : C.body, borderRadius: 1 }} />
  </div>
)

export const NAV: Record<string, React.ReactNode> = {
  'nav-bottom-bar': (
    <S>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ background: 'white', borderTop: `1px solid ${C.empty}`, padding: '6px 4px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>{Array.from({ length: 3 }).map((_, i) => navItem(i === 0, i))}</div>
      </div>
    </S>
  ),
  'nav-floating-island': (
    <S>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 5 }}>
        <div style={{ background: '#1a1a2e', padding: '6px 14px', borderRadius: 20, display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 8, alignSelf: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i === 0 ? C.accent : 'rgba(255,255,255,0.5)' }} />)}</div>
      </div>
    </S>
  ),
  'nav-minimal-dots': (
    <S>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ width: i === 0 ? 14 : 6, height: 6, borderRadius: 3, background: i === 0 ? C.accent : C.body, transition: 'all 200ms' }} />)}</div>
      </div>
    </S>
  ),
  'nav-tab-pills': (
    <S>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ background: 'white', borderTop: `1px solid ${C.empty}`, padding: '5px 6px', display: 'flex', justifyContent: 'space-around', gap: 4 }}>{Array.from({ length: 3 }).map((_, i) => <div key={i} style={{ flex: 1, padding: '4px 0', borderRadius: 8, background: i === 0 ? C.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 8, height: 8, borderRadius: 1.5, background: i === 0 ? 'white' : C.body }} /></div>)}</div>
      </div>
    </S>
  ),
}
