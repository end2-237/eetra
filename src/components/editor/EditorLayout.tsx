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
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mobile
}

export function EditorLayout() {
  const {
    pages, addPage, addBlock, setSelectedTemplate, docStyle, docId,
    title, subtitle, ref: docRef, destination, confidentiality,
    setPageBlocks, setDocStyle, setCoverStyle, currentPageIndex,
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

  // ── Auto-save ────────────────────────────────────────────────────────────
  useEffect(() => {
    const hasContent = title || pages.some(p => p.blocks.length > 0)
    if (!hasContent) return
    const timer = setTimeout(() => {
      saveDocument({
        id:             'current',
        title:          title || 'Sans titre',
        subtitle,
        ref:            docRef,
        destination,
        confidentiality,
        entityName:     profile.name,
        pages,
        docStyle,
        pageCount:      pages.length,
        blockCount:     pages.reduce((c, p) => c + p.blocks.length, 0),
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [title, pages, docStyle]) // eslint-disable-line react-hooks/exhaustive-deps

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
      <div ref={canvasRef as any} style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
        <Sidebar onExport={() => setShowExport(true)} />
        <div style={{ width: 240, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <EditorPanel />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DocumentViewer onExport={() => setShowExport(true)} />
        </div>

        {/* Live cursors overlay */}
        <LiveCursors containerRef={canvasRef} />

        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </div>
    </PageLayoutProvider>
  )
}
