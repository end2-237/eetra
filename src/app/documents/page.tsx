'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Plus, Search, Trash2, Copy, ArrowLeft,
  Clock, Layers, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react'
import { useLibrary } from '@/contexts/LibraryContext'
import { useProfile } from '@/contexts/ProfileContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const STORAGE_DRAFT = 'eetra-document-draft'

const CONF_COLORS: Record<string, string> = {
  'CONFIDENTIEL':            '#DC2626',
  'STRICTEMENT CONFIDENTIEL':'#7C3AED',
  'USAGE INTERNE':           '#D97706',
  'PUBLIC':                  '#059669',
}

const CSS = `
  .docs-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }

  .docs-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .docs-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .docs-back:hover { color:var(--text); }
  .docs-sep { font-size:14px; color:var(--border2); }
  .docs-page-title { font-size:14px; font-weight:700; color:var(--text); }

  .docs-body { max-width:1100px; margin:0 auto; padding:24px 20px 48px; }

  .docs-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
  .docs-h1  { font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .docs-sub { font-size:12px; color:var(--text4); margin:0; }

  .docs-controls { display:flex; gap:10px; margin-bottom:18px; align-items:center; }
  .docs-search { display:flex; align-items:center; gap:7px; border:1px solid var(--border); border-radius:6px; padding:4px 10px; background:var(--surface); transition:border-color .15s; height:30px; flex:1; max-width:340px; }
  .docs-search:focus-within { border-color:var(--accent); }
  .docs-search input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:100%; }
  .docs-search input::placeholder { color:var(--text4); }

  .docs-sort-btn { display:flex; align-items:center; gap:5px; padding:4px 11px; height:30px; border-radius:6px; border:1px solid var(--border); background:transparent; font-size:11px; font-weight:500; color:var(--text4); cursor:pointer; transition:all .12s; }
  .docs-sort-btn:hover { border-color:var(--border2); color:var(--text); background:var(--bg3); }
  .docs-sort-btn.active { border-color:var(--accent); color:var(--accent); background:var(--accentS); font-weight:600; }

  /* Table */
  .docs-table { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
  .docs-th { display:grid; gap:10px; padding:7px 16px; background:var(--bg2); border-bottom:1px solid var(--border); }
  .docs-th span { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); display:flex; align-items:center; gap:4px; cursor:pointer; user-select:none; }
  .docs-th span:hover { color:var(--text3); }
  .docs-tr { display:grid; gap:10px; padding:10px 16px; border-bottom:1px solid var(--border); align-items:center; cursor:pointer; transition:background .1s; }
  .docs-tr:last-child { border-bottom:none; }
  .docs-tr:hover { background:var(--bg2); }
  .docs-tr:hover .docs-row-actions { opacity:1; }
  .docs-row-actions { opacity:0; transition:opacity .15s; display:flex; gap:5px; }

  .docs-name { display:flex; align-items:center; gap:10px; min-width:0; }
  .docs-icon-box { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .docs-title { font-size:13px; font-weight:600; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .docs-entity { font-size:11px; color:var(--text4); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:1px; }

  .docs-conf { display:inline-block; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:600; }

  .act-btn { width:26px; height:26px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; color:var(--text4); }
  .act-btn:hover { border-color:var(--border2); background:var(--bg3); color:var(--text); }
  .act-btn.danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }

  /* Empty */
  .docs-empty { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:52px 24px; text-align:center; }
  .docs-empty-title { font-size:14px; font-weight:600; color:var(--text2); margin:12px 0 6px; }
  .docs-empty-sub { font-size:12px; color:var(--text4); margin:0 0 18px; }

  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-sm { padding:4px 10px; font-size:11px; }
`

type SortKey = 'date' | 'title' | 'pages'
type SortDir = 'asc' | 'desc'

export default function DocumentsPage() {
  const router = useRouter()
  const { documents, deleteDocument, duplicateDocument } = useLibrary()
  const { profile } = useProfile()

  const [search,  setSearch]  = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = documents
    .filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.entityName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.ref || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date')  cmp = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      if (sortKey === 'pages') cmp = (a.pageCount || 0) - (b.pageCount || 0)
      return sortDir === 'asc' ? -cmp : cmp
    })

  const newDoc = () => {
    try { localStorage.removeItem(STORAGE_DRAFT) } catch {}
    router.push('/editor')
  }

  const openDoc = (docId: string) => {
    const doc = documents.find(d => d.id === docId)
    if (!doc) return
    try {
      localStorage.setItem(STORAGE_DRAFT, JSON.stringify({
        title: doc.title, subtitle: doc.subtitle, ref: doc.ref,
        destination: doc.destination, confidentiality: doc.confidentiality,
        pages: doc.pages, docStyle: doc.docStyle,
      }))
    } catch {}
    router.push('/editor')
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={10} style={{ opacity:.4 }}/>
    return sortDir === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>
  }

  const cols = '1fr 130px 110px 70px 100px 80px'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="docs-page">

        {/* Topbar */}
        <header className="docs-top">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="docs-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13}/> Tableau de bord
            </button>
            <span className="docs-sep">/</span>
            <span className="docs-page-title">Documents</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ThemeToggle/>
            <button className="btn-primary btn-sm" onClick={newDoc}>
              <Plus size={12}/> Nouveau document
            </button>
          </div>
        </header>

        <div className="docs-body">

          {/* Page header */}
          <div className="docs-header">
            <div>
              <h1 className="docs-h1">Documents</h1>
              <p className="docs-sub">
                {documents.length} document{documents.length !== 1 ? 's' : ''} sauvegardé{documents.length !== 1 ? 's' : ''}
                {profile.name ? ` · ${profile.name}` : ''}
              </p>
            </div>
            <button className="btn-primary" onClick={newDoc}>
              <Plus size={13}/> Nouveau document
            </button>
          </div>

          {/* Controls */}
          <div className="docs-controls">
            <div className="docs-search">
              <Search size={12} color="var(--text4)"/>
              <input
                placeholder="Rechercher par titre, entité, référence…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                maxLength={100}
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="docs-empty">
              <FileText size={28} color="var(--text4)" style={{ margin:'0 auto' }}/>
              <div className="docs-empty-title">
                {search ? 'Aucun résultat' : 'Aucun document sauvegardé'}
              </div>
              <p className="docs-empty-sub">
                {search ? 'Modifiez votre recherche.' : 'Créez votre premier document professionnel.'}
              </p>
              {!search && (
                <button className="btn-primary btn-sm" onClick={newDoc}>
                  <Plus size={11}/> Créer un document
                </button>
              )}
            </div>
          ) : (
            <div className="docs-table">

              {/* Header */}
              <div className="docs-th" style={{ gridTemplateColumns:cols }}>
                <span onClick={() => toggleSort('title')}>Titre <SortIcon col="title"/></span>
                <span>Entreprise</span>
                <span>Confidentialité</span>
                <span onClick={() => toggleSort('pages')}>Pages <SortIcon col="pages"/></span>
                <span onClick={() => toggleSort('date')}>Modifié <SortIcon col="date"/></span>
                <span></span>
              </div>

              {/* Rows */}
              {filtered.map(doc => {
                const confColor = CONF_COLORS[doc.confidentiality] || '#6B7280'
                const accent    = doc.docStyle?.accentColor || 'var(--accent)'
                return (
                  <div key={doc.id} className="docs-tr" style={{ gridTemplateColumns:cols }} onClick={() => openDoc(doc.id)}>

                    {/* Title + ref */}
                    <div className="docs-name">
                      <div className="docs-icon-box" style={{ background:`${accent}12` }}>
                        <FileText size={13} color={accent}/>
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div className="docs-title">{doc.title || 'Sans titre'}</div>
                        {doc.ref && <div style={{ fontSize:10, color:'var(--text4)', fontFamily:'monospace', marginTop:1 }}>{doc.ref}</div>}
                      </div>
                    </div>

                    {/* Entity */}
                    <span style={{ fontSize:12, color:'var(--text4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {doc.entityName || '—'}
                    </span>

                    {/* Confidentiality */}
                    <span>
                      <span className="docs-conf" style={{ background:`${confColor}10`, color:confColor }}>
                        {doc.confidentiality || '—'}
                      </span>
                    </span>

                    {/* Pages */}
                    <span style={{ fontSize:12, color:'var(--text4)' }}>{doc.pageCount || 0}p</span>

                    {/* Date */}
                    <span style={{ fontSize:12, color:'var(--text4)' }}>
                      {new Date(doc.updatedAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'2-digit' })}
                    </span>

                    {/* Actions */}
                    <div className="docs-row-actions" onClick={e => e.stopPropagation()}>
                      <button className="act-btn" title="Dupliquer" onClick={() => duplicateDocument(doc.id)}>
                        <Copy size={11}/>
                      </button>
                      <button className="act-btn danger" title="Supprimer"
                        onClick={() => { if (window.confirm('Supprimer ce document définitivement ?')) deleteDocument(doc.id) }}>
                        <Trash2 size={11}/>
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </>
  )
}