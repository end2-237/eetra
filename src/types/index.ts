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
  watermark: boolean
}

export type BlockType = 
  | 'section'
  | 'text'
  | 'quote'
  | 'table'
  | 'kpi'
  | 'clause'
  | 'sign'
  | 'divider'

export interface DocBlock {
  id: string
  type: BlockType
  content?: string
}

export interface DocPage {
  id: string
  blocks: DocBlock[]
}

export interface Document {
  id: string
  title: string
  subtitle: string
  ref: string
  destination: string
  confidentiality: string
  pages: DocPage[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  text: string
  author: string
  createdAt: Date
}

export interface Template {
  id: string
  icon: string
  name: string
  desc: string
  tags: string[]
  blocks: Array<{ type: BlockType; content?: string }>
}

export type TabName = 'editor' | 'templates' | 'analytics' | 'comments'
