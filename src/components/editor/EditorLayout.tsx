'use client'

import { useEffect, useState } from 'react'
import { useDocument, STORAGE_DRAFT } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useLibrary } from '@/contexts/LibraryContext'
import { useToast } from '@/hooks/useToast'
import { useAutoSave } from '@/hooks/useAutoSave'
import { usePlan } from '@/contexts/PlanContext'
import { Toast } from '@/components/ui/Toast'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { PagesPanel } from './PagesPanel'
import { Canvas } from './Canvas'
import { EditorPanel } from './panels/EditorPanel'
import { TemplatesPanel } from './panels/TemplatesPanel'
import { AnalyticsPanel } from './panels/AnalyticsPanel'
import { CommentsPanel } from './panels/CommentsPanel'
import { DocumentStyleModal } from './DocumentStyleModal'
import { PlanUpgradeModal } from './PlanUpgradeModal'
import { GuidedTour } from '@/components/onboarding/GuidedTour'
import { makeWelcomeBlocks, WELCOME_DOC, WELCOME_PROFILE } from '@/lib/welcomeDoc'
import { generateId } from '@/lib/utils'

const FIRST_VISIT_KEY = 'eetra-visited'

export function EditorLayout() {
  const {
    addPage, activeTab, modified, markSaved, undo, redo,
    canUndo, canRedo, setTitle, setSubtitle, setRef, setDestination,
    setConfidentiality, setPageBlocks, pages, setShowStyleModal,
    title, subtitle, ref, destination, confidentiality, docId, docStyle,
  } = useDocument()
  const { updateProfile, profile } = useProfile()
  const { saveDocument } = useLibrary()
  const { toast, showToast } = useToast()
  const { plan } = usePlan()
  const [status, setStatus] = useState('Document actif')

  // Auto-save to library
  const saveToLibrary = () => {
    if (!pages.length) return
    const allBlocks = pages.flatMap(p => p.blocks)
    saveDocument({
      id: docId,
      title: title || 'Sans titre',
      subtitle,
      ref,
      destination,
      confidentiality,
      pages,
      docStyle,
      entityName: profile.name || 'EETRA',
      pageCount: pages.length + 1,
      blockCount: allBlocks.length,
      thumbnail: pages[0]?.blocks.find(b => b.type === 'section')?.content || '',
    })
  }

  // Initialize document on mount
  useEffect(() => {
    const hasDraft = !!localStorage.getItem(STORAGE_DRAFT)
    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY)

    if (!hasDraft) addPage()

    if (isFirstVisit && !hasDraft) {
      localStorage.setItem(FIRST_VISIT_KEY, '1')
      updateProfile(WELCOME_PROFILE)
      setTimeout(() => {
        setTitle(WELCOME_DOC.title)
        setSubtitle(WELCOME_DOC.subtitle)
        setRef(WELCOME_DOC.ref)
        setDestination(WELCOME_DOC.destination)
        setConfidentiality(WELCOME_DOC.confidentiality)
      }, 50)
      setShowStyleModal(true)
      showToast('Bienvenue sur EETRA ! Document exemple chargé.', 'ok')
    }
  }, []) // eslint-disable-line

  const [welcomeApplied, setWelcomeApplied] = useState(false)
  useEffect(() => {
    if (welcomeApplied) return
    const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) === '1'
    const hasDraft = !!(localStorage.getItem(STORAGE_DRAFT) && JSON.parse(localStorage.getItem(STORAGE_DRAFT) || '{}').pages?.length > 0)
    if (isFirstVisit && pages.length > 0 && !hasDraft) {
      const firstPage = pages[0]
      if (firstPage && firstPage.blocks.length === 0) {
        setPageBlocks(firstPage.id, makeWelcomeBlocks())
        setWelcomeApplied(true)
      }
    }
  }, [pages, welcomeApplied, setPageBlocks])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) { undo(); showToast('Action annulée', 'default') }
        return
      }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        if (canRedo) { redo(); showToast('Action rétablie', 'default') }
        return
      }
      if (e.key === 's') {
        e.preventDefault()
        markSaved()
        saveToLibrary()
        setStatus('Sauvegardé ✓')
        setTimeout(() => setStatus('Document actif'), 2000)
        showToast('Document sauvegardé', 'ok')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, canUndo, canRedo, markSaved, showToast]) // eslint-disable-line

  useAutoSave(modified, () => {
    markSaved()
    saveToLibrary()
    setStatus('Sauvegardé ✓')
    setTimeout(() => setStatus('Document actif'), 2000)
  })

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar showToast={showToast} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar status={status} showToast={showToast} />

        <div className="flex-1 flex overflow-hidden">
          <div style={{ display: activeTab === 'editor'    ? 'flex' : 'none' }} data-tour="editor-panel">
            <EditorPanel showToast={showToast} />
          </div>
          <div style={{ display: activeTab === 'templates' ? 'flex' : 'none' }} data-tour="templates-panel">
            <TemplatesPanel showToast={showToast} />
          </div>
          <div style={{ display: activeTab === 'analytics' ? 'flex' : 'none' }}>
            <AnalyticsPanel />
          </div>
          <div style={{ display: activeTab === 'comments'  ? 'flex' : 'none' }}>
            <CommentsPanel showToast={showToast} />
          </div>

          <div data-tour="pages-panel">
            <PagesPanel />
          </div>
          <Canvas />
        </div>
      </div>

      <DocumentStyleModal />
      <PlanUpgradeModal />
      <GuidedTour />
      <Toast {...toast} />
    </div>
  )
}
