'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { CompanyProfile } from '@/types'

const DEFAULT_PROFILE: CompanyProfile = {
  name: '', sector: '', legal: '', color: '#1B4FD8', address: '', city: '',
  email: '', web: '', siret: '', capital: '', tagline: '', signer: '',
  logoDataUrl: null, watermark: true,
}

interface ProfileContextType {
  profile: CompanyProfile
  updateProfile: (u: Partial<CompanyProfile>) => void
  resetProfile: () => void
}

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  resetProfile: () => {},
})

const KEY = 'eetra-profile'

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) })
    } catch {}
  }, [])

  const updateProfile = (u: Partial<CompanyProfile>) => {
    setProfile(p => {
      const next = { ...p, ...u }
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE)
    try { localStorage.removeItem(KEY) } catch {}
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
