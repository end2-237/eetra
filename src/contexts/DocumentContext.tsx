'use client'
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { DocBlock, DocPage, Comment, CommentReply, TabName, DocumentStyle, STYLE_PRESETS, ChartBlockData, ImageBlockData, OrientationZoneConfig, DEFAULT_ORIENTATION_ZONE, BlockStyleProperties } from '@/types'
import { generateId, generateDocId } from '@/lib/utils'
import { sanitizeContent } from '@/lib/sanitize'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

export const STORAGE_DRAFT = 'eetra-document-draft'

export const DEFAULT_COVER_STYLE: CoverStyle = {
  layout: 'classic',
  accentColor: '',
  showLogo: true,
  showQr: true,
  showGrid: false,
  backgroundStyle: 'solid',
  titleSize: 'lg',
}

interface DocumentContextType {
  docId: string; title: string; subtitle: string; ref: string; destination: string; confidentiality: string
  pages: DocPage[]; currentPageIndex: number; comments: Comment[]; activeTab: TabName
  zoom: number; modified: boolean; selectedTemplate: string | null; docStyle: DocumentStyle
  coverStyle: CoverStyle; showStyleModal: boolean
  orientationZone: OrientationZoneConfig
  canUndo: boolean; canRedo: boolean
  setTitle: (v: string) => void; setSubtitle: (v: string) => void; setRef: (v: string) => void
  setDestination: (v: string) => void; setConfidentiality: (v: string) => void
  setCurrentPageIndex: (i: number) => void; setActiveTab: (t: TabName) => void; setZoom: (z: number) => void
  setSelectedTemplate: (id: string | null) => void; setDocStyle: (s: DocumentStyle) => void
  setCoverStyle: (s: CoverStyle) => void; setShowStyleModal: (v: boolean) => void
  setOrientationZone: (config: OrientationZoneConfig) => void
  addPage: () => void; removePage: (id: string) => void; addBlock: (type: DocBlock['type'], content?: string) => void
  removeBlock: (pageId: string, blockId: string) => void; updateBlock: (pageId: string, blockId: string, content: string) => void
  updateBlockTable: (pageId: string, blockId: string, tableData: NonNullable<DocBlock['tableData']>) => void
  updateBlockChart: (pageId: string, blockId: string, chartData: ChartBlockData) => void
  updateBlockImage: (pageId: string, blockId: string, imageData: ImageBlockData) => void
  updateBlockStyle: (pageId: string, blockId: string, styles: Partial<BlockStyleProperties>) => void
  setPageBlocks: (pageId: string, blocks: DocBlock[]) => void; clearCurrentPage: () => void
  overflowBlock: (fromPageId: string, blockId: string) => void; undo: () => void; redo: () => void; clearDraft: () => void
  addComment: (text: string, author: string) => void; removeComment: (id: string) => void
  resolveComment: (id: string) => void; addReply: (commentId: string, text: string, author: string) => void
  markSaved: () => void; resetDocument: () => void
}

const DocumentContext = createContext<DocumentContextType>({} as DocumentContextType)

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [docId] = useState(generateDocId())
  const [title, setTitleState] = useState('')
  const [subtitle, setSubtitleState] = useState('')
  const [ref, setRefState] = useState('')
  const [destination, setDestinationState] = useState('')
  const [confidentiality, setConfidentialityState] = useState('CONFIDENTIEL')
  const [pages, setPages] = useState<DocPage[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [activeTab, setActiveTab] = useState<TabName>('editor')
  const [zoom, setZoom] = useState(0.75)
  const [modified, setModified] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [docStyle, setDocStyleState] = useState<DocumentStyle>(STYLE_PRESETS.classic)
  const [coverStyle, setCoverStyleState] = useState<CoverStyle>(DEFAULT_COVER_STYLE)
  const [showStyleModal, setShowStyleModal] = useState(false)
  const [orientationZone, setOrientationZoneState] = useState<OrientationZoneConfig>(DEFAULT_ORIENTATION_ZONE)

  const pageHistoryRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)
  const isRestoringRef = useRef(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const syncUndoRedoFlags = () => { setCanUndo(historyIdxRef.current > 0); setCanRedo(historyIdxRef.current < pageHistoryRef.current.length - 1) }

  const pushHistory = (currentPages: DocPage[]) => {
    if (isRestoringRef.current) return
    const serialized = JSON.stringify(currentPages)
    if (historyIdxRef.current < pageHistoryRef.current.length - 1) pageHistoryRef.current = pageHistoryRef.current.slice(0, historyIdxRef.current + 1)
    pageHistoryRef.current.push(serialized)
    if (pageHistoryRef.current.length > 50) pageHistoryRef.current.shift()
    historyIdxRef.current = pageHistoryRef.current.length - 1
    syncUndoRedoFlags()
  }

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current -= 1
    isRestoringRef.current = true
    setPages(JSON.parse(pageHistoryRef.current[historyIdxRef.current]) as DocPage[])
    setModified(true); syncUndoRedoFlags()
    requestAnimationFrame(() => { isRestoringRef.current = false })
  }, [])

  const redo = useCallback(() => {
    if (historyIdxRef.current >= pageHistoryRef.current.length - 1) return
    historyIdxRef.current += 1
    isRestoringRef.current = true
    setPages(JSON.parse(pageHistoryRef.current[historyIdxRef.current]) as DocPage[])
    setModified(true); syncUndoRedoFlags()
    requestAnimationFrame(() => { isRestoringRef.current = false })
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.title) setTitleState(draft.title)
        if (draft.subtitle) setSubtitleState(draft.subtitle)
        if (draft.ref) setRefState(draft.ref)
        if (draft.destination) setDestinationState(draft.destination)
        if (draft.confidentiality) setConfidentialityState(draft.confidentiality)
        if (draft.pages?.length > 0) {
          setPages(draft.pages); setCurrentPageIndex(0)
          pageHistoryRef.current = [JSON.stringify(draft.pages)]
          historyIdxRef.current = 0
        }
        if (draft.docStyle) setDocStyleState(draft.docStyle)
        if (draft.coverStyle) setCoverStyleState(draft.coverStyle)
        if (draft.orientationZone) setOrientationZoneState(draft.orientationZone)
      }
    } catch {}
  }, [])

  const setTitle = useCallback((v: string) => { setTitleState(sanitizeContent(v).slice(0, 200)); setModified(true) }, [])
  const setSubtitle = useCallback((v: string) => { setSubtitleState(sanitizeContent(v).slice(0, 300)); setModified(true) }, [])
  const setRef = useCallback((v: string) => { setRefState(sanitizeContent(v).slice(0, 100)); setModified(true) }, [])
  const setDestination = useCallback((v: string) => { setDestinationState(sanitizeContent(v).slice(0, 200)); setModified(true) }, [])
  const setConfidentiality = useCallback((v: string) => { setConfidentialityState(v); setModified(true) }, [])
  const setDocStyle = useCallback((s: DocumentStyle) => { setDocStyleState(s); setModified(true) }, [])
  const setCoverStyle = useCallback((s: CoverStyle) => { setCoverStyleState(s); setModified(true) }, [])
  const setOrientationZone = useCallback((config: OrientationZoneConfig) => { setOrientationZoneState(config); setModified(true) }, [])

  useEffect(() => {
    if (!modified && pages.length === 0) return
    try {
      const draft = { title, subtitle, ref, destination, confidentiality, pages, docStyle, coverStyle, orientationZone }
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draft))
    } catch {}
  }, [pages, title, subtitle, ref, destination, confidentiality, docStyle, coverStyle, orientationZone, modified])

  const markSaved = () => setModified(false)

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    setPages([]); setTitleState(''); setSubtitleState(''); setRefState(''); setDestinationState('')
    setCoverStyleState(DEFAULT_COVER_STYLE); setOrientationZoneState(DEFAULT_ORIENTATION_ZONE); setModified(false)
    pageHistoryRef.current = []; historyIdxRef.current = -1; syncUndoRedoFlags()
  }, [])

  const addPage = useCallback(() => {
    const newPage: DocPage = { id: generateId(), blocks: [] }
    setPages(prev => { pushHistory(prev); return [...prev, newPage] })
    setCurrentPageIndex(prev => prev + 1); setModified(true)
  }, [])

  const removePage = useCallback((id: string) => {
    setPages(prev => {
      pushHistory(prev)
      const idx = prev.findIndex(p => p.id === id)
      const next = prev.filter(p => p.id !== id)
      setCurrentPageIndex(ci => Math.max(0, ci >= idx ? ci - 1 : ci))
      return next
    }); setModified(true)
  }, [])

  const addBlock = useCallback((type: DocBlock['type'], content?: string) => {
    const block: DocBlock = { id: generateId(), type, content }
    setPages(prev => {
      pushHistory(prev)
      const updated = [...prev]
      if (updated[currentPageIndex]) updated[currentPageIndex] = { ...updated[currentPageIndex], blocks: [...updated[currentPageIndex].blocks, block] }
      return updated
    }); setModified(true)
  }, [currentPageIndex])

  const removeBlock = useCallback((pageId: string, blockId: string) => {
    setPages(prev => { pushHistory(prev); return prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) } : p) }); setModified(true)
  }, [])

  const updateBlock = useCallback((pageId: string, blockId: string, content: string) => {
    const safe = sanitizeContent(content)
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, content: safe } : b) } : p)); setModified(true)
  }, [])

  const updateBlockTable = useCallback((pageId: string, blockId: string, tableData: NonNullable<DocBlock['tableData']>) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, tableData } : b) } : p)); setModified(true)
  }, [])

  const updateBlockChart = useCallback((pageId: string, blockId: string, chartData: ChartBlockData) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, chartData } : b) } : p)); setModified(true)
  }, [])

  const updateBlockImage = useCallback((pageId: string, blockId: string, imageData: ImageBlockData) => {
    setPages(prev => prev.map(p => p.id === pageId ? { ...p, blocks: p.blocks.map(b => b.id === blockId ? { ...b, imageData } : b) } : p)); setModified(true)
  }, [])

  // ── NEW: update block visual styles (alignment, color, bold, etc.) ─────────
  const updateBlockStyle = useCallback((pageId: string, blockId: string, styles: Partial<BlockStyleProperties>) => {
    setPages(prev => prev.map(p =>
      p.id === pageId
        ? {
            ...p,
            blocks: p.blocks.map(b =>
              b.id === blockId
                ? {
                    ...b,
                    styles: {
                      ...b.styles,
                      ...styles,
                      // Merge nested textStyles object
                      textStyles: styles.textStyles
                        ? { ...(b.styles?.textStyles || {}), ...styles.textStyles }
                        : b.styles?.textStyles,
                    },
                  }
                : b
            ),
          }
        : p
    ))
    setModified(true)
  }, [])

  const setPageBlocks = useCallback((pageId: string, blocks: DocBlock[]) => {
    setPages(prev => { pushHistory(prev); return prev.map(p => p.id === pageId ? { ...p, blocks } : p) }); setModified(true)
  }, [])

  const clearCurrentPage = useCallback(() => {
    setPages(prev => { pushHistory(prev); const updated = [...prev]; if (updated[currentPageIndex]) updated[currentPageIndex] = { ...updated[currentPageIndex], blocks: [] }; return updated }); setModified(true)
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
      if (fromIdx + 1 < updated.length) updated[fromIdx + 1] = { ...updated[fromIdx + 1], blocks: [block, ...updated[fromIdx + 1].blocks] }
      else updated.splice(fromIdx + 1, 0, { id: generateId(), blocks: [block] })
      return updated
    }); setModified(true)
  }, [])

  const addComment = useCallback((text: string, author: string) => {
    const safeText = sanitizeContent(text).slice(0, 2000)
    const comment: Comment = { id: generateId(), text: safeText, author: sanitizeContent(author).slice(0, 100), createdAt: new Date(), resolved: false, replies: [] }
    setComments(prev => [...prev, comment])
  }, [])

  const removeComment = useCallback((id: string) => setComments(prev => prev.filter(c => c.id !== id)), [])
  const resolveComment = useCallback((id: string) => setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: !c.resolved } : c)), [])
  const addReply = useCallback((commentId: string, text: string, author: string) => {
    const reply: CommentReply = { id: generateId(), text: sanitizeContent(text).slice(0, 2000), author: sanitizeContent(author).slice(0, 100), createdAt: new Date() }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c))
  }, [])

  const resetDocument = useCallback(() => { clearDraft(); setCurrentPageIndex(0); setConfidentialityState('CONFIDENTIEL') }, [clearDraft])

  return (
    <DocumentContext.Provider value={{
      docId, title, subtitle, ref, destination, confidentiality, pages, currentPageIndex, comments,
      activeTab, zoom, modified, selectedTemplate, docStyle, coverStyle, showStyleModal, orientationZone,
      canUndo, canRedo,
      setTitle, setSubtitle, setRef, setDestination, setConfidentiality, setCurrentPageIndex,
      setActiveTab, setZoom, setSelectedTemplate, setDocStyle, setCoverStyle, setShowStyleModal,
      setOrientationZone,
      addPage, removePage, addBlock, removeBlock, updateBlock, updateBlockTable, updateBlockChart,
      updateBlockImage, updateBlockStyle, setPageBlocks, clearCurrentPage, overflowBlock, undo, redo, clearDraft,
      addComment, removeComment, resolveComment, addReply, markSaved, resetDocument,
    }}>
      {children}
    </DocumentContext.Provider>
  )
}
export const useDocument = () => useContext(DocumentContext)