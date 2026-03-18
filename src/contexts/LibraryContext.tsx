'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { DocPage, DocumentStyle } from '@/types'

export interface SavedDocument {
  id: string; title: string; subtitle: string; ref: string; destination: string
  confidentiality: string; pages: DocPage[]; docStyle: DocumentStyle; entityName: string
  pageCount: number; blockCount: number; createdAt: string; updatedAt: string; thumbnail?: string
}
interface LibraryContextType {
  documents: SavedDocument[]
  currentDocId: string | null
  saveDocument: (doc: Omit<SavedDocument, 'createdAt' | 'updatedAt'>) => void
  loadDocument: (id: string) => SavedDocument | null
  deleteDocument: (id: string) => void
  duplicateDocument: (id: string) => SavedDocument | null
  setCurrentDocId: (id: string | null) => void
}
const LibraryContext = createContext<LibraryContextType>({ documents: [], currentDocId: null, saveDocument: () => {}, loadDocument: () => null, deleteDocument: () => {}, duplicateDocument: () => null, setCurrentDocId: () => {} })
const LIBRARY_KEY = 'eetra-library-v2'
function generateId() { return 'DOC-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  useEffect(() => { try { const s = localStorage.getItem(LIBRARY_KEY); if (s) { const p = JSON.parse(s); setDocuments(Array.isArray(p) ? p : []) } } catch {} }, [])
  const persist = (docs: SavedDocument[]) => { try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(docs)) } catch {} }

  const saveDocument = useCallback((doc: Omit<SavedDocument, 'createdAt' | 'updatedAt'>) => {
    setDocuments(prev => {
      const now = new Date().toISOString()
      const existing = prev.find(d => d.id === doc.id)
      const updated = existing
        ? prev.map(d => d.id === doc.id ? { ...doc, createdAt: d.createdAt, updatedAt: now } : d)
        : [{ ...doc, id: doc.id || generateId(), createdAt: now, updatedAt: now }, ...prev]
      const trimmed = updated.slice(0, 100)
      persist(trimmed)
      return trimmed
    })
  }, [])

  const loadDocument = useCallback((id: string) => documents.find(d => d.id === id) || null, [documents])

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => { const updated = prev.filter(d => d.id !== id); persist(updated); return updated })
  }, [])

  const duplicateDocument = useCallback((id: string): SavedDocument | null => {
    const source = documents.find(d => d.id === id)
    if (!source) return null
    const now = new Date().toISOString()
    const newDoc: SavedDocument = {
      ...source, id: generateId(), title: `${source.title} (copie)`,
      pages: source.pages.map(p => ({ ...p, id: Math.random().toString(36).slice(2, 10), blocks: p.blocks.map(b => ({ ...b, id: Math.random().toString(36).slice(2, 10) })) })),
      createdAt: now, updatedAt: now,
    }
    setDocuments(prev => { const updated = [newDoc, ...prev].slice(0, 100); persist(updated); return updated })
    return newDoc
  }, [documents])

  return <LibraryContext.Provider value={{ documents, currentDocId, saveDocument, loadDocument, deleteDocument, duplicateDocument, setCurrentDocId }}>{children}</LibraryContext.Provider>
}
export const useLibrary = () => useContext(LibraryContext)
