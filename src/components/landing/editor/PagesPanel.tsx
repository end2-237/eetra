'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { X } from 'lucide-react'

export function PagesPanel() {
  const { pages, currentPageIndex, setCurrentPageIndex, removePage } = useDocument()
  const { profile } = useProfile()
  const co = profile.color

  const handleDelete = (e: React.MouseEvent, pageId: string, i: number) => {
    e.stopPropagation()
    if (window.confirm(`Supprimer la page ${i + 2} ?`)) {
      removePage(pageId)
    }
  }

  return (
    <div className="w-[140px] min-w-[140px] border-r flex flex-col overflow-y-auto p-2"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="text-[9px] font-bold uppercase tracking-widest text-center mb-3"
        style={{ color: 'var(--text4)' }}>
        Pages
      </div>

      {/* Cover thumb */}
      <div className="text-[8px] uppercase tracking-widest text-center mb-1.5"
        style={{ color: 'var(--text4)' }}>Couverture</div>
      <div
        onClick={() => {
          document.getElementById('cover-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        className="w-full rounded border-2 cursor-pointer mb-3 overflow-hidden"
        style={{
          aspectRatio: '0.707',
          background: co,
          borderColor: currentPageIndex === -1 ? 'var(--text)' : 'transparent',
        }}
      >
        <div className="w-full h-full flex flex-col justify-end p-1.5">
          <div className="text-[5px] font-black leading-tight" style={{ color: 'rgba(255,255,255,.8)' }}>
            COUV<br />P.01
          </div>
        </div>
      </div>

      {pages.length > 0 && (
        <div className="text-[8px] uppercase tracking-widest text-center mb-1.5"
          style={{ color: 'var(--text4)' }}>Contenu</div>
      )}

      {pages.map((page, i) => (
        <div
          key={page.id}
          className="group relative"
          style={{ marginBottom: 8 }}
        >
          <div
            onClick={() => {
              setCurrentPageIndex(i)
              document.getElementById(`page-${page.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="w-full rounded border-2 cursor-pointer overflow-hidden transition-all"
            style={{
              aspectRatio: '0.707',
              background: '#fff',
              borderColor: currentPageIndex === i ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <div className="w-full h-full flex flex-col bg-white p-1">
              <div className="h-0.5 w-full mb-1" style={{ background: co, opacity: .35 }} />
              <div className="flex-1 flex items-center justify-center">
                <span className="text-[5px] font-bold" style={{ color: '#bbb' }}>
                  P.{String(i + 2).padStart(2, '0')}
                </span>
              </div>
              <div className="h-px w-full" style={{ background: '#f0f0f0' }} />
            </div>
          </div>

          {/* Delete button — visible on hover */}
          <button
            onClick={(e) => handleDelete(e, page.id, i)}
            className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              width: 16, height: 16, borderRadius: '50%',
              background: '#DC2626', border: '1.5px solid #fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', padding: 0,
            }}
            title="Supprimer la page"
          >
            <X size={8} strokeWidth={3} />
          </button>
        </div>
      ))}

      <button
        onClick={() => {
          const el = document.querySelector('[data-add-page]') as HTMLElement
          el?.click()
        }}
        className="w-full py-1.5 rounded border border-dashed text-[10px] cursor-pointer transition-all"
        style={{ borderColor: 'var(--border2)', color: 'var(--text4)', background: 'transparent' }}
        onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--accent)'; (e.currentTarget).style.color = 'var(--accent)'; }}
        onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border2)'; (e.currentTarget).style.color = 'var(--text4)'; }}
      >
        + Page
      </button>
    </div>
  )
}
