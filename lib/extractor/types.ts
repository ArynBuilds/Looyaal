// Shapes produced by the brand extractor. Field names match the former
// standalone extractor service so API consumers keep working unchanged.

export interface LayoutPatterns {
  stackedFullWidth: number
  cardGrid: number
  thumbnailRows: number
  textOverlay: number
  heroImage: number
  mosaicMixed: number
  textOnly: number
  denseList: number
}

export interface ExtractionSignals {
  isDarkBg: boolean
  bgLuminance: number
  avgShadowDepth: number
  totalShadowCount: number
  serifRatio: number
  hasMonospace: boolean
  hasThinFonts: boolean
  avgFontWeight: number
  warmRatio: number
  avgSaturation: number
  avgRadius: number
  medianRadius: number
  avgRadiusMean: number
  highRadius: boolean
  lowRadius: boolean
  gradientCount: number
  avgSpacing: number
  uniqueBrandColors: number
  layoutPatterns: LayoutPatterns
  dominantLayout: string
  layoutScore: number
}

export type LogoSource = 'apple-touch-icon' | 'large-favicon' | 'header-img' | 'svg-logo' | 'og-image' | 'favicon'
export type BannerSource = 'og-image' | 'twitter-image' | 'dom-largest' | 'css-background'

export interface RawExtraction {
  colors: string[]          // top brand colors as "rgb(r, g, b)"
  fonts: string[]
  borderRadius: number[]
  shadows: number[]
  spacing: number[]
  backgrounds: string[]
  language: string
  hasProductPhotos: boolean
  isSinglePage: boolean
  logoUrl: string | null
  logoSource: LogoSource | null
  heroImageUrl: string | null
  bannerSource: BannerSource | null
  title: string
  metaThemeColor: string | null
  cssVarColors: string[]
  signals: ExtractionSignals
}

export type ShopStyle = 'premium' | 'craft' | 'cozy' | 'modern'

export interface ExtractedConfig {
  _confidence: Record<string, number>
  _scores?: Record<ShopStyle, number>
  _layout_hints?: Record<string, string | number>
  brand_color?: string
  logo_url?: string
  banner_url?: string
  language?: 'tr' | 'ar' | 'en'
  has_product_photos?: boolean
  name?: string
  shop_style?: ShopStyle
  font_personality?: 'traditional' | 'bold' | 'clean'
  shape?: 'round' | 'smooth'
  density?: 'balanced' | 'packed'
  layout?: 'single-page' | 'tabs'
  stamp_feel?: 'realistic' | 'playful' | 'minimal'
}
