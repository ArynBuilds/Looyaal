// One-shot script: rasterize barista PWA icons from an inline SVG.
// Run: node scripts/generate-barista-icons.mjs
// Produces:
//   public/icons/barista-192.png  (192x192, maskable)
//   public/icons/barista-512.png  (512x512, maskable)
//   public/icons/barista-180.png  (180x180, apple-touch)

import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(__dirname, '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

// Maskable spec: content must live inside a centered 80%-radius safe zone
// (per https://w3c.github.io/manifest/#icon-masks). The spec asked for 12% safe-zone,
// meaning content is inset 12% from each edge — equivalent to 76% content box.
// We use 80% (10% inset each side) as the safe-zone diameter so the cup glyph
// survives Android's circular crop and remains readable.

// Coordinate system: 512x512 canvas. Inner safe zone: 64..448 (10% inset).

const SVG_512 = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Background: fully maskable, dark base -->
  <rect width="512" height="512" fill="#0a0a0a"/>

  <!-- Subtle amber radial wash (top-center) -->
  <defs>
    <radialGradient id="glow" cx="50%" cy="32%" r="50%">
      <stop offset="0%" stop-color="#d97706" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#d97706" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cupAmber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <rect width="512" height="512" fill="url(#glow)"/>

  <!-- Amber rounded-square plate inside the safe zone -->
  <!-- Safe zone is 64..448 (size 384). Plate fills it with a 56px radius. -->
  <rect x="80" y="80" width="352" height="352" rx="64" ry="64" fill="#1a1208" stroke="#d97706" stroke-opacity="0.25" stroke-width="2"/>

  <!-- Steam: three rising wisps above the cup, soft amber -->
  <g stroke="url(#cupAmber)" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.85">
    <path d="M 210 178 C 210 162, 226 162, 226 146 C 226 130, 210 130, 210 114"/>
    <path d="M 256 178 C 256 162, 272 162, 272 146 C 272 130, 256 130, 256 114"/>
    <path d="M 302 178 C 302 162, 318 162, 318 146 C 318 130, 302 130, 302 114"/>
  </g>

  <!-- Coffee cup body: amber gradient, rounded mug + handle -->
  <!-- Cup body: 168..344 wide, 196..356 tall -->
  <path
    d="M 168 200
       L 168 304
       A 56 56 0 0 0 224 360
       L 288 360
       A 56 56 0 0 0 344 304
       L 344 200
       Z"
    fill="url(#cupAmber)"/>

  <!-- Handle (right side) -->
  <path
    d="M 344 230
       C 392 230, 392 290, 344 290"
    fill="none" stroke="url(#cupAmber)" stroke-width="20" stroke-linecap="round"/>

  <!-- Saucer ellipse -->
  <ellipse cx="256" cy="384" rx="124" ry="14" fill="#d97706" opacity="0.55"/>

  <!-- Small inner highlight on cup rim -->
  <path d="M 184 212 L 328 212" stroke="#fff" stroke-opacity="0.18" stroke-width="6" stroke-linecap="round"/>
</svg>
`.trim()

async function render(size, outPath) {
  const buf = Buffer.from(SVG_512)
  const png = await sharp(buf, { density: 384 })
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer()
  writeFileSync(outPath, png)
  console.log(`wrote ${outPath} (${png.length} bytes)`)
}

await render(192, resolve(outDir, 'barista-192.png'))
await render(512, resolve(outDir, 'barista-512.png'))
await render(180, resolve(outDir, 'barista-180.png'))
console.log('done')
