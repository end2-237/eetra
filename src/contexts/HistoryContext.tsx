'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { HistoryEntry } from '@/types'
interface HistoryContextType {
  entries: HistoryEntry[]
  addEntry: (entry: Omit<HistoryEntry, 'exportedAt'>) => void
  removeEntry: (id: string) => void
  clearHistory: () => void
}
const HistoryContext = createContext<HistoryContextType>({ entries: [], addEntry: () => {}, removeEntry: () => {}, clearHistory: () => {} })
const STORAGE_KEY = 'eetra-history'
export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setEntries(JSON.parse(stored).map((e: HistoryEntry) => ({ ...e, exportedAt: new Date(e.exportedAt) })))
    } catch {}
  }, [])
  const persist = (updated: HistoryEntry[]) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch {} }
  const addEntry = useCallback((entry: Omit<HistoryEntry, 'exportedAt'>) => {
    const full: HistoryEntry = { ...entry, exportedAt: new Date() }
    setEntries(prev => { const updated = [full, ...prev].slice(0, 50); persist(updated); return updated })
  }, [])
  const removeEntry = useCallback((id: string) => {
    setEntries(prev => { const updated = prev.filter(e => e.id !== id); persist(updated); return updated })
  }, [])
  const clearHistory = useCallback(() => { setEntries([]); try { localStorage.removeItem(STORAGE_KEY) } catch {} }, [])
  return <HistoryContext.Provider value={{ entries, addEntry, removeEntry, clearHistory }}>{children}</HistoryContext.Provider>
}
export const useHistory = () => useContext(HistoryContext)
