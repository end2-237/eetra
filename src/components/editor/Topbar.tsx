'use client'

import { useDocument } from '@/contexts/DocumentContext'
import { usePlan }     from '@/contexts/PlanContext'
import { Undo2, Redo2, FilePlus, Download } from 'lucide-react'

const CSS = `
  .topbar { height:48px; flex-shrink:0; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 14px; gap:8px; }
  .tb-meta { display:flex; align-items:center; gap:7px; min-width:0; }
  .tb-dot  { width:6px; height:6px; border-radius:50%; background:var(--success); flex-shrink:0; }
  .tb-status { font-family:monospace; font-size:11px; color:var(--text3); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px; }
  .tb-docid  { font-family:monospace; font-size:11px; color:var(--text4); }
  .tb-plan   { font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:2px 7px; border-radius:4px; flex-shrink:0; }
  .tb-sep    { width:1px; height:16px; background:var(--border); flex-shrink:0; }
  .tb-actions { display:flex; align-items:center; gap:4px; }
  .tb-icon-btn { width:28px; height:28px; border-radius:5px; border:1px solid var(--border); background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text3); transition:all .12s; }
  .tb-icon-btn:hover:not(:disabled) { background:var(--bg3); border-color:var(--border2); color:var(--text); }
  .tb-icon-btn:disabled { opacity:.3; cursor:not-allowed; }
  .tb-zoom-btn { padding:0 9px; height:28px; border-radius:5px; border:1px solid transparent; background:transparent; cursor:pointer; font-size:11px; font-family:monospace; font-weight:600; color:var(--text3); transition:all .12s; }
  .tb-zoom-btn.active { border-color:var(--accent); color:var(--accent); background:var(--accentS); }
  .tb-zoom-btn:hover:not(.active) { background:var(--bg3); color:var(--text); }
  .tb-ghost { display:inline-flex; align-items:center; gap:5px; padding:0 12px; height:28px; border-radius:5px; border:1px solid var(--border); background:transparent; color:var(--text2); font-size:11px; font-weight:600; cursor:pointer; transition:all .12s; }
  .tb-ghost:hover { border-color:var(--border2); background:var(--bg3); }
  .tb-primary { display:inline-flex; align-items:center; gap:5px; padding:0 13px; height:28px; border-radius:5px; border:none; background:var(--accent); color:#fff; font-size:11px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .tb-primary:hover { opacity:.88; }
`

const ZOOM_LEVELS = [
  { label:'100%', value:1     },
  { label:'75%',  value:0.75  },
  { label:'55%',  value:0.55  },
]

const PLAN_BADGE: Record<string, { bg:string; color:string }> = {
  starter:  { bg:'rgba(107,114,128,.1)', color:'#6B7280' },
  pro:      { bg:'rgba(27,79,216,.1)',   color:'#1B4FD8' },
  business: { bg:'rgba(5,150,105,.1)',   color:'#059669' },
}

interface Props {
  status:    string
  showToast: (msg: string, type?: 'ok' | 'err' | 'default') => void
}

export function Topbar({ status, showToast }: Props) {
  const { zoom, setZoom, docId, addPage, pages, canUndo, canRedo, undo, redo } = useDocument()
  const { plan, planId, canAddPage, requestUpgrade } = usePlan()

  const badge = PLAN_BADGE[planId] ?? PLAN_BADGE.pro

  const handleAddPage = () => {
    if (!canAddPage(pages.length)) {
      requestUpgrade(`Le plan ${plan.label} est limité à ${plan.maxPagesPerDoc} page(s). Passez au Pro pour des pages illimitées.`)
      return
    }
    addPage()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      <div className="topbar">
        {/* Left: status */}
        <div className="tb-meta">
          <div className="tb-dot"/>
          <span className="tb-status">{status}</span>
          <span style={{ color:'var(--border2)', fontSize:12 }}>·</span>
          <span className="tb-docid">{docId}</span>
          <span className="tb-plan" style={{ background:badge.bg, color:badge.color }}>{plan.label}</span>
        </div>

        {/* Right: controls */}
        <div className="tb-actions">
          {/* Undo / Redo */}
          <button className="tb-icon-btn" title="Annuler (Ctrl+Z)" disabled={!canUndo} onClick={() => canUndo && undo()}>
            <Undo2 size={13}/>
          </button>
          <button className="tb-icon-btn" title="Rétablir (Ctrl+Y)" disabled={!canRedo} onClick={() => canRedo && redo()}>
            <Redo2 size={13}/>
          </button>

          <div className="tb-sep"/>

          {/* Zoom */}
          {ZOOM_LEVELS.map(z => (
            <button key={z.label} className={`tb-zoom-btn${zoom === z.value ? ' active' : ''}`} onClick={() => setZoom(z.value)}>
              {z.label}
            </button>
          ))}

          <div className="tb-sep"/>

          <button className="tb-ghost" onClick={handleAddPage}>
            <FilePlus size={12}/> Page
          </button>

          <button className="tb-primary" onClick={() => window.dispatchEvent(new CustomEvent('eetra:export-pdf'))}>
            <Download size={12}/> PDF
          </button>
        </div>
      </div>
    </>
  )
}