'use client'

import { useEffect, useState } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useToast } from '@/hooks/useToast'
import { useAutoSave } from '@/hooks/useAutoSave'
import { Toast } from '@/components/ui/Toast'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { PagesPanel } from './PagesPanel'
import { Canvas } from './Canvas'
import { EditorPanel } from './panels/EditorPanel'
import { TemplatesPanel } from './panels/TemplatesPanel'
import { AnalyticsPanel } from './panels/AnalyticsPanel'
import { CommentsPanel } from './panels/CommentsPanel'

export function EditorLayout() {
  const { addPage, activeTab, modified, markSaved } = useDocument()
  const { toast, showToast } = useToast()
  const [status, setStatus] = useState('Document actif')

  // Initialize first page
  useEffect(() => {
    addPage()
  }, []) // eslint-disable-line

  useAutoSave(modified, () => {
    markSaved()
    setStatus('Sauvegardé ✓')
    setTimeout(() => setStatus('Document actif'), 2000)
  })

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar showToast={showToast} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar status={status} showToast={showToast} />

        <div className="flex-1 flex overflow-hidden">
          {/* Tab panels */}
          <div style={{ display: activeTab === 'editor'    ? 'flex' : 'none' }}><EditorPanel showToast={showToast} /></div>
          <div style={{ display: activeTab === 'templates' ? 'flex' : 'none' }}><TemplatesPanel showToast={showToast} /></div>
          <div style={{ display: activeTab === 'analytics' ? 'flex' : 'none' }}><AnalyticsPanel /></div>
          <div style={{ display: activeTab === 'comments'  ? 'flex' : 'none' }}><CommentsPanel showToast={showToast} /></div>

          <PagesPanel />
          <Canvas />
        </div>
      </div>

      <Toast {...toast} />
    </div>
  )
}
