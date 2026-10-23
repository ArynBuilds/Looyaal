import imageCompression from 'browser-image-compression'

export type CompressPreset = 'logo' | 'banner' | 'menu'

// Presets chosen to be visually indistinguishable from source on phone screens
// while keeping operational costs low. Logo uses lossless (flat colors benefit);
// photos use quality=0.9 (WebP) which is perceptually identical to the original.
const PRESETS: Record<CompressPreset, { maxWidthOrHeight: number; initialQuality: number; fileType: string }> = {
  logo: { maxWidthOrHeight: 512, initialQuality: 1.0, fileType: 'image/webp' },
  banner: { maxWidthOrHeight: 1920, initialQuality: 0.9, fileType: 'image/webp' },
  menu: { maxWidthOrHeight: 1400, initialQuality: 0.9, fileType: 'image/webp' },
}

export class UnsupportedFormatError extends Error {
  constructor() {
    super('Bu format desteklenmiyor, lütfen JPG veya PNG seçin.')
    this.name = 'UnsupportedFormatError'
  }
}

export class CompressFailedError extends Error {
  constructor() {
    super('Görsel okunamadı, başka bir dosya deneyin.')
    this.name = 'CompressFailedError'
  }
}

export async function compressImage(file: File, preset: CompressPreset): Promise<File> {
  // HEIC files are iPhone defaults. Safari decodes them natively; other
  // browsers don't. Detect and fail early with a user-friendly message.
  const isHeic = /\.(heic|heif)$/i.test(file.name) || file.type === 'image/heic' || file.type === 'image/heif'
  if (isHeic) {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    if (!isSafari) throw new UnsupportedFormatError()
  }

  const config = PRESETS[preset]

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: config.maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: config.initialQuality,
      fileType: config.fileType,
    })

    // Rename with .webp extension so the server stores it predictably
    const base = file.name.replace(/\.[^.]+$/, '') || 'image'
    return new File([compressed], `${base}.webp`, { type: 'image/webp' })
  } catch (err) {
    console.error('compressImage failed:', err)
    throw new CompressFailedError()
  }
}
