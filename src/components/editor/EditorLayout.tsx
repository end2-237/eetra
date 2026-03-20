'use client'

import { useEffect, useRef, useState } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { useCustomTemplates } from '@/contexts/CustomTemplateContext'
import { PageLayoutProvider } from '@/contexts/PageLayoutContext'
import { Sidebar } from './Sidebar'
import { EditorPanel } from './panels/EditorPanel'
import { LayoutPanel } from './panels/LayoutPanel'
import { DocumentViewer } from './document/DocumentViewer'
import { ExportModal } from './ExportModal'
import { useLibrary } from '@/contexts/LibraryContext'
import { TEMPLATES } from '@/lib/templates'
import type { DocBlock } from '@/types'
import { generateId } from '@/lib/utils'

export function EditorLayout() {
  const {
    pages, addPage, addBlock, setSelectedTemplate, docStyle,
    title, subtitle, ref: docRef, destination, confidentiality,
    resetDocument, setPageBlocks, setDocStyle,
    currentPageIndex,
  } = useDocument()
  const { profile } = useProfile()
  const { addNotification } = useNotifications()
  const { getTemplate } = useCustomTemplates()
  const { saveDocument } = useLibrary()

  const [showExport, setShowExport] = useState(false)
  const initDone = useRef(false)

  useEffect(() => {
    if (initDone.current) return
    initDone.current = true

    const pendingCustomId = sessionStorage.getItem('eetra-pending-custom-template')
    if (pendingCustomId) {
      sessionStorage.removeItem('eetra-pending-custom-template')
      const customTpl = getTemplate(pendingCustomId)
      if (customTpl) {
        if (customTpl.docStyle) setDocStyle(customTpl.docStyle)
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
        if (pages.length === 0) {
          addPage()
          setTimeout(() => tpl.blocks.forEach(b => addBlock(b.type, b.content)), 50)
        }
        addNotification({ type: 'success', title: 'Template chargé', message: `"${tpl.name}" prêt.` })
      }
    }
  }, [])

  // Auto-save to library
  useEffect(() => {
    if (!title && pages.every(p => p.blocks.length === 0)) return
    const timer = setTimeout(() => {
      saveDocument({
        id: 'current',
        title: title || 'Sans titre',
        subtitle, ref: docRef, destination, confidentiality,
        entityName: profile.name, pages, docStyle,
        pageCount: pages.length,
        blockCount: pages.reduce((c, p) => c + p.blocks.length, 0),
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [title, pages, docStyle])

  return (
    // PageLayoutProvider scoped to the editor — header/footer/watermark/hierarchy config
    <PageLayoutProvider>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* Left navigation sidebar */}
        <Sidebar onExport={() => setShowExport(true)} />

        {/* Block / layout panel (switches based on activeTab) */}
        <div style={{
          width: 240, flexShrink: 0, borderRight: '1px solid var(--border)',
          background: 'var(--surface)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <EditorPanel />
        </div>

        {/* Main document viewer */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <DocumentViewer onExport={() => setShowExport(true)} />
        </div>

        {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      </div>
    </PageLayoutProvider>
  )
}