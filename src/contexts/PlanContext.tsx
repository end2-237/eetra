'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export type PlanId = 'starter' | 'student' | 'pro' | 'business'

export interface PlanConfig {
  id:                     PlanId
  label:                  string
  maxPagesPerDoc:         number
  maxDocsPerMonth:        number
  ai:                     boolean
  canRemoveWatermark:     boolean
  canUseBuiltinTemplates: boolean   // NEW — accès aux 23+ templates intégrés
  canUseCommunityTpls:    boolean   // NEW — accès galerie communautaire
  canUseCustomTemplates:  boolean   // NEW — accès à ses propres templates
  price:                  string
  color:                  string
}

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter', label: 'Starter',
    maxPagesPerDoc: 2, maxDocsPerMonth: 5,
    ai: false, canRemoveWatermark: false,
    canUseBuiltinTemplates: false,   // ← bloqué
    canUseCommunityTpls: false,
    canUseCustomTemplates: false,
    price: 'Gratuit', color: '#6B7280',
  },
  student: {
    id: 'student', label: 'Étudiant',
    maxPagesPerDoc: 2, maxDocsPerMonth: 20,
    ai: false, canRemoveWatermark: false,
    canUseBuiltinTemplates: true,    // ← accès templates intégrés
    canUseCommunityTpls: false,
    canUseCustomTemplates: true,
    price: '2 000 FCFA/mois', color: '#059669',
  },
  pro: {
    id: 'pro', label: 'Pro',
    maxPagesPerDoc: Infinity, maxDocsPerMonth: Infinity,
    ai: true, canRemoveWatermark: true,
    canUseBuiltinTemplates: true,
    canUseCommunityTpls: true,
    canUseCustomTemplates: true,
    price: '14 900 FCFA/mois', color: '#1B4FD8',
  },
  business: {
    id: 'business', label: 'Business',
    maxPagesPerDoc: Infinity, maxDocsPerMonth: Infinity,
    ai: true, canRemoveWatermark: true,
    canUseBuiltinTemplates: true,
    canUseCommunityTpls: true,
    canUseCustomTemplates: true,
    price: '39 900 FCFA/mois', color: '#059669',
  },
}

interface UsageData {
  docsThisMonth: number
  month:         number
  year:          number
}

interface PlanContextType {
  planId:             PlanId
  plan:               PlanConfig
  usage:              UsageData
  loading:            boolean
  showUpgradeModal:   boolean
  upgradeReason:      string
  upgradeContext:     'template' | 'document' | 'community'
  setPlanId:          (id: PlanId) => Promise<void>
  canAddPage:         (currentPageCount: number) => boolean
  canUseAI:           () => boolean
  canStartCollaboration: () => boolean
  /** Templates intégrés (bibliothèque EETRA) */
  canUseTemplates:    () => boolean
  /** Templates de la communauté */
  canUseCommunityTemplates: () => boolean
  /** Ses propres templates personnalisés */
  canUseCustomTemplates: () => boolean
  requestUpgrade:     (reason: string, context?: 'template' | 'document' | 'community') => void
  dismissUpgrade:     () => void
  incrementDocUsage:  () => void
  getRemainingDocs:   () => number
  checkDocumentLimit: () => Promise<boolean>
  refreshPlan:        () => Promise<void>
  canCreateDocument:  () => boolean
}

const PlanContext = createContext<PlanContextType>({} as PlanContextType)
const KEY_USAGE = 'eetra-usage'

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [planId,  setPlanIdState] = useState<PlanId>('starter')
  const [loading, setLoading]     = useState(true)
  const [usage,   setUsage]       = useState<UsageData>({
    docsThisMonth: 0,
    month:         new Date().getMonth(),
    year:          new Date().getFullYear(),
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason,    setUpgradeReason]    = useState('')
  const [upgradeContext,   setUpgradeContext]   = useState<'template' | 'document' | 'community'>('template')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_USAGE)
      if (raw) {
        const p = JSON.parse(raw) as UsageData
        const now = new Date()
        if (p.month !== now.getMonth() || p.year !== now.getFullYear()) {
          setUsage({ docsThisMonth: 0, month: now.getMonth(), year: now.getFullYear() })
        } else {
          setUsage(p)
        }
      }
    } catch {}
  }, [])

  const refreshPlan = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plan/current', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.planId && data.planId in PLAN_CONFIGS) {
          setPlanIdState(data.planId as PlanId)
        }
      }
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    refreshPlan()
  }, [status, session?.user?.id, refreshPlan])

  const setPlanId = useCallback(async (id: PlanId) => {
    try {
      const res = await fetch('/api/plan/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: id }),
      })
      if (res.ok) setPlanIdState(id)
    } catch {
      setPlanIdState(id)
    }
  }, [])

  const plan = PLAN_CONFIGS[planId]

  const canAddPage  = useCallback((n: number) => n < plan.maxPagesPerDoc, [plan])
  const canUseAI    = useCallback(() => plan.ai, [plan])

  // ── Template access helpers ─────────────────────────────────────────────────
  const canUseTemplates         = useCallback(() => plan.canUseBuiltinTemplates,  [plan])
  const canUseCommunityTemplates = useCallback(() => plan.canUseCommunityTpls,     [plan])
  const canUseCustomTemplates   = useCallback(() => plan.canUseCustomTemplates,   [plan])

  const canStartCollaboration = useCallback(() =>
    planId === 'pro' || planId === 'business'
  , [planId])

  const requestUpgrade = useCallback((reason: string, context: 'template' | 'document' | 'community' = 'template') => {
    setUpgradeReason(reason)
    setUpgradeContext(context)
    setShowUpgradeModal(true)
  }, [])

  const dismissUpgrade = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeReason('')
  }, [])

  const incrementDocUsage = useCallback(() => {
    setUsage(prev => {
      const now  = new Date()
      const next: UsageData = prev.month !== now.getMonth() || prev.year !== now.getFullYear()
        ? { docsThisMonth: 1, month: now.getMonth(), year: now.getFullYear() }
        : { ...prev, docsThisMonth: prev.docsThisMonth + 1 }
      try { localStorage.setItem(KEY_USAGE, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const getRemainingDocs = useCallback(() => {
    if (plan.maxDocsPerMonth === Infinity) return Infinity
    return Math.max(0, plan.maxDocsPerMonth - usage.docsThisMonth)
  }, [plan, usage])

  const canCreateDocument = useCallback(() => getRemainingDocs() > 0, [getRemainingDocs])

  const checkDocumentLimit = useCallback(async (): Promise<boolean> => {
    if (plan.maxDocsPerMonth === Infinity) return true
    const remaining = getRemainingDocs()
    if (remaining <= 0) {
      requestUpgrade(
        `Vous avez atteint votre limite de ${plan.maxDocsPerMonth} documents/mois sur le plan ${plan.label}.`,
        'document'
      )
      return false
    }
    return true
  }, [plan, getRemainingDocs, requestUpgrade])

  return (
    <PlanContext.Provider value={{
      planId, plan, usage, loading, showUpgradeModal, upgradeReason, upgradeContext,
      setPlanId, canAddPage, canUseAI, canStartCollaboration,
      canUseTemplates, canUseCommunityTemplates, canUseCustomTemplates,
      requestUpgrade, dismissUpgrade, incrementDocUsage, getRemainingDocs,
      checkDocumentLimit, refreshPlan, canCreateDocument,
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)