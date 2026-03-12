'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { DocBlock, DocPage, Comment, TabName } from '@/types'
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

  setTitle: (v: string) => void
  setSubtitle: (v: string) => void
  setRef: (v: string) => void
  setDestination: (v: string) => void
  setConfidentiality: (v: string) => void
  setCurrentPageIndex: (i: number) => void
  setActiveTab: (t: TabName) => void
  setZoom: (z: number) => void
  setSelectedTemplate: (id: string | null) => void

  addPage: () => void
  removePage: (id: string) => void
  addBlock: (type: DocBlock['type'], content?: string) => void
  removeBlock: (pageId: string, blockId: string) => void
  updateBlock: (pageId: string, blockId: string, content: string) => void
  setPageBlocks: (pageId: string, blocks: DocBlock[]) => void
  clearCurrentPage: () => void

  addComment: (text: string, author: string) => void
  removeComment: (id: string) => void
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

  const markModified = () => setModified(true)
  const markSaved = () => setModified(false)

  const addPage = useCallback(() => {
    const newPage: DocPage = { id: generateId(), blocks: [] }
    setPages(prev => [...prev, newPage])
    setCurrentPageIndex(prev => prev + 1)
    markModified()
  }, [])

  const removePage = useCallback((id: string) => {
    setPages(prev => prev.filter(p => p.id !== id))
    setCurrentPageIndex(prev => Math.max(0, prev - 1))
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

  const addComment = useCallback((text: string, author: string) => {
    const comment: Comment = { id: generateId(), text, author, createdAt: new Date() }
    setComments(prev => [...prev, comment])
  }, [])

  const removeComment = useCallback((id: string) => {
    setComments(prev => prev.filter(c => c.id !== id))
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
        setTitle, setSubtitle, setRef, setDestination, setConfidentiality,
        setCurrentPageIndex, setActiveTab, setZoom, setSelectedTemplate,
        addPage, removePage, addBlock, removeBlock, updateBlock,
        setPageBlocks, clearCurrentPage,
        addComment, removeComment, markSaved, resetDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocument = () => useContext(DocumentContext)
