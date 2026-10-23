'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { compressImage, UnsupportedFormatError, CompressFailedError, type CompressPreset } from '@/lib/image-compress'

type Aspect = 'square' | 'banner' | 'card'

const ASPECT_CLASS: Record<Aspect, string> = {
  square: 'aspect-square w-24',
  banner: 'aspect-[16/9] w-full',
  card: 'aspect-square w-12',
}

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  preset: CompressPreset
  menuItemId?: string
  aspect?: Aspect
  label?: string
}

export function ImageUpload({ value, onChange, preset, menuItemId, aspect = 'square', label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    // Sanity: must be an image and under 10MB raw (client-side check; server also enforces 2MB on compressed)
    if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) {
      setError('Sadece görsel dosyalar yüklenebilir')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya 10MB sınırından büyük')
      return
    }

    setBusy(true)
    try {
      const compressed = await compressImage(file, preset)

      const form = new FormData()
      form.append('file', compressed)
      form.append('type', preset)
      if (preset === 'menu' && menuItemId) form.append('menu_item_id', menuItemId)

      const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Yükleme başarısız' }))
        throw new Error(j.error || 'Yükleme başarısız')
      }
      const { url } = await res.json()
      onChange(url)
    } catch (err) {
      if (err instanceof UnsupportedFormatError || err instanceof CompressFailedError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Yükleme başarısız, tekrar deneyin')
      }
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove() {
    if (preset !== 'menu' || !menuItemId) {
      // Logo/banner use upsert on replace; a standalone "remove" path isn't exposed yet
      // (we only need it for menu items per spec).
      return
    }
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/storage/upload?type=menu&menu_item_id=${menuItemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Silme başarısız')
      onChange(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silme başarısız')
    } finally {
      setBusy(false)
    }
  }

  const canRemove = preset === 'menu' && !!value

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className={`relative rounded-lg border border-dashed border-gray-300 bg-gray-50 overflow-hidden ${ASPECT_CLASS[aspect]}`}>
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {value ? 'Değiştir' : 'Yükle'}
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm font-medium hover:border-gray-300 disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" /> Kaldır
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
