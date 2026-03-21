'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { HistoryEntry } from '@/types'
import { apiFetch } from '@/lib/apiClient'

interface HistoryContextType {
  entries: HistoryEntry[]
  addEntry: (entry: Omit<HistoryEntry, 'exportedAt'>) => void
  removeEntry: (id: string) => void
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType>({ entries: [], addEntry: () => {}, removeEntry: () => {}, clearHistory: () => {} })
const STORAGE_KEY = 'eetra-history'

function parseEntries(raw: any[]): HistoryEntry[] {
  return raw.map(e => ({ ...e, exportedAt: new Date(e.exportedAt) }))
}

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setEntries(parseEntries(JSON.parse(s))) } catch {}
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    apiFetch<any[]>('/api/exports').then(cloud => {
      if (!cloud) return
      const parsed = parseEntries(cloud)
      setEntries(parsed)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed)) } catch {}
    })
  }, [session?.user?.id])

  const persist = (updated: HistoryEntry[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {}
  }

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'exportedAt'>) => {
    const full: HistoryEntry = { ...entry, exportedAt: new Date() }
    setEntries(prev => { const updated = [full, ...prev].slice(0, 50); persist(updated); return updated })
    if (session?.user?.id) apiFetch('/api/exports', { method: 'POST', body: JSON.stringify(full) })
  }, [session?.user?.id])

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => { const updated = prev.filter(e => e.id !== id); persist(updated); return updated })
    if (session?.user?.id) apiFetch('/api/exports', { method: 'DELETE', body: JSON.stringify({ id }) })
  }, [session?.user?.id])

  const clearHistory = useCallback(() => {
    setEntries([])
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    // Pas de bulk delete API pour l'instant — à ajouter si besoin
  }, [])

  return <HistoryContext.Provider value={{ entries, addEntry, removeEntry, clearHistory }}>{children}</HistoryContext.Provider>
}
export const useHistory = () => useContext(HistoryContext)