// ── Helper geometry ───────────────────────────────────────────────────────────
export function ngon(n: number, cx=50, cy=50, r=48, start=-Math.PI/2): string {
    return Array.from({length:n},(_,i)=>{
      const a=start+(2*Math.PI*i/n)
      return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`
    }).join(' ')
  }
  
  export function starPts(n: number, R=48, r=20, cx=50, cy=50): string {
    return Array.from({length:n*2},(_,i)=>{
      const a=-Math.PI/2+(Math.PI*i/n)
      const rr=i%2===0?R:r
      return `${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)}`
    }).join(' ')
  }
  
  export function explosionPts(n: number, R=48, r=30): string {
    return Array.from({length:n*2},(_,i)=>{
      const a=-Math.PI/2+(Math.PI*i/n)+(i%2===1?Math.PI/n*0.3:0)
      const rr=i%2===0?R:r
      return `${(50+rr*Math.cos(a)).toFixed(1)},${(50+rr*Math.sin(a)).toFixed(1)}`
    }).join(' ')
  }
  
  type ShapeRender = { path?: string; special?: string; strokeOnly?: boolean }
  
  export const SHAPE_LIB: Record<string, ShapeRender> = {
    line:              { path:'M2,50 L98,50', strokeOnly:true },
    arrow_right:       { path:'M2,50 L78,50 M78,35 L98,50 L78,65 Z', strokeOnly:true },
    arrow_left:        { path:'M98,50 L22,50 M22,35 L2,50 L22,65 Z', strokeOnly:true },
    arrow_double:      { path:'M22,35 L2,50 L22,65 L22,50 L78,50 L78,35 L98,50 L78,65', strokeOnly:true },
    connector_direct:  { path:'M2,50 L98,50', strokeOnly:true },
    connector_arrow:   { path:'M2,50 L85,50 M75,40 L98,50 L75,60', strokeOnly:true },
    connector_elbow:   { path:'M2,80 L50,80 L50,20 L98,20', strokeOnly:true },
    connector_curve:   { path:'M2,80 C30,80 70,20 98,20', strokeOnly:true },
    curve:             { path:'M2,80 C25,10 75,90 98,20', strokeOnly:true },
    scribble:          { path:'M2,50 C10,35 15,65 25,50 C35,35 40,65 50,50 C60,35 65,65 75,50 C85,35 90,65 98,50', strokeOnly:true },
    rect:              { path:'M2,2 L98,2 L98,98 L2,98 Z' },
    rect_round:        { special:'rect_round' },
    rect_snip1:        { path:'M2,2 L80,2 L98,20 L98,98 L2,98 Z' },
    rect_snip2:        { path:'M15,2 L85,2 L98,15 L98,85 L85,98 L15,98 L2,85 L2,15 Z' },
    rect_fold:         { path:'M2,2 L80,2 L98,20 L98,98 L2,98 Z M80,2 L80,20 L98,20' },
    ellipse:           { special:'ellipse' },
    triangle_iso:      { path:'M50,2 L98,98 L2,98 Z' },
    triangle_right:    { path:'M2,2 L98,98 L2,98 Z' },
    parallelogram:     { path:'M20,2 L98,2 L80,98 L2,98 Z' },
    trapezoid:         { path:'M20,2 L80,2 L98,98 L2,98 Z' },
    diamond:           { path:'M50,2 L98,50 L50,98 L2,50 Z' },
    pentagon:          { path:`M${ngon(5)}Z` },
    hexagon:           { path:`M${ngon(6)}Z` },
    octagon:           { path:`M${ngon(8)}Z` },
    dodecagon:         { path:`M${ngon(12)}Z` },
    cylinder:          { special:'cylinder' },
    frame:             { special:'frame' },
    donut:             { special:'donut' },
    heart:             { path:'M50,88 C22,68 2,52 2,32 Q2,8 26,8 Q38,8 50,22 Q62,8 74,8 Q98,8 98,32 Q98,52 50,88 Z' },
    lightning:         { path:'M60,2 L20,52 L48,52 L38,98 L78,45 L50,45 Z' },
    star4:             { path:`M${starPts(4,48,18)}Z` },
    star5:             { path:`M${starPts(5,48,20)}Z` },
    star6:             { path:`M${starPts(6,48,24)}Z` },
    star8:             { path:`M${starPts(8,48,20)}Z` },
    exp8:              { path:`M${explosionPts(8,48,28)}Z` },
    exp14:             { path:`M${explosionPts(14,48,32)}Z` },
    barrow_r:          { path:'M2,30 L65,30 L65,10 L98,50 L65,90 L65,70 L2,70 Z' },
    barrow_l:          { path:'M98,30 L35,30 L35,10 L2,50 L35,90 L35,70 L98,70 Z' },
    barrow_u:          { path:'M30,98 L30,35 L10,35 L50,2 L90,35 L70,35 L70,98 Z' },
    barrow_d:          { path:'M30,2 L30,65 L10,65 L50,98 L90,65 L70,65 L70,2 Z' },
    chevron:           { path:'M2,2 L70,2 L98,50 L70,98 L2,98 L30,50 Z' },
    cross:             { path:'M35,2 L65,2 L65,35 L98,35 L98,65 L65,65 L65,98 L35,98 L35,65 L2,65 L2,35 L35,35 Z' },
    moon:              { path:'M50,5 A45,45 0 1,1 50,95 A28,45 0 1,0 50,5 Z' },
    cloud:             { special:'cloud' },
    banner_wavy:       { path:'M2,40 C18,24 32,58 50,40 C68,22 82,56 98,40 L98,60 C82,76 68,42 50,60 C32,78 18,44 2,60 Z' },
    banner_vcut:       { path:'M2,28 L80,28 L98,50 L80,72 L2,72 L18,50 Z' },
    callout_rect:      { path:'M2,2 L98,2 L98,70 L55,70 L42,98 L38,70 L2,70 Z' },
    callout_round:     { path:'M12,2 L88,2 Q98,2 98,12 L98,58 Q98,68 88,68 L55,68 L42,98 L38,68 L12,68 Q2,68 2,58 L2,12 Q2,2 12,2 Z' },
    ribbon_u:          { path:'M2,60 C2,40 2,5 50,5 C98,5 98,40 98,60 L80,55 L65,80 L50,65 L35,80 L20,55 Z' },
    ribbon_d:          { path:'M2,40 C2,60 2,95 50,95 C98,95 98,60 98,40 L80,45 L65,20 L50,35 L35,20 L20,45 Z' },
    scroll_h:          { special:'scroll_h' },
    fc_process:        { path:'M2,2 L98,2 L98,98 L2,98 Z' },
    fc_decision:       { path:'M50,2 L98,50 L50,98 L2,50 Z' },
    fc_terminator:     { path:'M20,2 L80,2 Q98,2 98,20 L98,80 Q98,98 80,98 L20,98 Q2,98 2,80 L2,20 Q2,2 20,2 Z' },
    fc_document:       { path:'M2,2 L98,2 L98,80 C75,98 25,62 2,80 Z' },
    fc_prep:           { path:'M25,2 L75,2 L98,50 L75,98 L25,98 L2,50 Z' },
    no_sign:           { special:'no_sign' },
    smiley:            { special:'smiley' },
    teardrop:          { path:'M50,2 C80,2 98,30 98,50 A48,48 0 1,1 2,50 C2,30 20,2 50,2 Z' },
    L_shape:           { path:'M2,2 L50,2 L50,50 L98,50 L98,98 L2,98 Z' },
    plaque:            { path:'M15,2 L85,2 Q98,2 98,15 L98,85 Q98,98 85,98 L15,98 Q2,98 2,85 L2,15 Q2,2 15,2 Z' },
    U_shape:           { path:'M2,2 L30,2 L30,65 Q30,98 50,98 Q70,98 70,65 L70,2 L98,2 L98,70 Q98,98 50,98 Q2,98 2,70 Z' },
    sun:               { special:'sun' },
    larme:             { path:'M50,2 C80,2 98,30 98,50 A48,48 0 1,1 2,50 C2,30 20,2 50,2 Z' },
  }
  
  export const SHAPE_CATALOG = [
    { group:'Lignes', shapes:[
      {s:'line',i:'─',l:'Ligne'},{s:'arrow_right',i:'→',l:'Flèche →'},
      {s:'arrow_left',i:'←',l:'Flèche ←'},{s:'arrow_double',i:'↔',l:'Flèche ↔'},
      {s:'connector_direct',i:'╌',l:'Connecteur'},{s:'connector_arrow',i:'↦',l:'Conn. flèche'},
      {s:'connector_elbow',i:'⌐',l:'Coudé'},{s:'connector_curve',i:'⌒',l:'Courbe'},
      {s:'curve',i:'∫',l:'Courbe libre'},{s:'scribble',i:'〜',l:'Scribble'},
    ]},
    { group:'Rectangles', shapes:[
      {s:'rect',i:'▬',l:'Rectangle'},{s:'rect_round',i:'▭',l:'Coins arrondis'},
      {s:'rect_snip1',i:'◱',l:'1 coin coupé'},{s:'rect_snip2',i:'◪',l:'Coins coupés'},
      {s:'rect_fold',i:'⌐',l:'Coin plié'},
    ]},
    { group:'Formes', shapes:[
      {s:'ellipse',i:'●',l:'Ellipse'},{s:'triangle_iso',i:'▲',l:'Triangle'},
      {s:'parallelogram',i:'▱',l:'Parallélogramme'},{s:'trapezoid',i:'⏢',l:'Trapèze'},
      {s:'diamond',i:'◆',l:'Losange'},{s:'pentagon',i:'⬠',l:'Pentagone'},
      {s:'hexagon',i:'⬡',l:'Hexagone'},{s:'octagon',i:'⯃',l:'Octogone'},
      {s:'dodecagon',i:'⬡',l:'Dodécagone'},{s:'cylinder',i:'⊙',l:'Cylindre'},
      {s:'frame',i:'▭',l:'Cadre'},{s:'donut',i:'◉',l:'Anneau'},
      {s:'teardrop',i:'◉',l:'Larme'},{s:'L_shape',i:'⌐',l:'Forme L'},
      {s:'plaque',i:'⬮',l:'Plaque'},{s:'U_shape',i:'∪',l:'Forme U'},
      {s:'cross',i:'✚',l:'Croix'},{s:'no_sign',i:'⊘',l:'Interdit'},
      {s:'smiley',i:'☺',l:'Smiley'},{s:'heart',i:'♥',l:'Cœur'},
      {s:'lightning',i:'⚡',l:'Éclair'},{s:'sun',i:'☀',l:'Soleil'},
      {s:'moon',i:'☽',l:'Lune'},{s:'cloud',i:'☁',l:'Nuage'},
      {s:'larme',i:'💧',l:'Goutte'},
    ]},
    { group:'Flèches', shapes:[
      {s:'barrow_r',i:'▶',l:'Flèche →'},{s:'barrow_l',i:'◀',l:'Flèche ←'},
      {s:'barrow_u',i:'▲',l:'Flèche ↑'},{s:'barrow_d',i:'▼',l:'Flèche ↓'},
      {s:'chevron',i:'›',l:'Chevron'},
    ]},
    { group:'Étoiles', shapes:[
      {s:'star4',i:'✦',l:'Étoile 4'},{s:'star5',i:'★',l:'Étoile 5'},
      {s:'star6',i:'✡',l:'Étoile 6'},{s:'star8',i:'✴',l:'Étoile 8'},
      {s:'exp8',i:'✸',l:'Explosion 8'},{s:'exp14',i:'✹',l:'Explosion 14'},
      {s:'banner_wavy',i:'〜',l:'Bannière'},{s:'banner_vcut',i:'▷',l:'Fléchée'},
      {s:'ribbon_u',i:'🎀',l:'Ruban haut'},{s:'ribbon_d',i:'🎀',l:'Ruban bas'},
      {s:'scroll_h',i:'📜',l:'Parchemin'},
    ]},
    { group:'Bulles', shapes:[
      {s:'callout_rect',i:'💬',l:'Légende rect.'},{s:'callout_round',i:'💬',l:'Légende arron.'},
    ]},
    { group:'Organigramme', shapes:[
      {s:'fc_process',i:'▬',l:'Processus'},{s:'fc_decision',i:'◆',l:'Décision'},
      {s:'fc_terminator',i:'⬮',l:'Terminateur'},{s:'fc_document',i:'⬟',l:'Document'},
      {s:'fc_prep',i:'⬡',l:'Préparation'},
    ]},
  ]
  
  export const ALL_SHAPES = SHAPE_CATALOG.flatMap(g => g.shapes)
  
  export interface PageShape {
    id: string
    type: 'text' | 'rect' | 'image'
    shape?: string
    x: number; y: number; w: number; h: number; z: number
    opacity?: number
    rotation?: number
    locked?: boolean
    // Text
    text?: string; fontSize?: number
    fontWeight?: 'normal' | 'bold' | 'black'
    fontStyle?: 'normal' | 'italic'
    color?: string
    align?: 'left' | 'center' | 'right'
    letterSpacing?: number; lineHeight?: number; fontFamily?: string
    // Shape fill
    fill?: string; fillOpacity?: number
    stroke?: string; strokeWidth?: number; radius?: number
    useGradient?: boolean
    gradient?: { type: 'linear' | 'radial'; color1: string; color2: string; angle?: number }
    // Image
    src?: string; objectFit?: 'contain' | 'cover' | 'fill'
    // Inner text
    innerText?: string; innerFontSize?: number; innerColor?: string
    innerFontFamily?: string; innerAlign?: 'left' | 'center' | 'right'
    innerBold?: boolean; innerItalic?: boolean
  }
  
  // ── SVG Renderer ──────────────────────────────────────────────────────────────
  interface ShapeSVGProps {
    shape: PageShape
    accent: string
  }
  
  export function renderShapeSVG(b: PageShape, accent: string): React.ReactNode {
    // This is imported by React components that render JSX
    return null // placeholder — see PageShapeLayer for actual render
  }
  
  // Pure SVG string generator (no React needed)
  export function getShapePathData(shapeKey: string): ShapeRender | null {
    return SHAPE_LIB[shapeKey] || null
  }