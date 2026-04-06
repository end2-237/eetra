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

// ─── Block styles (applied via context menu or sidebar panel) ─────────────────
export interface BlockStyleProperties {
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  fontSize?: number
  fontFamily?: string
  textStyles?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
  }
  listStyle?: 'disc' | 'circle' | 'square'
  numberFormat?: 'numeric' | 'roman-upper' | 'roman-lower' | 'alpha-upper' | 'alpha-lower'
  shape?: 'circle' | 'rectangle' | 'line'
  shapeSize?: 'sm' | 'md' | 'lg'
  shapeColor?: string
}

export interface DocBlock {
  id: string
  type: BlockType
  content?: string
  tableData?: TableData
  chartData?: ChartBlockData
  imageData?: ImageBlockData
  /** Visual overrides applied by the user (alignment, color, bold, etc.) */
  styles?: BlockStyleProperties
}
export interface PageShape {
  id: string
  type: 'text' | 'rect' | 'image'
  shape?: string
  x: number; y: number; w: number; h: number; z: number
  opacity?: number
  rotation?: number
  locked?: boolean
  // Text
  text?: string; fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'black'
  fontStyle?: 'normal' | 'italic'
  color?: string
  align?: 'left' | 'center' | 'right'
  letterSpacing?: number; lineHeight?: number; fontFamily?: string
  // Shape fill
  fill?: string; fillOpacity?: number
  stroke?: string; strokeWidth?: number; radius?: number
  useGradient?: boolean
  gradient?: { type: 'linear' | 'radial'; color1: string; color2: string; angle?: number }
  // Image
  src?: string; objectFit?: 'contain' | 'cover' | 'fill'
  // Inner text for shapes
  innerText?: string; innerFontSize?: number; innerColor?: string
  innerFontFamily?: string; innerAlign?: 'left' | 'center' | 'right'
  innerBold?: boolean; innerItalic?: boolean
}

export interface DocPage {
  id: string
  blocks: DocBlock[]
  shapes?: PageShape[]
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

export type TabName = 'editor' | 'templates' | 'layout' | 'analytics' | 'comments' | 'orientation'

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

// ─── Orientation Zone ─────────────────────────────────────────────────────────

/** A single entry in the Table of Contents */
export interface TOCEntry {
  level: number           // 1=H1/Section, 2=H2, 3=H3, 4=H4
  number: string          // e.g. "1." or "1.2" or "A."
  label: string           // heading text
  page: number            // absolute page number in the final document
}

/** Configuration for the Orientation Zone (TOC area) */
export interface OrientationZoneConfig {
  enabled: boolean

  /** Where to insert the zone in the document */
  position: 'after-cover' | 'after-page' | 'end'

  /** When position='after-page', which content page index (0-based) to insert after */
  afterPageIndex: number | null

  // ── Table of Contents ──
  showTOC: boolean
  tocLevels: number[]           // which heading levels to include (1,2,3,4)
  numberStyle: 'numeric' | 'roman' | 'alpha'
  showPageNumbers: boolean
  tocTitle: string

  // ── List of Tables ──
  showTableList: boolean
  tableListTitle: string

  // ── List of Illustrations ──
  showIllustrationList: boolean
  illustrationListTitle: string
}

export const DEFAULT_ORIENTATION_ZONE: OrientationZoneConfig = {
  enabled: false,
  position: 'after-cover',
  afterPageIndex: null,
  showTOC: true,
  tocLevels: [1, 2, 3],
  numberStyle: 'numeric',
  showPageNumbers: true,
  tocTitle: 'Table des Matières',
  showTableList: false,
  tableListTitle: 'Liste des Tableaux',
  showIllustrationList: false,
  illustrationListTitle: 'Liste des Illustrations',
}