// ─── Block Types ──────────────────────────────────────────────────────────────
export type BlockType =
  | 'section'
  | 'text'
  | 'quote'
  | 'table'
  | 'kpi'
  | 'clause'
  | 'checklist'
  | 'image'
  | 'chart'
  | 'sign'
  | 'divider'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bullet-list'
  | 'numbered-list'

export interface TableData {
  headers: string[]
  rows: string[][]
}

export interface ChartBlockData {
  type: 'bar' | 'line' | 'pie' | 'donut'
  data: {
    labels: string[]
    datasets: { label: string; data: number[]; color?: string }[]
  }
  title: string
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

export interface DocPage {
  id: string
  blocks: DocBlock[]
}

export interface Comment {
  id: string
  text: string
  author: string
  createdAt: Date
  resolved: boolean
  replies: CommentReply[]
}

export interface CommentReply {
  id: string
  text: string
  author: string
  createdAt: Date
}

export interface HistoryEntry {
  id: string
  docId: string
  title: string
  entityName: string
  type: string
  pageCount: number
  blockCount: number
  signature: string
  qrData: string
  exportedAt: Date
}

export interface CompanyProfile {
  name: string
  sector: string
  legal: string
  color: string
  address: string
  city: string
  email: string
  web: string
  siret: string
  capital: string
  tagline: string
  signer: string
  logoDataUrl: string | null
  logoUrl?: string
  watermark: boolean
}

export type TabName = 'editor' | 'templates' | 'layout' | 'analytics' | 'comments'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  addedAt: Date
  avatar: string
}

export interface DocumentStyle {
  preset: string
  fontTitle: string
  fontBody: string
  accentColor: string
}

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
  opacity: number
  fontSize: number
  angle: number
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

export const FONT_TITLE_OPTIONS = [
  { value: 'Bricolage Grotesque', label: 'Bricolage', preview: 'Titre moderne' },
  { value: 'Playfair Display',    label: 'Playfair',  preview: 'Titre élégant' },
  { value: 'DM Serif Display',    label: 'DM Serif',  preview: 'Titre éditorial' },
  { value: 'Syne',                label: 'Syne',      preview: 'Titre design' },
  { value: 'Times New Roman',     label: 'Times NR',  preview: 'Titre classique' },
]

export const FONT_BODY_OPTIONS = [
  { value: 'Bricolage Grotesque', label: 'Bricolage', preview: 'Texte courant lisible' },
  { value: 'DM Sans',             label: 'DM Sans',   preview: 'Texte moderne épuré' },
  { value: 'Lora',                label: 'Lora',      preview: 'Texte serif doux' },
  { value: 'Source Serif 4',      label: 'Source S.', preview: 'Texte document pro' },
  { value: 'Times New Roman',     label: 'Times NR',  preview: 'Texte classique Word' },
]

export const FONT_MONO_OPTIONS = [
  { value: 'DM Mono',     label: 'DM Mono' },
  { value: 'Fira Code',   label: 'Fira Code' },
  { value: 'Roboto Mono', label: 'Roboto Mono' },
]

export const STYLE_PRESETS: Record<string, DocumentStyle> = {
  classic: {
    preset: 'classic',
    fontTitle: 'Times New Roman',
    fontBody: 'Times New Roman',
    accentColor: '#1B4FD8',
  },
  modern: {
    preset: 'modern',
    fontTitle: 'Bricolage Grotesque',
    fontBody: 'DM Sans',
    accentColor: '#1B4FD8',
  },
  editorial: {
    preset: 'editorial',
    fontTitle: 'Playfair Display',
    fontBody: 'Lora',
    accentColor: '#1B4FD8',
  },
  minimal: {
    preset: 'minimal',
    fontTitle: 'Syne',
    fontBody: 'DM Sans',
    accentColor: '#1B4FD8',
  },
}