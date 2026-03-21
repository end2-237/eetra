'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Trash2, Copy, Lock, Unlock, AlignLeft, AlignCenter, AlignRight,
  ChevronUp, ChevronDown, RotateCcw,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

export type CoverBlockType = 'text' | 'image' | 'rect' | 'circle' | 'line' | 'logo'

export interface CoverBlock {
  id: string
  type: CoverBlockType
  // Position as fraction of A4 page (0.0 – 1.0)
  x: number; y: number; w: number; h: number
  z: number
  locked?: boolean
  opacity?: number
  rotation?: number
  // Text
  text?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | 'black'
  fontStyle?: 'normal' | 'italic'
  color?: string
  align?: 'left' | 'center' | 'right'
  letterSpacing?: number
  lineHeight?: number
  fontFamily?: string
  // Shape (rect / circle / line)
  fill?: string
  fillOpacity?: number
  stroke?: string
  strokeWidth?: number
  radius?: number
  // Image
  src?: string
  objectFit?: 'cover' | 'contain' | 'fill'
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_W = 794
const PAGE_H = 1123
const H_SZ   = 8   // resize handle size px

const DEFAULTS: Record<CoverBlockType, Partial<CoverBlock>> = {
  text:   { w:.55, h:.06, text:'Double-clic pour éditer', fontSize:18, fontWeight:'normal', fontStyle:'normal', color:'#0D1117', align:'left', letterSpacing:0, lineHeight:1.35, fill:'transparent' },
  rect:   { w:.35, h:.08, fill:'#1B4FD8', fillOpacity:1, stroke:'none', strokeWidth:0, radius:0 },
  circle: { w:.14, h:.1,  fill:'#1B4FD8', fillOpacity:.15, stroke:'#1B4FD8', strokeWidth:1 },
  line:   { w:.45, h:.004,fill:'#1B4FD8', fillOpacity:1 },
  image:  { w:.32, h:.2,  fill:'#F5F7FA', stroke:'#DDE1EA', strokeWidth:1, objectFit:'contain' },
  logo:   { w:.22, h:.09, fill:'#F5F7FA', stroke:'#DDE1EA', strokeWidth:1, radius:6 },
}

const HANDLE_POS: Record<string, React.CSSProperties> = {
  nw: { top:-4, left:-4,                               cursor:'nw-resize' },
  n:  { top:-4, left:'50%', transform:'translateX(-50%)', cursor:'n-resize'  },
  ne: { top:-4, right:-4,                              cursor:'ne-resize' },
  e:  { top:'50%', right:-4, transform:'translateY(-50%)', cursor:'e-resize'  },
  se: { bottom:-4, right:-4,                           cursor:'se-resize' },
  s:  { bottom:-4, left:'50%', transform:'translateX(-50%)', cursor:'s-resize'  },
  sw: { bottom:-4, left:-4,                            cursor:'sw-resize' },
  w:  { top:'50%', left:-4, transform:'translateY(-50%)', cursor:'w-resize'  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function gid() { return Math.random().toString(36).slice(2, 9) }

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  blocks: CoverBlock[]
  onChange: (b: CoverBlock[]) => void
  accentColor?: string
  baseLayoutBg?: React.ReactNode  // optional rendered base layout as background
}

export function CoverPageEditor({ blocks, onChange, accentColor = '#1B4FD8', baseLayoutBg }: Props) {
  const [selId,   setSelId]   = useState<string | null>(null)
  const [editId,  setEditId]  = useState<string | null>(null)
  const [scale,   setScale]   = useState(0.58)
  const containerRef = useRef<HTMLDivElement>(null)

  // Drag & resize state in refs to avoid re-render during move
  const drag   = useRef<{ id: string; sx: number; sy: number; bx: number; by: number } | null>(null)
  const resize = useRef<{ id: string; handle: string; sx: number; sy: number; bx: number; by: number; bw: number; bh: number } | null>(null)

  // Compute display scale from container width
  useEffect(() => {
    const compute = () => {
      if (!containerRef.current) return
      const w = containerRef.current.clientWidth - 240 // leave room for props panel
      setScale(Math.min(0.72, Math.max(0.42, w / PAGE_W)))
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const dW = PAGE_W * scale
  const dH = PAGE_H * scale
  const sel = blocks.find(b => b.id === selId) || null

  // ── Block mutations ────────────────────────────────────────────────────────

  const upd = useCallback((id: string, patch: Partial<CoverBlock>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...patch } : b))
  }, [blocks, onChange])

  function addBlock(type: CoverBlockType) {
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.z), 0)
    const def = DEFAULTS[type]
    const nb: CoverBlock = {
      id: gid(), type, z: maxZ + 1, opacity: 1,
      x: 0.08 + Math.random() * 0.08,
      y: 0.08 + Math.random() * 0.08,
      w: def.w!, h: def.h!,
      ...def,
    }
    onChange([...blocks, nb])
    setSelId(nb.id)
    setEditId(null)
  }

  function del(id: string) {
    onChange(blocks.filter(b => b.id !== id))
    setSelId(null)
  }

  function dup(id: string) {
    const b = blocks.find(b => b.id === id); if (!b) return
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.z), 0)
    const nb: CoverBlock = { ...b, id: gid(), x: b.x + 0.02, y: b.y + 0.02, z: maxZ + 1 }
    onChange([...blocks, nb]); setSelId(nb.id)
  }

  function reset() {
    onChange([])
    setSelId(null)
    setEditId(null)
  }

  // ── Mouse event handlers ────────────────────────────────────────────────────

  const onBlockDown = useCallback((e: React.MouseEvent, id: string) => {
    if (editId === id) return
    e.stopPropagation(); e.preventDefault()
    const b = blocks.find(b => b.id === id)
    if (!b || b.locked) { setSelId(id); return }
    setSelId(id)
    drag.current = { id, sx: e.clientX, sy: e.clientY, bx: b.x, by: b.y }
  }, [blocks, editId])

  const onHandleDown = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation(); e.preventDefault()
    const b = blocks.find(b => b.id === id); if (!b) return
    resize.current = { id, handle, sx: e.clientX, sy: e.clientY, bx: b.x, by: b.y, bw: b.w, bh: b.h }
  }, [blocks])

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (drag.current) {
        const { id, sx, sy, bx, by } = drag.current
        const b = blocks.find(b => b.id === id); if (!b) return
        const nx = Math.max(0, Math.min(1 - b.w, bx + (e.clientX - sx) / dW))
        const ny = Math.max(0, Math.min(1 - b.h, by + (e.clientY - sy) / dH))
        upd(id, { x: nx, y: ny })
      }
      if (resize.current) {
        const { id, handle, sx, sy, bx, by, bw, bh } = resize.current
        const dx = (e.clientX - sx) / dW
        const dy = (e.clientY - sy) / dH
        let nx = bx, ny = by, nw = bw, nh = bh
        if (handle.includes('e')) nw = Math.max(0.04, bw + dx)
        if (handle.includes('s')) nh = Math.max(0.008, bh + dy)
        if (handle.includes('w')) { nx = bx + dx; nw = Math.max(0.04, bw - dx) }
        if (handle.includes('n')) { ny = by + dy; nh = Math.max(0.008, bh - dy) }
        nx = Math.max(0, nx); ny = Math.max(0, ny)
        nw = Math.min(1 - nx, nw); nh = Math.min(1 - ny, nh)
        upd(id, { x: nx, y: ny, w: nw, h: nh })
      }
    }
    const up = () => { drag.current = null; resize.current = null }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
  }, [blocks, dW, dH, upd])

  // ── Block renderer ────────────────────────────────────────────────────────

  const fileRef = useRef<HTMLInputElement>(null)

  function renderBlock(b: CoverBlock) {
    const bx = b.x * dW, by = b.y * dH, bw = b.w * dW, bh = b.h * dH
    const isSel  = selId === b.id
    const isEdit = editId === b.id
    const fs     = ((b.fontSize || 16) / 72) * 96 * scale  // pt → px at scale

    let inner: React.ReactNode
    if (b.type === 'text') {
      inner = (
        <div
          contentEditable={isEdit}
          suppressContentEditableWarning
          onInput={e => upd(b.id, { text: (e.currentTarget as HTMLElement).innerText })}
          onBlur={() => setEditId(null)}
          style={{
            width: '100%', height: '100%', outline: 'none', overflow: 'hidden',
            fontSize: fs, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            fontWeight: b.fontWeight === 'black' ? 900 : b.fontWeight === 'bold' ? 700 : 400,
            fontStyle: b.fontStyle || 'normal',
            color: b.color || '#0D1117',
            textAlign: b.align || 'left',
            letterSpacing: b.letterSpacing ? `${b.letterSpacing}em` : 'normal',
            lineHeight: b.lineHeight || 1.35,
            fontFamily: b.fontFamily || 'inherit',
          }}
          dangerouslySetInnerHTML={isEdit ? undefined : { __html: (b.text || '').replace(/\n/g, '<br/>') }}
        />
      )
    } else if (b.type === 'image' || b.type === 'logo') {
      inner = b.src ? (
        <img src={b.src} alt="" style={{ width: '100%', height: '100%', objectFit: b.objectFit || 'contain', display: 'block', borderRadius: b.radius }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: b.fill || '#F5F7FA', border: `${b.strokeWidth || 1}px solid ${b.stroke || '#DDE1EA'}`, borderRadius: b.radius || 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: '#aaa' }}>
          <span style={{ fontSize: Math.max(14, fs * 1.4), lineHeight: 1 }}>{b.type === 'logo' ? '🏢' : '🖼'}</span>
          <span style={{ fontSize: Math.max(9, fs * 0.65), fontWeight: 600 }}>{b.type === 'logo' ? 'Logo' : 'Image'}</span>
        </div>
      )
    } else if (b.type === 'rect') {
      inner = <div style={{ width: '100%', height: '100%', background: b.fill || accentColor, opacity: b.fillOpacity ?? 1, border: b.strokeWidth ? `${b.strokeWidth}px solid ${b.stroke || accentColor}` : 'none', borderRadius: b.radius || 0 }} />
    } else if (b.type === 'circle') {
      inner = <div style={{ width: '100%', height: '100%', background: b.fill || accentColor, opacity: b.fillOpacity ?? 0.15, border: b.strokeWidth ? `${b.strokeWidth}px solid ${b.stroke || accentColor}` : 'none', borderRadius: '50%' }} />
    } else if (b.type === 'line') {
      inner = <div style={{ width: '100%', height: '100%', background: b.fill || accentColor, borderRadius: 2 }} />
    }

    const sorted_b = [...blocks].sort((a, bb) => (a.z || 0) - (bb.z || 0))

    return (
      <div key={b.id}
        style={{
          position: 'absolute', left: bx, top: by, width: bw, height: bh,
          opacity: b.opacity ?? 1,
          transform: b.rotation ? `rotate(${b.rotation}deg)` : undefined,
          zIndex: b.z || 1,
          cursor: b.locked ? 'default' : isEdit ? 'text' : 'move',
          userSelect: isEdit ? 'text' : 'none',
          boxSizing: 'border-box',
        }}
        onMouseDown={e => onBlockDown(e, b.id)}
        onDoubleClick={e => { e.stopPropagation(); if (b.type === 'text' && !b.locked) setEditId(b.id) }}
        onClick={e => { e.stopPropagation(); setSelId(b.id) }}
      >
        {inner}

        {/* Selection ring */}
        {isSel && !isEdit && (
          <div style={{ position: 'absolute', inset: -1, border: '1.5px solid #1B4FD8', borderRadius: 2, pointerEvents: 'none', zIndex: 99 }} />
        )}

        {/* Resize handles */}
        {isSel && !isEdit && !b.locked && Object.keys(HANDLE_POS).map(h => (
          <div key={h} onMouseDown={e => onHandleDown(e, b.id, h)}
            style={{ position: 'absolute', width: H_SZ, height: H_SZ, background: '#fff', border: '1.5px solid #1B4FD8', borderRadius: 1.5, zIndex: 100, ...HANDLE_POS[h] }} />
        ))}
      </div>
    )
  }

  // ── Styles helpers ─────────────────────────────────────────────────────────

  const inp = { className: "w-full text-[11px] px-2 py-1.5 rounded-lg border outline-none font-sans", style: { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' } as React.CSSProperties }
  const lbl = { style: { fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'var(--text4)', marginBottom: 3, display: 'block', marginTop: 10 } }
  const sep = <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />

  // ── Toolbar entries ────────────────────────────────────────────────────────

  const tools: { type: CoverBlockType; icon: React.ReactNode; label: string }[] = [
    { type: 'text',   icon: <span style={{ fontSize: 15, fontWeight: 900, lineHeight: 1 }}>T</span>, label: 'Texte' },
    { type: 'rect',   icon: <span style={{ fontSize: 16, lineHeight: 1 }}>▬</span>, label: 'Rectangle' },
    { type: 'circle', icon: <span style={{ fontSize: 16, lineHeight: 1 }}>●</span>, label: 'Cercle' },
    { type: 'line',   icon: <span style={{ fontSize: 16, lineHeight: 1 }}>—</span>, label: 'Ligne' },
    { type: 'image',  icon: <span style={{ fontSize: 15, lineHeight: 1 }}>🖼</span>, label: 'Image' },
    { type: 'logo',   icon: <span style={{ fontSize: 15, lineHeight: 1 }}>🏢</span>, label: 'Logo' },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={{ display: 'flex', height: '100%', overflow: 'hidden', background: 'var(--bg3)' }}>
      {/* Left toolbar */}
      <div style={{ width: 56, flexShrink: 0, borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0', gap: 5, zIndex: 10 }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text4)', marginBottom: 4 }}>Insérer</span>
        {tools.map(({ type, icon, label }) => (
          <button key={type} title={label} onClick={() => addBlock(type)}
            style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, transition: 'all .12s', color: 'var(--text3)' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = accentColor; el.style.background = `${accentColor}12`; el.style.color = accentColor }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--bg2)'; el.style.color = 'var(--text3)' }}
          >
            {icon}
            <span style={{ fontSize: 7, fontWeight: 600, color: 'inherit' }}>{label}</span>
          </button>
        ))}

        {blocks.length > 0 && (
          <>
            <div style={{ width: 28, height: 1, background: 'var(--border)', margin: '6px 0' }} />
            <button title="Tout effacer" onClick={() => { if (window.confirm('Effacer tous les éléments ?')) reset() }}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <RotateCcw size={14} />
            </button>
          </>
        )}

        {selId && (
          <>
            <div style={{ width: 28, height: 1, background: 'var(--border)', margin: '6px 0' }} />
            <button title="Dupliquer" onClick={() => dup(selId)}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
              <Copy size={13} />
            </button>
            <button title="Monter en avant" onClick={() => { const b = blocks.find(b => b.id === selId); if (b) upd(selId, { z: b.z + 1 }) }}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
              <ChevronUp size={13} />
            </button>
            <button title="Envoyer en arrière" onClick={() => { const b = blocks.find(b => b.id === selId); if (b) upd(selId, { z: b.z - 1 }) }}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text4)' }}>
              <ChevronDown size={13} />
            </button>
            <button title="Supprimer" onClick={() => del(selId)}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>

      {/* Canvas */}
      <div
        style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '28px 20px 60px' }}
        onClick={() => { setSelId(null); setEditId(null) }}
      >
        <div style={{
          position: 'relative', width: dW, height: dH, flexShrink: 0,
          background: '#fff', boxShadow: '0 12px 48px rgba(0,0,0,.22)', borderRadius: 4,
          overflow: 'hidden',
        }}>
          {/* Base layout background — fills canvas at display size */}
          {baseLayoutBg && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
              {baseLayoutBg}
            </div>
          )}

          {/* Dot grid overlay */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.045) 1px, transparent 1px)', backgroundSize: `${16 * scale}px ${16 * scale}px`, pointerEvents: 'none', zIndex: 1 }} />

          {/* Blocks, sorted by z */}
          {[...blocks].sort((a, b) => (a.z || 0) - (b.z || 0)).map(renderBlock)}

          {/* Empty state */}
          {blocks.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'none', zIndex: 5 }}>
              <div style={{ fontSize: 28, opacity: .25 }}>+</div>
              <div style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>Cliquez sur un outil à gauche pour ajouter un élément</div>
            </div>
          )}
        </div>
      </div>

      {/* Right properties panel */}
      <div style={{ width: 228, flexShrink: 0, borderLeft: '1px solid var(--border)', background: 'var(--surface)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {sel ? (
          <div style={{ padding: '12px 14px', flex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                {sel.type === 'text' ? '✏️ Texte' : sel.type === 'rect' ? '▬ Rectangle' : sel.type === 'circle' ? '● Cercle' : sel.type === 'line' ? '— Ligne' : sel.type === 'image' ? '🖼 Image' : '🏢 Logo'}
              </span>
              <button onClick={() => del(sel.id)} style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', padding: 0 }}>
                <Trash2 size={10} />
              </button>
            </div>

            {/* Position */}
            <span {...lbl}>Position & Taille</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {([['X', 'x'], ['Y', 'y'], ['Larg.', 'w'], ['Haut.', 'h']] as [string, keyof CoverBlock][]).map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: 9, color: 'var(--text4)', display: 'block', marginBottom: 2 }}>{label} %</label>
                  <input type="number" min={0} max={100}
                    value={Math.round((sel[key] as number) * 100)}
                    onChange={e => upd(sel.id, { [key]: Number(e.target.value) / 100 })}
                    {...inp} />
                </div>
              ))}
            </div>

            {/* Opacity */}
            <span {...lbl}>Opacité — {Math.round((sel.opacity ?? 1) * 100)}%</span>
            <input type="range" min={0} max={100} value={Math.round((sel.opacity ?? 1) * 100)}
              onChange={e => upd(sel.id, { opacity: +e.target.value / 100 })}
              style={{ width: '100%', accentColor }} />

            {/* Lock */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>Verrouiller</span>
              <button onClick={() => upd(sel.id, { locked: !sel.locked })}
                style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border)', background: sel.locked ? 'var(--accentS)' : 'var(--bg2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sel.locked ? 'var(--accent)' : 'var(--text4)', padding: 0 }}>
                {sel.locked ? <Lock size={11} /> : <Unlock size={11} />}
              </button>
            </div>

            {sep}

            {/* TEXT PROPS */}
            {sel.type === 'text' && (
              <>
                <span {...lbl}>Contenu</span>
                <textarea rows={3} value={sel.text || ''} onChange={e => upd(sel.id, { text: e.target.value })}
                  style={{ width: '100%', fontSize: 11, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none', resize: 'vertical', minHeight: 64, fontFamily: 'inherit' }} />

                <span {...lbl}>Taille (pt)</span>
                <input type="number" min={6} max={200} value={sel.fontSize || 16}
                  onChange={e => upd(sel.id, { fontSize: +e.target.value })}
                  {...inp} />

                <span {...lbl}>Graisse</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {([['normal', 'Normal'], ['bold', 'Gras'], ['black', 'Black']] as [CoverBlock['fontWeight'], string][]).map(([v, l]) => (
                    <button key={v} onClick={() => upd(sel.id, { fontWeight: v })}
                      style={{ flex: 1, padding: '5px 2px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 10, fontWeight: v === 'normal' ? 400 : v === 'bold' ? 700 : 900, borderColor: sel.fontWeight === v ? accentColor : 'var(--border)', background: sel.fontWeight === v ? `${accentColor}18` : 'var(--bg2)', color: sel.fontWeight === v ? accentColor : 'var(--text4)' }}>
                      {l}
                    </button>
                  ))}
                </div>

                <span {...lbl}>Style & Alignement</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => upd(sel.id, { fontStyle: sel.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    style={{ flex: 1, padding: '5px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 12, fontStyle: 'italic', fontWeight: 700, borderColor: sel.fontStyle === 'italic' ? accentColor : 'var(--border)', background: sel.fontStyle === 'italic' ? `${accentColor}18` : 'var(--bg2)', color: sel.fontStyle === 'italic' ? accentColor : 'var(--text4)' }}>
                    I
                  </button>
                  {(['left', 'center', 'right'] as const).map((a, i) => (
                    <button key={a} onClick={() => upd(sel.id, { align: a })}
                      style={{ flex: 1, padding: '5px', borderRadius: 6, border: '1px solid', cursor: 'pointer', fontSize: 13, borderColor: sel.align === a ? accentColor : 'var(--border)', background: sel.align === a ? `${accentColor}18` : 'var(--bg2)', color: sel.align === a ? accentColor : 'var(--text4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {i === 0 ? <AlignLeft size={13}/> : i === 1 ? <AlignCenter size={13}/> : <AlignRight size={13}/>}
                    </button>
                  ))}
                </div>

                <span {...lbl}>Couleur du texte</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="color" value={sel.color || '#0D1117'} onChange={e => upd(sel.id, { color: e.target.value })}
                    style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', padding: 2, cursor: 'pointer', flexShrink: 0 }} />
                  <input type="text" value={sel.color || '#0D1117'} onChange={e => upd(sel.id, { color: e.target.value })}
                    {...inp} style={{ ...inp.style, flex: 1, fontFamily: 'monospace' }} />
                </div>

                <span {...lbl}>Espacement lettres — {((sel.letterSpacing || 0) * 100).toFixed(0)}%</span>
                <input type="range" min={-10} max={50} step={1}
                  value={Math.round((sel.letterSpacing || 0) * 100)}
                  onChange={e => upd(sel.id, { letterSpacing: +e.target.value / 100 })}
                  style={{ width: '100%', accentColor }} />

                <span {...lbl}>Interligne — {(sel.lineHeight || 1.35).toFixed(2)}</span>
                <input type="range" min={80} max={300} step={5}
                  value={Math.round((sel.lineHeight || 1.35) * 100)}
                  onChange={e => upd(sel.id, { lineHeight: +e.target.value / 100 })}
                  style={{ width: '100%', accentColor }} />
              </>
            )}

            {/* SHAPE PROPS */}
            {(sel.type === 'rect' || sel.type === 'circle' || sel.type === 'line') && (
              <>
                <span {...lbl}>Couleur de remplissage</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="color" value={sel.fill || accentColor} onChange={e => upd(sel.id, { fill: e.target.value })}
                    style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border)', padding: 2, cursor: 'pointer', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                    {[accentColor, '#ffffff', '#0D1117', '#999', 'transparent'].map(c => (
                      <button key={c} onClick={() => upd(sel.id, { fill: c })}
                        style={{ flex: 1, height: 26, borderRadius: 4, cursor: 'pointer', border: `2px solid ${sel.fill === c ? accentColor : c === '#ffffff' ? '#ddd' : 'transparent'}`, background: c === 'transparent' ? undefined : c, position: 'relative', overflow: 'hidden' }}>
                        {c === 'transparent' && <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg,#ddd 0,#ddd 3px,#fff 3px,#fff 6px)' }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {sel.type !== 'line' && (
                  <>
                    <span {...lbl}>Opacité fond — {Math.round((sel.fillOpacity ?? 1) * 100)}%</span>
                    <input type="range" min={0} max={100} value={Math.round((sel.fillOpacity ?? 1) * 100)}
                      onChange={e => upd(sel.id, { fillOpacity: +e.target.value / 100 })}
                      style={{ width: '100%', accentColor }} />

                    <span {...lbl}>Contour</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={sel.stroke || accentColor} onChange={e => upd(sel.id, { stroke: e.target.value })}
                        style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid var(--border)', padding: 2, cursor: 'pointer', flexShrink: 0 }} />
                      <input type="number" min={0} max={20} value={sel.strokeWidth || 0} placeholder="px"
                        onChange={e => upd(sel.id, { strokeWidth: +e.target.value })}
                        {...inp} style={{ ...inp.style, flex: 1 }} />
                    </div>
                  </>
                )}

                {sel.type === 'rect' && (
                  <>
                    <span {...lbl}>Arrondi (px)</span>
                    <input type="number" min={0} max={200} value={sel.radius || 0}
                      onChange={e => upd(sel.id, { radius: +e.target.value })}
                      {...inp} />
                  </>
                )}
              </>
            )}

            {/* IMAGE / LOGO PROPS */}
            {(sel.type === 'image' || sel.type === 'logo') && (
              <>
                <span {...lbl}>Image</span>
                <button onClick={() => fileRef.current?.click()}
                  style={{ width: '100%', padding: '9px', border: '1px dashed var(--border2)', borderRadius: 9, background: 'var(--bg2)', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>
                  📁 Choisir une image…
                </button>
                <input type="file" ref={fileRef} accept="image/*" style={{ display: 'none' }} onChange={e => {
                  const f = e.target.files?.[0]; if (!f || !selId) return
                  const r = new FileReader(); r.onload = ev => upd(selId, { src: ev.target?.result as string }); r.readAsDataURL(f)
                }} />
                {sel.src && (
                  <>
                    <div style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: '#f5f7fa', aspectRatio: '16/9' }}>
                      <img src={sel.src} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="" />
                    </div>
                    <button onClick={() => upd(sel.id, { src: undefined })}
                      style={{ marginTop: 6, width: '100%', padding: '5px', border: '1px solid #FCA5A5', background: '#FEF2F2', borderRadius: 6, cursor: 'pointer', fontSize: 10, fontWeight: 700, color: '#DC2626' }}>
                      Retirer l'image
                    </button>
                  </>
                )}
                {sel.type === 'logo' && (
                  <>
                    <span {...lbl}>Fond placeholder</span>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="color" value={sel.fill || '#F5F7FA'} onChange={e => upd(sel.id, { fill: e.target.value })}
                        style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid var(--border)', padding: 2, cursor: 'pointer' }} />
                      <span {...lbl} style={{ ...lbl.style, marginTop: 0, marginBottom: 0 }}>Arrondi</span>
                      <input type="number" min={0} max={50} value={sel.radius || 0}
                        onChange={e => upd(sel.id, { radius: +e.target.value })}
                        {...inp} style={{ ...inp.style, flex: 1 }} />
                    </div>
                  </>
                )}
              </>
            )}

            {sep}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => dup(sel.id)}
                style={{ flex: 1, padding: '7px', border: '1px solid var(--border)', background: 'var(--bg2)', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Copy size={11} /> Dupliquer
              </button>
              <button onClick={() => del(sel.id)}
                style={{ flex: 1, padding: '7px', border: '1px solid #FCA5A5', background: '#FEF2F2', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Trash2 size={11} /> Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 16, color: 'var(--text4)', fontSize: 12, lineHeight: 1.6, textAlign: 'center', marginTop: 40 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎨</div>
            <div style={{ fontWeight: 700, color: 'var(--text3)', marginBottom: 6 }}>Éditeur de couverture</div>
            <div>Ajoutez des éléments via la barre gauche.<br />Cliquez sur un élément pour le sélectionner et modifier ses propriétés.</div>
            <div style={{ marginTop: 16, fontSize: 10, fontWeight: 600, color: 'var(--text4)' }}>
              Double-clic → éditer le texte
            </div>
          </div>
        )}
      </div>
    </div>
  )
}