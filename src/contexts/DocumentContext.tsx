'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { DocBlock, DocPage, Comment, CommentReply, TabName, DocumentStyle, STYLE_PRESETS } from '@/types'
import { generateId, generateDocId } from '@/lib/utils'

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
  const [showStyleModal, setShowStyleModal] = useState(true)

  const markModified = () => setModified(true)
  const markSaved = () => setModified(false)

  const addPage = useCallback(() => {
    const newPage: DocPage = { id: generateId(), blocks: [] }
    setPages(prev => [...prev, newPage])
    setCurrentPageIndex(prev => prev + 1)
    markModified()
  }, [])

  const removePage = useCallback((id: string) => {
    setPages(prev => {
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
    setPages(prev =>
      prev.map(p =>
        p.id === pageId ? { ...p, blocks: p.blocks.filter(b => b.id !== blockId) } : p
      )
    )
    markModified()
  }, [])

  const updateBlock = useCallback((pageId: string, blockId: string, content: string) => {
    setPages(prev =>
      prev.map(p =>
        p.id === pageId
          ? { ...p, blocks: p.blocks.map(b => (b.id === blockId ? { ...b, content } : b)) }
          : p
      )
    )
    markModified()
  }, [])

  const updateBlockTable = useCallback((pageId: string, blockId: string, tableData: NonNullable<DocBlock['tableData']>) => {
    setPages(prev =>
      prev.map(p =>
        p.id === pageId
          ? { ...p, blocks: p.blocks.map(b => (b.id === blockId ? { ...b, tableData } : b)) }
          : p
      )
    )
    markModified()
  }, [])

  const setPageBlocks = useCallback((pageId: string, blocks: DocBlock[]) => {
    setPages(prev => prev.map(p => (p.id === pageId ? { ...p, blocks } : p)))
    markModified()
  }, [])

  const clearCurrentPage = useCallback(() => {
    setPages(prev => {
      const updated = [...prev]
      if (updated[currentPageIndex]) {
        updated[currentPageIndex] = { ...updated[currentPageIndex], blocks: [] }
      }
      return updated
    })
    markModified()
  }, [currentPageIndex])

  /**
   * Move a block that caused overflow from its page to the next page.
   * If no next page exists, a new one is created automatically.
   * If the page only has 1 block, we don't move it (prevents infinite loop).
   */
  const overflowBlock = useCallback((fromPageId: string, blockId: string) => {
    setPages(prev => {
      const fromIdx = prev.findIndex(p => p.id === fromPageId)
      if (fromIdx === -1) return prev

      const fromPage = prev[fromIdx]
      // Never move if it's the only block — avoids infinite loop
      if (fromPage.blocks.length <= 1) return prev

      const blockIdx = fromPage.blocks.findIndex(b => b.id === blockId)
      if (blockIdx === -1) return prev

      const block = fromPage.blocks[blockIdx]
      const updated = [...prev]

      // Remove block from source page
      updated[fromIdx] = {
        ...fromPage,
        blocks: fromPage.blocks.filter(b => b.id !== blockId),
      }

      // Prepend to next page or create a new one
      if (fromIdx + 1 < updated.length) {
        updated[fromIdx + 1] = {
          ...updated[fromIdx + 1],
          blocks: [block, ...updated[fromIdx + 1].blocks],
        }
      } else {
        const newPage: DocPage = { id: generateId(), blocks: [block] }
        updated.splice(fromIdx + 1, 0, newPage)
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
    setPages([])
    setCurrentPageIndex(0)
    setTitle('')
    setSubtitle('')
    setRef('')
    setDestination('')
    setConfidentiality('CONFIDENTIEL')
    setModified(false)
  }, [])

  return (
    <DocumentContext.Provider
      value={{
        docId, title, subtitle, ref, destination, confidentiality,
        pages, currentPageIndex, comments, activeTab, zoom, modified, selectedTemplate,
        docStyle, showStyleModal,
        setTitle, setSubtitle, setRef, setDestination, setConfidentiality,
        setCurrentPageIndex, setActiveTab, setZoom, setSelectedTemplate,
        setDocStyle, setShowStyleModal,
        addPage, removePage, addBlock, removeBlock, updateBlock, updateBlockTable,
        setPageBlocks, clearCurrentPage, overflowBlock,
        addComment, removeComment, resolveComment, addReply, markSaved, resetDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocument = () => useContext(DocumentContext)
