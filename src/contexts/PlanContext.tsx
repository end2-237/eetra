'use client'

/**
 * PlanContext — Server-verified plan.
 *
 * The plan is fetched from /api/plan/current (which reads from the DB) on mount
 * and after every login. Client storage (sessionStorage) is no longer trusted
 * as the source of truth for AI / page limits.
 *
 * The old signed-token flow is kept as fallback for offline/unauthenticated
 * sessions, but the DB value always wins when the user is authenticated.
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export type PlanId = 'starter' | 'pro' | 'business'

export interface PlanConfig {
  id:                 PlanId
  label:              string
  maxPagesPerDoc:     number
  maxDocsPerMonth:    number
  ai:                 boolean
  canRemoveWatermark: boolean
  price:              string
  color:              string
}

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter', label: 'Starter',
    maxPagesPerDoc: 2, maxDocsPerMonth: 5,
    ai: false, canRemoveWatermark: false,
    price: 'Gratuit', color: '#6B7280',
  },
  pro: {
    id: 'pro', label: 'Pro',
    maxPagesPerDoc: Infinity, maxDocsPerMonth: Infinity,
    ai: true, canRemoveWatermark: true,
    price: '14 900 FCFA/mois', color: '#1B4FD8',
  },
  business: {
    id: 'business', label: 'Business',
    maxPagesPerDoc: Infinity, maxDocsPerMonth: Infinity,
    ai: true, canRemoveWatermark: true,
    price: '39 900 FCFA/mois', color: '#059669',
  },
}

interface UsageData {
  docsThisMonth: number
  month:         number
  year:          number
}

interface PlanContextType {
  planId:            PlanId
  plan:              PlanConfig
  usage:             UsageData
  loading:           boolean
  showUpgradeModal:  boolean
  upgradeReason:     string
  setPlanId:         (id: PlanId) => Promise<void>
  canAddPage:        (currentPageCount: number) => boolean
  canUseAI:          () => boolean
  requestUpgrade:    (reason: string) => void
  dismissUpgrade:    () => void
  incrementDocUsage: () => void
  getRemainingDocs:  () => number
  /** Re-fetch plan from server */
  refreshPlan:       () => Promise<void>
}

const PlanContext = createContext<PlanContextType>({} as PlanContextType)
const KEY_USAGE   = 'eetra-usage'

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

  // ── Load usage from localStorage ────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_USAGE)
      if (raw) {
        const p   = JSON.parse(raw) as UsageData
        const now = new Date()
        if (p.month !== now.getMonth() || p.year !== now.getFullYear()) {
          setUsage({ docsThisMonth: 0, month: now.getMonth(), year: now.getFullYear() })
        } else {
          setUsage(p)
        }
      }
    } catch {}
  }, [])

  // ── Fetch plan from server ──────────────────────────────────────────────────
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
    } catch {
      // Network error — keep current plan
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on auth state change
  useEffect(() => {
    if (status === 'loading') return
    refreshPlan()
  }, [status, session?.user?.id, refreshPlan])

  // ── setPlanId: hits the server first ────────────────────────────────────────
  const setPlanId = useCallback(async (id: PlanId) => {
    try {
      const res = await fetch('/api/plan/current', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planId: id }),
      })
      if (res.ok) setPlanIdState(id)
    } catch {
      // Optimistic update as fallback (demo/offline)
      setPlanIdState(id)
    }
  }, [])

  const plan = PLAN_CONFIGS[planId]

  const canAddPage = useCallback((n: number) => n < plan.maxPagesPerDoc, [plan])
  const canUseAI   = useCallback(() => plan.ai, [plan])

  const requestUpgrade = useCallback((reason: string) => {
    setUpgradeReason(reason); setShowUpgradeModal(true)
  }, [])
  const dismissUpgrade = useCallback(() => {
    setShowUpgradeModal(false); setUpgradeReason('')
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

  return (
    <PlanContext.Provider value={{
      planId, plan, usage, loading, showUpgradeModal, upgradeReason,
      setPlanId, canAddPage, canUseAI, requestUpgrade,
      dismissUpgrade, incrementDocUsage, getRemainingDocs, refreshPlan,
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)
