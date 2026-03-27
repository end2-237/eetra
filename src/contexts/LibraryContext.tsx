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
  saveDocument: (doc: Omit<SavedDocument, 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; error?: string; code?: string }>
  loadDocument: (id: string) => SavedDocument | null
  deleteDocument: (id: string) => void
  duplicateDocument: (id: string) => Promise<SavedDocument | null>
  setCurrentDocId: (id: string | null) => void
}

const LibraryContext = createContext<LibraryContextType>({} as LibraryContextType)
const LIBRARY_KEY = 'eetra-library-v2'

function genId() { return 'DOC-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

// ── Debounced push for UPDATES only (not creates) ──────────────────────────────
const debouncedPush = debounce(async (doc: SavedDocument) => {
  await apiFetch(`/api/documents/${doc.id}`, { method: 'PUT', body: JSON.stringify(doc) })
}, 1500)

// ── Clear all EETRA localStorage keys for this user ───────────────────────────
function clearUserLocalStorage() {
  const keys = [
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
  keys.forEach(k => { try { localStorage.removeItem(k) } catch {} })
}

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  // Track the previous session userId so we detect logout / user-switch
  const [prevUserId, setPrevUserId] = useState<string | null>(null)

  // ── On session change: clear data if logged out or user switched ────────────
  useEffect(() => {
    if (status === 'loading') return

    const currentUserId = session?.user?.id ?? null

    if (prevUserId !== null && currentUserId !== prevUserId) {
      // User logged out or switched — wipe local data
      clearUserLocalStorage()
      setDocuments([])
      setCurrentDocId(null)
    }

    setPrevUserId(currentUserId)
  }, [session?.user?.id, status]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load documents: cloud first if authenticated, localStorage as fallback ──
  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.id) {
      // Not authenticated: load from localStorage (guest mode)
      try {
        const s = localStorage.getItem(LIBRARY_KEY)
        if (s) setDocuments(JSON.parse(s))
      } catch {}
      return
    }

    // Authenticated: fetch from server (source of truth)
    apiFetch<SavedDocument[]>('/api/documents').then(cloudDocs => {
      if (!cloudDocs) {
        // Network error: fall back to localStorage
        try {
          const s = localStorage.getItem(LIBRARY_KEY)
          if (s) setDocuments(JSON.parse(s))
        } catch {}
        return
      }

      // Persist to localStorage for offline access and update state
      try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(cloudDocs)) } catch {}
      setDocuments(cloudDocs)
    })
  }, [session?.user?.id, status])

  const persist = (docs: SavedDocument[]) => {
    try { localStorage.setItem(LIBRARY_KEY, JSON.stringify(docs)) } catch {}
  }

  // ── saveDocument ─────────────────────────────────────────────────────────────
  const saveDocument = useCallback(async (
    doc: Omit<SavedDocument, 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; error?: string; code?: string }> => {
    try {
      const now = new Date().toISOString()
      const existing = documents.find(d => d.id === doc.id)

      const full: SavedDocument = existing
        ? { ...doc, createdAt: existing.createdAt, updatedAt: now }
        : { ...doc, id: doc.id || genId(), createdAt: now, updatedAt: now }

      // ── NEW document: always verify server limit first ────────────────────────
      if (!existing && session?.user?.id) {
        const res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(full),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          // 403 = limit reached
          if (res.status === 403) {
            return {
              success: false,
              error: data.error || 'Limite de documents atteinte',
              code: data.code || 'LIMIT_REACHED',
            }
          }
          return { success: false, error: data.error || 'Erreur serveur' }
        }

        // Server created the doc — update local state
        const created: SavedDocument = await res.json()
        setDocuments(prev => {
          const updated = [created, ...prev].slice(0, 100)
          persist(updated)
          return updated
        })
        return { success: true }
      }

      // ── UPDATE existing document ─────────────────────────────────────────────
      setDocuments(prev => {
        const updated = existing
          ? prev.map(d => d.id === doc.id ? full : d)
          : [full, ...prev]
        const trimmed = updated.slice(0, 100)
        persist(trimmed)
        return trimmed
      })

      if (session?.user?.id && existing) {
        debouncedPush(full)
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Erreur lors de la sauvegarde' }
    }
  }, [session?.user?.id, documents])

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
      ...source,
      id: genId(),
      title: `${source.title} (copie)`,
      pages: source.pages.map(p => ({ ...p, id: Math.random().toString(36).slice(2, 10) })),
      createdAt: now,
      updatedAt: now,
    }

    if (session?.user?.id) {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error('[Library] Duplicate failed:', data.error)
        return null
      }

      const created: SavedDocument = await res.json()
      setDocuments(prev => {
        const updated = [created, ...prev].slice(0, 100)
        persist(updated)
        return updated
      })
      return created
    }

    // Offline / guest mode
    setDocuments(prev => {
      const updated = [newDoc, ...prev].slice(0, 100)
      persist(updated)
      return updated
    })
    return newDoc
  }, [documents, session?.user?.id])

  return (
    <LibraryContext.Provider value={{
      documents, currentDocId, saveDocument, loadDocument,
      deleteDocument, duplicateDocument, setCurrentDocId,
    }}>
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = () => useContext(LibraryContext)