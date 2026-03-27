'use client'

/**
 * useAuthClear — hook that wipes all EETRA localStorage data when the user
 * logs out or when the session user changes (prevents data leakage between accounts).
 *
 * Place this hook in your root layout or _app component, outside of any
 * provider that depends on the cleared data.
 *
 * Usage in src/app/layout.tsx (inside a client wrapper):
 *   import { useAuthClear } from '@/hooks/useAuthClear'
 *   function AuthClearEffect() { useAuthClear(); return null }
 *   // Then render <AuthClearEffect /> inside <SessionProvider>
 */

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

// All localStorage keys that contain user-specific data
const USER_DATA_KEYS = [
  'eetra-library-v2',
  'eetra-profile',
  'eetra-history',
  'eetra-notifications',
  'eetra-custom-templates',
  'eetra-document-draft',
  'eetra-page-layout',
  'eetra-usage',
  'eetra-tour-v1',
]

export function clearEetraUserData() {
  USER_DATA_KEYS.forEach(key => {
    try { localStorage.removeItem(key) } catch {}
  })
  // Also clear any session storage flags
  try { sessionStorage.removeItem('eetra-pending-template') } catch {}
  try { sessionStorage.removeItem('eetra-pending-custom-template') } catch {}
}

export function useAuthClear() {
  const { data: session, status } = useSession()
  const prevUserIdRef = useRef<string | null | undefined>(undefined) // undefined = not initialized yet

  useEffect(() => {
    if (status === 'loading') return

    const currentUserId = session?.user?.id ?? null

    // Skip the very first run (initialization)
    if (prevUserIdRef.current === undefined) {
      prevUserIdRef.current = currentUserId
      return
    }

    // If user changed (logged out, or different account logged in)
    if (prevUserIdRef.current !== currentUserId) {
      if (prevUserIdRef.current !== null) {
        // Previous user was logged in — clear their data
        clearEetraUserData()
      }
      prevUserIdRef.current = currentUserId
    }
  }, [session?.user?.id, status])
}