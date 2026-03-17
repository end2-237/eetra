'use client'

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { DocBlock, DocPage, Comment, CommentReply, TabName, DocumentStyle, STYLE_PRESETS } from '@/types'
import { generateId, generateDocId } from '@/lib/utils'

const STORAGE_DRAFT = 'eetra-document-draft'

interface DocumentContextType {
  docId: string
  title: string
  subtitle: string
  ref: string
  destination: string
  confidentiality: string
  pages: DocPage[]
  currentPageIndex: number
  comments: Comment[]
  activeTab: TabName
  zoom: number
  modified: boolean
  selectedTemplate: string | null
  docStyle: DocumentStyle
  showStyleModal: boolean
  canUndo: boolean
  canRedo: boolean

  setTitle: (v: string) => void
  setSubtitle: (v: string) => void
  setRef: (v: string) => void
  setDestination: (v: string) => void
  setConfidentiality: (v: string) => void
  setCurrentPageIndex: (i: number) => void
  setActiveTab: (t: TabName) => void
  setZoom: (z: number) => void
  setSelectedTemplate: (id: string | null) => void
  setDocStyle: (s: DocumentStyle) => void
  setShowStyleModal: (v: boolean) => void

  addPage: () => void
  removePage: (id: string) => void
  addBlock: (type: DocBlock['type'], content?: string) => void
  removeBlock: (pageId: string, blockId: string) => void
  updateBlock: (pageId: string, blockId: string, content: string) => void
  updateBlockTable: (pageId: string, blockId: string, tableData: NonNullable<DocBlock['tableData']>) => void
  setPageBlocks: (pageId: string, blocks: DocBlock[]) => void
  clearCurrentPage: () => void
  overflowBlock: (fromPageId: string, blockId: string) => void
  undo: () => void
  redo: () => void
  clearDraft: () => void

  addComment: (text: string, author: string) => void
  removeComment: (id: string) => void
  resolveComment: (id: string) => void
  addReply: (commentId: string, text: string, author: string) => void
  markSaved: () => void
  resetDocument: () => void
}

const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType)

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [docId] = useState(generateDocId())
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [ref, setRef] = useState('')
  const [destination, setDestination] = useState('')
  const [confidentiality, setConfidentiality] = useState('CONFIDENTIEL')
  const [pages, setPages] = useState<DocPage[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [activeTab, setActiveTab] = useState<TabName>('editor')
  const [zoom, setZoom] = useState(1)
  const [modified, setModified] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [docStyle, setDocStyle] = useState<DocumentStyle>(STYLE_PRESETS.classic)
  const [showStyleModal, setShowStyleModal] = useState(false)

  // Undo/Redo
  const pageHistoryRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)
  const isRestoringRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  function syncUndoRedoFlags() {
    setCanUndo(historyIdxRef.current > 0)
    setCanRedo(historyIdxRef.current < pageHistoryRef.current.length - 1)
  }

  function pushHistory(currentPages: DocPage[]) {
    if (isRestoringRef.current) return
    const serialized = JSON.stringify(currentPages)
    // Trim redo stack
    if (historyIdxRef.current < pageHistoryRef.current.length - 1) {
      pageHistoryRef.current = pageHistoryRef.current.slice(0, historyIdxRef.current + 1)
    }
    pageHistoryRef.current.push(serialized)
    if (pageHistoryRef.current.length > 50) pageHistoryRef.current.shift()
    historyIdxRef.current = pageHistoryRef.current.length - 1
    syncUndoRedoFlags()
  }

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current -= 1
    isRestoringRef.current = true
    const snapshot = JSON.parse(pageHistoryRef.current[historyIdxRef.current]) as DocPage[]
    setPages(snapshot)
    setModified(true)
    syncUndoRedoFlags()
    requestAnimationFrame(() => { isRestoringRef.current = false })
  }, [])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= pageHistoryRef.current.length - 1) return
    historyIdxRef.current += 1
    isRestoringRef.current = true
    const snapshot = JSON.parse(pageHistoryRef.current[historyIdxRef.current]) as DocPage[]
    setPages(snapshot)
    setModified(true)
    syncUndoRedoFlags()
    requestAnimationFrame(() => { isRestoringRef.current = false })
  }, [])

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.title) setTitle(draft.title)
        if (draft.subtitle) setSubtitle(draft.subtitle)
        if (draft.ref) setRef(draft.ref)
        if (draft.destination) setDestination(draft.destination)
        if (draft.confidentiality) setConfidentiality(draft.confidentiality)
        if (draft.pages?.length > 0) {
          setPages(draft.pages)
          setCurrentPageIndex(0)
          // Seed history
          pageHistoryRef.current = [JSON.stringify(draft.pages)]
          historyIdxRef.current = 0
        }
        if (draft.docStyle) setDocStyle(draft.docStyle)
      }
    } catch {}
  }, [])

  // Persist to localStorage when pages/metadata change
  useEffect(() => {
    if (!modified && pages.length === 0) return
    try {
      const draft = { title, subtitle, ref, destination, confidentiality, pages, docStyle }
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft))
    } catch {}
  }, [pages, title, subtitle, ref, destination, confidentiality, docStyle, modified])

  const markModified = () => setModified(true)
  const markSaved = () => setModified(false)

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    setPages([])
    setTitle('')
    setSubtitle('')
    setRef('')
    setDestination('')
    setModified(false)
    pageHistoryRef.current = []
    historyIdxRef.current = -1
    syncUndoRedoFlags()
  }, [])

  const addPage = useCallback(() => {
    const newPage: DocPage = { id: generateId(), blocks: [] }
    setPages(prev => {
      pushHistory(prev)
      return [...prev, newPage]
    })
    setCurrentPageIndex(prev => prev + 1)
    markModified()
  }, [])

  const removePage = useCallback((id: string) => {
    setPages(prev => {
      pushHistory(prev)
      const idx = prev.findIndex(p => p.id === id)
      const next = prev.filter(p => p.id !== id)
      setCurrentPageIndex(ci => Math.max(0, ci >= idx ? ci - 1 : ci))
      return next
    })
    markModified()
  }, [])

  const addBlock = useCallback((type: DocBlock['type'], content?: string) => {
    const block: DocBlock = { id: generateId(), type, content }
    setPages(prev => {
      pushHistory(prev)
      const updated = [...prev]
      if (updated[currentPageIndex]) {
        updated[currentPageIndex] = {
          ...updated[currentPageIndex],
          blocks: [...updated[currentPageIndex].blocks, block],
        }
      }
      return updated
    })
    markModified()
  }, [currentPageIndex])

  const removeBlock = useCallback((pageId: string, blockId: string) => {
    setPages(prev => {
      pushHistory(prev)
      return prev.map(p =>
        p.id === pageId ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) } : p
      )
    })
    markModified()
  }, [])

  const updateBlock = useCallback((pageId: string, blockId: string, content: string) => {
    setPages(prev =>
      prev.map(p =>
        p.id === pageId
          ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, content } : b) }
          : p
      )
    )
    markModified()
  }, [])

  const updateBlockTable = useCallback((pageId: string, blockId: string, tableData: NonNullable<DocBlock['tableData']>) => {
    setPages(prev =>
      prev.map(p =>
        p.id === pageId
          ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, tableData } : b) }
          : p
      )
    )
    markModified()
  }, [])

  const setPageBlocks = useCallback((pageId: string, blocks: DocBlock[]) => {
    setPages(prev => {
      pushHistory(prev)
      return prev.map(p => p.id === pageId ? { ...p, blocks } : p)
    })
    markModified()
  }, [])

  const clearCurrentPage = useCallback(() => {
    setPages(prev => {
      pushHistory(prev)
      const updated = [...prev]
      if (updated[currentPageIndex]) {
        updated[currentPageIndex] = { ...updated[currentPageIndex], blocks: [] }
      }
      return updated
    })
    markModified()
  }, [currentPageIndex])

  const overflowBlock = useCallback((fromPageId: string, blockId: string) => {
    setPages(prev => {
      const fromIdx = prev.findIndex(p => p.id === fromPageId)
      if (fromIdx === -1) return prev
      const fromPage = prev[fromIdx]
      if (fromPage.blocks.length <= 1) return prev
      const block = fromPage.blocks.find(b => b.id === blockId)
      if (!block) return prev
      const updated = [...prev]
      updated[fromIdx] = { ...fromPage, blocks: fromPage.blocks.filter(b => b.id !== blockId) }
      if (fromIdx + 1 < updated.length) {
        updated[fromIdx + 1] = { ...updated[fromIdx + 1], blocks: [block, ...updated[fromIdx + 1].blocks] }
      } else {
        updated.splice(fromIdx + 1, 0, { id: generateId(), blocks: [block] })
      }
      return updated
    })
    markModified()
  }, [])

  const addComment = useCallback((text: string, author: string) => {
    const comment: Comment = { id: generateId(), text, author, createdAt: new Date(), resolved: false, replies: [] }
    setComments(prev => [...prev, comment])
  }, [])

  const removeComment = useCallback((id: string) => {
    setComments(prev => prev.filter(c => c.id !== id))
  }, [])

  const resolveComment = useCallback((id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c))
  }, [])

  const addReply = useCallback((commentId: string, text: string, author: string) => {
    const reply: CommentReply = { id: generateId(), text, author, createdAt: new Date() }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c))
  }, [])

  const resetDocument = useCallback(() => {
    clearDraft()
    setCurrentPageIndex(0)
    setConfidentiality('CONFIDENTIEL')
  }, [clearDraft])

  return (
    <DocumentContext.Provider
      value={{
        docId, title, subtitle, ref, destination, confidentiality,
        pages, currentPageIndex, comments, activeTab, zoom, modified, selectedTemplate,
        docStyle, showStyleModal, canUndo, canRedo,
        setTitle, setSubtitle, setRef, setDestination, setConfidentiality,
        setCurrentPageIndex, setActiveTab, setZoom, setSelectedTemplate,
        setDocStyle, setShowStyleModal,
        addPage, removePage, addBlock, removeBlock, updateBlock, updateBlockTable,
        setPageBlocks, clearCurrentPage, overflowBlock, undo, redo, clearDraft,
        addComment, removeComment, resolveComment, addReply, markSaved, resetDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocument = () => useContext(DocumentContext)
export { STORAGE_DRAFT }
