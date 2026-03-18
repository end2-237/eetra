'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, BookOpen, Search, Clock, X, ChevronRight, ChevronLeft, Lock, CheckCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { EBOOKS, EBOOK_CATEGORIES, type Ebook, type EbookChapter } from '@/data/ebooks'

export default function EbooksPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openEbook, setOpenEbook] = useState<Ebook | null>(null)
  const [activeChapter, setActiveChapter] = useState<EbookChapter | null>(null)
  const [readChapters, setReadChapters] = useState<Set<string>>(new Set())

  const filtered = EBOOKS.filter(e => {
    const matchSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchCat = !activeCategory || e.category === activeCategory
    return matchSearch && matchCat
  })

  const openReader = (ebook: Ebook) => {
    setOpenEbook(ebook)
    setActiveChapter(ebook.chapters[0])
  }

  const markRead = (chapterId: string) => {
    setReadChapters(prev => new Set([...prev, chapterId]))
  }

  const navChapter = (dir: 'prev' | 'next') => {
    if (!openEbook || !activeChapter) return
    const idx = openEbook.chapters.findIndex(c => c.id === activeChapter.id)
    const newIdx = dir === 'next' ? idx + 1 : idx - 1
    if (newIdx >= 0 && newIdx < openEbook.chapters.length) {
      setActiveChapter(openEbook.chapters[newIdx])
      markRead(activeChapter.id)
    }
  }

  // Format markdown-like content to HTML
  const formatContent = (text: string) => {
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li style="margin-bottom:6px">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding-left:20px;margin:10px 0">$&</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
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
            <span className="text-[12px]" style={{ color: 'var(--text4)' }}>/ Bibliothèque</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-[1000px] mx-auto w-full px-6 py-10">
        {/* Hero */}
        <div className="rounded-2xl p-8 mb-8 relative overflow-hidden"
          style={{ background: 'var(--accent)' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <div className="relative">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">Bibliothèque EETRA</div>
            <h1 className="text-[28px] font-black tracking-tight text-white mb-2">
              Ressources juridiques & business
            </h1>
            <p className="text-[13px] text-white/70 max-w-lg">
              {EBOOKS.length} guides pratiques sur le droit OHADA, la comptabilité SYSCOHADA, les marchés publics et la gestion d'entreprise en Afrique de l'Ouest.
            </p>
            <div className="flex gap-4 mt-4 text-[12px] text-white/60">
              <span>📖 {EBOOKS.filter(e => e.free).length} guides gratuits</span>
              <span>📚 {EBOOKS.reduce((a, b) => a + b.pages, 0)}+ pages</span>
              <span>🎯 Mis à jour 2026</span>
            </div>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="relative mb-4">
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text4)' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un guide..."
            className="w-full rounded-xl px-3.5 py-3 pl-10 text-[13px] border outline-none font-sans"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border transition-all"
            style={!activeCategory
              ? { background: 'var(--accent)', color: '#fff', borderColor: 'transparent' }
              : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }
            }
          >
            Tous
          </button>
          {EBOOK_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer border transition-all"
              style={activeCategory === cat
                ? { background: 'var(--accent)', color: '#fff', borderColor: 'transparent' }
                : { background: 'transparent', borderColor: 'var(--border)', color: 'var(--text4)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ebook grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(ebook => (
            <div
              key={ebook.id}
              className="rounded-2xl border overflow-hidden cursor-pointer transition-all group"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
              onClick={() => openReader(ebook)}
            >
              {/* Cover */}
              <div style={{ height: 80, background: ebook.coverColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, position: 'relative' }}>
                {ebook.icon}
                {!ebook.free && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(0,0,0,.3)', color: '#fff' }}>
                    <Lock size={8} /> Pro
                  </div>
                )}
                {ebook.free && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: 'rgba(0,0,0,.25)', color: '#fff' }}>
                    Gratuit
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: ebook.coverColor }}>
                  {ebook.category}
                </div>
                <div className="text-[13px] font-bold mb-1 leading-tight" style={{ color: 'var(--text)' }}>
                  {ebook.title}
                </div>
                <p className="text-[11px] mb-3 line-clamp-2" style={{ color: 'var(--text4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {ebook.description}
                </p>

                <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text4)' }}>
                  <span className="flex items-center gap-1"><Clock size={10} /> {ebook.readTime}</span>
                  <span>{ebook.pages} pages</span>
                </div>

                <div className="flex gap-1 flex-wrap mt-3">
                  {ebook.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reader Modal */}
      {openEbook && activeChapter && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'stretch', justifyContent: 'center',
            padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpenEbook(null) }}
        >
          <div style={{
            background: 'var(--surface)', borderRadius: 20, width: '100%', maxWidth: 900,
            border: '1px solid var(--border)', display: 'flex', overflow: 'hidden', maxHeight: '90vh',
          }}>
            {/* Sidebar TOC */}
            <div style={{ width: 240, borderRight: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg2)', display: 'flex', flexDirection: 'column' }}>
              {/* Ebook header */}
              <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: openEbook.coverColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 8 }}>
                  {openEbook.icon}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4 }}>{openEbook.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text4)' }}>{openEbook.chapters.length} chapitres · {openEbook.readTime}</div>
              </div>

              {/* Chapters list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                {openEbook.chapters.map((ch, idx) => {
                  const isRead = readChapters.has(ch.id)
                  const isActive = activeChapter.id === ch.id
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { setActiveChapter(ch); if (isActive) markRead(ch.id) }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '10px 12px',
                        borderRadius: 8, cursor: 'pointer', border: 'none',
                        background: isActive ? 'var(--accentS)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text3)',
                        marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      {isRead
                        ? <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0 }} />
                        : <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--border2)', flexShrink: 0, background: isActive ? 'var(--accent)' : 'transparent' }} />
                      }
                      <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500 }}>
                        {idx + 1}. {ch.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Reader content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text4)', marginBottom: 2 }}>{openEbook.title}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{activeChapter.title}</div>
                </div>
                <button
                  onClick={() => setOpenEbook(null)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Article */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
                <div
                  style={{ fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8, color: 'var(--text2)' }}
                  dangerouslySetInnerHTML={{ __html: `<p>${formatContent(activeChapter.content)}</p>` }}
                />
              </div>

              {/* Navigation */}
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button variant="ghost" size="sm"
                  disabled={openEbook.chapters.indexOf(activeChapter) === 0}
                  onClick={() => navChapter('prev')}
                >
                  <ChevronLeft size={13} /> Précédent
                </Button>

                <div style={{ fontSize: 11, color: 'var(--text4)' }}>
                  {openEbook.chapters.indexOf(activeChapter) + 1} / {openEbook.chapters.length}
                </div>

                {openEbook.chapters.indexOf(activeChapter) < openEbook.chapters.length - 1 ? (
                  <Button variant="primary" size="sm" onClick={() => navChapter('next')}>
                    Suivant <ChevronRight size={13} />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => { markRead(activeChapter.id); setOpenEbook(null) }}>
                    <CheckCircle size={13} /> Terminer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
