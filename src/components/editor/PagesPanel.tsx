'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'

export function PagesPanel() {
  const { pages, currentPageIndex, setCurrentPageIndex } = useDocument()
  const { profile } = useProfile()
  const co = profile.color

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
          onClick={() => {
            setCurrentPageIndex(i)
            document.getElementById(`page-${page.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="w-full rounded border-2 cursor-pointer mb-2 overflow-hidden transition-all"
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
