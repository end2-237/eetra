'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Clock, Trash2, Search, Shield, ArrowLeft, ArrowUpDown, ArrowDown, ArrowUp } from 'lucide-react'
import { useHistory } from '@/contexts/HistoryContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const CSS = `
  .hist-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }

  .hist-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .hist-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .hist-back:hover { color:var(--text); }
  .hist-sep { font-size:14px; color:var(--border2); }
  .hist-page-title { font-size:14px; font-weight:700; color:var(--text); }

  .hist-body { max-width:1100px; margin:0 auto; padding:24px 20px 48px; }

  .hist-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
  .hist-h1  { font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .hist-sub { font-size:12px; color:var(--text4); margin:0; }

  .hist-controls { display:flex; gap:10px; margin-bottom:18px; align-items:center; }
  .hist-search { display:flex; align-items:center; gap:7px; border:1px solid var(--border); border-radius:6px; padding:4px 10px; background:var(--surface); transition:border-color .15s; height:30px; flex:1; max-width:340px; }
  .hist-search:focus-within { border-color:var(--accent); }
  .hist-search input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:100%; }
  .hist-search input::placeholder { color:var(--text4); }

  /* Table */
  .hist-table { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
  .hist-th { display:grid; gap:10px; padding:7px 16px; background:var(--bg2); border-bottom:1px solid var(--border); align-items:center; }
  .hist-th span { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); display:flex; align-items:center; gap:4px; cursor:pointer; user-select:none; white-space:nowrap; }
  .hist-th span:hover { color:var(--text3); }
  .hist-tr { display:grid; gap:10px; padding:10px 16px; border-bottom:1px solid var(--border); align-items:center; transition:background .1s; }
  .hist-tr:last-child { border-bottom:none; }
  .hist-tr:hover { background:var(--bg2); }
  .hist-tr:hover .hist-row-actions { opacity:1; }
  .hist-row-actions { opacity:0; transition:opacity .15s; display:flex; gap:5px; }

  .hist-doc-name { display:flex; align-items:center; gap:10px; min-width:0; }
  .hist-icon-box { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .hist-title  { font-size:13px; font-weight:600; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .hist-entity { font-size:11px; color:var(--text4); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:1px; }

  /* QR cell */
  .hist-qr { width:40px; height:40px; border-radius:5px; border:1px solid var(--border); object-fit:contain; background:white; flex-shrink:0; }

  /* Signature pill */
  .hist-sig { display:flex; align-items:center; gap:5px; padding:3px 8px; border-radius:4px; background:var(--bg3); max-width:100%; overflow:hidden; }
  .hist-sig-text { font-family:monospace; font-size:9px; color:var(--text4); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* Doc ID */
  .hist-docid { font-family:monospace; font-size:10px; color:var(--accent); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

  /* Action button */
  .act-btn { width:26px; height:26px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; color:var(--text4); }
  .act-btn.danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }

  /* Empty */
  .hist-empty { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:52px 24px; text-align:center; }
  .hist-empty-title { font-size:14px; font-weight:600; color:var(--text2); margin:12px 0 6px; }
  .hist-empty-sub { font-size:12px; color:var(--text4); margin:0 0 18px; }

  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-sm { padding:4px 10px; font-size:11px; }
  .btn-danger { background:#DC2626; }
  .btn-danger:hover { opacity:.88; }
`

type SortKey = 'date' | 'title' | 'pages'
type SortDir = 'asc' | 'desc'

export default function HistoryPage() {
  const router = useRouter()
  const { entries, removeEntry, clearHistory } = useHistory()

  const [search,  setSearch]  = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = entries
    .filter(e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.entityName.toLowerCase().includes(search.toLowerCase()) ||
      e.docId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date')  cmp = b.exportedAt.getTime() - a.exportedAt.getTime()
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      if (sortKey === 'pages') cmp = (a.pageCount || 0) - (b.pageCount || 0)
      return sortDir === 'asc' ? -cmp : cmp
    })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={10} style={{ opacity:.4 }}/>
    return sortDir === 'asc' ? <ArrowUp size={10}/> : <ArrowDown size={10}/>
  }

  // cols: QR | Titre | Entité | ID | Blocs/Pages | Signature | Date | Actions
  const cols = '44px 1fr 130px 110px 80px 160px 110px 40px'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="hist-page">

        {/* Topbar */}
        <header className="hist-top">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="hist-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13}/> Tableau de bord
            </button>
            <span className="hist-sep">/</span>
            <span className="hist-page-title">Historique</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ThemeToggle/>
            {entries.length > 0 && (
              <button
                className="btn-primary btn-sm btn-danger"
                onClick={() => { if (window.confirm("Vider tout l'historique ?")) clearHistory() }}
              >
                <Trash2 size={11}/> Vider l'historique
              </button>
            )}
          </div>
        </header>

        <div className="hist-body">

          {/* Page header */}
          <div className="hist-header">
            <div>
              <h1 className="hist-h1">Historique des exports</h1>
              <p className="hist-sub">
                {entries.length} document{entries.length !== 1 ? 's' : ''} exporté{entries.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="hist-controls">
            <div className="hist-search">
              <Search size={12} color="var(--text4)"/>
              <input
                placeholder="Rechercher par titre, entité, ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="hist-empty">
              <Clock size={28} color="var(--text4)" style={{ margin:'0 auto' }}/>
              <div className="hist-empty-title">
                {search ? 'Aucun résultat' : 'Aucun export enregistré'}
              </div>
              <p className="hist-empty-sub">
                {search ? 'Modifiez votre recherche.' : 'Exportez un document PDF pour qu\'il apparaisse ici.'}
              </p>
              {!search && (
                <button className="btn-primary btn-sm" onClick={() => router.push('/editor')}>
                  Créer un document →
                </button>
              )}
            </div>
          ) : (
            <div className="hist-table">

              {/* Header */}
              <div className="hist-th" style={{ gridTemplateColumns:cols }}>
                <span style={{ cursor:'default' }}>QR</span>
                <span onClick={() => toggleSort('title')}>Titre <SortIcon col="title"/></span>
                <span>Entité</span>
                <span>Identifiant</span>
                <span onClick={() => toggleSort('pages')}>Taille <SortIcon col="pages"/></span>
                <span>Signature</span>
                <span onClick={() => toggleSort('date')}>Exporté le <SortIcon col="date"/></span>
                <span></span>
              </div>

              {/* Rows */}
              {filtered.map(entry => (
                <div key={entry.id} className="hist-tr" style={{ gridTemplateColumns:cols }}>

                  {/* QR */}
                  <div>
                    <img
                      src={entry.qrData}
                      alt="QR"
                      className="hist-qr"
                      onError={e => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
                    />
                  </div>

                  {/* Title */}
                  <div className="hist-doc-name">
                    <div className="hist-icon-box" style={{ background:'var(--accentS)' }}>
                      <FileText size={13} color="var(--accent)"/>
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div className="hist-title">{entry.title || 'Sans titre'}</div>
                    </div>
                  </div>

                  {/* Entity */}
                  <span style={{ fontSize:12, color:'var(--text4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {entry.entityName || '—'}
                  </span>

                  {/* Doc ID */}
                  <span className="hist-docid">{entry.docId}</span>

                  {/* Size */}
                  <span style={{ fontSize:12, color:'var(--text4)' }}>
                    {entry.pageCount}p · {entry.blockCount} blocs
                  </span>

                  {/* Signature */}
                  <div className="hist-sig">
                    <Shield size={10} color="var(--success)" style={{ flexShrink:0 }}/>
                    <span className="hist-sig-text">{entry.signature}</span>
                  </div>

                  {/* Date */}
                  <span style={{ fontSize:12, color:'var(--text4)', whiteSpace:'nowrap' }}>
                    {entry.exportedAt.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'2-digit' })}
                    {' '}
                    <span style={{ color:'var(--text4)', fontSize:11 }}>
                      {entry.exportedAt.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })}
                    </span>
                  </span>

                  {/* Actions */}
                  <div className="hist-row-actions" onClick={e => e.stopPropagation()}>
                    <button className="act-btn danger" title="Supprimer"
                      onClick={() => removeEntry(entry.id)}>
                      <Trash2 size={11}/>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}