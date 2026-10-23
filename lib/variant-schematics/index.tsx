// Aggregated registry of variant schematics — abstract, neutral-color
// previews used in the editor's variant picker so owners can scan visually
// before clicking. Schematics intentionally do NOT use brand color (uses
// only #f59e0b amber accent) so they read consistently across orgs.

import { STAMPS } from './stamps'
import { HEADERS } from './headers'
import { MENUS } from './menus'
import { SANA_OZEL } from './sana-ozel'
import { CAMPAIGNS } from './campaigns'
import { CHALLENGES } from './challenges'
import { ACTIVITY } from './activity'
import { PROFILE } from './profile'
import { NAV } from './nav'

export const SCHEMATICS: Record<string, React.ReactNode> = {
  ...STAMPS,
  ...HEADERS,
  ...MENUS,
  ...SANA_OZEL,
  ...CAMPAIGNS,
  ...CHALLENGES,
  ...ACTIVITY,
  ...PROFILE,
  ...NAV,
}

/** Returns the schematic for a variant ID, or a neutral fallback. */
export function getSchematic(variantId: string): React.ReactNode {
  return SCHEMATICS[variantId] ?? (
    <div style={{ width: '100%', aspectRatio: '4/3', background: '#f8f8fa', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#9ca3af', letterSpacing: '0.1em' }}>?</div>
  )
}
