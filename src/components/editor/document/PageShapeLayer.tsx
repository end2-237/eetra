'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { X, Move, Type, Image, Plus } from 'lucide-react'
import type { PageShape } from '@/types'
import { SHAPE_CATALOG, ALL_SHAPES, SHAPE_LIB } from '@/lib/shapes'

const PAGE_W = 794
const PAGE_H = 1123
const H_SZ = 7

const HANDLE_POS: Record<string, React.CSSProperties> = {
  nw:{top:-4,left:-4,cursor:'nw-resize'},
  ne:{top:-4,right:-4,cursor:'ne-resize'},
  se:{bottom:-4,right:-4,cursor:'se-resize'},
  sw:{bottom:-4,left:-4,cursor:'sw-resize'},
  n:{top:-4,left:'50%',transform:'translateX(-50%)',cursor:'n-resize'},
  s:{bottom:-4,left:'50%',transform:'translateX(-50%)',cursor:'s-resize'},
  e:{top:'50%',right:-4,transform:'translateY(-50%)',cursor:'e-resize'},
  w:{top:'50%',left:-4,transform:'translateY(-50%)',cursor:'w-resize'},
}

function gid() { return Math.random().toString(36).slice(2,9) }

function ShapeSVGRender({ b, accent }: { b: PageShape; accent: string }) {
  const shapeKey = b.shape || 'rect'
  const def = SHAPE_LIB[shapeKey]
  if (!def) return null

  const id = b.id
  const gradId = `g-${id}`
  const fillVal = b.useGradient && b.gradient ? `url(#${gradId})` : (b.fill || accent)
  const bColor = b.stroke || 'none'
  const bWidth = b.strokeWidth || 0
  const op = b.fillOpacity !== undefined ? b.fillOpacity : 1
  const grad = b.gradient
  const lX1 = grad?.angle !== undefined ? `${Math.round(Math.cos((grad.angle-90)*Math.PI/180)*50+50)}%` : '0%'
  const lY1 = grad?.angle !== undefined ? `${Math.round(Math.sin((grad.angle-90)*Math.PI/180)*50+50)}%` : '0%'
  const lX2 = grad?.angle !== undefined ? `${Math.round(-Math.cos((grad.angle-90)*Math.PI/180)*50+50)}%` : '100%'
  const lY2 = grad?.angle !== undefined ? `${Math.round(-Math.sin((grad.angle-90)*Math.PI/180)*50+50)}%` : '100%'

  const sp = { fill: fillVal, fillOpacity: op, stroke: bColor, strokeWidth: bWidth }
  const so = { fill: 'none', stroke: b.fill || accent, strokeWidth: Math.max(bWidth,3), strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{overflow:'visible',display:'block'}}>
      <defs>
        {b.useGradient && grad && (
          grad.type === 'radial'
            ? <radialGradient id={gradId} cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor={grad.color1}/><stop offset="100%" stopColor={grad.color2}/></radialGradient>
            : <linearGradient id={gradId} x1={lX1} y1={lY1} x2={lX2} y2={lY2}><stop offset="0%" stopColor={grad.color1}/><stop offset="100%" stopColor={grad.color2}/></linearGradient>
        )}
      </defs>
      {def.path && !def.strokeOnly && !def.special && <path d={def.path} {...sp}/>}
      {def.path && def.strokeOnly && <path d={def.path} {...so}/>}
      {def.special === 'ellipse' && <ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/>}
      {def.special === 'rect_round' && <rect x="1" y="1" width="98" height="98" rx={b.radius||12} {...sp}/>}
      {def.special === 'cylinder' && <><path d="M2,20 L2,80 Q2,98 50,98 Q98,98 98,80 L98,20" {...sp}/><ellipse cx="50" cy="20" rx="48" ry="12" {...sp}/></>}
      {def.special === 'frame' && <><rect x="1" y="1" width="98" height="98" fill={fillVal} fillOpacity={op} stroke={bColor} strokeWidth={bWidth}/><rect x="14" y="14" width="72" height="72" fill="transparent" stroke={bColor==='none'?'transparent':bColor} strokeWidth={Math.max(bWidth/2,1)}/></>}
      {def.special === 'donut' && <><ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/><ellipse cx="50" cy="50" rx="22" ry="22" fill="white" stroke="none"/></>}
      {def.special === 'no_sign' && <><ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/><line x1="22" y1="22" x2="78" y2="78" stroke="white" strokeWidth="12" strokeLinecap="round"/></>}
      {def.special === 'smiley' && <><ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/><ellipse cx="35" cy="38" rx="5" ry="5" fill="white"/><ellipse cx="65" cy="38" rx="5" ry="5" fill="white"/><path d="M30,62 Q50,80 70,62" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/></>}
      {def.special === 'sun' && <><circle cx="50" cy="50" r="28" {...sp}/>{[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(<line key={a} x1={50+33*Math.cos(a*Math.PI/180)} y1={50+33*Math.sin(a*Math.PI/180)} x2={50+47*Math.cos(a*Math.PI/180)} y2={50+47*Math.sin(a*Math.PI/180)} stroke={b.fill||accent} strokeWidth="4" strokeLinecap="round"/>))}</>}
      {def.special === 'cloud' && <path d="M25,70 Q10,70 8,55 Q6,40 20,38 Q18,20 35,18 Q42,8 58,12 Q70,8 78,20 Q95,20 95,38 Q98,55 85,60 Q88,75 72,75 Z" {...sp}/>}
      {def.special === 'scroll_h' && <><path d="M15,10 Q10,2 20,2 L80,2 Q90,2 85,10 L85,90 Q90,98 80,98 L20,98 Q10,98 15,90 Z" {...sp}/><path d="M15,2 Q8,2 8,10 Q8,18 15,18" fill="none" stroke="white" strokeWidth="2"/></>}
    </svg>
  )
}

interface Props {
  pageId: string
  shapes: PageShape[]
  onAdd: (shape: PageShape) => void
  onUpdate: (shapeId: string, patch: Partial<PageShape>) => void
  onRemove: (shapeId: string) => void
  accentColor: string
  readonly?: boolean
}

export function PageShapeLayer({ pageId, shapes, onAdd, onUpdate, onRemove, accentColor, readonly }: Props) {
  const [selId, setSelId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const layerRef = useRef<HTMLDivElement>(null)

  const drag = useRef<{id:string;sx:number;sy:number;bx:number;by:number}|null>(null)
  const resize = useRef<{id:string;handle:string;sx:number;sy:number;bx:number;by:number;bw:number;bh:number}|null>(null)

  const addShape = (shapeKey: string) => {
    const maxZ = shapes.reduce((m,s) => Math.max(m, s.z||0), 0)
    const ns: PageShape = {
      id: gid(), type: 'rect', shape: shapeKey, z: maxZ+1,
      x: 0.1 + Math.random()*0.1, y: 0.1 + Math.random()*0.1,
      w: 0.25, h: 0.18, opacity: 1,
      fill: accentColor, fillOpacity: 0.85, strokeWidth: 0,
      innerText: '', innerFontSize: 14, innerColor: '#ffffff',
      innerFontFamily: 'Bricolage Grotesque', innerAlign: 'center',
    }
    onAdd(ns)
    setSelId(ns.id)
    setShowPicker(false)
  }

  const addTextShape = () => {
    const maxZ = shapes.reduce((m,s) => Math.max(m, s.z||0), 0)
    const ns: PageShape = {
      id: gid(), type: 'text', z: maxZ+1,
      x: 0.1, y: 0.1, w: 0.5, h: 0.06,
      opacity: 1, text: 'Double-clic pour éditer',
      fontSize: 18, fontWeight: 'normal', fontStyle: 'normal',
      color: '#0D1117', align: 'left', lineHeight: 1.35,
    }
    onAdd(ns)
    setSelId(ns.id)
    setShowPicker(false)
  }

  const onBlockDown = useCallback((e: React.MouseEvent, id: string) => {
    if (editId === id || readonly) return
    e.stopPropagation(); e.preventDefault()
    const b = shapes.find(s => s.id === id)
    if (!b || b.locked) { setSelId(id); return }
    setSelId(id)
    drag.current = { id, sx: e.clientX, sy: e.clientY, bx: b.x, by: b.y }
  }, [shapes, editId, readonly])

  const onHandleDown = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation(); e.preventDefault()
    const b = shapes.find(s => s.id === id)
    if (!b) return
    resize.current = { id, handle, sx: e.clientX, sy: e.clientY, bx: b.x, by: b.y, bw: b.w, bh: b.h }
  }, [shapes])

  useEffect(() => {
    const layerEl = layerRef.current
    if (!layerEl) return

    const move = (e: MouseEvent) => {
      const rect = layerEl.getBoundingClientRect()
      const dW = rect.width; const dH = rect.height
      if (drag.current) {
        const { id, sx, sy, bx, by } = drag.current
        const b = shapes.find(s => s.id === id); if (!b) return
        const nx = Math.max(0, Math.min(1 - b.w, bx + (e.clientX - sx) / dW))
        const ny = Math.max(0, Math.min(1 - b.h, by + (e.clientY - sy) / dH))
        onUpdate(id, { x: nx, y: ny })
      }
      if (resize.current) {
        const { id, handle, sx, sy, bx, by, bw, bh } = resize.current
        const dx = (e.clientX - sx) / dW; const dy = (e.clientY - sy) / dH
        let nx = bx, ny = by, nw = bw, nh = bh
        if (handle.includes('e')) nw = Math.max(0.04, bw + dx)
        if (handle.includes('s')) nh = Math.max(0.02, bh + dy)
        if (handle.includes('w')) { nx = bx + dx; nw = Math.max(0.04, bw - dx) }
        if (handle.includes('n')) { ny = by + dy; nh = Math.max(0.02, bh - dy) }
        onUpdate(id, { x: Math.max(0,nx), y: Math.max(0,ny), w: Math.min(1-Math.max(0,nx),nw), h: Math.min(1-Math.max(0,ny),nh) })
      }
    }
    const up = () => { drag.current = null; resize.current = null }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
    return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
  }, [shapes, onUpdate])

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selId && !editId) {
        e.preventDefault(); onRemove(selId); setSelId(null)
      }
      if (e.key === 'Escape') { setSelId(null); setEditId(null) }
    }
    document.addEventListener('keydown', kd)
    return () => document.removeEventListener('keydown', kd)
  }, [selId, editId, onRemove])

  const filteredShapes = searchQ
    ? ALL_SHAPES.filter(s => s.l.toLowerCase().includes(searchQ.toLowerCase()))
    : null

  if (readonly) {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
        {[...shapes].sort((a,b) => (a.z||0)-(b.z||0)).map(b => {
          const bx = b.x * PAGE_W, by = b.y * PAGE_H
          const bw = b.w * PAGE_W, bh = b.h * PAGE_H
          return (
            <div key={b.id} style={{ position:'absolute', left:bx, top:by, width:bw, height:bh, opacity:b.opacity??1, transform:b.rotation?`rotate(${b.rotation}deg)`:undefined, zIndex:b.z||1, overflow:'hidden', pointerEvents:'none' }}>
              {b.type === 'text' ? (
                <div style={{ width:'100%',height:'100%',fontSize:b.fontSize||16,fontWeight:b.fontWeight==='black'?900:b.fontWeight==='bold'?700:400,fontStyle:b.fontStyle||'normal',color:b.color||'#0D1117',textAlign:b.align||'left',letterSpacing:b.letterSpacing?`${b.letterSpacing}em`:'normal',lineHeight:b.lineHeight||1.35,fontFamily:b.fontFamily||'inherit',whiteSpace:'pre-wrap',wordBreak:'break-word',overflow:'hidden' }}>
                  {b.text}
                </div>
              ) : b.type === 'image' && b.src ? (
                <img src={b.src} alt="" style={{width:'100%',height:'100%',objectFit:b.objectFit||'contain',display:'block'}}/>
              ) : (
                <div style={{position:'relative',width:'100%',height:'100%'}}>
                  <ShapeSVGRender b={b} accent={accentColor}/>
                  {b.innerText && (
                    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:b.innerFontSize||14,fontWeight:b.innerBold?700:400,fontStyle:b.innerItalic?'italic':'normal',color:b.innerColor||'#fff',fontFamily:b.innerFontFamily||'inherit',textAlign:b.innerAlign||'center',pointerEvents:'none',padding:4,wordBreak:'break-word',lineHeight:1.3}}>
                      {b.innerText}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      {/* Shape layer */}
      <div
        ref={layerRef}
        className="pdf-hidden"
        style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        onClick={() => { setSelId(null); setEditId(null); setShowPicker(false) }}
      >
        {[...shapes].sort((a,b) => (a.z||0)-(b.z||0)).map(b => {
          const bx = b.x * PAGE_W, by = b.y * PAGE_H
          const bw = b.w * PAGE_W, bh = b.h * PAGE_H
          const isSel = selId === b.id
          const isEdit = editId === b.id

          let content: React.ReactNode
          if (b.type === 'text') {
            content = (
              <div
                contentEditable={isEdit}
                suppressContentEditableWarning
                onInput={e => onUpdate(b.id, { text: (e.currentTarget as HTMLElement).innerText })}
                onBlur={() => setEditId(null)}
                style={{ width:'100%',height:'100%',fontSize:b.fontSize||16,fontWeight:b.fontWeight==='black'?900:b.fontWeight==='bold'?700:400,fontStyle:b.fontStyle||'normal',color:b.color||'#0D1117',textAlign:b.align||'left',letterSpacing:b.letterSpacing?`${b.letterSpacing}em`:'normal',lineHeight:b.lineHeight||1.35,fontFamily:b.fontFamily||'inherit',whiteSpace:'pre-wrap',wordBreak:'break-word',overflow:'hidden',outline:'none',cursor:isEdit?'text':'inherit' }}
                dangerouslySetInnerHTML={isEdit ? undefined : { __html: (b.text||'').replace(/\n/g,'<br/>') }}
              />
            )
          } else if (b.type === 'image' && b.src) {
            content = <img src={b.src} alt="" style={{width:'100%',height:'100%',objectFit:b.objectFit||'contain',display:'block'}}/>
          } else {
            content = (
              <div style={{position:'relative',width:'100%',height:'100%'}}>
                <ShapeSVGRender b={b} accent={accentColor}/>
                {(b.innerText || isSel) && (
                  <div
                    contentEditable={isEdit}
                    suppressContentEditableWarning
                    onInput={e => onUpdate(b.id, { innerText: (e.currentTarget as HTMLElement).innerText })}
                    onBlur={() => setEditId(null)}
                    style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:b.innerFontSize||14,fontWeight:b.innerBold?700:400,fontStyle:b.innerItalic?'italic':'normal',color:b.innerColor||'#fff',fontFamily:b.innerFontFamily||'inherit',textAlign:b.innerAlign||'center',pointerEvents:isEdit?'text':'none' as any,outline:'none',padding:6,wordBreak:'break-word',lineHeight:1.3}}
                    dangerouslySetInnerHTML={isEdit?undefined:{__html:(b.innerText||'').replace(/\n/g,'<br/>')}}
                  />
                )}
              </div>
            )
          }

          return (
            <div
              key={b.id}
              style={{ position:'absolute', left:bx, top:by, width:bw, height:bh, opacity:b.opacity??1, transform:b.rotation?`rotate(${b.rotation}deg)`:undefined, zIndex:(b.z||1)+5, cursor:b.locked?'default':isEdit?'text':'move', userSelect:isEdit?'text':'none', boxSizing:'border-box' }}
              onMouseDown={e => onBlockDown(e, b.id)}
              onDoubleClick={e => { e.stopPropagation(); setEditId(b.id); setSelId(b.id) }}
              onClick={e => { e.stopPropagation(); setSelId(b.id) }}
            >
              {content}
              {isSel && !isEdit && <div style={{position:'absolute',inset:-2,border:`2px solid ${accentColor}`,borderRadius:3,pointerEvents:'none',zIndex:99}}/>}
              {isSel && !isEdit && !b.locked && Object.keys(HANDLE_POS).map(h => (
                <div key={h} onMouseDown={e => onHandleDown(e, b.id, h)} style={{position:'absolute',width:H_SZ,height:H_SZ,background:'#fff',border:`2px solid ${accentColor}`,borderRadius:2,zIndex:100,...HANDLE_POS[h]}}/>
              ))}
            </div>
          )
        })}
      </div>

      {/* Floating add button */}
      <div className="pdf-hidden" style={{ position:'absolute', bottom:8, right:8, zIndex:20, display:'flex', gap:4 }}>
        <button onClick={e => { e.stopPropagation(); addTextShape() }}
          title="Ajouter du texte"
          style={{ width:28, height:28, borderRadius:7, background:'rgba(27,79,216,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', backdropFilter:'blur(4px)' }}>
          <Type size={12}/>
        </button>
        <button onClick={e => { e.stopPropagation(); setShowPicker(v => !v) }}
          title="Ajouter une forme"
          style={{ width:28, height:28, borderRadius:7, background: showPicker ? 'var(--accent)' : 'rgba(27,79,216,.9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', backdropFilter:'blur(4px)' }}>
          <Plus size={12}/>
        </button>
        {selId && (
          <button onClick={e => { e.stopPropagation(); onRemove(selId); setSelId(null) }}
            title="Supprimer"
            style={{ width:28, height:28, borderRadius:7, background:'rgba(220,38,38,.85)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            <X size={12}/>
          </button>
        )}
      </div>

      {/* Shape picker popover */}
      {showPicker && (
        <div
          className="pdf-hidden"
          onClick={e => e.stopPropagation()}
          style={{ position:'absolute', bottom:44, right:8, zIndex:500, width:260, maxHeight:340, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,.2)', overflow:'hidden', display:'flex', flexDirection:'column' }}
        >
          <div style={{ padding:'8px 10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
            <input
              placeholder="🔍 Rechercher une forme…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ width:'100%', padding:'5px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text)', fontSize:11, outline:'none', boxSizing:'border-box' }}
            />
          </div>
          <div style={{ overflowY:'auto', flex:1, padding:'6px 8px' }}>
            {(filteredShapes ? [{ group:'Résultats', shapes: filteredShapes }] : SHAPE_CATALOG).map(group => (
              group.shapes.length === 0 ? null :
              <div key={group.group}>
                {!searchQ && <div style={{ fontSize:8, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text4)', padding:'4px 2px 3px' }}>{group.group}</div>}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:2, marginBottom:4 }}>
                  {group.shapes.map(({s,i,l}) => (
                    <button key={s} onClick={() => addShape(s)} title={l}
                      style={{ padding:'5px 2px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg)', cursor:'pointer', fontSize:12, display:'flex', flexDirection:'column', alignItems:'center', gap:1 }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = accentColor; el.style.background = `${accentColor}12` }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.background = 'var(--bg)' }}>
                      <span>{i}</span>
                      <span style={{ fontSize:6, color:'var(--text4)', whiteSpace:'nowrap', overflow:'hidden', maxWidth:'100%' }}>{l}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}