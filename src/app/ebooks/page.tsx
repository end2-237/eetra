'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, BookOpen, Search, Clock, X,
  ChevronRight, ChevronLeft, Lock, CheckCircle2,
  Circle, FileText, Tag,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { EBOOKS, EBOOK_CATEGORIES, type Ebook, type EbookChapter } from '@/data/ebooks'

// ── CSS ───────────────────────────────────────────────────────────────────────

const CSS = `
  .lib-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }

  /* Topbar */
  .lib-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .lib-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .lib-back:hover { color:var(--text); }
  .lib-sep { font-size:14px; color:var(--border2); }
  .lib-page-title { font-size:14px; font-weight:700; color:var(--text); }

  /* Body */
  .lib-body { max-width:1100px; margin:0 auto; padding:24px 20px 48px; }
  .lib-layout { display:grid; grid-template-columns:200px 1fr; gap:20px; align-items:start; }

  /* Left sidebar */
  .lib-sidebar { position:sticky; top:72px; }
  .lib-sidebar-block { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; }
  .lib-sidebar-head { padding:9px 12px; border-bottom:1px solid var(--border); background:var(--bg2); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); }
  .lib-cat-btn { display:flex; align-items:center; justify-content:space-between; width:100%; padding:8px 12px; border:none; background:transparent; cursor:pointer; font-size:12px; font-weight:500; color:var(--text3); transition:background .1s,color .1s; text-align:left; }
  .lib-cat-btn:hover { background:var(--bg2); color:var(--text); }
  .lib-cat-btn.active { background:var(--accentS); color:var(--accent); font-weight:600; }
  .lib-cat-count { font-size:10px; font-weight:600; padding:1px 5px; border-radius:3px; background:var(--bg3); color:var(--text4); }
  .lib-cat-btn.active .lib-cat-count { background:var(--accent); color:#fff; }

  /* Main content */
  .lib-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
  .lib-h1  { font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .lib-sub { font-size:12px; color:var(--text4); margin:0; }

  .lib-search { display:flex; align-items:center; gap:7px; border:1px solid var(--border); border-radius:6px; padding:4px 10px; background:var(--surface); transition:border-color .15s; height:30px; width:100%; max-width:300px; margin-bottom:16px; }
  .lib-search:focus-within { border-color:var(--accent); }
  .lib-search input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:100%; }
  .lib-search input::placeholder { color:var(--text4); }

  /* Ebook list */
  .lib-list { display:flex; flex-direction:column; gap:1px; border:1px solid var(--border); border-radius:7px; overflow:hidden; background:var(--border); }
  .lib-item { background:var(--surface); padding:14px 16px; cursor:pointer; transition:background .1s; display:flex; align-items:center; gap:14px; }
  .lib-item:hover { background:var(--bg2); }

  /* Cover block */
  .lib-cover { width:52px; height:72px; border-radius:5px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .lib-cover-spine { position:absolute; left:0; top:0; bottom:0; width:4px; background:rgba(0,0,0,.18); }
  .lib-cover-icon { font-size:22px; position:relative; z-index:1; }

  /* Item info */
  .lib-item-title { font-size:13px; font-weight:700; color:var(--text); margin-bottom:2px; }
  .lib-item-desc  { font-size:11px; color:var(--text4); line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:7px; }
  .lib-item-meta  { display:flex; align-items:center; gap:10px; }
  .lib-item-tags  { display:flex; gap:5px; flex-wrap:wrap; }

  /* Badges */
  .bdg { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:600; }
  .bdg-free { background:rgba(5,150,105,.1); color:#059669; }
  .bdg-pro  { background:rgba(27,79,216,.1); color:#1B4FD8; }
  .bdg-cat  { background:var(--bg3); color:var(--text4); }
  .bdg-tag  { background:var(--bg3); color:var(--text4); }

  .lib-item-right { flex-shrink:0; display:flex; flex-direction:column; align-items:flex-end; gap:6px; }
  .lib-read-btn { padding:5px 12px; border-radius:5px; background:var(--accent); color:#fff; border:none; font-size:11px; font-weight:600; cursor:pointer; transition:opacity .15s; white-space:nowrap; }
  .lib-read-btn:hover { opacity:.88; }

  /* Progress bar */
  .lib-progress-track { height:3px; border-radius:99px; background:var(--border); overflow:hidden; width:80px; }
  .lib-progress-fill  { height:100%; border-radius:99px; background:var(--accent); transition:width .4s ease; }

  /* Empty */
  .lib-empty { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:52px 24px; text-align:center; }

  /* ── Reader modal ── */
  .reader-overlay { position:fixed; inset:0; z-index:9000; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; padding:24px; }
  .reader-modal { background:var(--surface); border-radius:8px; width:100%; max-width:920px; border:1px solid var(--border); display:flex; overflow:hidden; max-height:90vh; box-shadow:0 24px 80px rgba(0,0,0,.3); }

  /* Reader sidebar */
  .reader-toc { width:236px; flex-shrink:0; border-right:1px solid var(--border); background:var(--bg2); display:flex; flex-direction:column; }
  .reader-toc-head { padding:14px 14px; border-bottom:1px solid var(--border); }
  .reader-toc-ebook-title { font-size:13px; font-weight:700; color:var(--text); line-height:1.4; margin-bottom:2px; }
  .reader-toc-meta { font-size:10px; color:var(--text4); }
  .reader-toc-list { flex:1; overflow-y:auto; padding:6px; }
  .reader-ch-btn { width:100%; text-align:left; padding:8px 10px; border-radius:5px; border:none; background:transparent; cursor:pointer; display:flex; align-items:flex-start; gap:8px; transition:background .1s; margin-bottom:1px; }
  .reader-ch-btn:hover { background:var(--bg3); }
  .reader-ch-btn.active { background:var(--accentS); }
  .reader-ch-num { font-size:10px; font-weight:700; color:var(--text4); min-width:16px; margin-top:1px; }
  .reader-ch-btn.active .reader-ch-num { color:var(--accent); }
  .reader-ch-title { font-size:12px; font-weight:500; color:var(--text3); line-height:1.4; }
  .reader-ch-btn.active .reader-ch-title { font-weight:700; color:var(--accent); }

  /* Reader main */
  .reader-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .reader-head { padding:12px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .reader-chapter-title { font-size:14px; font-weight:700; color:var(--text); }
  .reader-ebook-label { font-size:11px; color:var(--text4); margin-bottom:2px; }
  .reader-close { width:28px; height:28px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text4); transition:all .12s; }
  .reader-close:hover { background:var(--bg3); color:var(--text); }
  .reader-content { flex:1; overflow-y:auto; padding:28px 32px; }
  .reader-article { font-size:14px; line-height:1.85; color:var(--text2); }
  .reader-article p  { margin:0 0 16px; }
  .reader-article strong { font-weight:700; color:var(--text); }
  .reader-article em { font-style:italic; color:var(--text3); }
  .reader-article ul { padding-left:20px; margin:12px 0; }
  .reader-article li { margin-bottom:6px; }
  .reader-footer { padding:10px 20px; border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; background:var(--bg2); }
  .reader-nav-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 12px; border-radius:5px; font-size:12px; font-weight:600; cursor:pointer; transition:all .12s; border:1px solid var(--border); background:transparent; color:var(--text2); }
  .reader-nav-btn:hover:not(:disabled) { border-color:var(--border2); background:var(--bg3); }
  .reader-nav-btn:disabled { opacity:.35; cursor:not-allowed; }
  .reader-nav-primary { background:var(--accent); color:#fff; border-color:var(--accent); }
  .reader-nav-primary:hover:not(:disabled) { opacity:.88; background:var(--accent); }
  .reader-counter { font-size:11px; color:var(--text4); }
`

// ── Format content ────────────────────────────────────────────────────────────

function formatContent(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .split('\n\n').map(p => p.startsWith('<ul>') ? p : `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('')
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EbooksPage() {
  const router = useRouter()
  const [search,          setSearch]          = useState('')
  const [activeCat,       setActiveCat]       = useState<string | null>(null)
  const [openEbook,       setOpenEbook]       = useState<Ebook | null>(null)
  const [activeChapter,   setActiveChapter]   = useState<EbookChapter | null>(null)
  const [readChapters,    setReadChapters]    = useState<Set<string>>(new Set())

  const filtered = EBOOKS.filter(e => {
    const q = search.toLowerCase()
    const matchQ = !search || e.title.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q))
    const matchC = !activeCat || e.category === activeCat
    return matchQ && matchC
  })

  const openReader = (ebook: Ebook) => {
    setOpenEbook(ebook)
    setActiveChapter(ebook.chapters[0])
  }

  const markRead = (chapterId: string) => setReadChapters(prev => new Set([...prev, chapterId]))

  const navChapter = (dir: 'prev' | 'next') => {
    if (!openEbook || !activeChapter) return
    const idx = openEbook.chapters.findIndex(c => c.id === activeChapter.id)
    const next = dir === 'next' ? idx + 1 : idx - 1
    if (next >= 0 && next < openEbook.chapters.length) {
      markRead(activeChapter.id)
      setActiveChapter(openEbook.chapters[next])
    }
  }

  const chapterIndex = openEbook && activeChapter
    ? openEbook.chapters.findIndex(c => c.id === activeChapter.id)
    : 0

  const getProgress = (ebook: Ebook) => {
    const done = ebook.chapters.filter(c => readChapters.has(c.id)).length
    return Math.round((done / ebook.chapters.length) * 100)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="lib-page">

        {/* Topbar */}
        <header className="lib-top">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="lib-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13}/> Tableau de bord
            </button>
            <span className="lib-sep">/</span>
            <span className="lib-page-title">Bibliothèque</span>
          </div>
          <ThemeToggle/>
        </header>

        <div className="lib-body">

          {/* Page header */}
          <div className="lib-header">
            <div>
              <h1 className="lib-h1">Bibliothèque de ressources</h1>
              <p className="lib-sub">
                {EBOOKS.length} guides · {EBOOKS.filter(e => e.free).length} gratuits · {EBOOKS.reduce((a,b) => a + b.pages, 0)}+ pages · Mis à jour 2026
              </p>
            </div>
          </div>

          <div className="lib-layout">

            {/* Left: categories */}
            <div className="lib-sidebar">
              <div className="lib-sidebar-block">
                <div className="lib-sidebar-head">Catégories</div>
                <button
                  className={`lib-cat-btn${!activeCat ? ' active' : ''}`}
                  onClick={() => setActiveCat(null)}
                >
                  Toutes
                  <span className="lib-cat-count">{EBOOKS.length}</span>
                </button>
                {EBOOK_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`lib-cat-btn${activeCat === cat ? ' active' : ''}`}
                    onClick={() => setActiveCat(activeCat === cat ? null : cat)}
                  >
                    <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{cat}</span>
                    <span className="lib-cat-count">{EBOOKS.filter(e => e.category === cat).length}</span>
                  </button>
                ))}
              </div>

              {/* Stats */}
              <div className="lib-sidebar-block" style={{ marginTop:10 }}>
                <div className="lib-sidebar-head">Votre lecture</div>
                <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--text4)' }}>Chapitres lus</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{readChapters.size}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--text4)' }}>Guides ouverts</span>
                    <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>
                      {EBOOKS.filter(e => e.chapters.some(c => readChapters.has(c.id))).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: ebook list */}
            <div>
              {/* Search */}
              <div className="lib-search">
                <Search size={12} color="var(--text4)"/>
                <input
                  placeholder="Rechercher un guide…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {filtered.length === 0 ? (
                <div className="lib-empty">
                  <BookOpen size={26} color="var(--text4)" style={{ margin:'0 auto 10px' }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>Aucun résultat</div>
                  <p style={{ fontSize:12, color:'var(--text4)', margin:0 }}>Modifiez votre recherche ou changez de catégorie.</p>
                </div>
              ) : (
                <div className="lib-list">
                  {filtered.map(ebook => {
                    const prog = getProgress(ebook)
                    const hasStarted = prog > 0
                    return (
                      <div key={ebook.id} className="lib-item" onClick={() => openReader(ebook)}>

                        {/* Cover */}
                        <div className="lib-cover" style={{ background:ebook.coverColor }}>
                          <div className="lib-cover-spine"/>
                          <span className="lib-cover-icon">{ebook.icon}</span>
                        </div>

                        {/* Info */}
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:3 }}>
                            <span className="bdg bdg-cat">{ebook.category}</span>
                            {ebook.free
                              ? <span className="bdg bdg-free">Gratuit</span>
                              : <span className="bdg bdg-pro"><Lock size={9}/> Pro</span>
                            }
                            {hasStarted && prog < 100 && (
                              <span style={{ fontSize:10, color:'var(--accent)', fontWeight:600 }}>{prog}% lu</span>
                            )}
                            {prog === 100 && (
                              <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color:'#059669', fontWeight:600 }}>
                                <CheckCircle2 size={11}/> Terminé
                              </span>
                            )}
                          </div>
                          <div className="lib-item-title">{ebook.title}</div>
                          <div className="lib-item-desc">{ebook.description}</div>
                          <div className="lib-item-meta">
                            <span style={{ fontSize:11, color:'var(--text4)', display:'flex', alignItems:'center', gap:4 }}>
                              <Clock size={10}/> {ebook.readTime}
                            </span>
                            <span style={{ fontSize:11, color:'var(--text4)' }}>
                              {ebook.pages} pages
                            </span>
                            <span style={{ fontSize:11, color:'var(--text4)' }}>
                              {ebook.chapters.length} chapitres
                            </span>
                          </div>
                          {hasStarted && (
                            <div style={{ marginTop:7 }}>
                              <div className="lib-progress-track">
                                <div className="lib-progress-fill" style={{ width:`${prog}%` }}/>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tags + CTA */}
                        <div className="lib-item-right">
                          <button className="lib-read-btn" onClick={e => { e.stopPropagation(); openReader(ebook) }}>
                            {hasStarted ? 'Continuer →' : 'Lire →'}
                          </button>
                          <div style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'flex-end' }}>
                            {ebook.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="bdg bdg-tag" style={{ fontSize:9 }}>{tag}</span>
                            ))}
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Reader modal ── */}
      {openEbook && activeChapter && (
        <div className="reader-overlay" onClick={e => { if (e.target === e.currentTarget) setOpenEbook(null) }}>
          <div className="reader-modal">

            {/* TOC sidebar */}
            <div className="reader-toc">
              <div className="reader-toc-head">
                <div style={{ width:36, height:36, borderRadius:6, background:openEbook.coverColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, marginBottom:8, flexShrink:0 }}>
                  {openEbook.icon}
                </div>
                <div className="reader-toc-ebook-title">{openEbook.title}</div>
                <div className="reader-toc-meta">
                  {openEbook.chapters.length} chapitres · {openEbook.readTime}
                </div>
                {/* Overall progress */}
                <div style={{ marginTop:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                    <span style={{ fontSize:10, color:'var(--text4)' }}>Progression</span>
                    <span style={{ fontSize:10, fontWeight:600, color:'var(--accent)' }}>{getProgress(openEbook)}%</span>
                  </div>
                  <div className="lib-progress-track" style={{ width:'100%' }}>
                    <div className="lib-progress-fill" style={{ width:`${getProgress(openEbook)}%` }}/>
                  </div>
                </div>
              </div>

              <div className="reader-toc-list">
                {openEbook.chapters.map((ch, idx) => {
                  const isRead   = readChapters.has(ch.id)
                  const isActive = activeChapter.id === ch.id
                  return (
                    <button
                      key={ch.id}
                      className={`reader-ch-btn${isActive ? ' active' : ''}`}
                      onClick={() => { markRead(activeChapter.id); setActiveChapter(ch) }}
                    >
                      {isRead
                        ? <CheckCircle2 size={12} color="#059669" style={{ flexShrink:0, marginTop:1 }}/>
                        : <Circle size={12} color={isActive ? 'var(--accent)' : 'var(--border2)'} style={{ flexShrink:0, marginTop:1 }}/>
                      }
                      <div>
                        <span className="reader-ch-num">{idx + 1}.</span>
                        {' '}
                        <span className="reader-ch-title">{ch.title}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reader main */}
            <div className="reader-main">
              <div className="reader-head">
                <div>
                  <div className="reader-ebook-label">{openEbook.title}</div>
                  <div className="reader-chapter-title">{activeChapter.title}</div>
                </div>
                <button className="reader-close" onClick={() => setOpenEbook(null)}>
                  <X size={13}/>
                </button>
              </div>

              <div className="reader-content">
                <div
                  className="reader-article"
                  dangerouslySetInnerHTML={{ __html: formatContent(activeChapter.content) }}
                />
              </div>

              <div className="reader-footer">
                <button
                  className="reader-nav-btn"
                  disabled={chapterIndex === 0}
                  onClick={() => navChapter('prev')}
                >
                  <ChevronLeft size={13}/> Précédent
                </button>

                <span className="reader-counter">
                  {chapterIndex + 1} / {openEbook.chapters.length}
                </span>

                {chapterIndex < openEbook.chapters.length - 1 ? (
                  <button className="reader-nav-btn reader-nav-primary" onClick={() => navChapter('next')}>
                    Suivant <ChevronRight size={13}/>
                  </button>
                ) : (
                  <button className="reader-nav-btn" style={{ color:'#059669', borderColor:'rgba(5,150,105,.3)' }}
                    onClick={() => { markRead(activeChapter.id); setOpenEbook(null) }}>
                    <CheckCircle2 size={12}/> Terminer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}