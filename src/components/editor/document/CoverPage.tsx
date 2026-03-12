'use client'

import { useDocument } from '@/contexts/DocumentContext'

interface Props {
  name: string; tagline: string; signer: string; color: string
  logoDataUrl: string | null; email: string; web: string; city: string
  docId: string; date: string
}

export function CoverPage({ name, tagline, signer, color, logoDataUrl, email, web, city, docId, date }: Props) {
  const { title, subtitle, ref, destination, confidentiality } = useDocument()
  const co = color || '#1B4FD8'

  const titleWords = (title || 'TITRE DU DOCUMENT').toUpperCase().split(' ')
  const mid = Math.ceil(titleWords.length / 2)
  const titleLine1 = titleWords.slice(0, mid).join(' ')
  const titleLine2 = titleWords.slice(mid).join(' ')

  return (
    <div id="cover-page"
      style={{
        width: 794, height: 1123, background: '#fff', color: '#111',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,.12), 0 16px 48px rgba(0,0,0,.1)',
        marginBottom: 28, fontFamily: 'Bricolage Grotesque, sans-serif',
      }}>
      {/* Left color band */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 6, height: '100%', background: co }} />
      {/* Top gradient */}
      <div style={{ position: 'absolute', top: 0, left: 6, right: 0, height: 3, background: `linear-gradient(90deg,${co}88,transparent)` }} />

      {/* Header */}
      <div style={{ padding: '52px 64px 0 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, background: co, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {logoDataUrl
              ? <img src={logoDataUrl} style={{ maxWidth: 44, maxHeight: 44, objectFit: 'contain' }} alt="" />
              : <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-.5px' }}>{(name || 'EE').slice(0, 2)}</div>
            }
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>{name || 'EETRA'}</div>
            <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#999', marginTop: 1 }}>{tagline || 'Document d\'Entreprise'}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: '#bbb' }}>{confidentiality}</div>
          <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: '#ccc', marginTop: 2 }}>{docId}</div>
        </div>
      </div>

      {/* Center content */}
      <div style={{ position: 'absolute', top: '45%', transform: 'translateY(-50%)', left: 64, right: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 40, height: 3, background: co, borderRadius: 2 }} />
          <div style={{ flex: 1, height: 1, background: '#e8e8e8' }} />
        </div>

        <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 500, letterSpacing: '.2em', textTransform: 'uppercase', color: co, marginBottom: 12 }}>
          Document Stratégique
        </div>

        <h1 style={{ fontWeight: 900, fontSize: 64, letterSpacing: '-.03em', lineHeight: .92, textTransform: 'uppercase', color: '#111', marginBottom: 18 }}>
          {titleLine1}<br />{titleLine2}
        </h1>

        <p style={{ fontFamily: 'Libre Caslon Text, serif', fontSize: 22, fontStyle: 'italic', fontWeight: 400, color: '#888', marginBottom: 36 }}>
          {subtitle || 'Sous-titre du document'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
          {[
            ['Date', date],
            ['Signataire', signer || 'Direction Générale'],
            ['Destinataire', destination || '—'],
            ['Référence', ref || '—'],
          ].map(([label, value], i) => (
            <div key={label} style={{ padding: '14px 16px', borderRight: i < 3 ? '1px solid #e8e8e8' : 'none' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111', fontFamily: label === 'Référence' ? 'DM Mono, monospace' : 'inherit' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, background: co, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px' }}>
        <span style={{ fontWeight: 800, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)' }}>{name || 'EETRA'}</span>
        <div style={{ display: 'flex', gap: 24, fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,.5)' }}>
          {email && <span>{email}</span>}
          {web && <span>{web}</span>}
          {city && <span>{city}</span>}
        </div>
      </div>
      <div style={{ position: 'absolute', right: 20, bottom: 80, fontFamily: 'Libre Caslon Text, serif', fontSize: 32, fontStyle: 'italic', fontWeight: 300, color: '#ddd' }}>01</div>
    </div>
  )
}
