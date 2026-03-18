'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Search, Trash2, Copy, ArrowLeft, Clock, Layers } from 'lucide-react'
import { useLibrary } from '@/contexts/LibraryContext'
import { useProfile } from '@/contexts/ProfileContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

const STORAGE_DRAFT = 'eetra-document-draft'

const CONF_COLORS: Record<string, string> = {
  'CONFIDENTIEL': '#DC2626',
  'STRICTEMENT CONFIDENTIEL': '#7C3AED',
  'USAGE INTERNE': '#D97706',
  'PUBLIC': '#059669',
}

export default function DocumentsPage() {
  const router = useRouter()
  const { documents, deleteDocument, duplicateDocument } = useLibrary()
  const { profile } = useProfile()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')

  const filtered = documents
    .filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.entityName?.toLowerCase().includes(search.toLowerCase()) ||
      d.ref?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortBy === 'date'
      ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      : a.title.localeCompare(b.title)
    )

  // FIX: Write document state to STORAGE_DRAFT before navigating.
  // DocumentContext reads from STORAGE_DRAFT on mount, so this
  // correctly loads all pages + blocks without the "setPageBlocks on
  // non-existent page" bug that caused blank document reloads.
  const handleOpenDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return

    try {
      const draftPayload = {
        title: doc.title,
        subtitle: doc.subtitle,
        ref: doc.ref,
        destination: doc.destination,
        confidentiality: doc.confidentiality,
        pages: doc.pages,
        docStyle: doc.docStyle,
      }
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify(draftPayload))
    } catch (err) {
      console.error('[EETRA] Failed to write draft for document load', err)
    }

    router.push('/editor')
  }

  const handleNewDocument = () => {
    try {
      localStorage.removeItem(STORAGE_DRAFT)
    } catch {}
    router.push('/editor')
  }

  const handleDuplicate = (id: string) => {
    duplicateDocument(id)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text4)' }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FileText size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
            <span className="text-[12px]" style={{ color: 'var(--text4)' }}>/ Mes Documents</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="primary" size="sm" onClick={handleNewDocument}>
            <Plus size={13} /> Nouveau Document
          </Button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto w-full px-6 py-10">
        {/* Title + stats */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              Bibliothèque de Documents
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
              {documents.length} document{documents.length > 1 ? 's' : ''} sauvegardé{documents.length > 1 ? 's' : ''}
              {profile.name && ` · ${profile.name}`}
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-[11px]" style={{ color: 'var(--text4)' }}>Trier :</span>
            {(['date', 'title'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer border transition-all"
                style={sortBy === s
                  ? { background: 'var(--accentS)', borderColor: 'var(--accent)', color: 'var(--accent)' }
                  : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }
                }
              >
                {s === 'date' ? 'Date' : 'Titre'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, entité, référence..."
            className="w-full rounded-xl px-3.5 py-3 pl-10 text-[13px] border outline-none font-sans"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            maxLength={100}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <FileText size={40} style={{ color: 'var(--text4)', margin: '0 auto 16px' }} />
            <div className="text-[16px] font-bold mb-2" style={{ color: 'var(--text2)' }}>
              {search ? 'Aucun résultat' : 'Aucun document sauvegardé'}
            </div>
            <p className="text-[13px] mb-4" style={{ color: 'var(--text4)' }}>
              {search ? 'Modifiez votre recherche.' : 'Créez votre premier document professionnel.'}
            </p>
            {!search && (
              <Button variant="primary" size="sm" onClick={handleNewDocument}>
                <Plus size={12} /> Créer un document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* New document card */}
            <div
              onClick={handleNewDocument}
              className="rounded-2xl border-2 border-dashed p-5 flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{ borderColor: 'var(--border2)', minHeight: 160 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--accentS)' }}>
                <Plus size={18} color="var(--accent)" />
              </div>
              <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>Nouveau Document</span>
            </div>

            {filtered.map(doc => {
              const confColor = CONF_COLORS[doc.confidentiality] || '#6B7280'
              const updatedAt = new Date(doc.updatedAt)
              return (
                <div
                  key={doc.id}
                  className="rounded-2xl border p-5 cursor-pointer transition-all group"
                  style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
                  onClick={() => handleOpenDocument(doc.id)}
                >
                  <div className="w-full h-1 rounded-full mb-4" style={{ background: doc.docStyle?.accentColor || 'var(--accent)' }} />

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${confColor}15`, color: confColor }}>
                      {doc.confidentiality}
                    </span>
                    <span className="font-mono text-[9px]" style={{ color: 'var(--text4)' }}>{doc.ref || '—'}</span>
                  </div>

                  <div className="text-[14px] font-bold mb-1 leading-tight" style={{ color: 'var(--text)' }}>
                    {doc.title || 'Sans titre'}
                  </div>
                  <div className="text-[11px] mb-3" style={{ color: 'var(--text4)' }}>
                    {doc.subtitle || doc.entityName || '—'}
                  </div>

                  <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text4)' }}>
                    <span className="flex items-center gap-1"><Layers size={10} /> {doc.pageCount} page{doc.pageCount > 1 ? 's' : ''}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />
                      {updatedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleDuplicate(doc.id) }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border"
                      style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg3)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <Copy size={10} /> Dupliquer
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        if (window.confirm('Supprimer ce document définitivement ?')) deleteDocument(doc.id)
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer border"
                      style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text4)'; }}
                    >
                      <Trash2 size={10} /> Supprimer
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
