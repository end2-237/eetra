'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Clock, Trash2, Download, Search, Shield, ArrowLeft } from 'lucide-react'
import { useHistory } from '@/contexts/HistoryContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'

export default function HistoryPage() {
  const router = useRouter()
  const { entries, removeEntry, clearHistory } = useHistory()
  const [search, setSearch] = useState('')

  const filtered = entries.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.entityName.toLowerCase().includes(search.toLowerCase()) ||
    e.docId.toLowerCase().includes(search.toLowerCase())
  )

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
            <span className="text-[12px]" style={{ color: 'var(--text4)' }}>/ Historique</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {entries.length > 0 && (
            <Button variant="danger" size="sm" onClick={() => {
              if (window.confirm('Vider tout l\'historique ?')) clearHistory()
            }}>
              <Trash2 size={12} /> Vider
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h1 className="text-[28px] font-black tracking-tight mb-1" style={{ color: 'var(--text)' }}>
            Historique des Documents
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
            {entries.length} document{entries.length > 1 ? 's' : ''} généré{entries.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par titre, entité, ID..."
            className="w-full rounded-xl px-3.5 py-3 pl-10 text-[13px] border outline-none font-sans"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <Clock size={40} style={{ color: 'var(--text4)', margin: '0 auto 16px' }} />
            <div className="text-[16px] font-bold mb-2" style={{ color: 'var(--text2)' }}>
              {search ? 'Aucun résultat' : 'Aucun document généré'}
            </div>
            <p className="text-[13px]" style={{ color: 'var(--text4)' }}>
              {search ? 'Modifiez votre recherche.' : 'Exportez un document PDF pour qu\'il apparaisse ici.'}
            </p>
            {!search && (
              <Button variant="primary" size="sm" style={{ marginTop: 16 }} onClick={() => router.push('/editor')}>
                Créer un document →
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(entry => (
              <div key={entry.id}
                className="rounded-xl border p-5 flex items-start gap-5"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

                {/* QR Code */}
                <div className="flex-shrink-0">
                  <img
                    src={entry.qrData}
                    alt="QR"
                    style={{ width: 64, height: 64, borderRadius: 8, border: '1px solid var(--border)' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <div className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
                        {entry.title || 'Sans titre'}
                      </div>
                      <div className="text-[12px]" style={{ color: 'var(--text4)' }}>
                        {entry.entityName} · {entry.pageCount} page{entry.pageCount > 1 ? 's' : ''} · {entry.blockCount} blocs
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-mono text-[10px]" style={{ color: 'var(--accent)' }}>{entry.docId}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--text4)' }}>
                        {entry.exportedAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' '}à{' '}
                        {entry.exportedAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Signature */}
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 mt-2"
                    style={{ background: 'var(--bg3)' }}>
                    <Shield size={11} color="var(--success)" />
                    <span className="font-mono text-[9px] truncate" style={{ color: 'var(--text4)' }}>
                      {entry.signature}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold cursor-pointer border transition-all"
                    style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }}
                    onMouseEnter={e => { (e.currentTarget).style.background = '#FEE2E2'; (e.currentTarget).style.borderColor = '#FCA5A5'; (e.currentTarget).style.color = '#DC2626'; }}
                    onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text4)'; }}
                  >
                    <Trash2 size={11} /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
