'use client'

import {
  createContext, useContext, useState, useCallback, useEffect
} from 'react'
import type {
  PageLayoutConfig, HeaderConfig, FooterConfig,
  WatermarkConfig, HierarchyConfig
} from '@/types'

// ─── Re-export defaults so consumers don't need to import from types ──────────
export const DEFAULT_HEADER: HeaderConfig = {
  show: true,
  showLogo: true,
  showCompanyName: true,
  showDocTitle: true,
  showConfidentiality: true,
  showSeparator: true,
  height: 52,
  align: 'split',
}

export const DEFAULT_FOOTER: FooterConfig = {
  show: true,
  showPageNumber: true,
  showDocRef: true,
  showCompanyName: false,
  showDate: false,
  showSeparator: true,
  pageNumberFormat: 'total',
  pageNumberAlign: 'right',
  height: 44,
}

export const DEFAULT_WATERMARK: WatermarkConfig = {
  show: false,
  text: 'CONFIDENTIEL',
  preset: 'confidential',
  opacity: 8,
  fontSize: 72,
  angle: -45,
  color: '#1B4FD8',
}

export const DEFAULT_HIERARCHY: HierarchyConfig = {
  autoNumberSections: false,
  numberStyle: 'numeric',
  showOutlineInHeader: false,
  indentSubSections: true,
}

export const DEFAULT_LAYOUT: PageLayoutConfig = {
  header:    DEFAULT_HEADER,
  footer:    DEFAULT_FOOTER,
  watermark: DEFAULT_WATERMARK,
  hierarchy: DEFAULT_HIERARCHY,
}

// ─── Context type ─────────────────────────────────────────────────────────────
interface PageLayoutContextType {
  layout: PageLayoutConfig
  updateHeader:    (patch: Partial<HeaderConfig>)    => void
  updateFooter:    (patch: Partial<FooterConfig>)    => void
  updateWatermark: (patch: Partial<WatermarkConfig>) => void
  updateHierarchy: (patch: Partial<HierarchyConfig>) => void
  resetLayout:     () => void
}

const PageLayoutContext = createContext<PageLayoutContextType>({
  layout:          DEFAULT_LAYOUT,
  updateHeader:    () => {},
  updateFooter:    () => {},
  updateWatermark: () => {},
  updateHierarchy: () => {},
  resetLayout:     () => {},
})

const STORAGE_KEY = 'eetra-page-layout'

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PageLayoutProvider({ children }: { children: React.ReactNode }) {
  const [layout, setLayout] = useState<PageLayoutConfig>(DEFAULT_LAYOUT)

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PageLayoutConfig>
        setLayout(prev => ({
          header:    { ...prev.header,    ...saved.header },
          footer:    { ...prev.footer,    ...saved.footer },
          watermark: { ...prev.watermark, ...saved.watermark },
          hierarchy: { ...prev.hierarchy, ...saved.hierarchy },
        }))
      }
    } catch {}
  }, [])

  const persist = (next: PageLayoutConfig) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
  }

  const updateHeader = useCallback((patch: Partial<HeaderConfig>) => {
    setLayout(prev => {
      const next = { ...prev, header: { ...prev.header, ...patch } }
      persist(next)
      return next
    })
  }, [])

  const updateFooter = useCallback((patch: Partial<FooterConfig>) => {
    setLayout(prev => {
      const next = { ...prev, footer: { ...prev.footer, ...patch } }
      persist(next)
      return next
    })
  }, [])

  const updateWatermark = useCallback((patch: Partial<WatermarkConfig>) => {
    setLayout(prev => {
      const next = { ...prev, watermark: { ...prev.watermark, ...patch } }
      persist(next)
      return next
    })
  }, [])

  const updateHierarchy = useCallback((patch: Partial<HierarchyConfig>) => {
    setLayout(prev => {
      const next = { ...prev, hierarchy: { ...prev.hierarchy, ...patch } }
      persist(next)
      return next
    })
  }, [])

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return (
    <PageLayoutContext.Provider value={{
      layout, updateHeader, updateFooter, updateWatermark, updateHierarchy, resetLayout
    }}>
      {children}
    </PageLayoutContext.Provider>
  )
}

export const usePageLayout = () => useContext(PageLayoutContext)