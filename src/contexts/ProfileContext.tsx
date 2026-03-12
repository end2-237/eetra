'use client'

import { createContext, useContext, useState } from 'react'
import { CompanyProfile } from '@/types'

const DEFAULT_PROFILE: CompanyProfile = {
  name: '',
  sector: '',
  legal: '',
  color: '#1B4FD8',
  address: '',
  city: '',
  email: '',
  web: '',
  siret: '',
  capital: '',
  tagline: '',
  signer: '',
  logoDataUrl: null,
  watermark: true,
}

interface ProfileContextType {
  profile: CompanyProfile
  updateProfile: (updates: Partial<CompanyProfile>) => void
  resetProfile: () => void
}

const ProfileContext = createContext<ProfileContextType>({
  profile: DEFAULT_PROFILE,
  updateProfile: () => {},
  resetProfile: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE)

  const updateProfile = (updates: Partial<CompanyProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const resetProfile = () => setProfile(DEFAULT_PROFILE)

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => useContext(ProfileContext)
