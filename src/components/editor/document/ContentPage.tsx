'use client'

import { useRef } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { DocPage } from '@/types'
import { BlockRenderer } from '../blocks/BlockRenderer'
import { X } from 'lucide-react'

interface Props {
  page: DocPage
  pageNumber: number
}

export function ContentPage({ page, pageNumber }: Props) {
  const { title, confidentiality, docId, removeBlock } = useDocument()
  const { profile } = useProfile()
  const co = profile.color
  const name = profile.name || 'EETRA'

  return (
    <div
      id={`page-${page.id}`}
      style={{
        width: 794, minHeight: 1123, background: '#fff', color: '#111',
        position: 'relative', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,.12), 0 16px 48px rgba(0,0,0,.1)',
        marginBottom: 28, fontFamily: 'Bricolage Grotesque, sans-serif',
      }}
    >
      {/* Side accent */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: co, opacity: .25 }} />

      {/* Page header */}
      <div style={{ padding: '26px 56px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {profile.logoDataUrl && (
            <img src={profile.logoDataUrl} style={{ height: 18, maxWidth: 56, objectFit: 'contain' }} alt="" />
          )}
          <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: '.15em', textTransform: 'uppercase', color: '#aaa' }}>{name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#ccc', letterSpacing: '.04em' }}>
            {(title || '—').slice(0, 32)}
          </span>
          <span style={{ fontWeight: 700, fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: '#ccc', padding: '2px 7px', border: '1px solid #e8e8e8', borderRadius: 3 }}>
            {confidentiality}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px 56px', minHeight: 980, position: 'relative' }}>
        {page.blocks.length === 0 ? (
          <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: 12 }}>
            Ajoutez des blocs depuis le panneau gauche, ou choisissez un Smart Template.
          </p>
        ) : (
          page.blocks.map(block => (
            <div key={block.id} className="group relative" style={{ marginBottom: 20 }}>
              <BlockRenderer block={block} color={co} entityName={name} />
              {/* Delete button */}
              <button
                onClick={() => removeBlock(page.id, block.id)}
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  right: -32, top: '50%', transform: 'translateY(-50%)',
                  width: 24, height: 24, borderRadius: 5, background: '#fff',
                  border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#999',
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = '#FECACA'; (e.currentTarget).style.borderColor = '#FCA5A5'; (e.currentTarget).style.color = '#DC2626'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = '#fff'; (e.currentTarget).style.borderColor = '#e0e0e0'; (e.currentTarget).style.color = '#999'; }}
              >
                <X size={10} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Page footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 56px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 8, color: '#ccc', letterSpacing: '.06em' }}>
          {profile.watermark ? 'EETRA Document Platform · ' : ''}{docId}
        </span>
        <span style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: 26, fontStyle: 'italic', color: '#e8e8e8' }}>
          {String(pageNumber).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
