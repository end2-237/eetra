/**
 * useDocumentGuard — hook to be used wherever a new document is created.
 *
 * Usage:
 *   const { checkAndCreate } = useDocumentGuard()
 *   // Before creating a doc, call:
 *   const allowed = await checkAndCreate()
 *   if (!allowed) return  // upgrade modal already shown by the hook
 */

'use client'

import { useCallback } from 'react'
import { usePlan } from '@/contexts/PlanContext'

export function useDocumentGuard() {
  const { canCreateDocument, checkDocumentLimit, requestUpgrade, plan, usage } = usePlan()

  /**
   * Returns true if the user can create a new document.
   * If not, shows the upgrade modal and returns false.
   */
  const checkAndCreate = useCallback(async (): Promise<boolean> => {
    // First: local check (fast, no network)
    if (!canCreateDocument()) {
      requestUpgrade(
        `Vous avez utilisé vos ${plan.maxDocsPerMonth} documents ce mois-ci (plan ${plan.label}). Passez au Pro pour des documents illimités.`,
        'document'
      )
      return false
    }

    // Then: server-side verification (catches edge cases with concurrent sessions)
    const serverAllowed = await checkDocumentLimit()
    return serverAllowed
  }, [canCreateDocument, checkDocumentLimit, requestUpgrade, plan, usage])

  return { checkAndCreate }
}