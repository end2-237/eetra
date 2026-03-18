'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { useHistory } from '@/contexts/HistoryContext'
import { CoverPage } from './document/CoverPage'
import { ContentPage } from './document/ContentPage'
import { formatDate, generateSignature, buildQrUrl } from '@/lib/utils'

export function Canvas() {
  const { zoom, pages, docId, addPage, title, docStyle, overflowBlock } = useDocument()
  const { profile } = useProfile()
  const { addEntry } = useHistory()
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handlePageOverflow = useCallback((pageId: string, blockId: string) => {
    overflowBlock(pageId, blockId)
  }, [overflowBlock])

  // ─── High-quality print-based PDF export ─────────────────────────────────
  const handlePrintPDF = useCallback(async () => {
    document.body.classList.add('pdf-exporting')
    const prevTitle = document.title
    document.title = `EETRA-${profile.name || 'Document'}-${docId}`

    // Small delay to let CSS apply
    await new Promise(r => setTimeout(r, 200))

    window.print()

    setTimeout(() => {
      document.body.classList.remove('pdf-exporting')
      document.title = prevTitle
    }, 500)

    // Log to history
    const sig = generateSignature(docId, profile.name || 'EETRA', Date.now())
    const allBlocks = pages.flatMap(p => p.blocks)
    addEntry({
      id: Math.random().toString(36).slice(2, 10),
      docId,
      title: title || 'Sans titre',
      entityName: profile.name || 'EETRA',
      type: 'PDF Export',
      pageCount: pages.length + 1,
      blockCount: allBlocks.length,
      signature: sig,
      qrData: buildQrUrl(docId, sig),
    })
  }, [profile, docId, pages, title, addEntry])

  // ─── Fallback: html2pdf for inline download (optional) ───────────────────
  const handleHtml2PdfExport = useCallback(async () => {
    if (typeof window === 'undefined') return
    const html2pdf = (await import('html2pdf.js')).default
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const orig = wrapper.style.transform
    wrapper.style.transform = 'none'
    document.body.classList.add('pdf-exporting')

    try {
      await html2pdf().set({
        margin: 0,
        filename: `EETRA-${profile.name || 'Document'}-${docId}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, logging: false, allowTaint: false },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait', compress: true },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      }).from(wrapper).save()
    } finally {
      document.body.classList.remove('pdf-exporting')
      wrapper.style.transform = orig
    }
  }, [profile, docId])

  // ─── Listen for export events ──────────────────────────────────────────────
  useEffect(() => {
    const handlePrint = () => handlePrintPDF()
    const handleDownload = async () => {
      // Log then download
      await handleHtml2PdfExport()
      const sig = generateSignature(docId, profile.name || 'EETRA', Date.now())
      const allBlocks = pages.flatMap(p => p.blocks)
      addEntry({
        id: Math.random().toString(36).slice(2, 10),
        docId,
        title: title || 'Sans titre',
        entityName: profile.name || 'EETRA',
        type: 'PDF Export',
        pageCount: pages.length + 1,
        blockCount: allBlocks.length,
        signature: sig,
        qrData: buildQrUrl(docId, sig),
      })
    }

    // Main export (print-quality)
    window.addEventListener('eetra:export-pdf', handlePrint)
    // Alternative download event (html2pdf)
    window.addEventListener('eetra:download-pdf', handleDownload)
    return () => {
      window.removeEventListener('eetra:export-pdf', handlePrint)
      window.removeEventListener('eetra:download-pdf', handleDownload)
    }
  }, [handlePrintPDF, handleHtml2PdfExport, profile, docId, pages, title, addEntry])

  return (
    <div id="canvas" className="flex-1 overflow-auto flex justify-center"
      style={{ background: 'var(--bg3)', padding: '40px 40px 80px' }}>
      <div
        ref={wrapperRef}
        id="pages-wrapper"
        className="flex flex-col items-center"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform .2s',
        }}
      >
        <CoverPage
          name={profile.name}
          tagline={profile.tagline}
          signer={profile.signer}
          color={profile.color}
          logoDataUrl={profile.logoDataUrl}
          email={profile.email}
          web={profile.web}
          city={profile.city}
          docId={docId}
          date={formatDate(new Date())}
        />
        {pages.map((page, i) => (
          <ContentPage
            key={page.id}
            page={page}
            pageNumber={i + 2}
            onOverflow={handlePageOverflow}
          />
        ))}
        <button data-add-page onClick={addPage} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
