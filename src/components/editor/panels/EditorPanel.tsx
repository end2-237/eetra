'use client'
import { useState } from 'react'
import { Zap, Edit3, Lock } from 'lucide-react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { Button } from '@/components/ui/Button'
import { generateIntroduction, professionalizeText } from '@/lib/ai'
import { generateId } from '@/lib/utils'
import { DocBlock } from '@/types'

const BLOCK_TYPES = [
  { type: 'section',   label: 'Titre de Section',   icon: '§' },
  { type: 'text',      label: 'Paragraphe',          icon: '¶' },
  { type: 'quote',     label: 'Citation Exécutive',  icon: '"' },
  { type: 'table',     label: 'Tableau de Données',  icon: '⊞' },
  { type: 'kpi',       label: 'KPIs / Chiffres Clés',icon: '◈' },
  { type: 'clause',    label: 'Clause Juridique',    icon: '⚖' },
  { type: 'sign',      label: 'Zone Signature',      icon: '✒' },
  { type: 'divider',   label: 'Séparateur',          icon: '—' },
  { type: 'checklist', label: 'Liste de contrôle',   icon: '☑' },
] as const

interface Props { showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void }

export function EditorPanel({ showToast }: Props) {
  const {
    title, setTitle, subtitle, setSubtitle, ref, setRef,
    destination, setDestination, confidentiality, setConfidentiality,
    addBlock, pages, currentPageIndex, setPageBlocks,
  } = useDocument()
  const { profile } = useProfile()
  const { canUseAI, requestUpgrade, plan } = usePlan()
  const [genLoading, setGenLoading] = useState(false)
  const [proLoading, setProLoading] = useState(false)
  const CONFIDENTIALITIES = ['CONFIDENTIEL', 'USAGE INTERNE', 'PUBLIC', 'STRICTEMENT CONFIDENTIEL']
  const aiEnabled = canUseAI()

  async function handleGenerateIntro() {
    if (!aiEnabled) {
      requestUpgrade(`L'IA rédactionnelle est réservée au plan Pro et supérieur.`)
      return
    }
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
    } catch { showToast('Erreur API', 'err') }
    finally { setGenLoading(false) }
  }

  async function handleProfessionalize() {
    if (!aiEnabled) {
      requestUpgrade(`L'IA rédactionnelle est réservée au plan Pro et supérieur.`)
      return
    }
    const sel = window.getSelection()?.toString()?.trim()
    if (!sel || sel.length < 10) { showToast('Sélectionnez du texte dans le document', 'err'); return }
    setProLoading(true)
    try {
      const result = await professionalizeText(sel)
      if (result) { document.execCommand('insertText', false, result); showToast('Reformulé !', 'ok') }
    } catch { showToast('Erreur API', 'err') }
    finally { setProLoading(false) }
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

        {/* Document metadata */}
        <div className="flex flex-col gap-3 mb-5">
          {[
            { label: 'Titre', val: title, set: setTitle, ph: 'Titre du document' },
            { label: 'Sous-titre / Objet', val: subtitle, set: setSubtitle, ph: 'Objet ou description' },
            { label: 'Référence', val: ref, set: setRef, ph: 'REF-2026-001', mono: true },
            { label: 'Destinataire', val: destination, set: setDestination, ph: 'À l\'attention de...' },
          ].map(({ label, val, set, ph, mono }) => (
            <div key={label}>
              <label className={lbl} style={{ color: 'var(--text3)' }}>{label}</label>
              <input
                className={inp + (mono ? ' font-mono' : '')} style={inpStyle}
                placeholder={ph} value={val} onChange={e => set(e.target.value)}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = 'var(--surface)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg3)'; }}
              />
            </div>
          ))}
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

        {/* Block types */}
        <div className="flex flex-col gap-1.5 mb-5">
          {BLOCK_TYPES.map(({ type, label, icon }) => (
            <button key={type}
              onClick={() => { addBlock(type); showToast(`Bloc "${label}" ajouté`, 'ok') }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] cursor-pointer border transition-all duration-150"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text2)', fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--accent)'; (e.currentTarget).style.color = 'var(--accent)'; (e.currentTarget).style.background = 'var(--accentS)'; }}
              onMouseLeave={e => { (e.currentTarget).style.borderColor = 'var(--border)'; (e.currentTarget).style.color = 'var(--text2)'; (e.currentTarget).style.background = 'var(--surface)'; }}
            >
              <span style={{ width: 16, fontSize: 12, textAlign: 'center', opacity: .6, flexShrink: 0 }}>{icon}</span>
              {label}
              <span className="ml-auto" style={{ color: 'var(--accent)', fontWeight: 700 }}>+</span>
            </button>
          ))}
        </div>

        <div className="h-px mb-4" style={{ background: 'var(--border)' }} />

        {/* AI panel */}
        <div className="rounded-xl p-4 border" style={{
          background: aiEnabled ? 'var(--accentS)' : 'var(--bg3)',
          borderColor: aiEnabled ? 'var(--accentS2)' : 'var(--border)',
        }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            {aiEnabled ? <Zap size={11} color="var(--accent)" /> : <Lock size={11} color="var(--text4)" />}
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: aiEnabled ? 'var(--accent)' : 'var(--text4)' }}>
              IA — Professionnaliser
            </span>
            {!aiEnabled && (
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(217,119,6,.1)', color: '#D97706' }}>
                Plan Pro
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text3)' }}>
            {aiEnabled
              ? 'Génération d\'introduction ou reformulation du texte sélectionné.'
              : `Passez au plan ${plan.label === 'starter' ? 'Pro' : 'supérieur'} pour débloquer l\'IA rédactionnelle.`
            }
          </p>
          <Button
            variant={aiEnabled ? 'primary' : 'ghost'}
            fullWidth size="sm"
            disabled={genLoading}
            onClick={handleGenerateIntro}
          >
            {genLoading
              ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin-fast" />
              : aiEnabled ? <Zap size={11} /> : <Lock size={11} />
            }
            {aiEnabled ? 'Générer Introduction' : 'Débloquer l\'IA →'}
          </Button>
          {aiEnabled && (
            <Button variant="ghost" fullWidth size="sm" disabled={proLoading} onClick={handleProfessionalize} style={{ marginTop: 6 }}>
              {proLoading ? <span className="w-3 h-3 rounded-full border-2 border-current/30 border-t-current animate-spin-fast" /> : null}
              Reformuler Sélection
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
