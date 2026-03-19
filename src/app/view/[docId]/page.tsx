'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FileText, Lock, Download, ExternalLink } from 'lucide-react'

interface SharedDoc {
  id: string
  title: string
  subtitle?: string
  entityName?: string
  confidentiality?: string
  pages?: any[]
  docStyle?: any
  exportedAt?: string
}

export default function ViewDocPage() {
  const params = useParams()
  const docId = params?.docId as string
  const [doc, setDoc] = useState<SharedDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Try to find document from library (localStorage)
    try {
      const libraryRaw = localStorage.getItem('eetra-library')
      if (libraryRaw) {
        const library: SharedDoc[] = JSON.parse(libraryRaw)
        const found = library.find(d => d.id === docId || d.id === decodeURIComponent(docId))
        if (found) { setDoc(found); setLoading(false); return }
      }
      // Try history
      const historyRaw = localStorage.getItem('eetra-history')
      if (historyRaw) {
        const history: SharedDoc[] = JSON.parse(historyRaw)
        const found = history.find(d => d.id === docId)
        if (found) { setDoc(found); setLoading(false); return }
      }
    } catch {}
    setNotFound(true)
    setLoading(false)
  }, [docId])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', items: 'center', justifyContent: 'center', background: '#F5F7FA' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 48 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1B4FD8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: 13, color: '#aaa' }}>Chargement du document...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (notFound || !doc) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F7FA', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F0F4FF', border: '2px solid #E0E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Lock size={24} color="#1B4FD8" />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0D1117', marginBottom: 8 }}>Document introuvable</h1>
        <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
          Ce lien est invalide, a expiré, ou le document n'est plus disponible.
        </p>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#1B4FD8', color: '#fff', borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
          <ExternalLink size={13} /> Créer un document
        </a>
      </div>
    </div>
  )

  const pageCount = doc.pages?.length || 1
  const blockCount = doc.pages?.reduce((acc: number, p: any) => acc + (p.blocks?.length || 0), 0) || 0
  const accent = doc.docStyle?.accentColor || '#1B4FD8'

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0D1117', letterSpacing: '-.01em' }}>EETRA</span>
        </div>
        <span style={{ fontSize: 11, color: '#bbb' }}>Document partagé — lecture seule</span>
      </div>

      {/* Document info card */}
      <div style={{ maxWidth: 800, margin: '48px auto', padding: '0 24px' }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8e8e8', overflow: 'hidden', marginBottom: 24 }}>
          {/* Cover strip */}
          <div style={{ height: 120, background: accent, position: 'relative', overflow: 'hidden', padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.06)' }} />
            {doc.confidentiality && (
              <div style={{ position: 'absolute', top: 20, right: 24, fontSize: 9, fontWeight: 800, letterSpacing: '.2em', padding: '3px 8px', background: 'rgba(255,255,255,.15)', color: '#fff', borderRadius: 4 }}>
                {doc.confidentiality}
              </div>
            )}
            {doc.subtitle && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)', marginBottom: 6 }}>{doc.subtitle}</div>}
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1.1, margin: 0 }}>
              {doc.title || 'Document EETRA'}
            </h1>
          </div>

          {/* Meta */}
          <div style={{ padding: '24px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Émetteur', value: doc.entityName || '—' },
                { label: 'Pages', value: String(pageCount) },
                { label: 'Blocs de contenu', value: String(blockCount) },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '12px 16px', background: '#F8F9FB', borderRadius: 10 }}>
                  <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#bbb', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: 16, background: '#FFF9F0', border: '1px solid #FDE68A', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Lock size={16} color="#D97706" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>Accès limité à la prévisualisation</div>
                <div style={{ fontSize: 11, color: '#B45309', marginTop: 2 }}>
                  Pour accéder au document complet, demandez un accès à l'émetteur ou créez un compte EETRA.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a
                href="/editor"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: accent, color: '#fff', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}
              >
                <FileText size={14} /> Créer mon propre document
              </a>
              <button
                onClick={() => window.print()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 20px', background: '#fff', color: '#555', border: '1px solid #e8e8e8', borderRadius: 12, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
              >
                <Download size={14} /> Imprimer
              </button>
            </div>
          </div>
        </div>

        {/* Page summaries */}
        {doc.pages && doc.pages.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: '#bbb', marginBottom: 12 }}>
              Aperçu du contenu ({doc.pages.length} page{doc.pages.length > 1 ? 's' : ''})
            </div>
            {doc.pages.map((page: any, i: number) => (
              <div key={page.id || i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', padding: '16px 20px', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 9, fontWeight: 900, color: accent }}>{i + 1}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#555' }}>Page {i + 1} — {page.blocks?.length || 0} blocs</span>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(page.blocks || []).slice(0, 6).map((block: any, bi: number) => (
                    <span key={bi} style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#F5F7FA', color: '#888', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                      {block.type}
                    </span>
                  ))}
                  {(page.blocks?.length || 0) > 6 && <span style={{ fontSize: 9, color: '#bbb' }}>+{page.blocks.length - 6} autres</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: '#ccc' }}>
          Document généré par <strong style={{ color: '#888' }}>EETRA</strong> · Plateforme de documents professionnels
        </div>
      </div>
    </div>
  )
}
