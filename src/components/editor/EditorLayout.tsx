'use client'

import { useEffect, useRef, useState } from 'react'
import { useDocument }        from '@/contexts/DocumentContext'
import { useProfile }         from '@/contexts/ProfileContext'
import { useNotifications }   from '@/contexts/NotificationContext'
import { useCustomTemplates } from '@/contexts/CustomTemplateContext'
import { useLibrary }         from '@/contexts/LibraryContext'
import { useRealtime }        from '@/contexts/RealtimeContext'
import { PageLayoutProvider } from '@/contexts/PageLayoutContext'
import { Sidebar }            from './Sidebar'
import { EditorPanel }        from './panels/EditorPanel'
import { DocumentViewer }     from './document/DocumentViewer'
import { ExportModal }        from './ExportModal'
import { LiveCursors }        from './LiveCursors'
import { MobileEditor }       from './MobileEditor'
import { TEMPLATES }          from '@/lib/templates'
import { generateId }         from '@/lib/utils'
import type { DocBlock }      from '@/types'

function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  const [isMobileInit, setIsMobileInit] = useState(false)
  
  useEffect(() => {
    const check = () => {
      // Use 1024px breakpoint for better tablet support
      const isMobileView = window.innerWidth < 1024
      setMobile(isMobileView)
    }
    
    check()
    setIsMobileInit(true)
    
    const resizeListener = () => check()
    window.addEventListener('resize', resizeListener, { passive: true })
    return () => window.removeEventListener('resize', resizeListener)
  }, [])
  
  // Prevent hydration mismatch
  if (!isMobileInit) return false
  return mobile
}

export function EditorLayout() {
  const {
    pages, addPage, addBlock, setSelectedTemplate, docStyle, docId,
    title, subtitle, ref: docRef, destination, confidentiality,
    setPageBlocks, setDocStyle, setCoverStyle, currentPageIndex, modified, markSaved,
    activeTab, setActiveTab, orientationZone,
  } = useDocument()

  const { profile }           = useProfile()
  const { addNotification }   = useNotifications()
  const { getTemplate }       = useCustomTemplates()
  const { saveDocument }      = useLibrary()
  const { joinDocument }      = useRealtime()
  const isMobile              = useIsMobile()
  const canvasRef             = useRef<HTMLDivElement>(null)

  const [showExport, setShowExport] = useState(false)
  const initDone = useRef(false)

  // ── Join realtime channel for this document ──────────────────────────────
  useEffect(() => {
    if (docId) joinDocument(docId)
  }, [docId, joinDocument])

  // ── Template initialisation ──────────────────────────────────────────────
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
            const blocks: DocBlock[] = tpl.blocks.map(b => ({
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

  // ── Auto-save: robust interval-based approach ────────────────────────────
  // Uses a ref to always access the latest state without re-creating the interval.
  // Saves every 3 seconds IF the document has been modified.
  const saveRef = useRef({
    pages, title, subtitle, docRef, destination, confidentiality,
    profile, docStyle, modified,
  })

  // Keep ref in sync with latest state on every render
  useEffect(() => {
    saveRef.current = {
      pages, title, subtitle, docRef, destination, confidentiality,
      profile, docStyle, modified,
    }
  })

  useEffect(() => {
    const doSave = () => {
      const s = saveRef.current
      // Only save if there is content and the document has been modified
      if (!s.modified) return
      const hasContent = s.title || s.pages.some(p => p.blocks.length > 0)
      if (!hasContent) return

      saveDocument({
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
      // Mark as saved so we don't re-save unchanged content
      markSaved()
    }

    // Save every 3 seconds
    const interval = setInterval(doSave, 3000)

    // Also save immediately when the component mounts if there's content
    // (covers the case where the user refreshes)
    doSave()

    return () => clearInterval(interval)
  }, [docId, saveDocument, markSaved]) // stable deps — saveRef keeps everything else

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <PageLayoutProvider>
        <MobileEditor onExport={() => setShowExport(true)} />
        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </PageLayoutProvider>
    )
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <PageLayoutProvider>
      <div ref={canvasRef as any} style={{ 
        display: 'flex', 
        height: '100vh', 
        overflow: 'hidden', 
        background: 'var(--bg)',
        flexDirection: 'row',
      }}>
        <Sidebar onExport={() => setShowExport(true)} />
        
        {/* Desktop panel (visible on desktop, hidden on tablet/mobile) */}
        <div className="editor-side-panel" style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <EditorPanel />
        </div>
        
        {/* Mobile/Tablet panel overlay (shown when activeTab is not editor) */}
        {activeTab !== 'editor' && (
          <div className="editor-panel-modal-overlay" style={{
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(0,0,0,.3)', 
            zIndex: 99,
            display: 'flex',
            alignItems: 'flex-end',
            opacity: 0,
            visibility: 'hidden',
            transition: 'opacity .25s, visibility .25s',
          }} onClick={() => setActiveTab('editor')} >
            <div style={{
              width: '100%',
              maxHeight: '80vh',
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              overflow: 'auto',
              borderRadius: '12px 12px 0 0',
              animation: 'slideUp .25s cubic-bezier(.23,1,.32,1)',
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                  {activeTab === 'templates' && 'Templates'}
                  {activeTab === 'analytics' && 'Analyse'}
                  {activeTab === 'comments' && 'Notes'}
                  {activeTab === 'layout' && 'Mise en page'}
                  {activeTab === 'orientation' && 'Zone d\'orientation'}
                </div>
              </div>
              <EditorPanel />
            </div>
          </div>
        )}
        
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <DocumentViewer onExport={() => setShowExport(true)} />
        </div>

        {/* Live cursors overlay */}
        <LiveCursors containerRef={canvasRef} />

        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </div>
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Desktop: show side panel, hide mobile modal */
        @media (min-width: 1024px) {
          .editor-side-panel { display: flex !important; }
          .editor-panel-modal-overlay { display: none !important; }
        }
        
        /* Tablet/Mobile: hide side panel, show mobile modal */
        @media (max-width: 1023px) {
          .editor-side-panel { display: none !important; }
          .editor-panel-modal-overlay { display: flex !important; opacity: 1; visibility: visible; }
        }
      `}</style>
    </PageLayoutProvider>
  )
}
