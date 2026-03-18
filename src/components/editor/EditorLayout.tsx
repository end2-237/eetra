'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { makeWelcomeBlocks, WELCOME_DOC, WELCOME_PROFILE } from '@/lib/welcomeDoc'
import { generateId } from '@/lib/utils'

const FIRST_VISIT_KEY = 'eetra-visited'

// Calculate optimal zoom based on available canvas width
function getOptimalZoom(): number {
  if (typeof window === 'undefined') return 0.75
  // sidebar(236) + panel(272) + pages(140) + padding(80) = 728px reserved
  const available = window.innerWidth - 728
  const canvasWidth = 794
  const rawZoom = available / canvasWidth
  // Clamp between 0.45 and 1.0, snap to nearest preset
  if (rawZoom >= 0.90) return 1.0
  if (rawZoom >= 0.65) return 0.75
  return 0.55
}

export function EditorLayout() {
  const {
    addPage, activeTab, modified, markSaved, undo, redo,
    canUndo, canRedo, setTitle, setSubtitle, setRef, setDestination,
    setConfidentiality, setPageBlocks, pages, setShowStyleModal,
    title, subtitle, ref, destination, confidentiality, docId, docStyle,
    setZoom,
  } = useDocument()
  const { updateProfile, profile } = useProfile()
  const { saveDocument } = useLibrary()
  const { toast, showToast } = useToast()
  const { plan } = usePlan()
  const [status, setStatus] = useState('Document actif')

  // ─── Auto-zoom on mount and resize ────────────────────────────────────
  useEffect(() => {
    const applyZoom = () => setZoom(getOptimalZoom())
    applyZoom()
    window.addEventListener('resize', applyZoom)
    return () => window.removeEventListener('resize', applyZoom)
  }, [setZoom])

  // Auto-save to library
  const saveToLibrary = useCallback(() => {
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
  }, [pages, title, subtitle, ref, destination, confidentiality, docId, docStyle, profile.name, saveDocument])

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

  // ─── Onboarding guard — force profile name if missing ─────────────────
  const [showProfileNudge, setShowProfileNudge] = useState(false)
  useEffect(() => {
    // After 3 seconds, if no company name, prompt the user
    if (!profile.name) {
      const timer = setTimeout(() => setShowProfileNudge(true), 3000)
      return () => clearTimeout(timer)
    }
    setShowProfileNudge(false)
  }, [profile.name])

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
  }, [undo, redo, canUndo, canRedo, markSaved, saveToLibrary, showToast]) // eslint-disable-line

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

        {/* Profile nudge banner */}
        {showProfileNudge && (
          <div
            className="flex items-center justify-between px-5 py-2.5 text-[12px] font-bold"
            style={{ background: 'var(--warn)', color: '#fff' }}
          >
            <span>⚠ Votre nom d'entreprise n'est pas défini — la page de couverture affichera "EETRA" à la place.</span>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowProfileNudge(false); window.location.href = '/onboarding' }}
                style={{ background: 'rgba(255,255,255,.25)', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 11 }}
              >
                Configurer →
              </button>
              <button
                onClick={() => setShowProfileNudge(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)', fontSize: 16 }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div style={{ display: activeTab === 'editor'    ? 'flex' : 'none' }} data-tour="editor-panel">
            <ErrorBoundary context="EditorPanel">
              <EditorPanel showToast={showToast} />
            </ErrorBoundary>
          </div>
          <div style={{ display: activeTab === 'templates' ? 'flex' : 'none' }} data-tour="templates-panel">
            <ErrorBoundary context="TemplatesPanel">
              <TemplatesPanel showToast={showToast} />
            </ErrorBoundary>
          </div>
          <div style={{ display: activeTab === 'analytics' ? 'flex' : 'none' }}>
            <ErrorBoundary context="AnalyticsPanel">
              <AnalyticsPanel />
            </ErrorBoundary>
          </div>
          <div style={{ display: activeTab === 'comments'  ? 'flex' : 'none' }}>
            <ErrorBoundary context="CommentsPanel">
              <CommentsPanel showToast={showToast} />
            </ErrorBoundary>
          </div>

          <div data-tour="pages-panel">
            <PagesPanel />
          </div>

          <ErrorBoundary context="Canvas">
            <Canvas />
          </ErrorBoundary>
        </div>
      </div>

      <DocumentStyleModal />
      <PlanUpgradeModal />
      <GuidedTour />
      <Toast {...toast} />
    </div>
  )
}
