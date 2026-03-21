'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CompanyProfile } from '@/types'
import { apiFetch, debounce } from '@/lib/apiClient'

const DEFAULT_PROFILE: CompanyProfile = {
  name: '', sector: '', legal: '', color: '#1B4FD8', address: '', city: '',
  email: '', web: '', siret: '', capital: '', tagline: '', signer: '',
  logoDataUrl: null, watermark: true,
}

interface ProfileContextType { profile: CompanyProfile; updateProfile: (u: Partial<CompanyProfile>) => void; resetProfile: () => void }
const ProfileContext = createContext<ProfileContextType>({ profile: DEFAULT_PROFILE, updateProfile: () => {}, resetProfile: () => {} })
const KEY = 'eetra-profile'

const debouncedSync = debounce((data: Partial<CompanyProfile>) => {
  apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(data) })
}, 2000)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(s) }) } catch {}
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    apiFetch<CompanyProfile>('/api/profile').then(cloud => {
      if (!cloud || Object.keys(cloud).length === 0) return
      const merged = { ...DEFAULT_PROFILE, ...cloud }
      setProfile(merged)
      try { localStorage.setItem(KEY, JSON.stringify(merged)) } catch {}
    })
  }, [session?.user?.id])

  const updateProfile = (u: Partial<CompanyProfile>) => {
    setProfile(p => {
      const next = { ...p, ...u }
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      if (session?.user?.id) debouncedSync(next)
      return next
    })
  }

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE)
    try { localStorage.removeItem(KEY) } catch {}
    if (session?.user?.id) apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(DEFAULT_PROFILE) })
  }

  return <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>{children}</ProfileContext.Provider>
}
export const useProfile = () => useContext(ProfileContext)