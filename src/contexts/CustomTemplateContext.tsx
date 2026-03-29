'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  publishedAt?: string
  author?: string
  authorAvatar?: string
  likes?: number
  isLiked?: boolean
}

interface CustomTemplateContextType {
  templates: CustomTemplate[]
  communityTemplates: CustomTemplate[]
  loading: boolean
  communityLoading: boolean
  createTemplate: (t: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => Promise<CustomTemplate>
  updateTemplate: (id: string, updates: Partial<CustomTemplate>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  duplicateTemplate: (id: string) => Promise<CustomTemplate | null>
  incrementUsage: (id: string) => void
  getTemplate: (id: string) => CustomTemplate | null
  publishTemplate: (id: string) => Promise<void>
  unpublishTemplate: (id: string) => Promise<void>
  likeTemplate: (id: string) => void
  importCommunityTemplate: (tpl: CustomTemplate) => Promise<CustomTemplate>
  refreshCommunity: () => Promise<void>
}

const CustomTemplateContext = createContext<CustomTemplateContextType>({
  templates: [],
  communityTemplates: [],
  loading: false,
  communityLoading: false,
  createTemplate: async () => ({} as CustomTemplate),
  updateTemplate: async () => {},
  deleteTemplate: async () => {},
  duplicateTemplate: async () => null,
  incrementUsage: () => {},
  getTemplate: () => null,
  publishTemplate: async () => {},
  unpublishTemplate: async () => {},
  likeTemplate: () => {},
  importCommunityTemplate: async () => ({} as CustomTemplate),
  refreshCommunity: async () => {},
})

const LOCAL_MY_KEY = 'eetra-custom-templates'

function genId() { return 'TPL-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

export const DEFAULT_COVER_STYLE: CoverStyle = {
  layout: 'classic',
  accentColor: '#1B4FD8',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'lg',
  coverBlocks: [],
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

function parseBlocks(raw: any): CustomTemplateBlock[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return []
}

function parseCoverStyle(raw: any): CoverStyle {
  if (!raw) return DEFAULT_COVER_STYLE
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return DEFAULT_COVER_STYLE }
  }
  return raw as CoverStyle
}

export function CustomTemplateProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const isAuth = !!session?.user?.id

  const [templates,          setTemplates]          = useState<CustomTemplate[]>([])
  const [communityTemplates, setCommunityTemplates] = useState<CustomTemplate[]>([])
  const [loading,            setLoading]            = useState(false)
  const [communityLoading,   setCommunityLoading]   = useState(false)

  // ── Load my templates ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const s = localStorage.getItem(LOCAL_MY_KEY)
      if (s) setTemplates(JSON.parse(s))
    } catch {}

    if (status === 'loading') return
    if (!isAuth) return

    setLoading(true)
    apiFetch<CustomTemplate[]>('/api/templates').then(serverTemplates => {
      if (serverTemplates) {
        const parsed = serverTemplates.map(t => ({
          ...t,
          blocks: parseBlocks(t.blocks),
          coverStyle: parseCoverStyle(t.coverStyle),
        }))
        setTemplates(parsed)
        try { localStorage.setItem(LOCAL_MY_KEY, JSON.stringify(parsed)) } catch {}
      }
      setLoading(false)
    })
  }, [isAuth, status])

  // ── Load community templates ───────────────────────────────────────────────
  const refreshCommunity = useCallback(async () => {
    setCommunityLoading(true)
    try {
      // Cache-buster timestamp pour forcer le rechargement sur Vercel
      const res = await fetch(`/api/templates/community?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      })
      if (!res.ok) {
        console.error('[Community] fetch failed:', res.status)
        return
      }
      const data = await res.json()
      if (!Array.isArray(data)) {
        console.error('[Community] unexpected response:', data)
        return
      }
      const parsed: CustomTemplate[] = data.map((t: any) => ({
        ...t,
        blocks: parseBlocks(t.blocks),
        coverStyle: parseCoverStyle(t.coverStyle),
      }))
      setCommunityTemplates(parsed)
    } catch (err) {
      console.error('[Community] error:', err)
    } finally {
      setCommunityLoading(false)
    }
  }, [])

  // Load community on mount (always, even unauthenticated)
  useEffect(() => {
    refreshCommunity()
  }, [refreshCommunity])

  const persistMyTemplates = (items: CustomTemplate[]) => {
    try { localStorage.setItem(LOCAL_MY_KEY, JSON.stringify(items)) } catch {}
  }

  // ── createTemplate ─────────────────────────────────────────────────────────
  const createTemplate = useCallback(async (
    t: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<CustomTemplate> => {
    const now = new Date().toISOString()

    if (isAuth) {
      const created = await apiFetch<CustomTemplate>('/api/templates', {
        method: 'POST',
        body: JSON.stringify(t),
      })
      if (created) {
        const parsed = { ...created, blocks: parseBlocks(created.blocks), coverStyle: parseCoverStyle(created.coverStyle) }
        setTemplates(prev => {
          const updated = [parsed, ...prev]
          persistMyTemplates(updated)
          return updated
        })
        return parsed
      }
    }

    const full: CustomTemplate = { ...t, id: genId(), createdAt: now, updatedAt: now, usageCount: 0 }
    setTemplates(prev => {
      const updated = [full, ...prev]
      persistMyTemplates(updated)
      return updated
    })
    return full
  }, [isAuth])

  // ── updateTemplate ─────────────────────────────────────────────────────────
  const updateTemplate = useCallback(async (id: string, updates: Partial<CustomTemplate>) => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
      )
      persistMyTemplates(updated)
      return updated
    })

    if (isAuth) {
      await apiFetch(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    }
  }, [isAuth])

  // ── deleteTemplate ─────────────────────────────────────────────────────────
  const deleteTemplate = useCallback(async (id: string) => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      persistMyTemplates(updated)
      return updated
    })
    setCommunityTemplates(prev => prev.filter(t => t.id !== id))

    if (isAuth) {
      await apiFetch(`/api/templates/${id}`, { method: 'DELETE' })
    }
  }, [isAuth])

  // ── duplicateTemplate ──────────────────────────────────────────────────────
  const duplicateTemplate = useCallback(async (id: string): Promise<CustomTemplate | null> => {
    const source = templates.find(t => t.id === id)
    if (!source) return null
    return createTemplate({ ...source, name: `${source.name} (copie)`, isPublic: false })
  }, [templates, createTemplate])

  // ── incrementUsage ─────────────────────────────────────────────────────────
  const incrementUsage = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t)
      persistMyTemplates(updated)
      return updated
    })
    setCommunityTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t)
    )
    apiFetch(`/api/templates/${id}`, { method: 'PATCH' })
  }, [])

  // ── getTemplate ────────────────────────────────────────────────────────────
  const getTemplate = useCallback((id: string) => {
    return templates.find(t => t.id === id)
      || communityTemplates.find(t => t.id === id)
      || null
  }, [templates, communityTemplates])

  // ── publishTemplate ────────────────────────────────────────────────────────
  const publishTemplate = useCallback(async (id: string) => {
    setTemplates(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, isPublic: true, updatedAt: new Date().toISOString() } : t
      )
      persistMyTemplates(updated)
      return updated
    })

    if (isAuth) {
      await apiFetch(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublic: true }),
      })
    }

    await refreshCommunity()
  }, [isAuth, refreshCommunity])

  // ── unpublishTemplate ──────────────────────────────────────────────────────
  const unpublishTemplate = useCallback(async (id: string) => {
    setTemplates(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, isPublic: false, updatedAt: new Date().toISOString() } : t
      )
      persistMyTemplates(updated)
      return updated
    })
    setCommunityTemplates(prev => prev.filter(t => t.id !== id))

    if (isAuth) {
      await apiFetch(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublic: false }),
      })
    }

    await refreshCommunity()
  }, [isAuth, refreshCommunity])

  // ── likeTemplate ──────────────────────────────────────────────────────────
  const likeTemplate = useCallback((id: string) => {
    setCommunityTemplates(prev =>
      prev.map(t => {
        if (t.id !== id) return t
        const wasLiked = t.isLiked ?? false
        return { ...t, isLiked: !wasLiked, likes: Math.max(0, (t.likes ?? 0) + (wasLiked ? -1 : 1)) }
      })
    )
  }, [])

  // ── importCommunityTemplate ────────────────────────────────────────────────
  const importCommunityTemplate = useCallback(async (tpl: CustomTemplate): Promise<CustomTemplate> => {
    const imported = await createTemplate({ ...tpl, name: `${tpl.name} (importé)`, isPublic: false })
    incrementUsage(tpl.id)
    return imported
  }, [createTemplate, incrementUsage])

  return (
    <CustomTemplateContext.Provider value={{
      templates,
      communityTemplates,
      loading,
      communityLoading,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      duplicateTemplate,
      incrementUsage,
      getTemplate,
      publishTemplate,
      unpublishTemplate,
      likeTemplate,
      importCommunityTemplate,
      refreshCommunity,
    }}>
      {children}
    </CustomTemplateContext.Provider>
  )
}

export const useCustomTemplates = () => useContext(CustomTemplateContext)