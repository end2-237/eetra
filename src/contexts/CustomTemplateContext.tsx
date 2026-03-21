'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { BlockType, DocumentStyle, TableData, STYLE_PRESETS } from '@/types'
import type { CoverBlock } from '@/components/editor/cover/CoverPageEditor'

export interface CustomTemplateBlock {
  type: BlockType
  content?: string
  tableData?: TableData
}

export type CoverLayout = 'classic' | 'minimal' | 'bold' | 'split'

export interface CoverStyle {
  layout: CoverLayout
  accentColor: string
  showLogo: boolean
  showQr: boolean
  showGrid: boolean
  backgroundStyle: 'solid' | 'gradient' | 'dots' | 'lines'
  titleSize: 'sm' | 'md' | 'lg' | 'xl'
  // Custom cover blocks (free-form canvas elements)
  coverBlocks?: CoverBlock[]
}

export interface CustomTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  tags: string[]
  blocks: CustomTemplateBlock[]
  docStyle: DocumentStyle
  coverStyle: CoverStyle
  createdAt: string
  updatedAt: string
  isPublic: boolean
  usageCount: number
}

interface CustomTemplateContextType {
  templates: CustomTemplate[]
  createTemplate: (t: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => CustomTemplate
  updateTemplate: (id: string, updates: Partial<CustomTemplate>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string) => CustomTemplate | null
  incrementUsage: (id: string) => void
  getTemplate: (id: string) => CustomTemplate | null
}

const CustomTemplateContext = createContext<CustomTemplateContextType>({
  templates: [],
  createTemplate: () => ({} as CustomTemplate),
  updateTemplate: () => {},
  deleteTemplate: () => {},
  duplicateTemplate: () => null,
  incrementUsage: () => {},
  getTemplate: () => null,
})

const STORAGE_KEY = 'eetra-custom-templates'

function genId() { return 'TPL-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

const DEFAULT_COVER_STYLE: CoverStyle = {
  layout: 'classic',
  accentColor: '#1B4FD8',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'lg',
  coverBlocks: [],
}

export { DEFAULT_COVER_STYLE }

export function CustomTemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setTemplates(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (items: CustomTemplate[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }

  const createTemplate = useCallback((t: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    const now = new Date().toISOString()
    const full: CustomTemplate = { ...t, id: genId(), createdAt: now, updatedAt: now, usageCount: 0 }
    setTemplates(prev => {
      const updated = [full, ...prev]
      persist(updated)
      return updated
    })
    return full
  }, [])

  const updateTemplate = useCallback((id: string, updates: Partial<CustomTemplate>) => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
      persist(updated)
      return updated
    })
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      persist(updated)
      return updated
    })
  }, [])

  const duplicateTemplate = useCallback((id: string): CustomTemplate | null => {
    const source = templates.find(t => t.id === id)
    if (!source) return null
    const now = new Date().toISOString()
    const copy: CustomTemplate = {
      ...source,
      id: genId(),
      name: `${source.name} (copie)`,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
    }
    setTemplates(prev => {
      const updated = [copy, ...prev]
      persist(updated)
      return updated
    })
    return copy
  }, [templates])

  const incrementUsage = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t)
      persist(updated)
      return updated
    })
  }, [])

  const getTemplate = useCallback((id: string) => {
    return templates.find(t => t.id === id) || null
  }, [templates])

  return (
    <CustomTemplateContext.Provider value={{
      templates, createTemplate, updateTemplate, deleteTemplate,
      duplicateTemplate, incrementUsage, getTemplate,
    }}>
      {children}
    </CustomTemplateContext.Provider>
  )
}

export const useCustomTemplates = () => useContext(CustomTemplateContext)