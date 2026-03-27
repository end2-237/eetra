'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DocPage, DocumentStyle } from '@/types'
import { apiFetch, debounce } from '@/lib/apiClient'

export interface SavedDocument {
  id: string; title: string; subtitle: string; ref: string; destination: string
  confidentiality: string; pages: DocPage[]; docStyle: DocumentStyle; entityName: string
  pageCount: number; blockCount: number; createdAt: string; updatedAt: string
}

interface LibraryContextType {
  documents: SavedDocument[]
  currentDocId: string | null
  saveDocument: (doc: Omit<SavedDocument, 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string }>
  loadDocument: (id: string) => SavedDocument | null
  deleteDocument: (id: string) => void
  duplicateDocument: (id: string) => Promise<SavedDocument | null>
  setCurrentDocId: (id: string | null) => void
}

const LibraryContext = createContext<LibraryContextType>({} as LibraryContextType)
const LIBRARY_KEY = 'eetra-library-v2'

function genId() { return 'DOC-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

const debouncedPush = debounce(async (doc: SavedDocument, isNew: boolean) => {
  if (isNew) {
    await apiFetch('/api/documents', { method: 'POST', body: JSON.stringify(doc) })
  } else {
    await apiFetch(`/api/documents/${doc.id}`, { method: 'PUT', body: JSON.stringify(doc) })
  }
}, 1500)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [cloudIds, setCloudIds] = useState<Set<string>>(new Set())

  // 1. Charger depuis localStorage immédiatement
  useEffect(() => {
    try {
      const s = localStorage.getItem(LIBRARY_KEY)
      if (s) setDocuments(JSON.parse(s))
    } catch {}
  }, [])

  // 2. Charger depuis cloud si connecté, fusionner
  useEffect(() => {
    if (!session?.user?.id) return
    apiFetch<SavedDocument[]>('/api/documents').then(cloudDocs => {
      if (!cloudDocs) return
      const ids = new Set(cloudDocs.map(d => d.id))
      setCloudIds(ids)
      setDocuments(prev => {
        // Cloud gagne sur les conflits
        const merged = [...cloudDocs]
        prev.forEach(local => { if (!ids.has(local.id)) merged.push(local) })
        const sorted = merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(sorted)) } catch {}
        return sorted
      })
    })
  }, [session?.user?.id])

  const persist = (docs: SavedDocument[]) => {
    try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(docs)) } catch {}
  }

  const saveDocument = useCallback(async (doc: Omit<SavedDocument, 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString()
      const existing = documents.find(d => d.id === doc.id)
      const full = existing
        ? { ...doc, createdAt: existing.createdAt, updatedAt: now }
        : { ...doc, id: doc.id || genId(), createdAt: now, updatedAt: now }

      // ── For new documents, check server limit before saving ────────────────────
      if (!existing && session?.user?.id) {
        try {
          const testRes = await apiFetch('/api/documents', {
            method: 'POST',
            body: JSON.stringify(full),
          })
          if (!testRes) {
            return { success: false, error: 'Erreur serveur lors de la sauvegarde' }
          }
        } catch (err: any) {
          // Server rejected the document (likely limit reached)
          const errorMsg = err?.message || 'Impossible de créer le document'
          return { success: false, error: errorMsg }
        }
      }

      // ── Update local state ─────────────────────────────────────────────────────
      setDocuments(prev => {
        const updated = existing
          ? prev.map(d => d.id === doc.id ? full : d)
          : [full, ...prev]
        const trimmed = updated.slice(0, 100)
        persist(trimmed)
        // Sync cloud updates (PUT requests don't fail on limit)
        if (session?.user?.id && existing) debouncedPush(full, false)
        return trimmed
      })

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erreur lors de la sauvegarde' }
    }
  }, [session?.user?.id, documents, cloudIds])

  const loadDocument = useCallback((id: string) => documents.find(d => d.id === id) || null, [documents])

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== id)
      persist(updated)
      if (session?.user?.id) apiFetch(`/api/documents/${id}`, { method: 'DELETE' })
      return updated
    })
  }, [session?.user?.id])

  const duplicateDocument = useCallback(async (id: string): Promise<SavedDocument | null> => {
    const source = documents.find(d => d.id === id)
    if (!source) return null
    const now = new Date().toISOString()
    const newDoc: SavedDocument = {
      ...source, id: genId(), title: `${source.title} (copie)`,
      pages: source.pages.map(p => ({ ...p, id: Math.random().toString(36).slice(2, 10) })),
      createdAt: now, updatedAt: now,
    }

    // ── Check server limit before duplicating ──────────────────────────────────
    if (session?.user?.id) {
      try {
        await apiFetch('/api/documents', { method: 'POST', body: JSON.stringify(newDoc) })
      } catch (err: any) {
        // Server rejected (limit reached)
        console.error('[v0] Duplicate failed:', err?.message)
        return null
      }
    }

    // ── Update local state ─────────────────────────────────────────────────────
    setDocuments(prev => {
      const updated = [newDoc, ...prev].slice(0, 100)
      persist(updated)
      return updated
    })
    return newDoc
  }, [documents, session?.user?.id])

  return (
    <LibraryContext.Provider value={{ documents, currentDocId, saveDocument, loadDocument, deleteDocument, duplicateDocument, setCurrentDocId }}>
      {children}
    </LibraryContext.Provider>
  )
}
export const useLibrary = () => useContext(LibraryContext)
