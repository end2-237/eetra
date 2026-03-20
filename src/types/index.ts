export interface CompanyProfile {
  name: string; sector: string; legal: string; color: string
  address: string; city: string; email: string; web: string
  siret: string; capital: string; tagline: string; signer: string
  logoDataUrl: string | null; watermark: boolean
}

export type BlockType =
  | 'section' | 'text' | 'quote' | 'table' | 'kpi'
  | 'clause' | 'sign' | 'divider' | 'image' | 'checklist'
  | 'chart'

export interface TableData { headers: string[]; rows: string[][] }

export interface ChartBlockData {
  type: 'bar' | 'line' | 'pie' | 'donut'
  title: string
  data: {
    labels: string[]
    datasets: { label: string; data: number[]; color?: string }[]
  }
}

export interface ImageBlockData {
  src: string
  caption: string
  align: 'left' | 'center' | 'right'
  size: 'sm' | 'md' | 'lg' | 'full'
}

export interface DocBlock {
  id: string
  type: BlockType
  content?: string
  tableData?: TableData
  chartData?: ChartBlockData
  imageData?: ImageBlockData
}

export interface DocPage { id: string; blocks: DocBlock[] }

export interface Comment {
  id: string; text: string; author: string; createdAt: Date
  resolved: boolean; replies: CommentReply[]
}
export interface CommentReply {
  id: string; text: string; author: string; createdAt: Date
}

export interface Template {
  id: string; icon: string; name: string; desc: string; tags: string[]
  blocks: Array<{ type: BlockType; content?: string; tableData?: TableData }>
}

export type TabName = 'editor' | 'templates' | 'analytics' | 'comments' | 'layout'

export interface DocumentStyle {
  fontTitle: string; fontBody: string; fontMono: string
  accentColor: string; preset: 'classic' | 'modern' | 'editorial' | 'minimal'
}

export const FONT_TITLE_OPTIONS = [
  { value: 'Bricolage Grotesque', label: 'Bricolage Grotesque', preview: 'Aa' },
  { value: 'Playfair Display', label: 'Playfair Display', preview: 'Aa' },
  { value: 'DM Serif Display', label: 'DM Serif Display', preview: 'Aa' },
  { value: 'Syne', label: 'Syne', preview: 'Aa' },
  { value: 'Space Grotesk', label: 'Space Grotesk', preview: 'Aa' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', preview: 'Aa' },
]
export const FONT_BODY_OPTIONS = [
  { value: 'Bricolage Grotesque', label: 'Bricolage Grotesque', preview: 'Lorem ipsum' },
  { value: 'Libre Caslon Text', label: 'Libre Caslon', preview: 'Lorem ipsum' },
  { value: 'Source Serif 4', label: 'Source Serif 4', preview: 'Lorem ipsum' },
  { value: 'DM Sans', label: 'DM Sans', preview: 'Lorem ipsum' },
  { value: 'Lato', label: 'Lato', preview: 'Lorem ipsum' },
]
export const FONT_MONO_OPTIONS = [
  { value: 'DM Mono', label: 'DM Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'IBM Plex Mono', label: 'IBM Plex Mono' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
]
export const STYLE_PRESETS: Record<string, DocumentStyle> = {
  classic: { fontTitle: 'Bricolage Grotesque', fontBody: 'Libre Caslon Text', fontMono: 'DM Mono', accentColor: '#1B4FD8', preset: 'classic' },
  modern: { fontTitle: 'Space Grotesk', fontBody: 'DM Sans', fontMono: 'Fira Code', accentColor: '#0F172A', preset: 'modern' },
  editorial: { fontTitle: 'Playfair Display', fontBody: 'Source Serif 4', fontMono: 'IBM Plex Mono', accentColor: '#4A1D96', preset: 'editorial' },
  minimal: { fontTitle: 'Syne', fontBody: 'DM Sans', fontMono: 'JetBrains Mono', accentColor: '#374151', preset: 'minimal' },
}

export interface HistoryEntry {
  id: string; docId: string; title: string; entityName: string; type: string
  pageCount: number; blockCount: number; exportedAt: Date; signature: string; qrData: string
}
export interface TeamMember {
  id: string; name: string; email: string
  role: 'admin' | 'editor' | 'viewer'; addedAt: Date; avatar: string
}

// ─── ADD THESE TO YOUR EXISTING src/types/index.ts ───────────────────────────
// Add after the existing exports, before the closing of the file.

export interface HeaderConfig {
  show: boolean
  showLogo: boolean
  showCompanyName: boolean
  showDocTitle: boolean
  showConfidentiality: boolean
  showSeparator: boolean
  height: 44 | 52 | 64
  align: 'left' | 'center' | 'split'
}

export interface FooterConfig {
  show: boolean
  showPageNumber: boolean
  showDocRef: boolean
  showCompanyName: boolean
  showDate: boolean
  showSeparator: boolean
  pageNumberFormat: 'simple' | 'total' | 'dash'
  pageNumberAlign: 'left' | 'center' | 'right'
  height: 36 | 44 | 52
}

export interface WatermarkConfig {
  show: boolean
  text: string
  preset: 'confidential' | 'draft' | 'sample' | 'custom'
  opacity: number      // 0–100
  fontSize: number     // 40–120
  angle: number        // -75 to 0
  color: string
}

export interface HierarchyConfig {
  autoNumberSections: boolean
  numberStyle: 'numeric' | 'roman' | 'alpha'
  showOutlineInHeader: boolean
  indentSubSections: boolean
}

export interface PageLayoutConfig {
  header: HeaderConfig
  footer: FooterConfig
  watermark: WatermarkConfig
  hierarchy: HierarchyConfig
}

// Also extend TabName to include 'layout':
// export type TabName = 'editor' | 'templates' | 'analytics' | 'comments' | 'layout'