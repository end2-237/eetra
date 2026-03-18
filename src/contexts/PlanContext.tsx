'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { getPlanToken, setPlanToken, clearPlanToken, requestPlanToken, verifyPlanToken, type PlanToken } from '@/lib/planToken'

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
  tokenVerified: boolean
  setPlanId: (id: PlanId) => Promise<void>
  canAddPage: (currentPageCount: number) => boolean
  canUseAI: () => boolean
  requestUpgrade: (reason: string) => void
  dismissUpgrade: () => void
  incrementDocUsage: () => void
  getRemainingDocs: () => number
}

const PlanContext = createContext<PlanContextType>({} as PlanContextType)

const KEY_USAGE = 'eetra-usage'

export function PlanProvider({ children }: { children: React.ReactNode }) {
  // Default to starter — upgraded via signed token only
  const [planId, _setPlanId] = useState<PlanId>('starter')
  const [tokenVerified, setTokenVerified] = useState(false)
  const [usage, setUsage] = useState<UsageData>({
    docsThisMonth: 0,
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')
  const verifyInProgress = useRef(false)

  useEffect(() => {
    // Load usage data
    try {
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

    // Validate plan token on mount
    validateStoredToken()
  }, [])

  const validateStoredToken = async () => {
    if (verifyInProgress.current) return
    verifyInProgress.current = true

    try {
      const token = getPlanToken()
      if (!token) {
        // No token = starter plan
        _setPlanId('starter')
        setTokenVerified(false)
        return
      }

      // Quick client-side expiry check
      if (Date.now() > token.exp) {
        clearPlanToken()
        _setPlanId('starter')
        setTokenVerified(false)
        return
      }

      // Server-side signature verification
      const valid = await verifyPlanToken(token)
      if (valid && token.plan in PLAN_CONFIGS) {
        _setPlanId(token.plan as PlanId)
        setTokenVerified(true)
      } else {
        clearPlanToken()
        _setPlanId('starter')
        setTokenVerified(false)
      }
    } catch {
      // On network error, degrade gracefully to starter
      _setPlanId('starter')
      setTokenVerified(false)
    } finally {
      verifyInProgress.current = false
    }
  }

  const setPlanId = useCallback(async (id: PlanId) => {
    // Request a signed token from the server
    const token = await requestPlanToken(id)
    if (token) {
      _setPlanId(id)
      setTokenVerified(true)
    }
    // If request fails, plan stays as-is
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
      planId, plan, usage, showUpgradeModal, upgradeReason, tokenVerified,
      setPlanId, canAddPage, canUseAI, requestUpgrade,
      dismissUpgrade, incrementDocUsage, getRemainingDocs,
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export const usePlan = () => useContext(PlanContext)
