'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export type PlanId = 'starter' | 'pro' | 'business'

export interface PlanConfig {
  id: PlanId
  label: string
  maxPagesPerDoc: number
  maxDocsPerMonth: number
  ai: boolean
  canRemoveWatermark: boolean
  price: string
  color: string
}

export const PLAN_CONFIGS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter', label: 'Starter', maxPagesPerDoc: 2,
    maxDocsPerMonth: 5, ai: false, canRemoveWatermark: false,
    price: 'Gratuit', color: '#6B7280',
  },
  pro: {
    id: 'pro', label: 'Pro', maxPagesPerDoc: Infinity,
    maxDocsPerMonth: Infinity, ai: true, canRemoveWatermark: true,
    price: '14 900 FCFA/mois', color: '#1B4FD8',
  },
  business: {
    id: 'business', label: 'Business', maxPagesPerDoc: Infinity,
    maxDocsPerMonth: Infinity, ai: true, canRemoveWatermark: true,
    price: '39 900 FCFA/mois', color: '#059669',
  },
}

interface UsageData {
  docsThisMonth: number
  month: number
  year: number
}

interface PlanContextType {
  planId: PlanId
  plan: PlanConfig
  usage: UsageData
  showUpgradeModal: boolean
  upgradeReason: string
  setPlanId: (id: PlanId) => void
  canAddPage: (currentPageCount: number) => boolean
  canUseAI: () => boolean
  requestUpgrade: (reason: string) => void
  dismissUpgrade: () => void
  incrementDocUsage: () => void
  getRemainingDocs: () => number
}

const PlanContext = createContext<PlanContextType>({} as PlanContextType)

const KEY_PLAN = 'eetra-plan'
const KEY_USAGE = 'eetra-usage'

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [planId, _setPlanId] = useState<PlanId>('pro') // default pro for demo
  const [usage, setUsage] = useState<UsageData>({
    docsThisMonth: 0,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY_PLAN) as PlanId | null
      if (stored && PLAN_CONFIGS[stored]) _setPlanId(stored)

      const storedUsage = localStorage.getItem(KEY_USAGE)
      if (storedUsage) {
        const parsed = JSON.parse(storedUsage) as UsageData
        const now = new Date()
        if (parsed.month !== now.getMonth() || parsed.year !== now.getFullYear()) {
          setUsage({ docsThisMonth: 0, month: now.getMonth(), year: now.getFullYear() })
        } else {
          setUsage(parsed)
        }
      }
    } catch {}
  }, [])

  const setPlanId = useCallback((id: PlanId) => {
    _setPlanId(id)
    try { localStorage.setItem(KEY_PLAN, id) } catch {}
  }, [])

  const plan = PLAN_CONFIGS[planId]

  const canAddPage = useCallback((currentPageCount: number) => {
    return currentPageCount < plan.maxPagesPerDoc
  }, [plan])

  const canUseAI = useCallback(() => plan.ai, [plan])

  const requestUpgrade = useCallback((reason: string) => {
    setUpgradeReason(reason)
    setShowUpgradeModal(true)
  }, [])

  const dismissUpgrade = useCallback(() => {
    setShowUpgradeModal(false)
    setUpgradeReason('')
  }, [])

  const incrementDocUsage = useCallback(() => {
    setUsage(prev => {
      const now = new Date()
      const updated: UsageData = prev.month !== now.getMonth() || prev.year !== now.getFullYear()
        ? { docsThisMonth: 1, month: now.getMonth(), year: now.getFullYear() }
        : { ...prev, docsThisMonth: prev.docsThisMonth + 1 }
      try { localStorage.setItem(KEY_USAGE, JSON.stringify(updated)) } catch {}
      return updated
    })
  }, [])

  const getRemainingDocs = useCallback(() => {
    if (plan.maxDocsPerMonth === Infinity) return Infinity
    return Math.max(0, plan.maxDocsPerMonth - usage.docsThisMonth)
  }, [plan, usage])

  return (
    <PlanContext.Provider value={{
      planId, plan, usage, showUpgradeModal, upgradeReason,
      setPlanId, canAddPage, canUseAI, requestUpgrade,
      dismissUpgrade, incrementDocUsage, getRemainingDocs,
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)
