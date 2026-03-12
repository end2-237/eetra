'use client'

import { useEffect, useRef } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { CoverPage } from './document/CoverPage'
import { ContentPage } from './document/ContentPage'
import { formatDate } from '@/lib/utils'

export function Canvas() {
  const { zoom, pages, docId, addPage } = useDocument()
  const { profile } = useProfile()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Listen for PDF export event
  useEffect(() => {
    const handler = async () => {
      if (typeof window === 'undefined') return
      // @ts-ignore — html2pdf loaded via CDN fallback
      const html2pdf = (await import('html2pdf.js')).default
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const orig = wrapper.style.transform
      wrapper.style.transform = 'none'
      await html2pdf().set({
        margin: 0,
        filename: `EETRA-${profile.name || 'Document'}-${docId}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
      }).from(wrapper).save()
      wrapper.style.transform = orig
    }
    window.addEventListener('eetra:export-pdf', handler)
    return () => window.removeEventListener('eetra:export-pdf', handler)
  }, [profile, docId])

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
          <ContentPage key={page.id} page={page} pageNumber={i + 2} />
        ))}
        {/* Hidden trigger for PagesPanel */}
        <button data-add-page onClick={addPage} style={{ display: 'none' }} />
      </div>
    </div>
  )
}
