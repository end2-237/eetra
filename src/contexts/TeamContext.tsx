'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { TeamMember } from '@/types'
import { generateId } from '@/lib/utils'

interface TeamContextType {
  members: TeamMember[]
  addMember: (name: string, email: string, role: TeamMember['role']) => void
  removeMember: (id: string) => void
  updateRole: (id: string, role: TeamMember['role']) => void
}

const TeamContext = createContext<TeamContextType>({
  members: [],
  addMember: () => {},
  removeMember: () => {},
  updateRole: () => {},
})

const AVATARS = ['🧑‍💼', '👩‍💼', '🧑‍🔬', '👩‍🔬', '🧑‍💻', '👩‍💻', '🧑‍🎨', '👩‍🎨']

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: generateId(),
      name: 'Vous',
      email: 'admin@entreprise.com',
      role: 'admin',
      addedAt: new Date(),
      avatar: '👑',
    },
  ])

  const addMember = useCallback((name: string, email: string, role: TeamMember['role']) => {
    const member: TeamMember = {
      id: generateId(),
      name,
      email,
      role,
      addedAt: new Date(),
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    }
    setMembers(prev => [...prev, member])
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }, [])

  const updateRole = useCallback((id: string, role: TeamMember['role']) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m))
  }, [])

  return (
    <TeamContext.Provider value={{ members, addMember, removeMember, updateRole }}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
