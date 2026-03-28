'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter }          from 'next/navigation'
import { useDocument }        from '@/contexts/DocumentContext'
import { useProfile }         from '@/contexts/ProfileContext'
import { useNotifications }   from '@/contexts/NotificationContext'
import { useCustomTemplates } from '@/contexts/CustomTemplateContext'
import { useLibrary }         from '@/contexts/LibraryContext'
import { useRealtime }        from '@/contexts/RealtimeContext'
import { usePlan }            from '@/contexts/PlanContext'
import { PageLayoutProvider } from '@/contexts/PageLayoutContext'
import { Sidebar }            from './Sidebar'
import { EditorPanel }        from './panels/EditorPanel'
import { DocumentViewer }     from './document/DocumentViewer'
import { ExportModal }        from './ExportModal'
import { PlanUpgradeModal }   from './PlanUpgradeModal'
import { LiveCursors }        from './LiveCursors'
import { MobileEditor }       from './MobileEditor'
import { TEMPLATES }          from '@/lib/templates'
import { generateId }         from '@/lib/utils'
import type { DocBlock }      from '@/types'

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  const [isMobileInit, setIsMobileInit] = useState(false)
  
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 1024)
    check()
    setIsMobileInit(true)
    const resizeListener = () => check()
    window.addEventListener('resize', resizeListener, { passive: true })
    return () => window.removeEventListener('resize', resizeListener)
  }, [])
  
  if (!isMobileInit) return false
  return mobile
}

export function EditorLayout() {
  const router = useRouter()
  const {
    pages, addPage, addBlock, setSelectedTemplate, docStyle, docId,
    title, subtitle, ref: docRef, destination, confidentiality,
    setPageBlocks, setDocStyle, setCoverStyle, currentPageIndex, modified, markSaved,
    activeTab, setActiveTab, orientationZone,
  } = useDocument()

  const { profile }                      = useProfile()
  const { addNotification }              = useNotifications()
  const { getTemplate }                  = useCustomTemplates()
  const { saveDocument }                 = useLibrary()
  const { joinDocument }                 = useRealtime()
  const { checkDocumentLimit, canCreateDocument, requestUpgrade, plan } = usePlan()
  const isMobile                         = useIsMobile()
  const canvasRef                        = useRef<HTMLDivElement>(null)

  const [showExport, setShowExport] = useState(false)
  const initDone = useRef(false)
  const limitChecked = useRef(false)

  // ── Join realtime channel ──────────────────────────────────────────────────
  useEffect(() => {
    if (docId) joinDocument(docId)
  }, [docId, joinDocument])

  // ── HARD BLOCK: prevent new document creation if plan limit reached ─────────
  useEffect(() => {
    if (limitChecked.current) return
    limitChecked.current = true

    // Detect if this is a NEW document attempt (no saved draft with content)
    const hasPendingTemplate = (
      !!sessionStorage.getItem('eetra-pending-template') ||
      !!sessionStorage.getItem('eetra-pending-custom-template')
    )

    const draftRaw = (() => { try { return localStorage.getItem('eetra-document-draft') } catch { return null } })()
    const draft = draftRaw ? (() => { try { return JSON.parse(draftRaw) } catch { return null } })() : null
    const hasDraftContent = draft && (draft.title || (draft.pages && draft.pages.length > 0))

    // Only check limit for truly new documents (no existing draft content, or pending template)
    const isNewDoc = !hasDraftContent || hasPendingTemplate

    if (isNewDoc) {
      checkDocumentLimit().then(allowed => {
        if (!allowed) {
          // Clean up pending template flags so they don't persist
          try { sessionStorage.removeItem('eetra-pending-template') } catch {}
          try { sessionStorage.removeItem('eetra-pending-custom-template') } catch {}
          // Redirect back to dashboard after short delay (upgrade modal shown by checkDocumentLimit)
          setTimeout(() => router.push('/dashboard'), 400)
        }
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Template initialisation ────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    const pendingCustomId = sessionStorage.getItem('eetra-pending-custom-template')
    if (pendingCustomId) {
      sessionStorage.removeItem('eetra-pending-custom-template')
      const customTpl = getTemplate(pendingCustomId)
      if (customTpl) {
        if (customTpl.docStyle)  setDocStyle(customTpl.docStyle)
        if (customTpl.coverStyle) setCoverStyle(customTpl.coverStyle)
        setSelectedTemplate(pendingCustomId)
        addNotification({ type: 'success', title: 'Template appliqué', message: `"${customTpl.name}" chargé.` })
        return
      }
    }

    const pendingId = sessionStorage.getItem('eetra-pending-template')
    if (pendingId) {
      sessionStorage.removeItem('eetra-pending-template')
      const tpl = TEMPLATES.find(t => t.id === pendingId)
      if (tpl) {
        setSelectedTemplate(tpl.id)
        if (tpl.coverStyle) setCoverStyle(tpl.coverStyle)
        if (tpl.coverStyle?.accentColor) setDocStyle({ ...docStyle, accentColor: tpl.coverStyle.accentColor })

        if (pages.length === 0) {
          addPage()
          setTimeout(() => {
            const blocks: DocBlock[] = tpl.blocks.map((b: any) => ({
              id:      generateId(),
              type:    b.type,
              content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content ?? {}),
            }))
            setPageBlocks('current', blocks)
          }, 50)
        }
        addNotification({ type: 'success', title: 'Template chargé', message: `"${tpl.name}" prêt.` })
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-save ──────────────────────────────────────────────────────────────
  const saveRef = useRef({
    pages, title, subtitle, docRef, destination, confidentiality,
    profile, docStyle, modified,
  })

  useEffect(() => {
    saveRef.current = {
      pages, title, subtitle, docRef, destination, confidentiality,
      profile, docStyle, modified,
    }
  })

  useEffect(() => {
    const doSave = async () => {
      const s = saveRef.current
      if (!s.modified) return
      const hasContent = s.title || s.pages.some(p => p.blocks.length > 0)
      if (!hasContent) return

      const result = await saveDocument({
        id:             docId,
        title:          s.title || 'Sans titre',
        subtitle:       s.subtitle,
        ref:            s.docRef,
        destination:    s.destination,
        confidentiality: s.confidentiality,
        entityName:     s.profile.name,
        pages:          s.pages,
        docStyle:       s.docStyle,
        pageCount:      s.pages.length,
        blockCount:     s.pages.reduce((c, p) => c + p.blocks.length, 0),
      })

      if (result.success) {
        markSaved()
      } else if (result.code === 'LIMIT_REACHED') {
        // Limit reached during auto-save (edge case) — show upgrade modal
        requestUpgrade(
          result.error || `Limite de documents atteinte sur le plan ${plan.label}.`,
          'document'
        )
      }
    }

    const interval = setInterval(doSave, 3000)
    // Run immediately on mount
    doSave()
    return () => clearInterval(interval)
  }, [docId, saveDocument, markSaved, requestUpgrade, plan])

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <PageLayoutProvider>
        <PlanUpgradeModal />
        <MobileEditor onExport={() => setShowExport(true)} />
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </PageLayoutProvider>
    )
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  return (
    <PageLayoutProvider>
      <PlanUpgradeModal />
      <div ref={canvasRef as any} style={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden', 
        background: 'var(--bg)',
        flexDirection: 'row',
      }}>
        <Sidebar onExport={() => setShowExport(true)} />
        
        <div className="editor-side-panel" style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <EditorPanel />
        </div>
        
        <div className="editor-main" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <DocumentViewer onExport={() => setShowExport(true)} />
        </div>

        <LiveCursors containerRef={canvasRef} />

        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (min-width: 1024px) {
          .editor-side-panel { display: flex !important; }
          .editor-main { overflow: hidden !important; }
        }
        @media (max-width: 1023px) {
          .editor-side-panel { display: none !important; }
          .editor-main { overflow-y: auto !important; padding-bottom: 56px !important; }
        }
        @media (max-width: 479px) {
          .editor-main { padding-bottom: 52px !important; }
        }
      `}</style>
    </PageLayoutProvider>
  )
}
