'use client'

import { useState } from 'react'
import { Zap, Edit3 } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { Button } from '@/components/ui/Button'
import { generateIntroduction, professionalizeText } from '@/lib/ai'
import { generateId } from '@/lib/utils'
import { DocBlock } from '@/types'

const BLOCK_TYPES = [
  { type: 'section', label: 'Titre de Section' },
  { type: 'text',    label: 'Paragraphe' },
  { type: 'quote',   label: 'Citation Exécutive' },
  { type: 'table',   label: 'Tableau de Données' },
  { type: 'kpi',     label: 'KPIs / Chiffres Clés' },
  { type: 'clause',  label: 'Clause Juridique' },
  { type: 'sign',    label: 'Zone Signature' },
  { type: 'divider', label: 'Séparateur' },
] as const

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

export function EditorPanel({ showToast }: Props) {
  const {
    title, setTitle, subtitle, setSubtitle, ref, setRef,
    destination, setDestination, confidentiality, setConfidentiality,
    addBlock, pages, currentPageIndex, setPageBlocks,
  } = useDocument()
  const { profile } = useProfile()
  const [genLoading, setGenLoading] = useState(false)
  const [proLoading, setProLoading] = useState(false)

  const CONFIDENTIALITIES = ['CONFIDENTIEL', 'USAGE INTERNE', 'PUBLIC', 'STRICTEMENT CONFIDENTIEL']

  async function handleGenerateIntro() {
    setGenLoading(true)
    showToast('IA en rédaction...')
    try {
      const paragraphs = await generateIntroduction(profile.name || 'l\'entreprise', title || 'ce document')
      const currentPage = pages[currentPageIndex]
      if (currentPage) {
        const newBlocks: DocBlock[] = [
          ...currentPage.blocks,
          ...paragraphs.map(p => ({ id: generateId(), type: 'text' as const, content: p })),
        ]
        setPageBlocks(currentPage.id, newBlocks)
      }
      showToast('Introduction générée !', 'ok')
    } catch {
      showToast('Erreur API', 'err')
    } finally {
      setGenLoading(false)
    }
  }

  async function handleProfessionalize() {
    const sel = window.getSelection()?.toString()?.trim()
    if (!sel || sel.length < 10) {
      showToast('Sélectionnez du texte dans le document', 'err')
      return
    }
    setProLoading(true)
    try {
      const result = await professionalizeText(sel)
      if (result) {
        document.execCommand('insertText', false, result)
        showToast('Reformulé !', 'ok')
      }
    } catch {
      showToast('Erreur API', 'err')
    } finally {
      setProLoading(false)
    }
  }

  const lbl = "block text-[10px] font-bold uppercase tracking-widest mb-1.5"
  const inp = "w-full rounded-lg px-3.5 py-2.5 text-[13px] border outline-none transition-colors duration-150 font-sans"
  const inpStyle = { background: 'var(--bg3)', borderColor: 'var(--border)', color: 'var(--text)' }

  return (
    <div className="w-[272px] min-w-[272px] border-r overflow-y-auto hide-scroll flex flex-col"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Edit3 size={13} color="var(--accent)" strokeWidth={2} />
          <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>Propriétés</span>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <div>
            <label className={lbl} style={{ color: 'var(--text3)' }}>Titre</label>
            <input className={inp} style={inpStyle} placeholder="Titre du document"
              value={title} onChange={e => setTitle(e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--text3)' }}>Sous-titre / Objet</label>
            <input className={inp} style={inpStyle} placeholder="Objet ou description"
              value={subtitle} onChange={e => setSubtitle(e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--text3)' }}>Référence</label>
            <input className={inp + ' font-mono'} style={inpStyle} placeholder="REF-2026-001"
              value={ref} onChange={e => setRef(e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--text3)' }}>Destinataire</label>
            <input className={inp} style={inpStyle} placeholder="À l'attention de..."
              value={destination} onChange={e => setDestination(e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
            />
          </div>
          <div>
            <label className={lbl} style={{ color: 'var(--text3)' }}>Confidentialité</label>
            <select className={inp} style={inpStyle} value={confidentiality} onChange={e => setConfidentiality(e.target.value)}>
              {CONFIDENTIALITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

        <div className="text-[9px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text4)' }}>
          Bibliothèque de Blocs
        </div>
        <div className="flex flex-col gap-1.5 mb-5">
          {BLOCK_TYPES.map(({ type, label }) => (
            <button key={type}
              onClick={() => { addBlock(type); showToast(`Bloc "${label}" ajouté`, 'ok'); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[12px] font-600 cursor-pointer border transition-all duration-150"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)', fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--accent)'; (e.currentTarget).style.color = 'var(--accent)'; (e.currentTarget).style.background = 'var(--accentS)'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text2)'; (e.currentTarget).style.background = 'var(--surface)'; }}
            >
              {label}
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>+</span>
            </button>
          ))}
        </div>

        <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

        {/* AI Box */}
        <div className="rounded-xl p-4 border" style={{ background: 'var(--accentS)', borderColor: 'var(--accentS2)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap size={11} color="var(--accent)" />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              IA — Professionnaliser
            </span>
          </div>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text3)' }}>
            Génération d&apos;introduction ou reformulation du texte sélectionné.
          </p>
          <Button variant="primary" fullWidth size="sm" disabled={genLoading} onClick={handleGenerateIntro}>
            {genLoading
              ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
              : <Zap size={11} />
            }
            Générer Introduction
          </Button>
          <Button variant="ghost" fullWidth size="sm" disabled={proLoading} onClick={handleProfessionalize}
            style={{ marginTop: 6 }}>
            {proLoading
              ? <span className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin-fast" />
              : null
            }
            Reformuler Sélection
          </Button>
        </div>
      </div>
    </div>
  )
}
