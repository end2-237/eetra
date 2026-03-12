'use client'

import { DocumentProvider } from '@/contexts/DocumentContext'
import { EditorLayout } from '@/components/editor/EditorLayout'

export default function EditorPage() {
  return (
    <DocumentProvider>
      <EditorLayout />
    </DocumentProvider>
  )
}
