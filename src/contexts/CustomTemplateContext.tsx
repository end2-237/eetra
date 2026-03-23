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
  // Community fields
  publishedAt?: string
  author?: string
  authorAvatar?: string
  likes?: number
  isLiked?: boolean
}

interface CustomTemplateContextType {
  templates: CustomTemplate[]
  communityTemplates: CustomTemplate[]
  createTemplate: (t: Omit<CustomTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => CustomTemplate
  updateTemplate: (id: string, updates: Partial<CustomTemplate>) => void
  deleteTemplate: (id: string) => void
  duplicateTemplate: (id: string) => CustomTemplate | null
  incrementUsage: (id: string) => void
  getTemplate: (id: string) => CustomTemplate | null
  publishTemplate: (id: string) => void
  unpublishTemplate: (id: string) => void
  likeTemplate: (id: string) => void
  importCommunityTemplate: (tpl: CustomTemplate) => CustomTemplate
}

const CustomTemplateContext = createContext<CustomTemplateContextType>({
  templates: [],
  communityTemplates: [],
  createTemplate: () => ({} as CustomTemplate),
  updateTemplate: () => {},
  deleteTemplate: () => {},
  duplicateTemplate: () => null,
  incrementUsage: () => {},
  getTemplate: () => null,
  publishTemplate: () => {},
  unpublishTemplate: () => {},
  likeTemplate: () => {},
  importCommunityTemplate: () => ({} as CustomTemplate),
})

const STORAGE_KEY = 'eetra-custom-templates'
const COMMUNITY_KEY = 'eetra-community-templates'

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

// ── Seed community templates (demo data) ──────────────────────────────────────

const SEED_COMMUNITY: CustomTemplate[] = [
  {
    id: 'COM-RAPPORT-CA',
    name: 'Rapport Conseil d\'Administration',
    description: 'Compte rendu de réunion du CA avec résolutions et PV complet.',
    category: 'Gouvernance',
    icon: '🏛️',
    tags: ['CA', 'PV', 'Résolutions'],
    blocks: [
      { type: 'section', content: 'OUVERTURE DE LA SÉANCE' },
      { type: 'text', content: 'Le Conseil d\'Administration s\'est réuni le [date] au siège social. Étaient présents : [membres].' },
      { type: 'section', content: 'ORDRE DU JOUR' },
      { type: 'checklist', content: 'Approbation du PV de la séance précédente\nExamen des comptes de l\'exercice\nAffectation du résultat\nRenouvellement mandats\nQuestions diverses' },
      { type: 'section', content: 'DÉLIBÉRATIONS & RÉSOLUTIONS' },
      { type: 'clause', content: 'Résolution N°1\nLe Conseil d\'Administration, après délibération, approuve les comptes annuels de l\'exercice clos le 31 décembre [année] et donne quitus aux administrateurs.' },
      { type: 'sign' },
    ],
    docStyle: STYLE_PRESETS.classic,
    coverStyle: { ...DEFAULT_COVER_STYLE, layout: 'minimal', accentColor: '#0F172A', titleSize: 'md' },
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-15T09:00:00Z',
    isPublic: true,
    usageCount: 127,
    publishedAt: '2026-01-15T09:00:00Z',
    author: 'Cabinet Juriste OHADA',
    authorAvatar: '⚖️',
    likes: 43,
    isLiked: false,
  },
  {
    id: 'COM-PITCH-DECK',
    name: 'Pitch Deck Investisseurs',
    description: 'Présentation startup pour levée de fonds — structure problem/solution/traction.',
    category: 'Stratégie',
    icon: '🚀',
    tags: ['Startup', 'Levée', 'Pitch'],
    blocks: [
      { type: 'section', content: 'LE PROBLÈME QUE NOUS RÉSOLVONS' },
      { type: 'text', content: 'Le marché souffre de [problème]. Cela représente une inefficacité de [impact] pour [cible].' },
      { type: 'section', content: 'NOTRE SOLUTION' },
      { type: 'quote', content: '"Nous offrons la première plateforme [description] qui permet à [cible] de [bénéfice] en [délai]."' },
      { type: 'kpi' },
      { type: 'section', content: 'TRACTION & MÉTRIQUES CLÉS' },
      { type: 'table', tableData: {
        headers: ['Métrique', 'Aujourd\'hui', 'M+6', 'M+12'],
        rows: [
          ['Utilisateurs actifs', '—', '—', '—'],
          ['MRR (FCFA)', '—', '—', '—'],
          ['NPS Score', '—', '—', '—'],
        ],
      }},
      { type: 'section', content: 'UTILISATION DES FONDS' },
      { type: 'table', tableData: {
        headers: ['Poste', 'Allocation', '% Total'],
        rows: [
          ['Développement produit', '—', '40%'],
          ['Commercial & Marketing', '—', '35%'],
          ['Opérations', '—', '25%'],
        ],
      }},
    ],
    docStyle: STYLE_PRESETS.modern,
    coverStyle: { ...DEFAULT_COVER_STYLE, layout: 'bold', accentColor: '#7C3AED', titleSize: 'xl' },
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
    isPublic: true,
    usageCount: 89,
    publishedAt: '2026-02-01T09:00:00Z',
    author: 'EETRA Community',
    authorAvatar: '⭐',
    likes: 67,
    isLiked: false,
  },
  {
    id: 'COM-NOTE-INTERNE',
    name: 'Note Interne RH',
    description: 'Communication RH structurée : annonce, procédure ou circulaire.',
    category: 'Ressources Humaines',
    icon: '👥',
    tags: ['RH', 'Circulaire', 'Personnel'],
    blocks: [
      { type: 'section', content: 'OBJET DE LA NOTE' },
      { type: 'table', tableData: {
        headers: ['De', 'À', 'Date', 'Réf.'],
        rows: [['Direction RH', 'Ensemble du personnel', new Date().toLocaleDateString('fr-FR'), 'RH-[N°]']],
      }},
      { type: 'text', content: 'La présente note a pour objet de vous informer de [sujet]. Cette mesure prend effet à compter du [date d\'effet].' },
      { type: 'section', content: 'DISPOSITIONS APPLICABLES' },
      { type: 'checklist', content: 'Condition 1\nCondition 2\nCondition 3' },
      { type: 'clause', content: 'Disposition finale\nToute dérogation à la présente note devra faire l\'objet d\'une demande écrite auprès de la Direction des Ressources Humaines.' },
      { type: 'sign' },
    ],
    docStyle: STYLE_PRESETS.minimal,
    coverStyle: { ...DEFAULT_COVER_STYLE, layout: 'minimal', accentColor: '#059669', titleSize: 'sm' },
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
    isPublic: true,
    usageCount: 204,
    publishedAt: '2026-02-10T09:00:00Z',
    author: 'DRH Afrique Corp',
    authorAvatar: '👤',
    likes: 31,
    isLiked: false,
  },
  {
    id: 'COM-RAPPORT-ESG',
    name: 'Rapport RSE / ESG',
    description: 'Rapport de responsabilité sociale et environnementale conforme aux standards.',
    category: 'Gouvernance',
    icon: '🌱',
    tags: ['RSE', 'ESG', 'Durabilité'],
    blocks: [
      { type: 'section', content: 'MESSAGE DE LA DIRECTION GÉNÉRALE' },
      { type: 'quote', content: '"Notre engagement envers le développement durable est au cœur de notre stratégie d\'entreprise pour les prochaines décennies."' },
      { type: 'section', content: 'NOS INDICATEURS ESG' },
      { type: 'kpi' },
      { type: 'section', content: 'AXE ENVIRONNEMENTAL' },
      { type: 'text', content: 'Nos actions en faveur de l\'environnement couvrent la réduction des émissions de CO₂, la gestion des déchets et la préservation de la biodiversité locale.' },
      { type: 'table', tableData: {
        headers: ['Indicateur', 'Réf. N-1', 'N', 'Objectif N+1'],
        rows: [
          ['Émissions CO₂ (tCO₂e)', '—', '—', '—10%'],
          ['Consommation eau (m³)', '—', '—', '—5%'],
          ['Taux recyclage déchets', '—', '—', '>70%'],
        ],
      }},
      { type: 'section', content: 'AXE SOCIAL' },
      { type: 'text', content: 'Notre politique sociale vise à garantir l\'équité, la formation continue et le bien-être de l\'ensemble de nos collaborateurs.' },
      { type: 'divider' },
      { type: 'sign' },
    ],
    docStyle: STYLE_PRESETS.editorial,
    coverStyle: { ...DEFAULT_COVER_STYLE, layout: 'split', accentColor: '#059669', titleSize: 'lg' },
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
    isPublic: true,
    usageCount: 56,
    publishedAt: '2026-03-01T09:00:00Z',
    author: 'Consultants Durabilité',
    authorAvatar: '🌍',
    likes: 28,
    isLiked: false,
  },
]

export function CustomTemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([])
  const [communityTemplates, setCommunityTemplates] = useState<CustomTemplate[]>(SEED_COMMUNITY)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setTemplates(JSON.parse(stored))
    } catch {}

    try {
      const storedCommunity = localStorage.getItem(COMMUNITY_KEY)
      if (storedCommunity) {
        const parsed: CustomTemplate[] = JSON.parse(storedCommunity)
        // Merge with seeds, deduplicate by id
        setCommunityTemplates(prev => {
          const ids = new Set(prev.map(t => t.id))
          const extra = parsed.filter(t => !ids.has(t.id))
          return [...prev, ...extra]
        })
      }
    } catch {}
  }, [])

  const persist = (items: CustomTemplate[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }

  const persistCommunity = (items: CustomTemplate[]) => {
    // Only persist user-published ones (not seeds)
    const userPublished = items.filter(t => !SEED_COMMUNITY.find(s => s.id === t.id))
    try { localStorage.setItem(COMMUNITY_KEY, JSON.stringify(userPublished)) } catch {}
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
      // If it's also in community, update there too
      setCommunityTemplates(cprev => {
        const cidx = cprev.findIndex(t => t.id === id)
        if (cidx === -1) return cprev
        const next = cprev.map(t => t.id === id ? { ...t, ...updates } : t)
        persistCommunity(next)
        return next
      })
      return updated
    })
  }, [])

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      persist(updated)
      return updated
    })
    // Remove from community if was published
    setCommunityTemplates(prev => {
      const updated = prev.filter(t => t.id !== id)
      persistCommunity(updated)
      return updated
    })
  }, [])

  const duplicateTemplate = useCallback((id: string): CustomTemplate | null => {
    const source = templates.find(t => t.id === id)
    if (!source) return null
    const now = new Date().toISOString()
    const copy: CustomTemplate = {
      ...source, id: genId(), name: `${source.name} (copie)`,
      createdAt: now, updatedAt: now, usageCount: 0,
      isPublic: false, publishedAt: undefined,
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
    setCommunityTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t)
    )
  }, [])

  const getTemplate = useCallback((id: string) => {
    return templates.find(t => t.id === id) || communityTemplates.find(t => t.id === id) || null
  }, [templates, communityTemplates])

  const publishTemplate = useCallback((id: string) => {
    const tpl = templates.find(t => t.id === id)
    if (!tpl) return
    const published: CustomTemplate = {
      ...tpl,
      isPublic: true,
      publishedAt: new Date().toISOString(),
      likes: tpl.likes ?? 0,
      isLiked: false,
    }
    // Update in my templates
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id ? published : t)
      persist(updated)
      return updated
    })
    // Add to community
    setCommunityTemplates(prev => {
      const exists = prev.find(t => t.id === id)
      const updated = exists
        ? prev.map(t => t.id === id ? published : t)
        : [published, ...prev]
      persistCommunity(updated)
      return updated
    })
  }, [templates])

  const unpublishTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, isPublic: false, publishedAt: undefined } : t)
      persist(updated)
      return updated
    })
    setCommunityTemplates(prev => {
      // Keep seeds, remove user-published
      if (SEED_COMMUNITY.find(s => s.id === id)) return prev
      const updated = prev.filter(t => t.id !== id)
      persistCommunity(updated)
      return updated
    })
  }, [])

  const likeTemplate = useCallback((id: string) => {
    setCommunityTemplates(prev => {
      const updated = prev.map(t => {
        if (t.id !== id) return t
        const wasLiked = t.isLiked ?? false
        return { ...t, isLiked: !wasLiked, likes: Math.max(0, (t.likes ?? 0) + (wasLiked ? -1 : 1)) }
      })
      persistCommunity(updated)
      return updated
    })
  }, [])

  const importCommunityTemplate = useCallback((tpl: CustomTemplate): CustomTemplate => {
    const now = new Date().toISOString()
    const imported: CustomTemplate = {
      ...tpl,
      id: genId(),
      name: `${tpl.name} (importé)`,
      createdAt: now,
      updatedAt: now,
      usageCount: 0,
      isPublic: false,
      publishedAt: undefined,
    }
    setTemplates(prev => {
      const updated = [imported, ...prev]
      persist(updated)
      return updated
    })
    incrementUsage(tpl.id)
    return imported
  }, [incrementUsage])

  return (
    <CustomTemplateContext.Provider value={{
      templates, communityTemplates,
      createTemplate, updateTemplate, deleteTemplate,
      duplicateTemplate, incrementUsage, getTemplate,
      publishTemplate, unpublishTemplate, likeTemplate, importCommunityTemplate,
    }}>
      {children}
    </CustomTemplateContext.Provider>
  )
}

export const useCustomTemplates = () => useContext(CustomTemplateContext)