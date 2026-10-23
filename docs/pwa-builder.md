# The PWA builder

Every Looyaal install produces one branded, installable customer app (a Progressive Web App) for the cafe. Nothing is compiled per cafe: the app is a single React shell that reads a small JSON configuration, turns it into CSS custom properties ("design tokens"), and picks one of several interchangeable components for each slot of the screen ("variants").

This document follows that pipeline from the cafe's website to the icon on a customer's home screen.

- [1. Pipeline overview](#1-pipeline-overview)
- [2. Brand extraction](#2-brand-extraction)
- [3. The onboarding wizard](#3-the-onboarding-wizard)
- [4. The configuration object](#4-the-configuration-object)
- [5. Design tokens](#5-design-tokens)
- [6. Variants](#6-variants)
- [7. How variants are chosen](#7-how-variants-are-chosen)
- [8. The editor](#8-the-editor)
- [9. The app shell](#9-the-app-shell)
- [10. Installability: manifest, icons, service worker](#10-installability-manifest-icons-service-worker)
- [11. Push notifications](#11-push-notifications)
- [12. The barista app](#12-the-barista-app)
- [13. Adding a new variant](#13-adding-a-new-variant)

---

## 1. Pipeline overview

```mermaid
flowchart LR
    URL[Cafe website URL] --> EX["/api/brand/extract<br/>lib/extractor/"]
    EX --> DRAFT[Draft answers<br/>+ confidence<br/>+ layout hints]
    DRAFT --> WIZ[Onboarding wizard<br/>app/onboarding/page.tsx]
    WIZ --> MAP[mapAnswersToVariants<br/>lib/variant-mapper.ts]
    MAP --> CFG[(organizations.pwa_config)]
    ED[Editor<br/>app/(dashboard)/editor] --> CFG
    CFG --> THEME["/api/public/{slug}/theme"]
    THEME --> TP[TokenProvider<br/>generateTokens]
    TP --> CSS[":root CSS variables"]
    THEME --> VR[Variant registries<br/>variant-renderer.tsx]
    CSS --> APP[Customer PWA]
    VR --> APP
```

The same configuration also drives the web app manifest, the home-screen icon and the status-bar color.

---

## 2. Brand extraction

`POST /api/brand/extract` (owner session required) runs the in-process extractor in `lib/extractor/`. It needs no headless browser: it fetches the page and its stylesheets and analyses them statically.

### 2.1 Fetching safely

The URL is user-supplied, so every request goes through `lib/extractor/safe-fetch.ts`:

- Only `http(s)` URLs; the route itself additionally requires `https` for the entry URL.
- Every hostname, including each redirect hop, must resolve to **public** IP addresses (loopback, RFC 1918, link-local, CGNAT, multicast, unique-local IPv6 and IPv4-mapped forms are rejected). Redirects are followed manually, at most 4 hops, and re-checked.
- Response bodies are size-capped and time-boxed:

| Resource | Timeout | Max size |
| --- | --- | --- |
| HTML page | 12 s | 3 MB |
| Linked stylesheets (first 6) | 6 s each | 1.5 MB each |
| Logo (copied into storage) | 8 s | 2 MB |

The detected logo is copied into the `org-assets` storage bucket so the app does not depend on the source site staying online.

### 2.2 Signals

| Source | Signals (`lib/extractor/css-signals.ts`, `dom-signals.ts`) |
| --- | --- |
| CSS (`<style>`, linked sheets, inline `style`) | weighted color usage, CSS custom-property colors, font families and usage, font weights, border radii (median), box-shadow blur depth and count, gradient count, paddings, body background luminance |
| HTML (cheerio) | logo (apple-touch-icon, large favicon, header image, SVG logo, og:image, favicon), banner (og:image, twitter:image, largest DOM image, CSS background), `lang`, single-page detection, presence of product photos, layout pattern counts |
| Meta | `theme-color`, `<title>` / `og:site_name` |

Layout patterns are counted from markup heuristics (class names, width and height attributes) into eight buckets: `stackedFullWidth`, `cardGrid`, `textOverlay`, `thumbnailRows`, `heroImage`, `mosaicMixed`, `textOnly`, `denseList`. The largest bucket is the **dominant layout**.

### 2.3 From signals to answers

`lib/extractor/build-config.ts` produces a draft of the wizard answers, each with a confidence in `_confidence`.

**Brand color.** The first frequently used color that matches the page's `theme-color` meta tag or a CSS custom property wins; otherwise a non-neutral `theme-color`, then a non-neutral CSS variable, then the most used color. Confidence starts at 0.5, +0.1 with at least 3 candidate colors, +0.25 for a meta match, +0.2 for a CSS variable match (capped at 0.95).

**Shop style** (`lib/extractor/score-style.ts`) is a weighted linear model. About twenty signals are normalised to `[0, 1]` (for example `darkness`, `shadowDepth = min(avgBlur / 20, 1)`, `serifStrength`, `colorWarmth`, `radiusSize = min(medianRadius / 30, 1)`, `whitespace`, layout counts) and each contributes to the four styles:

| Signal | premium | craft | cozy | modern |
| --- | --- | --- | --- | --- |
| dark background | 3.0 | 0.5 | | 1.5 |
| shadow depth | 3.0 | 1.0 | 0.5 | |
| few shadows | | | | 2.5 |
| serif fonts | 1.0 | 4.0 | 0.5 | |
| monospace / thin fonts | | | | 3.0 |
| warm colors | | 3.5 | 3.0 | |
| saturation | | 1.5 | 2.0 | |
| large radii | | 1.0 | 2.0 | |
| gradients | 2.5 | | 1.0 | |
| whitespace | 1.0 | | | 2.0 |
| text over images / hero | 3.0 / 2.0 | - / 1.0 | | |
| card grid | | | 1.0 | 2.5 |
| mosaic | | | 2.5 | |

(The table shows the main weights; inverse terms such as `(1 - warmth) * 1.5` for modern are in the source.) The highest score wins. Confidence is `winner / total`, plus 0.2 when the margin over the runner-up exceeds 3, capped at 0.95.

**Other answers.**

| Answer | Rule |
| --- | --- |
| `font_personality` | serif share > 0.3 gives `traditional`; average weight > 600 gives `bold`; else `clean` |
| `shape` | median radius > 20 px gives `round`, else `smooth` |
| `density` | average padding > 20 px gives `balanced`, else `packed` |
| `layout` | single-page site gives `single-page`, else `tabs` |
| `stamp_feel` | premium and craft give `realistic`, cozy gives `playful`, modern gives `minimal` |
| `language` | from `<html lang>`: `tr`, `ar`, otherwise `en` |
| `has_product_photos` | from product-image detection |
| `_layout_hints` | the eight layout counts plus the dominant layout (used in section 7) |

---

## 3. The onboarding wizard

`app/onboarding/page.tsx` runs once, right after the owner account is created. Each step shows a live phone preview rendered with `ScopedTokenProvider` (section 5), and the answers are persisted to `localStorage` so a reload resumes where the owner left off.

| Step | Answer |
| --- | --- |
| Website | Optional URL; triggers extraction and pre-fills every later step ("detected from your site, change it if you like") |
| Color | `brand_color` |
| Logo | upload or keep the extracted one (`org-assets/<org_id>/...`) |
| Banner | header photo |
| Style | `shop_style`: premium, craft, cozy, modern |
| Shape | `shape`: round, smooth |
| Stamp card | `stamp_feel`: realistic, minimal, playful |
| Photos | `has_product_photos` |
| Font | `font_personality`: traditional, clean, bold |
| Density | `density`: balanced, packed |
| Language | `language`: tr, en, ar |
| Layout | `layout`: tabs, single-page |
| Location | city and address of the first branch |

On completion the wizard calls `mapAnswersToVariants`, merges the answers with the chosen variants and saves the result with `PUT /api/org` (`pwa_config`, `primary_color`, `logo_url`, `onboarding_completed = true`).

---

## 4. The configuration object

`PwaConfig` in `lib/pwa-tokens.ts` is the whole contract between the builder and the app:

```ts
interface PwaConfig {
  shop_style: 'premium' | 'craft' | 'cozy' | 'modern'
  color_mode: 'dark' | 'light'        // overridden at runtime by the phone's setting
  shape: 'round' | 'smooth'
  brand_color: string                  // #rrggbb
  logo_url: string | null
  banner_url: string | null
  stamp_feel: 'realistic' | 'minimal' | 'playful'
  has_product_photos: boolean
  font_personality: 'traditional' | 'clean' | 'bold'
  density: 'balanced' | 'packed'
  language: 'tr' | 'en' | 'ar'
  layout: 'tabs' | 'single-page'
  _layout_hints?: { dominant: string; stacked: number; grid: number; ... }
  variant_stamp?: string; variant_header?: string; variant_menu?: string
  variant_campaign?: string; variant_sana_ozel?: string; variant_activity?: string
  variant_profile?: string; variant_nav?: string; variant_challenge?: string
}
```

It is stored as JSONB in `organizations.pwa_config`. `GET /api/public/{slug}/theme` merges it over `DEFAULT_CONFIG`, overrides `brand_color`, `logo_url` and `banner_url` with the organization's columns, and returns both the config and the generated tokens.

---

## 5. Design tokens

`generateTokens(config)` in `lib/pwa-tokens.ts` turns the answers into about 70 CSS custom properties. Components never hard-code colors, sizes or radii; they only reference these variables, which is what makes every variant re-skinnable.

### 5.1 Color

The brand hex is converted to HSL (`lib/color-utils.ts`) and the whole palette is derived from it:

| Token | Formula |
| --- | --- |
| `--color-brand` | the brand hex |
| `--color-brand-light` | `hsl(h, s + 10, min(l + 15, 85))` |
| `--color-brand-dark` | `hsl(h, s, max(l - 15, 15))` |
| `--color-brand-muted` | `hsl(h, max(s - 30, 10), 20 dark / 90 light)` |
| `--color-brand-glow(-strong)` | brand at 15 % / 30 % alpha (dark) or 8 % / 15 % (light) |

Surfaces are **tinted with the brand hue** but nearly desaturated, so a red brand gets warm greys and a blue brand cool greys:

| Token | Dark mode | Light mode |
| --- | --- | --- |
| `--color-bg` | `hsl(h, min(s, 8)%, 10%)` | `hsl(h, min(s, 8)%, 94%)` |
| `--color-bg-surface` | `hsl(h, min(s, 5)%, 15%)` | `hsl(h, min(s, 5)%, 98%)` |
| `--color-card` | `hsl(h, min(s, 5)%, 14%)` | `#ffffff` |
| `--color-card-border` | `hsl(h, min(s, 5)%, 20%)` | `rgba(0,0,0,.1)` |
| `--color-text` | `#FAFAFA` | `#111827` |
| `--color-nav-bg` | 85 % alpha of the background | `rgba(255,255,255,.95)` |
| `--color-stamp-empty` | `hsl(h, min(s, 5)%, 20%)` | `#e5e7eb` |

`color_mode` saved in the config is a fallback only: `TokenProvider` listens to `prefers-color-scheme` and regenerates tokens when the phone switches between light and dark.

### 5.2 Scale: container-query units

All spacing, radii, type and element sizes are expressed in `cqw` (1 % of the container's width) against a 390 px reference phone, so the preview inside the dashboard and the real app on any phone are proportionally identical.

| Answer | Tokens it controls | Values |
| --- | --- | --- |
| `density` | `--space-xs ... --space-3xl` | balanced `1, 2.1, 3.1, 4.1, 6.2, 8.2, 12.3 cqw`; packed `0.8, 1.5, 2.1, 3.1, 4.1, 6.2, 9.2 cqw` |
| `density` | aspect ratios `--ar-header-photo`, `--ar-campaign-card`, `--ar-menu-image`, ... | packed uses flatter ratios (for example header 2.2/1 instead of 1.8/1) |
| `shape` | `--radius-sm/md/lg/card/button/input`, `--radius-stamp` | round `2.6 / 4.1 / 6.2 / 5.1 / 3.6 / 3.1 cqw`, stamp `50%`; smooth `1.5 / 2.6 / 4.1 / 3.1 / 2.1 / 2.1 cqw`, stamp `30%` |
| `font_personality` | `--font-heading`, `--font-weight-heading`, `--font-size-hero ... tiny`, letter spacing | traditional: Playfair Display 700, hero 7.2 cqw; clean: Inter 600, hero 6.2 cqw; bold: Inter 900, hero 9.2 cqw, tracking -0.03em |
| `shop_style` | `--shadow-card`, `--nav-blur`, `--transition(-fast)` | premium deep shadow, 20 px blur, 250 ms; craft lighter, 300 ms; cozy brand-colored glow and a springy cubic-bezier; modern no shadow, 24 px blur, 150 ms |

Fixed tokens include `--radius-full` (pill), `--color-danger`, `--color-success`, icon, avatar, stamp and nav-bar sizes.

### 5.3 Applying tokens

- `TokenProvider` (`components/pwa-v2/token-provider.tsx`) writes every token to `document.documentElement.style`, paints `html` and `body` with `--color-bg` (no white flash in safe areas or during overscroll) and updates `<meta name="theme-color">` so the status bar matches.
- `ScopedTokenProvider` applies the same tokens to a single `div` with `container-type: inline-size`, which is how the onboarding preview and the editor render a phone inside the dashboard without touching the dashboard's own styles.

---

## 6. Variants

A variant is a self-contained React component for one slot of the app. All variants of a slot share a props contract, read only design tokens, and are registered in `components/pwa-v2/variant-renderer.tsx`. Each one is loaded with `next/dynamic`, so a cafe's app only downloads the variants it uses.

| Slot | Registered | Auto-pick pool | Rendered in | Props |
| --- | --- | --- | --- | --- |
| Stamp card | 24 | 14 | Card tab | stamps, required, reward name, streak |
| Header | 14 | 10 | Card and Store tabs | shop name, logo, banner, city |
| Menu | 21 | 14 | Store tab | items (name, price, photo, category, featured) |
| Campaign | 13 | 10 | Store tab | campaigns, press handler |
| Personal offers ("Sana Özel") | 18 | 10 | Store tab | offers, press handler |
| Challenge | 10 | 5 | Store tab | title, progress, days left, reward |
| Activity | 5 | 5 | Card tab | streak, visits, rewards, last visits |
| Profile | 4 | 4 | Profile tab | name, phone, totals, logout |
| Navigation | 4 | 4 | shell | active tab, tab change, QR button |

That is 113 components in total. Variants that are registered but outside the auto-pick pool (the `-v2` stamp reworks and the newer menu, campaign, offer and challenge patterns) are reachable from the editor.

If a configured variant id does not exist, every slot falls back to a safe default (`stamp-minimal-01`, `header-logo-01`, `menu-compact-list`, and so on), so a stale config can never break the app.

---

## 7. How variants are chosen

`mapAnswersToVariants` in `lib/variant-mapper.ts` is deterministic: the same answers always produce the same app, while two cafes with different brand colors usually get different picks from the same pool.

**Pools.**

| Slot | Pool selected by |
| --- | --- |
| Stamp | `stamp_feel` (realistic: embossed, punch card, split, gold card, passport; minimal: grid, bars, dots, segmented, neon; playful: cups, strip, steps, coffee cup) |
| Header | available assets: banner gives photo headers; logo only gives logo headers; neither gives minimal or gradient headers |
| Menu | `has_product_photos` (6 photo layouts or 8 text layouts), refined by layout hints |
| Campaign, personal offers, activity, profile, challenge | `shop_style` |
| Navigation | `layout` (`single-page` renders no navigation) |

**Deterministic pick.**

```ts
seed  = `${brand_color}-${shop_style}-${stamp_feel}-${shape}-${font_personality}` + '-' + slot
hash  = Java-style 31x string hash of seed (32-bit)
index = abs(hash) % pool.length
```

**Layout hints override.** When the extractor found a dominant layout on the cafe's website, menu and campaign variants mirror it, so the app feels like the site:

| Dominant site layout | Menu (with photos / without) | Campaign |
| --- | --- | --- |
| stackedFullWidth | stacked images | full-bleed |
| cardGrid | photo cards / compact list | mosaic |
| thumbnailRows | photo rows / icon rows | split |
| textOverlay | large photo grid / featured hero | gradient banner |
| heroImage | featured hero / compact list | full-bleed |
| mosaicMixed | photo mosaic / pill tags | mosaic |
| textOnly | photo cards / minimal rows | inline |
| denseList | icon rows / compact list | card |

`has_product_photos` always wins over a text-only site layout: a cafe that will upload photos gets a photo menu.

---

## 8. The editor

`app/(dashboard)/editor/page.tsx` lets the owner change any answer or any variant after onboarding:

- Every slot opens a picker showing a **schematic** of each variant (`lib/variant-schematics/`). Schematics are deliberately abstract, neutral grey with one amber accent, so the picker is easy to scan regardless of the cafe's brand color.
- The right-hand phone renders the real `PwaShell` with the cafe's actual menu and campaigns inside a `ScopedTokenProvider`, so changes are previewed exactly.
- Re-running extraction from a new URL is possible at any time.
- Saving writes `pwa_config` through `PUT /api/org`. Customers get the new look on their next app load; nothing is rebuilt.

---

## 9. The app shell

`components/pwa-v2/pwa-shell.tsx` loads data through `use-pwa-data.ts` (card, visits, offers, campaigns, menu, streak, challenge) and renders either:

- **Tabs** (`layout: 'tabs'`): Card (`kartim`: header, stamp card, streak badge, activity), Store (`magaza`: challenge, personal offers, campaigns, menu) and Profile (`profil`). Swiping switches tabs; the navigation variant draws the tab bar and the central QR button.
- **Single page** (`layout: 'single-page'`): the same content stacked on one scrolling page.

**Deep links.** Notification URLs carry `?tab=magaza&offer=<id>`; the shell opens the Store tab where the offer is displayed.

**Earning and redeeming.** Pressing the stamp card opens the QR overlay (`qr-overlay.tsx`). The app asks the server for a token (`qr/generate`, `offer/claim` or, for a full card, `reward/claim`), renders it as a QR with a 2-minute countdown, and polls `qr/status` until the barista confirms; then it celebrates (confetti and haptics) and refreshes.

**First run for a customer.** Splash, welcome (explains the card), phone number, welcome stamp, then an install guide (Android uses the captured `beforeinstallprompt`; iOS gets "Share, Add to Home Screen" instructions), then the app.

---

## 10. Installability: manifest, icons, service worker

| Piece | Implementation |
| --- | --- |
| Manifest | `GET /api/public/{slug}/manifest` returns a per-cafe `application/manifest+json`: cafe name, `display: standalone`, `theme_color` = brand color. The page injects it as `<link rel="manifest">` at runtime. |
| Icons | `GET /api/public/{slug}/icon/{192,512}` renders the logo with `sharp`: contained on a brand-colored square with 12 % padding on every side, so the same PNG is safe as an Android maskable icon and an iOS home-screen tile. Without a logo it returns a solid brand-colored square. |
| Service worker | `public/sw.js`, served with `no-cache` and a strict CSP (`next.config.ts`). Network-only for `/api/*`, cache-first for icons and images, network-first with cache fallback for everything else. Cross-origin requests are never intercepted. |
| HTTPS | Required by browsers for service workers, installation and push. Run behind TLS in production. |

---

## 11. Push notifications

1. When the customer reaches the main app, the PWA waits for the **first tap** (iOS only allows permission prompts from a user gesture), registers `/sw.js` and requests notification permission.
2. Any existing subscription is unsubscribed first (a reinstalled PWA otherwise keeps a dead endpoint), then a new one is created with the public VAPID key.
3. `POST /api/push/subscribe` stores the subscription on the customer (`push_subscription`, `push_opted_in`).
4. The server sends through `lib/push.ts` (`web-push`, VAPID keys, `VAPID_SUBJECT`). The service worker shows the notification with the cafe's icon and, on click, focuses or opens the deep link and reports the click.

What gets sent and when is decided by the engines; see `docs/engines.md`.

---

## 12. The barista app

The barista side is a second, separately installable PWA under `/barista/` with its own manifest (`/api/barista/manifest`, `scope: /barista/`) and icons (`public/icons/barista-*.png`, generated by `scripts/generate-barista-icons.mjs`).

Pairing a barista phone takes one scan:

1. The owner adds a barista to a branch. The server creates an account with a random internal email, a generated display name, and a **setup token** valid for 24 hours (`lib/barista-setup-token.ts`: 24 random hex characters plus an 8-character HMAC tag, stored server-side, single use, older tokens revoked).
2. The owner shows the setup QR; the barista scans it with their own phone and opens `/barista/setup?t=...`.
3. The barista chooses a password; the token is consumed atomically, the account is signed in, and a `barista_handle` cookie remembers the device, so later logins only ask for the password.

The scanner (`app/barista/[orgSlug]/page.tsx`, `html5-qrcode`) reads the customer's QR, shows who it is and what it is for (stamp, reward, campaign, offer or subscription) via `/api/barista/verify`, optionally lets the barista pick the drink from the menu (which records the real price), and confirms with `/api/barista/confirm`.

---

## 13. Adding a new variant

1. Create `components/pwa-v2/variants/<slot>-<name>.tsx` implementing the slot's props type (`stamp-types.tsx`, `menu-types.ts`, ...). Use only `var(--...)` tokens and `cqw` units; never hard-code a brand color.
2. Register it with `next/dynamic` in the matching registry in `components/pwa-v2/variant-renderer.tsx`.
3. Add a schematic in `lib/variant-schematics/<slot>.tsx` and a label in the editor's `VARIANT_LABELS`.
4. Optionally add it to a pool in `lib/variant-mapper.ts`. Be aware that adding to a pool changes the deterministic pick for existing cafes that have not saved an explicit variant; existing saved configs are unaffected because they store the variant id.
5. Check it in both color modes, both shapes and both densities in the editor preview.
