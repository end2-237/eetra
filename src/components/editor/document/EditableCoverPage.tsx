'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useDocument } from '@/contexts/DocumentContext'
import { useProfile } from '@/contexts/ProfileContext'
import { usePlan } from '@/contexts/PlanContext'
import { useQR } from '@/hooks/useQR'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'
import type { CoverBlock } from '@/components/editor/cover/CoverPageEditor'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type GradType = 'linear' | 'radial'
type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge'
type PageBorderStyle =
  | 'none' | 'simple' | 'double' | 'thick' | 'dashed' | 'ornate' | 'shadow' | 'inset'
  | 'dotted' | 'wave' | 'glow' | 'ribbon' | 'frame3d' | 'blueprint' | 'neon'
type PageBgType = 'solid' | 'gradient' | 'pattern'
type PatternType = 'dots' | 'lines' | 'grid' | 'diagonal' | 'cross' | 'wave' | 'chevron'

type ExtBlock = CoverBlock & {
  shape?: string
  gradient?: { type: GradType; color1: string; color2: string; color3?: string; angle?: number }
  useGradient?: boolean
  shadow?: { x: number; y: number; blur: number; color: string }
  useShadow?: boolean
  border?: { width: number; color: string; style: BorderStyle }
  useBorder?: boolean
  fontFamily?: string
  textShadow?: string
  gradient_text?: boolean
  underline?: boolean; strikethrough?: boolean; overline?: boolean
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  blur?: number; useBlur?: boolean
  locked?: boolean
  groupId?: string
  innerText?: string
  innerFontSize?: number
  innerFontWeight?: string
  innerColor?: string
  innerFontFamily?: string
  innerAlign?: 'left' | 'center' | 'right'
  innerBold?: boolean
  innerItalic?: boolean
}

interface PageConfig {
  bgType: PageBgType; bgColor: string; bgColor2: string; bgGradAngle: number
  bgPattern: PatternType; bgPatternColor: string; bgPatternOpacity: number
  borderStyle: PageBorderStyle; borderColor: string; borderWidth: number
  showQr: boolean
}

// ─────────────────────────────────────────────────────────────────────────────
// SHAPE LIBRARY
// ─────────────────────────────────────────────────────────────────────────────

function ngon(n: number, cx=50, cy=50, r=48, start=-Math.PI/2): string {
  return Array.from({length:n},(_,i)=>{
    const a=start+(2*Math.PI*i/n)
    return `${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

function starPts(n: number, R=48, r=20, cx=50, cy=50): string {
  return Array.from({length:n*2},(_,i)=>{
    const a=-Math.PI/2+(Math.PI*i/n)
    const rr=i%2===0?R:r
    return `${(cx+rr*Math.cos(a)).toFixed(1)},${(cy+rr*Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

function explosionPts(n: number, R=48, r=30): string {
  return Array.from({length:n*2},(_,i)=>{
    const a=-Math.PI/2+(Math.PI*i/n)+(i%2===1?Math.PI/n*0.3:0)
    const rr=i%2===0?R:r
    return `${(50+rr*Math.cos(a)).toFixed(1)},${(50+rr*Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

type ShapeRender = { path?: string; special?: string; strokeOnly?: boolean; fill?: boolean }

const SHAPE_LIB: Record<string, ShapeRender> = {
  line:              { path:'M2,50 L98,50', strokeOnly:true },
  arrow_right:       { path:'M2,50 L78,50 M78,35 L98,50 L78,65 Z', strokeOnly:true },
  arrow_left:        { path:'M98,50 L22,50 M22,35 L2,50 L22,65 Z', strokeOnly:true },
  arrow_double:      { path:'M22,35 L2,50 L22,65 L22,50 L78,50 L78,35 L98,50 L78,65', strokeOnly:true },
  connector_direct:  { path:'M2,50 L98,50', strokeOnly:true },
  connector_arrow:   { path:'M2,50 L85,50 M75,40 L98,50 L75,60', strokeOnly:true },
  connector_arrow2:  { path:'M25,40 L2,50 L25,60 M2,50 L98,50 M73,40 L98,50 L73,60', strokeOnly:true },
  connector_elbow:   { path:'M2,80 L50,80 L50,20 L98,20', strokeOnly:true },
  connector_elbow_a: { path:'M2,80 L50,80 L50,20 L85,20 M75,10 L98,20 L75,30', strokeOnly:true },
  connector_elbow_a2:{ path:'M25,90 L2,80 L25,70 M2,80 L50,80 L50,20 L98,20 M73,10 L98,20 L73,30', strokeOnly:true },
  connector_curve:   { path:'M2,80 C30,80 70,20 98,20', strokeOnly:true },
  connector_curve_a: { path:'M2,80 C30,80 70,20 85,20 M75,10 L98,20 L75,30', strokeOnly:true },
  connector_curve_a2:{ path:'M25,90 L2,80 L25,70 M2,80 C30,80 70,20 98,20 M73,10 L98,20 L73,30', strokeOnly:true },
  curve:             { path:'M2,80 C25,10 75,90 98,20', strokeOnly:true },
  scribble:          { path:'M2,50 C10,35 15,65 25,50 C35,35 40,65 50,50 C60,35 65,65 75,50 C85,35 90,65 98,50', strokeOnly:true },
  rect:              { path:'M2,2 L98,2 L98,98 L2,98 Z' },
  rect_round:        { special:'rect_round' },
  rect_snip1:        { path:'M2,2 L80,2 L98,20 L98,98 L2,98 Z' },
  rect_snip2:        { path:'M15,2 L85,2 L98,15 L98,85 L85,98 L15,98 L2,85 L2,15 Z' },
  rect_snip_same:    { path:'M2,2 L80,2 L98,20 L98,80 L80,98 L2,98 Z' },
  rect_snip_diag:    { path:'M15,2 L98,2 L98,85 L85,98 L2,98 L2,15 Z' },
  rect_fold:         { path:'M2,2 L80,2 L98,20 L98,98 L2,98 Z M80,2 L80,20 L98,20' },
  rect_fold_corner:  { path:'M2,2 L80,2 L80,20 L98,20 L98,98 L2,98 Z' },
  rect_round_same:   { special:'rect_round_same' },
  ellipse:           { special:'ellipse' },
  triangle_iso:      { path:'M50,2 L98,98 L2,98 Z' },
  triangle_right:    { path:'M2,2 L98,98 L2,98 Z' },
  parallelogram:     { path:'M20,2 L98,2 L80,98 L2,98 Z' },
  trapezoid:         { path:'M20,2 L80,2 L98,98 L2,98 Z' },
  diamond:           { path:'M50,2 L98,50 L50,98 L2,50 Z' },
  pentagon:          { path:`M${ngon(5)}Z` },
  hexagon:           { path:`M${ngon(6)}Z` },
  heptagon:          { path:`M${ngon(7)}Z` },
  octagon:           { path:`M${ngon(8)}Z` },
  decagon:           { path:`M${ngon(10)}Z` },
  dodecagon:         { path:`M${ngon(12)}Z` },
  cylinder:          { special:'cylinder' },
  cube:              { special:'cube' },
  frame:             { special:'frame' },
  donut:             { special:'donut' },
  teardrop:          { path:'M50,98 C20,98 2,70 2,50 A48,48 0 1,1 98,50 C98,70 80,98 50,98 Z' },
  L_shape:           { path:'M2,2 L50,2 L50,50 L98,50 L98,98 L2,98 Z' },
  arc:               { path:'M5,95 A65,65 0 0,1 95,95', strokeOnly:true },
  arc_filled:        { path:'M50,50 L5,95 A65,65 0 0,1 95,95 Z' },
  plaque:            { path:'M15,2 L85,2 Q98,2 98,15 L98,85 Q98,98 85,98 L15,98 Q2,98 2,85 L2,15 Q2,2 15,2 Z' },
  double_plaque:     { special:'double_plaque' },
  U_shape:           { path:'M2,2 L30,2 L30,65 Q30,98 50,98 Q70,98 70,65 L70,2 L98,2 L98,70 Q98,98 50,98 Q2,98 2,70 Z' },
  cross:             { path:'M35,2 L65,2 L65,35 L98,35 L98,65 L65,65 L65,98 L35,98 L35,65 L2,65 L2,35 L35,35 Z' },
  no_sign:           { special:'no_sign' },
  smiley:            { special:'smiley' },
  heart:             { path:'M50,88 C22,68 2,52 2,32 Q2,8 26,8 Q38,8 50,22 Q62,8 74,8 Q98,8 98,32 Q98,52 50,88 Z' },
  lightning:         { path:'M60,2 L20,52 L48,52 L38,98 L78,45 L50,45 Z' },
  sun:               { special:'sun' },
  moon:              { path:'M50,5 A45,45 0 1,1 50,95 A28,45 0 1,0 50,5 Z' },
  cloud:             { special:'cloud' },
  larme:             { path:'M50,2 C80,2 98,30 98,50 A48,48 0 1,1 2,50 C2,30 20,2 50,2 Z' },
  barrow_r:   { path:'M2,30 L65,30 L65,10 L98,50 L65,90 L65,70 L2,70 Z' },
  barrow_l:   { path:'M98,30 L35,30 L35,10 L2,50 L35,90 L35,70 L98,70 Z' },
  barrow_u:   { path:'M30,98 L30,35 L10,35 L50,2 L90,35 L70,35 L70,98 Z' },
  barrow_d:   { path:'M30,2 L30,65 L10,65 L50,98 L90,65 L70,65 L70,2 Z' },
  barrow_lr:  { path:'M2,50 L22,20 L22,38 L78,38 L78,20 L98,50 L78,80 L78,62 L22,62 L22,80 Z' },
  barrow_ud:  { path:'M50,2 L20,22 L38,22 L38,78 L20,78 L50,98 L80,78 L62,78 L62,22 L80,22 Z' },
  barrow_quad:{ path:'M50,2 L30,22 L40,22 L40,40 L22,40 L22,30 L2,50 L22,70 L22,60 L40,60 L40,78 L30,78 L50,98 L70,78 L60,78 L60,60 L78,60 L78,70 L98,50 L78,30 L78,40 L60,40 L60,22 L70,22 Z' },
  barrow_bent:{ path:'M2,70 L2,30 L55,30 L55,10 L98,50 L55,90 L55,70 Z' },
  barrow_U:   { path:'M15,2 L40,2 L40,60 Q40,80 50,80 Q60,80 60,60 L60,2 L85,2 L85,65 Q85,98 50,98 Q15,98 15,65 Z' },
  chevron:    { path:'M2,2 L70,2 L98,50 L70,98 L2,98 L30,50 Z' },
  chevron2:   { path:'M2,2 L55,2 L83,50 L55,98 L2,98 L30,50 Z M55,2 L83,2 L98,50 L83,98 L55,98 L70,50 Z' },
  barrow_circ:{ path:'M50,5 A45,45 0 0,1 85,70 L75,70 Q90,90 95,50 Q90,10 50,5 Z' },
  barrow_rib_u:{ path:'M20,98 L20,40 L2,40 L50,2 L98,40 L80,40 L80,98 L60,85 L50,98 L40,85 Z' },
  barrow_rib_d:{ path:'M20,2 L20,60 L2,60 L50,98 L98,60 L80,60 L80,2 L60,15 L50,2 L40,15 Z' },
  eq_plus:    { path:'M38,2 L62,2 L62,38 L98,38 L98,62 L62,62 L62,98 L38,98 L38,62 L2,62 L2,38 L38,38 Z' },
  eq_minus:   { path:'M2,38 L98,38 L98,62 L2,62 Z' },
  eq_multiply:{ path:`M${starPts(4,46,18)}Z` },
  eq_divide:  { path:'M35,40 L65,40 L65,60 L35,60 Z M45,15 A5,5 0 1,1 55,15 A5,5 0 1,1 45,15 Z M45,80 A5,5 0 1,1 55,80 A5,5 0 1,1 45,80 Z', special:'eq_divide' },
  eq_equal:   { path:'M2,32 L98,32 L98,45 L2,45 Z M2,55 L98,55 L98,68 L2,68 Z' },
  eq_notequal:{ path:'M2,32 L98,32 L98,45 L2,45 Z M2,55 L98,55 L98,68 L2,68 Z M65,5 L35,95', special:'eq_notequal' },
  fc_process:   { path:'M2,2 L98,2 L98,98 L2,98 Z' },
  fc_process_alt:{ path:'M15,2 L85,2 Q98,2 98,15 L98,85 Q98,98 85,98 L15,98 Q2,98 2,85 L2,15 Q2,2 15,2 Z' },
  fc_decision:  { path:'M50,2 L98,50 L50,98 L2,50 Z' },
  fc_data:      { path:'M20,2 L98,2 L80,98 L2,98 Z' },
  fc_predefined:{ special:'fc_predefined' },
  fc_internal:  { special:'fc_internal' },
  fc_document:  { path:'M2,2 L98,2 L98,80 C75,98 25,62 2,80 Z' },
  fc_multidoc:  { special:'fc_multidoc' },
  fc_terminator:{ path:'M20,2 L80,2 Q98,2 98,20 L98,80 Q98,98 80,98 L20,98 Q2,98 2,80 L2,20 Q2,2 20,2 Z' },
  fc_prep:      { path:'M25,2 L75,2 L98,50 L75,98 L25,98 L2,50 Z' },
  fc_manual_op: { path:'M2,2 L98,2 L80,98 L20,98 Z' },
  fc_manual_in: { path:'M2,20 L98,2 L98,98 L2,98 Z' },
  fc_card:      { path:'M2,15 L15,2 L98,2 L98,98 L2,98 Z' },
  fc_punch:     { special:'fc_punch' },
  fc_sum:       { path:'M98,2 L2,50 L98,98 Z' },
  fc_or:        { path:'M2,50 C2,2 98,2 98,50 C98,98 2,98 2,50 Z', special:'fc_or' },
  fc_collate:   { path:'M2,2 L98,2 L50,50 L98,98 L2,98 L50,50 Z' },
  fc_sort:      { path:'M50,2 L98,50 L50,98 L2,50 Z M2,50 L98,50' },
  fc_extract:   { path:'M2,2 L98,2 L50,98 Z' },
  fc_merge:     { path:'M2,98 L98,98 L50,2 Z' },
  fc_offline:   { path:`M${ngon(3)}Z` },
  fc_delay:     { path:'M2,2 L70,2 Q98,2 98,50 Q98,98 70,98 L2,98 Z' },
  fc_magdisk:   { special:'fc_magdisk' },
  fc_direct:    { special:'fc_direct' },
  fc_display:   { path:'M20,2 L80,2 Q98,2 98,20 L98,80 Q98,98 80,98 L20,98 Q2,65 2,50 Q2,35 20,2 Z' },
  star4:    { path:`M${starPts(4,48,18)}Z` },
  star5:    { path:`M${starPts(5,48,20)}Z` },
  star6:    { path:`M${starPts(6,48,24)}Z` },
  star7:    { path:`M${starPts(7,48,22)}Z` },
  star8:    { path:`M${starPts(8,48,20)}Z` },
  star10:   { path:`M${starPts(10,48,20)}Z` },
  star12:   { path:`M${starPts(12,48,24)}Z` },
  exp8:     { path:`M${explosionPts(8,48,28)}Z` },
  exp14:    { path:`M${explosionPts(14,48,32)}Z` },
  exp16:    { path:`M${explosionPts(16,48,33)}Z` },
  exp24:    { path:`M${explosionPts(24,48,36)}Z` },
  exp32:    { path:`M${explosionPts(32,48,38)}Z` },
  ribbon_u: { path:'M2,60 C2,40 2,5 50,5 C98,5 98,40 98,60 L80,55 L65,80 L50,65 L35,80 L20,55 Z' },
  ribbon_d: { path:'M2,40 C2,60 2,95 50,95 C98,95 98,60 98,40 L80,45 L65,20 L50,35 L35,20 L20,45 Z' },
  ribbon_tilt:{ path:'M2,70 L20,55 L15,25 L50,40 L85,5 L95,35 L75,55 L98,70 L65,65 L50,95 L35,65 Z' },
  banner_u: { path:'M2,30 L2,80 C2,90 98,90 98,80 L98,30 L75,50 L50,30 L25,50 Z' },
  banner_d: { path:'M2,70 L2,20 C2,10 98,10 98,20 L98,70 L75,50 L50,70 L25,50 Z' },
  scroll_h: { special:'scroll_h' },
  scroll_v: { special:'scroll_v' },
  banner_cls:  { special:'banner_cls' },
  banner_3d:   { special:'banner_3d' },
  banner_plate:{ special:'banner_plate' },
  banner_wavy: { path:'M2,40 C18,24 32,58 50,40 C68,22 82,56 98,40 L98,60 C82,76 68,42 50,60 C32,78 18,44 2,60 Z' },
  banner_vcut: { path:'M2,28 L80,28 L98,50 L80,72 L2,72 L18,50 Z' },
  callout_rect:  { path:'M2,2 L98,2 L98,70 L55,70 L42,98 L38,70 L2,70 Z' },
  callout_round: { path:'M12,2 L88,2 Q98,2 98,12 L98,58 Q98,68 88,68 L55,68 L42,98 L38,68 L12,68 Q2,68 2,58 L2,12 Q2,2 12,2 Z' },
  callout_oval:  { special:'callout_oval' },
  callout_cloud: { special:'callout_cloud' },
  callout_l1:    { path:'M2,2 L98,2 L98,70 L80,70 L75,98 L65,70 L2,70 Z' },
  callout_l2:    { path:'M2,2 L98,2 L98,70 L70,70 L60,85 L55,70 L2,70 Z' },
  callout_l3:    { path:'M2,2 L98,2 L98,70 L2,70 Z M50,70 L45,90 L55,90 Z' },
}

const SHAPE_CATALOG = [
  { group:'Lignes', shapes:[
    {s:'line',i:'─',l:'Ligne'},{s:'arrow_right',i:'→',l:'Flèche →'},
    {s:'arrow_double',i:'↔',l:'Flèche ↔'},{s:'connector_direct',i:'╌',l:'Connecteur'},
    {s:'connector_arrow',i:'↦',l:'Conn. flèche'},{s:'connector_arrow2',i:'↔',l:'Conn. 2 flèches'},
    {s:'connector_elbow',i:'⌐',l:'Coudé'},{s:'connector_elbow_a',i:'↩',l:'Coudé flèche'},
    {s:'connector_elbow_a2',i:'↔',l:'Coudé 2 fl.'},{s:'connector_curve',i:'⌒',l:'Courbe'},
    {s:'connector_curve_a',i:'⟿',l:'Courbe fl.'},{s:'connector_curve_a2',i:'⟺',l:'Courbe 2 fl.'},
    {s:'curve',i:'∫',l:'Courbe libre'},{s:'scribble',i:'〜',l:'Scribble'},
  ]},
  { group:'Rectangles', shapes:[
    {s:'rect',i:'▬',l:'Rectangle'},{s:'rect_round',i:'▭',l:'Coins arrondis'},
    {s:'rect_snip1',i:'◱',l:'1 coin coupé'},{s:'rect_snip2',i:'◪',l:'Coins coupés'},
    {s:'rect_snip_same',i:'◫',l:'2 côtés coupés'},{s:'rect_snip_diag',i:'▨',l:'Diag. coupé'},
    {s:'rect_fold',i:'⌐',l:'Coin plié'},{s:'rect_fold_corner',i:'⌐',l:'Coin replié'},
    {s:'rect_round_same',i:'▭',l:'2 côtés ronds'},
  ]},
  { group:'Formes de base', shapes:[
    {s:'ellipse',i:'●',l:'Ellipse'},{s:'triangle_iso',i:'▲',l:'Triangle iso.'},
    {s:'triangle_right',i:'◁',l:'Triangle rect.'},{s:'parallelogram',i:'▱',l:'Parallélogramme'},
    {s:'trapezoid',i:'⏢',l:'Trapèze'},{s:'diamond',i:'◆',l:'Losange'},
    {s:'pentagon',i:'⬠',l:'Pentagone'},{s:'hexagon',i:'⬡',l:'Hexagone'},
    {s:'heptagon',i:'⬡',l:'Heptagone'},{s:'octagon',i:'⯃',l:'Octogone'},
    {s:'decagon',i:'⬟',l:'Décagone'},{s:'dodecagon',i:'⬡',l:'Dodécagone'},
    {s:'cylinder',i:'⊙',l:'Cylindre'},{s:'cube',i:'⬛',l:'Cube'},
    {s:'frame',i:'▭',l:'Cadre'},{s:'donut',i:'◉',l:'Anneau'},
    {s:'teardrop',i:'◉',l:'Larme'},{s:'L_shape',i:'⌐',l:'Forme L'},
    {s:'arc',i:'⌒',l:'Arc'},{s:'arc_filled',i:'◔',l:'Arc plein'},
    {s:'plaque',i:'⬮',l:'Plaque'},{s:'double_plaque',i:'⬮',l:'Double plaque'},
    {s:'U_shape',i:'∪',l:'Forme U'},{s:'cross',i:'✚',l:'Croix'},
    {s:'no_sign',i:'⊘',l:'Interdit'},{s:'smiley',i:'☺',l:'Smiley'},
    {s:'heart',i:'♥',l:'Cœur'},{s:'lightning',i:'⚡',l:'Éclair'},
    {s:'sun',i:'☀',l:'Soleil'},{s:'moon',i:'☽',l:'Lune'},
    {s:'cloud',i:'☁',l:'Nuage'},{s:'larme',i:'💧',l:'Goutte'},
  ]},
  { group:'Flèches pleines', shapes:[
    {s:'barrow_r',i:'▶',l:'Flèche droite'},{s:'barrow_l',i:'◀',l:'Flèche gauche'},
    {s:'barrow_u',i:'▲',l:'Flèche haut'},{s:'barrow_d',i:'▼',l:'Flèche bas'},
    {s:'barrow_lr',i:'◀▶',l:'Fl. horiz.'},{s:'barrow_ud',i:'▲▼',l:'Fl. vert.'},
    {s:'barrow_quad',i:'✛',l:'Fl. quadruple'},{s:'barrow_bent',i:'↱',l:'Fl. coudée'},
    {s:'barrow_U',i:'↩',l:'Fl. U'},{s:'chevron',i:'›',l:'Chevron'},
    {s:'chevron2',i:'»',l:'Double chevron'},{s:'barrow_circ',i:'↻',l:'Fl. circulaire'},
    {s:'barrow_rib_u',i:'⬆',l:'Ruban haut'},{s:'barrow_rib_d',i:'⬇',l:'Ruban bas'},
  ]},
  { group:'Équation', shapes:[
    {s:'eq_plus',i:'+',l:'Plus'},{s:'eq_minus',i:'−',l:'Moins'},
    {s:'eq_multiply',i:'×',l:'Multiplier'},{s:'eq_divide',i:'÷',l:'Diviser'},
    {s:'eq_equal',i:'=',l:'Égal'},{s:'eq_notequal',i:'≠',l:'Différent'},
  ]},
  { group:'Organigrammes', shapes:[
    {s:'fc_process',i:'▬',l:'Processus'},{s:'fc_process_alt',i:'▭',l:'Proc. alt.'},
    {s:'fc_decision',i:'◆',l:'Décision'},{s:'fc_data',i:'▱',l:'Données'},
    {s:'fc_predefined',i:'⊟',l:'Prédéfini'},{s:'fc_internal',i:'⊞',l:'Stockage int.'},
    {s:'fc_document',i:'⬟',l:'Document'},{s:'fc_multidoc',i:'⬟',l:'Multi-doc'},
    {s:'fc_terminator',i:'⬮',l:'Terminateur'},{s:'fc_prep',i:'⬡',l:'Préparation'},
    {s:'fc_manual_op',i:'⏢',l:'Op. manuelle'},{s:'fc_manual_in',i:'▱',l:'Entrée man.'},
    {s:'fc_card',i:'▬',l:'Carte'},{s:'fc_sum',i:'Σ',l:'Somme'},
    {s:'fc_or',i:'∨',l:'OU logique'},{s:'fc_collate',i:'⧓',l:'Regrouper'},
    {s:'fc_sort',i:'⧖',l:'Trier'},{s:'fc_extract',i:'▽',l:'Extraire'},
    {s:'fc_merge',i:'△',l:'Fusionner'},{s:'fc_offline',i:'△',l:'Stockage'},
    {s:'fc_delay',i:'⊃',l:'Retard'},{s:'fc_display',i:'⬡',l:'Affichage'},
  ]},
  { group:'Étoiles & Bannières', shapes:[
    {s:'star4',i:'✦',l:'Étoile 4'},{s:'star5',i:'★',l:'Étoile 5'},
    {s:'star6',i:'✡',l:'Étoile 6'},{s:'star7',i:'★',l:'Étoile 7'},
    {s:'star8',i:'✴',l:'Étoile 8'},{s:'star10',i:'❋',l:'Étoile 10'},
    {s:'star12',i:'✳',l:'Étoile 12'},{s:'exp8',i:'✸',l:'Explosion 8'},
    {s:'exp14',i:'✹',l:'Explosion 14'},{s:'exp16',i:'✺',l:'Explosion 16'},
    {s:'exp24',i:'✻',l:'Explosion 24'},{s:'exp32',i:'✼',l:'Explosion 32'},
    {s:'banner_cls',i:'🎀',l:'Bannière classique'},{s:'banner_3d',i:'⌬',l:'Bannière 3D'},
    {s:'banner_plate',i:'🪧',l:'Plaque cadre'},{s:'banner_wavy',i:'〜',l:'Bannière ondulée'},
    {s:'banner_vcut',i:'▷',l:'Bannière fléchée'},
    {s:'ribbon_u',i:'🎀',l:'Ruban haut'},{s:'ribbon_d',i:'🎀',l:'Ruban bas'},
    {s:'ribbon_tilt',i:'🎗',l:'Ruban incl.'},{s:'banner_u',i:'⚑',l:'Bannière h.'},
    {s:'banner_d',i:'⚑',l:'Bannière b.'},{s:'scroll_h',i:'📜',l:'Parchemin H'},
    {s:'scroll_v',i:'📜',l:'Parchemin V'},
  ]},
  { group:'Bulles & Légendes', shapes:[
    {s:'callout_rect',i:'💬',l:'Légende rect.'},{s:'callout_round',i:'💬',l:'Légende arron.'},
    {s:'callout_oval',i:'💬',l:'Légende ovale'},{s:'callout_cloud',i:'💭',l:'Bulle pensée'},
    {s:'callout_l1',i:'💬',l:'Légende 1 seg.'},{s:'callout_l2',i:'💬',l:'Légende 2 seg.'},
    {s:'callout_l3',i:'💬',l:'Légende 3 seg.'},
  ]},
]

const ALL_SHAPES = SHAPE_CATALOG.flatMap(g => g.shapes)

// ─────────────────────────────────────────────────────────────────────────────
// SHAPE SVG RENDERER
// ─────────────────────────────────────────────────────────────────────────────

function ShapeSVG({ b, accent }: { b: ExtBlock; accent: string }) {
  const shape = (b.shape || 'rect') as string
  const def = SHAPE_LIB[shape] || SHAPE_LIB['rect']
  const id = b.id
  const gradId = `g-${id}`; const filtId = `f-${id}`
  const fillVal = b.useGradient && b.gradient ? `url(#${gradId})` : (b.fill || accent)
  const bColor = b.useBorder && b.border ? b.border.color : (b.stroke||'none')
  const bWidth = b.useBorder && b.border ? b.border.width : (b.strokeWidth||0)
  const bDash = b.border?.style==='dashed'?'8 4':b.border?.style==='dotted'?'2 4':undefined
  const op = b.fillOpacity!==undefined?b.fillOpacity:1
  const grad = b.gradient
  const lX1=grad?.angle!==undefined?`${Math.round(Math.cos((grad.angle-90)*Math.PI/180)*50+50)}%`:'0%'
  const lY1=grad?.angle!==undefined?`${Math.round(Math.sin((grad.angle-90)*Math.PI/180)*50+50)}%`:'0%'
  const lX2=grad?.angle!==undefined?`${Math.round(-Math.cos((grad.angle-90)*Math.PI/180)*50+50)}%`:'100%'
  const lY2=grad?.angle!==undefined?`${Math.round(-Math.sin((grad.angle-90)*Math.PI/180)*50+50)}%`:'100%'
  const sp = { fill:fillVal, fillOpacity:op, stroke:bColor, strokeWidth:bWidth, strokeDasharray:bDash, filter:b.useShadow&&b.shadow?`url(#${filtId})`:undefined }
  const so = { fill:'none', stroke:b.fill||accent, strokeWidth:Math.max(bWidth||0,3), strokeLinecap:'round' as const, strokeLinejoin:'round' as const, strokeDasharray:bDash, filter:b.useShadow&&b.shadow?`url(#${filtId})`:undefined }

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{overflow:'visible',display:'block'}}>
      <defs>
        {b.useGradient&&grad&&(
          grad.type==='radial'?<radialGradient id={gradId} cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor={grad.color1}/>{grad.color3&&<stop offset="50%" stopColor={grad.color3}/>}<stop offset="100%" stopColor={grad.color2}/></radialGradient>
          :<linearGradient id={gradId} x1={lX1} y1={lY1} x2={lX2} y2={lY2}><stop offset="0%" stopColor={grad.color1}/>{grad.color3&&<stop offset="50%" stopColor={grad.color3}/>}<stop offset="100%" stopColor={grad.color2}/></linearGradient>
        )}
        {b.useShadow&&b.shadow&&<filter id={filtId} x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx={b.shadow.x||0} dy={b.shadow.y||0} stdDeviation={b.shadow.blur||4} floodColor={b.shadow.color||'#000'} floodOpacity="0.6"/></filter>}
      </defs>
      {def.path && !def.strokeOnly && !def.special && <path d={def.path} {...sp}/>}
      {def.path && def.strokeOnly && <path d={def.path} {...so}/>}
      {def.special==='ellipse'&&<ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/>}
      {def.special==='rect_round'&&<rect x="1" y="1" width="98" height="98" rx={b.radius||12} {...sp}/>}
      {def.special==='rect_round_same'&&<path d="M2,2 L80,2 Q98,2 98,20 L98,80 Q98,98 80,98 L2,98 Z" {...sp}/>}
      {def.special==='cylinder'&&<><path d="M2,20 L2,80 Q2,98 50,98 Q98,98 98,80 L98,20" {...sp}/><ellipse cx="50" cy="20" rx="48" ry="12" {...sp}/></>}
      {def.special==='cube'&&<><path d="M25,98 L2,75 L2,25 L50,2 L98,25 L98,75 L50,98 Z" {...sp}/><path d="M25,98 L25,48 L2,25 M25,48 L98,25 M50,2 L25,25" fill="none" stroke={bColor==='none'?`${b.fill||accent}88`:bColor} strokeWidth={Math.max(bWidth,1)}/></>}
      {def.special==='frame'&&<><rect x="1" y="1" width="98" height="98" fill={fillVal} fillOpacity={op} stroke={bColor} strokeWidth={bWidth}/><rect x="14" y="14" width="72" height="72" fill="transparent" stroke={bColor==='none'?'transparent':bColor} strokeWidth={Math.max(bWidth/2,1)}/></>}
      {def.special==='donut'&&<><ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/><ellipse cx="50" cy="50" rx="22" ry="22" fill="white" stroke="none"/></>}
      {def.special==='no_sign'&&<><ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/><line x1="22" y1="22" x2="78" y2="78" stroke="white" strokeWidth="12" strokeLinecap="round"/></>}
      {def.special==='smiley'&&<><ellipse cx="50" cy="50" rx="49" ry="49" {...sp}/><ellipse cx="35" cy="38" rx="5" ry="5" fill="white"/><ellipse cx="65" cy="38" rx="5" ry="5" fill="white"/><path d="M30,62 Q50,80 70,62" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"/></>}
      {def.special==='sun'&&<><circle cx="50" cy="50" r="28" {...sp}/>{[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(<line key={a} x1={50+33*Math.cos(a*Math.PI/180)} y1={50+33*Math.sin(a*Math.PI/180)} x2={50+47*Math.cos(a*Math.PI/180)} y2={50+47*Math.sin(a*Math.PI/180)} stroke={b.fill||accent} strokeWidth="4" strokeLinecap="round"/>))}</>}
      {def.special==='cloud'&&<path d="M25,70 Q10,70 8,55 Q6,40 20,38 Q18,20 35,18 Q42,8 58,12 Q70,8 78,20 Q95,20 95,38 Q98,55 85,60 Q88,75 72,75 Z" {...sp}/>}
      {def.special==='double_plaque'&&<><path d="M7,12 L92,12 Q100,12 100,22 L100,92 Q100,100 92,100 L7,100 Q0,100 0,92 L0,22 Q0,12 7,12 Z" {...sp} transform="translate(-2,-2)"/><path d="M15,2 L93,2 Q98,2 98,8 L98,90 Q98,98 93,98 L15,98 Q2,98 2,90 L2,8 Q2,2 15,2 Z" {...sp}/></>}
      {def.special==='fc_predefined'&&<><rect x="2" y="2" width="96" height="96" {...sp}/><line x1="18" y1="2" x2="18" y2="98" stroke="white" strokeWidth="3"/><line x1="82" y1="2" x2="82" y2="98" stroke="white" strokeWidth="3"/></>}
      {def.special==='fc_internal'&&<><rect x="2" y="2" width="96" height="96" {...sp}/><line x1="18" y1="2" x2="18" y2="98" stroke="white" strokeWidth="3"/><line x1="2" y1="18" x2="98" y2="18" stroke="white" strokeWidth="3"/></>}
      {def.special==='fc_multidoc'&&<><path d="M10,90 L10,15 Q10,5 20,5 L85,5 Q95,5 95,15 L95,72 C75,88 45,62 15,72" fill={fillVal} fillOpacity={op} stroke={bColor} strokeWidth={bWidth} transform="translate(0,-8)"/><path d="M2,95 L2,22 Q2,12 12,12 L88,12 Q98,12 98,22 L98,78 C78,95 38,68 2,78 Z" {...sp}/></>}
      {def.special==='fc_punch'&&<><path d="M2,2 L98,2 L98,98 L2,98 Z" {...sp}/><path d="M15,2 C15,15 35,15 35,2" fill={fillVal} fillOpacity={op} stroke="white" strokeWidth="2"/><path d="M50,2 C50,15 70,15 70,2" fill={fillVal} fillOpacity={op} stroke="white" strokeWidth="2"/></>}
      {def.special==='fc_magdisk'&&<><ellipse cx="50" cy="88" rx="48" ry="10" {...sp}/><path d="M2,88 L2,25" stroke={bColor==='none'?b.fill||accent:bColor} strokeWidth={bWidth} fill="none"/><path d="M98,88 L98,25" stroke={bColor==='none'?b.fill||accent:bColor} strokeWidth={bWidth} fill="none"/><ellipse cx="50" cy="25" rx="48" ry="10" {...sp}/></>}
      {def.special==='fc_direct'&&<><ellipse cx="50" cy="50" rx="48" ry="48" {...sp}/><line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="3"/></>}
      {def.special==='fc_or'&&<><path d="M2,50 C2,2 98,2 98,50 C98,98 2,98 2,50 Z" {...sp}/><line x1="2" y1="50" x2="98" y2="50" stroke="white" strokeWidth="2"/><line x1="50" y1="2" x2="50" y2="98" stroke="white" strokeWidth="2"/></>}
      {def.special==='eq_divide'&&<><rect x="2" y="42" width="96" height="16" {...sp}/><circle cx="50" cy="20" r="8" {...sp}/><circle cx="50" cy="80" r="8" {...sp}/></>}
      {def.special==='eq_notequal'&&<><rect x="2" y="28" width="96" height="14" {...sp}/><rect x="2" y="58" width="96" height="14" {...sp}/><line x1="65" y1="5" x2="35" y2="95" stroke={b.fill||accent} strokeWidth="5" strokeLinecap="round"/></>}
      {def.special==='scroll_h'&&<><path d="M15,10 Q10,2 20,2 L80,2 Q90,2 85,10 L85,90 Q90,98 80,98 L20,98 Q10,98 15,90 Z" {...sp}/><path d="M15,2 Q8,2 8,10 Q8,18 15,18" fill="none" stroke="white" strokeWidth="2"/><path d="M15,98 Q8,98 8,90 Q8,82 15,82" fill="none" stroke="white" strokeWidth="2"/></>}
      {def.special==='scroll_v'&&<><path d="M10,15 Q2,10 2,20 L2,80 Q2,90 10,85 L90,85 Q98,90 98,80 L98,20 Q98,10 90,15 Z" {...sp}/><path d="M2,15 Q2,8 10,8 Q18,8 18,15" fill="none" stroke="white" strokeWidth="2"/><path d="M98,15 Q98,8 90,8 Q82,8 82,15" fill="none" stroke="white" strokeWidth="2"/></>}
      {def.special==='banner_cls'&&<><path d="M5,50 L16,30 L16,46 C30,40 42,35 50,35 C58,35 70,40 84,46 L84,30 L95,50 L84,70 L84,54 C70,60 58,65 50,65 C42,65 30,60 16,54 L16,70 Z" {...sp}/><path d="M5,50 L16,70 L16,54 L5,50 Z" fill={b.useGradient?'rgba(0,0,0,.22)':`${b.fill||accent}55`} stroke="none"/><path d="M95,50 L84,70 L84,54 L95,50 Z" fill={b.useGradient?'rgba(0,0,0,.22)':`${b.fill||accent}55`} stroke="none"/></>}
      {def.special==='banner_3d'&&<><path d="M5,65 L5,42 L86,13 L95,36 L95,58 L14,87 Z" {...sp}/><path d="M5,65 L14,87 L14,65 L5,42 Z" fill={b.useGradient?'rgba(0,0,0,.3)':`${b.fill||accent}55`} stroke="none"/><path d="M86,13 L95,36 L86,36 Z" fill={b.useGradient?'rgba(0,0,0,.3)':`${b.fill||accent}55`} stroke="none"/></>}
      {def.special==='banner_plate'&&<><rect x="2" y="18" width="96" height="64" {...sp}/><rect x="8" y="24" width="84" height="52" fill="none" stroke={bColor==='none'?`${b.fill||accent}cc`:bColor} strokeWidth={Math.max(bWidth,2)}/><rect x="12" y="28" width="76" height="44" fill="none" stroke={bColor==='none'?`${b.fill||accent}66`:bColor} strokeWidth={Math.max(bWidth*.4,.8)}/></>}
      {def.special==='callout_oval'&&<><ellipse cx="50" cy="42" rx="48" ry="38" {...sp}/><path d="M40,78 L30,98 L52,78 Z" {...sp}/></>}
      {def.special==='callout_cloud'&&<><path d="M28,68 Q14,68 12,54 Q10,40 24,38 Q22,20 38,18 Q46,8 60,14 Q70,8 78,20 Q92,20 92,38 Q96,55 82,60 Q84,74 70,74 Z" {...sp}/><path d="M45,72 Q42,85 35,95 Q48,82 55,74 Z" {...sp}/></>}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_W=794, PAGE_H=1123, H_SZ=7, SNAP_DIST=6
const HANDLE_DIRS=['nw','n','ne','e','se','s','sw','w'] as const
const HANDLE_POS: Record<string,React.CSSProperties> = {
  nw:{top:-4,left:-4,cursor:'nw-resize'},n:{top:-4,left:'50%',transform:'translateX(-50%)',cursor:'n-resize'},
  ne:{top:-4,right:-4,cursor:'ne-resize'},e:{top:'50%',right:-4,transform:'translateY(-50%)',cursor:'e-resize'},
  se:{bottom:-4,right:-4,cursor:'se-resize'},s:{bottom:-4,left:'50%',transform:'translateX(-50%)',cursor:'s-resize'},
  sw:{bottom:-4,left:-4,cursor:'sw-resize'},w:{top:'50%',left:-4,transform:'translateY(-50%)',cursor:'w-resize'},
}

const FONTS=['Times New Roman','Georgia','Garamond','Palatino Linotype','Book Antiqua','Century Schoolbook','Cambria',
  'Playfair Display','Cormorant Garamond','DM Serif Display','Source Serif 4','EB Garamond','Lora','Merriweather','Spectral','Bitter',
  'Bricolage Grotesque','Syne','Space Grotesk','DM Sans','Outfit','Nunito','Poppins','Raleway','Josefin Sans',
  'Arial','Helvetica','Tahoma','Trebuchet MS','Verdana','Century Gothic','Impact',
  'Bebas Neue','Anton','Permanent Marker','Pacifico','Lobster','Abril Fatface','Dancing Script',
  'DM Mono','Courier New','Roboto Mono','Fira Code']

const FONT_GROUPS=[
  {label:'Serif classiques',fonts:['Times New Roman','Georgia','Garamond','Palatino Linotype','Book Antiqua','Century Schoolbook','Cambria']},
  {label:'Serif modernes',fonts:['Playfair Display','Cormorant Garamond','DM Serif Display','Source Serif 4','EB Garamond','Lora','Merriweather','Spectral','Bitter']},
  {label:'Sans-serif modernes',fonts:['Bricolage Grotesque','Syne','Space Grotesk','DM Sans','Outfit','Nunito','Poppins','Raleway','Josefin Sans']},
  {label:'Sans-serif classiques',fonts:['Arial','Helvetica','Tahoma','Verdana','Century Gothic','Impact']},
  {label:'Display & Script',fonts:['Bebas Neue','Anton','Permanent Marker','Pacifico','Lobster','Abril Fatface','Dancing Script']},
  {label:'Monospace',fonts:['DM Mono','Courier New','Roboto Mono','Fira Code']},
]

const PALETTE=['#ffffff','#f8f9fa','#e9ecef','#dee2e6','#adb5bd','#6c757d','#495057','#343a40','#212529','#0D1117',
  '#fff3cd','#ffd43b','#f59f00','#e67700','#d63031','#c0392b','#e84393','#cc5de8','#7950f2','#4263eb',
  '#228be6','#1098ad','#0ca678','#37b24d','#74c0fc','#a9e34b','#ffa94d','#ff6b6b','#f783ac','#da77f2',
  '#1B4FD8','#059669','#DC2626','#7C3AED','#D97706','#0E7490','#EC4899','#F97316','#14B8A6','#6366F1']

const PAGE_BORDER_STYLES=[
  {id:'none',l:'Aucun'},{id:'simple',l:'Simple'},{id:'double',l:'Double'},
  {id:'thick',l:'Épais'},{id:'dashed',l:'Tirets'},{id:'dotted',l:'Pointillés'},
  {id:'ornate',l:'Orné'},{id:'shadow',l:'Ombre'},{id:'inset',l:'Inset'},
  {id:'wave',l:'Vagues'},{id:'glow',l:'Lueur'},{id:'ribbon',l:'Ruban'},
  {id:'frame3d',l:'Cadre 3D'},{id:'blueprint',l:'Blueprint'},{id:'neon',l:'Néon'},
]

const PATTERNS=[{id:'dots',l:'Points'},{id:'lines',l:'Lignes'},{id:'grid',l:'Grille'},
  {id:'diagonal',l:'Diagonal'},{id:'cross',l:'Croisillon'},{id:'wave',l:'Vagues'},{id:'chevron',l:'Chevron'}]

function gid(){return Math.random().toString(36).slice(2,9)}

const DEFAULT_PAGE_CONFIG: PageConfig={
  bgType:'solid',bgColor:'#ffffff',bgColor2:'#f0f4ff',bgGradAngle:135,
  bgPattern:'dots',bgPatternColor:'#000000',bgPatternOpacity:0.05,
  borderStyle:'none',borderColor:'#1B4FD8',borderWidth:8,showQr:true,
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE BACKGROUND & BORDER
// ─────────────────────────────────────────────────────────────────────────────

function PageBackground({config}:{config:PageConfig}) {
  const {bgType,bgColor,bgColor2,bgGradAngle,bgPattern,bgPatternColor,bgPatternOpacity}=config
  const pat=useMemo(()=>{
    switch(bgPattern) {
      case 'dots':     return <pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1.5" fill={bgPatternColor} opacity={bgPatternOpacity}/></pattern>
      case 'lines':    return <pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke={bgPatternColor} strokeWidth="0.8" opacity={bgPatternOpacity}/></pattern>
      case 'grid':     return <pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20,0 L0,0 0,20" fill="none" stroke={bgPatternColor} strokeWidth="0.5" opacity={bgPatternOpacity}/></pattern>
      case 'diagonal': return <pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="20" stroke={bgPatternColor} strokeWidth="1" opacity={bgPatternOpacity}/></pattern>
      case 'cross':    return <pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10,0 L10,20 M0,10 L20,10" fill="none" stroke={bgPatternColor} strokeWidth="0.5" opacity={bgPatternOpacity}/></pattern>
      case 'wave':     return <pattern id="pp" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0,10 C10,0 30,20 40,10" fill="none" stroke={bgPatternColor} strokeWidth="1" opacity={bgPatternOpacity}/></pattern>
      case 'chevron':  return <pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><polyline points="0,10 10,0 20,10" fill="none" stroke={bgPatternColor} strokeWidth="1" opacity={bgPatternOpacity}/></pattern>
      default: return null
    }
  },[bgPattern,bgPatternColor,bgPatternOpacity])
  const bg=bgType==='gradient'?`linear-gradient(${bgGradAngle}deg,${bgColor},${bgColor2})`:bgColor
  return (
    <div style={{position:'absolute',inset:0,background:bg,zIndex:0}}>
      {bgType==='pattern'&&<svg style={{position:'absolute',inset:0}} width={PAGE_W} height={PAGE_H} xmlns="http://www.w3.org/2000/svg"><defs>{pat}</defs><rect width={PAGE_W} height={PAGE_H} fill="url(#pp)"/></svg>}
    </div>
  )
}

function PageBorder({config}:{config:PageConfig}) {
  const {borderStyle:bs,borderColor:bc,borderWidth:bw}=config
  if (bs==='none') return null
  const base: React.CSSProperties={position:'absolute',inset:0,pointerEvents:'none',zIndex:200,boxSizing:'border-box'}
  if (bs==='simple')  return <div style={{...base,border:`${bw}px solid ${bc}`}}/>
  if (bs==='double')  return <div style={{...base,border:`${bw}px double ${bc}`}}/>
  if (bs==='thick')   return <div style={{...base,border:`${bw*2}px solid ${bc}`}}/>
  if (bs==='dashed')  return <div style={{...base,border:`${bw}px dashed ${bc}`}}/>
  if (bs==='dotted')  return <div style={{...base,border:`${bw}px dotted ${bc}`}}/>
  if (bs==='shadow')  return <div style={{...base,boxShadow:`inset 0 0 0 ${bw}px ${bc},inset 0 0 ${bw*3}px ${bc}40`}}/>
  if (bs==='inset')   return <div style={{...base}}><div style={{position:'absolute',inset:bw,border:`${Math.max(1,bw/2)}px solid ${bc}`,boxSizing:'border-box'}}/><div style={{position:'absolute',inset:0,border:`${bw}px solid ${bc}`,boxSizing:'border-box'}}/></div>
  if (bs==='ornate')  return <div style={{...base}}><div style={{position:'absolute',inset:0,border:`${bw}px solid ${bc}`,boxSizing:'border-box'}}/><div style={{position:'absolute',inset:bw+4,border:`${Math.max(1,bw/3)}px solid ${bc}`,boxSizing:'border-box',opacity:.5}}/></div>
  if (bs==='wave') {
    const amp=bw*1.2,freq=40,W=PAGE_W,H=PAGE_H
    const topPts=Array.from({length:Math.ceil(W/freq)+1},(_,i)=>`${i*freq},${amp*Math.sin(i*Math.PI)}`)
    const botPts=Array.from({length:Math.ceil(W/freq)+1},(_,i)=>`${i*freq},${H-amp*Math.sin(i*Math.PI)}`)
    const leftPts=Array.from({length:Math.ceil(H/freq)+1},(_,i)=>`${amp*Math.sin(i*Math.PI)},${i*freq}`)
    const rightPts=Array.from({length:Math.ceil(H/freq)+1},(_,i)=>`${W-amp*Math.sin(i*Math.PI)},${i*freq}`)
    return <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:200,overflow:'visible'}} width={W} height={H}><polyline points={topPts.join(' ')} fill="none" stroke={bc} strokeWidth={bw} strokeLinecap="round"/><polyline points={botPts.join(' ')} fill="none" stroke={bc} strokeWidth={bw} strokeLinecap="round"/><polyline points={leftPts.join(' ')} fill="none" stroke={bc} strokeWidth={bw} strokeLinecap="round"/><polyline points={rightPts.join(' ')} fill="none" stroke={bc} strokeWidth={bw} strokeLinecap="round"/></svg>
  }
  if (bs==='glow') return <div style={{...base,boxShadow:`inset 0 0 ${bw*2}px ${bc}, inset 0 0 ${bw*5}px ${bc}55, inset 0 0 ${bw*10}px ${bc}22`,border:`1px solid ${bc}44`}}/>
  if (bs==='ribbon') return <div style={{...base}}><div style={{position:'absolute',top:0,left:0,right:0,height:bw,background:bc}}/><div style={{position:'absolute',bottom:0,left:0,right:0,height:bw,background:bc}}/><div style={{position:'absolute',top:0,left:0,bottom:0,width:bw,background:bc}}/><div style={{position:'absolute',top:0,right:0,bottom:0,width:bw,background:bc}}/></div>
  if (bs==='frame3d') {
    const light='rgba(255,255,255,0.6)',dark='rgba(0,0,0,0.35)'
    return <div style={{...base}}><div style={{position:'absolute',inset:0,borderTop:`${bw}px solid ${light}`,borderLeft:`${bw}px solid ${light}`,borderBottom:`${bw}px solid ${dark}`,borderRight:`${bw}px solid ${dark}`,boxSizing:'border-box'}}/><div style={{position:'absolute',inset:bw,border:`${bw}px solid ${bc}`,boxSizing:'border-box'}}/></div>
  }
  if (bs==='blueprint') return <div style={{...base}}><div style={{position:'absolute',inset:bw,border:`${Math.max(1,bw*.5)}px dashed ${bc}`,boxSizing:'border-box',opacity:.5}}/><div style={{position:'absolute',inset:0,border:`${bw}px solid ${bc}`,boxSizing:'border-box'}}/></div>
  if (bs==='neon') return <div style={{...base,border:`${Math.max(1,bw*.4)}px solid ${bc}`,boxShadow:[`inset 0 0 ${bw}px ${bc}`,`inset 0 0 ${bw*3}px ${bc}88`,`0 0 ${bw}px ${bc}`,`0 0 ${bw*3}px ${bc}88`,`0 0 ${bw*6}px ${bc}44`].join(',')}}/>
  return null
}

function SnapGuides({guides}:{guides:{x?:number;y?:number}[]}) {
  return <>{guides.map((g,i)=>
    g.x!==undefined
    ?<div key={i} style={{position:'absolute',left:g.x-.5,top:0,width:1,height:'100%',background:'#1B4FD8',opacity:.8,pointerEvents:'none',zIndex:500}}/>
    :<div key={i} style={{position:'absolute',top:g.y!-.5,left:0,height:1,width:'100%',background:'#1B4FD8',opacity:.8,pointerEvents:'none',zIndex:500}}/>
  )}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const LBL: React.CSSProperties={fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--text4)',marginBottom:3,display:'block'}
const INP: React.CSSProperties={width:'100%',padding:'5px 8px',borderRadius:7,border:'1px solid var(--border)',background:'var(--bg)',color:'var(--text)',fontSize:11,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}
const ICOBTN: React.CSSProperties={padding:'3px 7px',borderRadius:5,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:11,fontWeight:700,color:'var(--text4)'}

function Divider(){return <div style={{height:1,background:'var(--border)',margin:'4px 0'}}/>}

function ColorRow({value,onChange}:{value:string;onChange:(v:string)=>void}){
  return <div>
    <div style={{display:'flex',gap:3,flexWrap:'wrap',marginBottom:5}}>
      {PALETTE.map(c=><button key={c} onClick={()=>onChange(c)} style={{width:16,height:16,borderRadius:3,background:c,border:`2px solid ${value===c?'var(--text)':'transparent'}`,cursor:'pointer',flexShrink:0}}/>)}
    </div>
    <div style={{display:'flex',gap:5,alignItems:'center'}}>
      <input type="color" value={value} onChange={e=>onChange(e.target.value)} style={{width:26,height:26,borderRadius:5,border:'1px solid var(--border)',padding:2,cursor:'pointer',flexShrink:0}}/>
      <input type="text" value={value} onChange={e=>onChange(e.target.value)} style={{flex:1,...INP,fontFamily:'monospace',fontSize:10}}/>
    </div>
  </div>
}

function GradEditor({value,onChange,accent}:{value:any;onChange:(v:any)=>void;accent:string}){
  const g=value||{type:'linear',color1:accent,color2:'#ffffff',angle:135}
  return <div style={{display:'flex',flexDirection:'column',gap:5,padding:'8px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg2)'}}>
    <div style={{display:'flex',gap:3}}>
      {(['linear','radial'] as GradType[]).map(t=><button key={t} onClick={()=>onChange({...g,type:t})} style={{flex:1,padding:'3px',borderRadius:4,border:'1px solid',cursor:'pointer',fontSize:9,fontWeight:700,borderColor:g.type===t?accent:'var(--border)',background:g.type===t?`${accent}18`:'transparent',color:g.type===t?accent:'var(--text4)'}}>{t==='linear'?'Linéaire':'Radial'}</button>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
      {[['C1','color1'],['Mi','color3'],['C2','color2']].map(([l,k])=><div key={k}>
        <span style={{fontSize:8,color:'var(--text4)',display:'block',marginBottom:2}}>{l}</span>
        <input type="color" value={(g as any)[k]||(k==='color3'?'#888':'#fff')} onChange={e=>onChange({...g,[k]:e.target.value})} style={{width:'100%',height:22,borderRadius:4,border:'1px solid var(--border)',padding:2,cursor:'pointer'}}/>
      </div>)}
    </div>
    {g.type==='linear'&&<><span style={{fontSize:8,color:'var(--text4)'}}>Angle {g.angle||135}°</span><input type="range" min={0} max={360} value={g.angle||135} onChange={e=>onChange({...g,angle:+e.target.value})} style={{width:'100%',accentColor:accent}}/></>}
    <div style={{height:16,borderRadius:4,background:g.type==='radial'?`radial-gradient(${g.color1},${g.color3||g.color2})`:`linear-gradient(${g.angle||135}deg,${g.color1},${g.color3||''},${g.color2})`}}/>
  </div>
}

function Toggle({value,onChange,accent}:{value:boolean;onChange:(v:boolean)=>void;accent:string}){
  return <div onClick={()=>onChange(!value)} style={{width:32,height:17,borderRadius:9,cursor:'pointer',position:'relative',background:value?accent:'var(--border2)',transition:'background .18s',flexShrink:0}}>
    <div style={{position:'absolute',top:1.5,width:14,height:14,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 3px rgba(0,0,0,.2)',left:value?16:1.5,transition:'left .18s'}}/>
  </div>
}

function Slider({label,min,max,value,onChange,accent,unit}:any){
  return <>
    <label style={LBL}>{label} — {typeof value==='number'?value.toFixed(value<5?2:0):value}{unit||''}</label>
    <div style={{display:'flex',gap:6,alignItems:'center'}}>
      <input type="range" min={min} max={max} value={value} onChange={e=>onChange(+e.target.value)} style={{flex:1,accentColor:accent}}/>
      <input type="number" min={min} max={max} value={value} onChange={e=>onChange(+e.target.value)} style={{...INP,width:52}}/>
    </div>
  </>
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type PanelTab='elements'|'texte'|'inner'|'couleur'|'effets'|'page'|'calques'

interface Props {
  zoom: number
  /** When true, renders the properties panel below the canvas (mobile layout) */
  mobileLayout?: boolean
}

export function EditableCoverPage({zoom, mobileLayout=false}:Props){
  const {title,subtitle,ref:docRef,destination,confidentiality,docStyle,coverStyle,setCoverStyle}=useDocument()
  const {profile}=useProfile()
  const {planId}=usePlan()

  const cv:CoverStyle={layout:'classic',accentColor:'',showLogo:true,showQr:true,showGrid:false,backgroundStyle:'solid',titleSize:'lg',coverBlocks:[],...coverStyle}
  const accent=cv.accentColor||profile.color||docStyle.accentColor||'#1B4FD8'
  const fontTitle=docStyle.fontTitle||'Bricolage Grotesque'
  const TITLE_SZ={sm:28,md:36,lg:44,xl:56}
  const titleFontSize=(TITLE_SZ[cv.titleSize as keyof typeof TITLE_SZ]||44)*zoom
  const showWatermark=profile.watermark||planId==='starter'

  const blocks:ExtBlock[]=((cv as any).coverBlocks||[]) as ExtBlock[]
  const pageConf:PageConfig={...DEFAULT_PAGE_CONFIG,...((cv as any).pageConfig||{})}
  const qrDataUrl=useQR({docId:'EETRA-DOC',title,entityName:profile.name})

  const [selIds,setSelIds]=useState<Set<string>>(new Set())
  const [editId,setEditId]=useState<string|null>(null)
  const [innerEditId,setInnerEditId]=useState<string|null>(null)
  const [panelTab,setPanelTab]=useState<PanelTab>('elements')
  const [showPanel,setShowPanel]=useState(mobileLayout) // auto-open on mobile
  const [guides,setGuides]=useState<{x?:number;y?:number}[]>([])
  const [fontSearch,setFontSearch]=useState('')
  const [shapeSearch,setShapeSearch]=useState('')

  const canvasRef=useRef<HTMLDivElement>(null)
  const fileRef=useRef<HTMLInputElement>(null)
  const drag=useRef<{ids:string[];sx:number;sy:number;starts:{id:string;bx:number;by:number}[]}|null>(null)
  const resize=useRef<{id:string;handle:string;sx:number;sy:number;bx:number;by:number;bw:number;bh:number}|null>(null)

  const dW=PAGE_W*zoom, dH=PAGE_H*zoom
  const selId=selIds.size===1?[...selIds][0]:null
  const sel=selId?blocks.find(b=>b.id===selId):undefined
  const isText=sel?.type==='text'
  const isShape=sel&&sel.type!=='text'&&sel.type!=='image'&&sel.type!=='logo'
  const isImg=sel?.type==='image'||sel?.type==='logo'
  const hasBlocks=blocks.length>0
  const multiSel=selIds.size>1

  const saveBlocks=useCallback((u:ExtBlock[])=>setCoverStyle({...(cv as any),coverBlocks:u as any[]}),[cv,setCoverStyle])
  const saveConf=useCallback((p:Partial<PageConfig>)=>setCoverStyle({...(cv as any),pageConfig:{...pageConf,...p}}),[cv,pageConf,setCoverStyle])
  const upd=useCallback((id:string,patch:Partial<ExtBlock>)=>saveBlocks(blocks.map(b=>b.id===id?{...b,...patch}:b)),[blocks,saveBlocks])

  const add=useCallback((type:string,shape?:string)=>{
    const maxZ=blocks.reduce((m,b)=>Math.max(m,b.z||0),0)
    const isT=type==='text',isI=type==='image'||type==='logo'
    const def=shape?SHAPE_LIB[shape]:null
    const isLine=def?.strokeOnly
    const nb:ExtBlock={
      id:gid(),type:isT?'text':isI?(type as any):'rect',z:maxZ+1,opacity:1,
      x:.08+Math.random()*.06,y:.08+Math.random()*.06,
      w:isT?.55:isI?.3:isLine?.5:.28,
      h:isT?.07:isI?.18:isLine?.03:.22,
      ...(isT?{text:'Double-clic pour éditer',fontSize:24,fontWeight:'normal' as const,fontStyle:'normal' as const,color:'#0D1117',align:'left' as const,letterSpacing:0,lineHeight:1.35,fontFamily:fontTitle}
        :isI?{fill:'#F5F7FA',stroke:'#DDE1EA',strokeWidth:1,objectFit:'contain' as const}
        :{shape:(shape||type) as any,fill:accent,fillOpacity:1,strokeWidth:0,
          useGradient:false,gradient:{type:'linear' as GradType,color1:accent,color2:'#ffffff',angle:135},
          useShadow:false,shadow:{x:4,y:4,blur:8,color:'#000000'},
          useBorder:false,border:{width:2,color:'#ffffff',style:'solid' as BorderStyle},
          innerText:'',innerFontSize:16,innerColor:'#ffffff',innerFontFamily:fontTitle,innerAlign:'center',innerBold:false,innerItalic:false}),
    }
    saveBlocks([...blocks,nb]);setSelIds(new Set([nb.id]));setShowPanel(true)
    setPanelTab(isT?'texte':isI?'couleur':'couleur')
  },[blocks,saveBlocks,accent,fontTitle])

  const del=useCallback((ids?:string[])=>{
    const td=ids||[...selIds];saveBlocks(blocks.filter(b=>!td.includes(b.id)));setSelIds(new Set())
  },[blocks,saveBlocks,selIds])

  const dup=useCallback((ids?:string[])=>{
    const td=ids||[...selIds];const maxZ=blocks.reduce((m,b)=>Math.max(m,b.z||0),0)
    const copies=blocks.filter(b=>td.includes(b.id)).map((b,i)=>({...b,id:gid(),x:b.x+.015,y:b.y+.015,z:maxZ+1+i}))
    saveBlocks([...blocks,...copies]);setSelIds(new Set(copies.map(c=>c.id)))
  },[blocks,saveBlocks,selIds])

  const group=useCallback(()=>{
    if(selIds.size<2)return;const gId=gid()
    saveBlocks(blocks.map(b=>selIds.has(b.id)?{...b,groupId:gId}:b))
  },[blocks,saveBlocks,selIds])

  const ungroup=useCallback(()=>{
    const gIds=new Set(blocks.filter(b=>selIds.has(b.id)&&b.groupId).map(b=>b.groupId!))
    saveBlocks(blocks.map(b=>gIds.has(b.groupId||'')?{...b,groupId:undefined}:b))
  },[blocks,saveBlocks,selIds])

  const computeSnap=useCallback((id:string,nx:number,ny:number,nw:number,nh:number)=>{
    const snap=SNAP_DIST/dW,snapY=SNAP_DIST/dH,ng:typeof guides=[]
    let sx=nx,sy=ny
    if(Math.abs(nx+nw/2-.5)<snap){sx=.5-nw/2;ng.push({x:PAGE_W/2})}
    if(Math.abs(ny+nh/2-.5)<snapY){sy=.5-nh/2;ng.push({y:PAGE_H/2})}
    if(Math.abs(nx)<snap){sx=0;ng.push({x:0})}
    if(Math.abs(ny)<snapY){sy=0;ng.push({y:0})}
    if(Math.abs(nx+nw-1)<snap){sx=1-nw;ng.push({x:PAGE_W})}
    if(Math.abs(ny+nh-1)<snapY){sy=1-nh;ng.push({y:PAGE_H})}
    blocks.filter(b=>b.id!==id).forEach(b=>{
      if(Math.abs(nx-b.x)<snap){sx=b.x;ng.push({x:b.x*PAGE_W})}
      if(Math.abs(nx+nw-(b.x+b.w))<snap){sx=b.x+b.w-nw;ng.push({x:(b.x+b.w)*PAGE_W})}
      if(Math.abs(ny-b.y)<snapY){sy=b.y;ng.push({y:b.y*PAGE_H})}
      if(Math.abs(ny+nh-(b.y+b.h))<snapY){sy=b.y+b.h-nh;ng.push({y:(b.y+b.h)*PAGE_H})}
    })
    setGuides(ng);setTimeout(()=>setGuides([]),600)
    return{sx,sy}
  },[blocks,dW,dH])

  const onBlockDown=useCallback((e:React.MouseEvent,id:string)=>{
    if(editId===id||innerEditId===id)return
    e.stopPropagation();e.preventDefault()
    const b=blocks.find(b=>b.id===id);if(!b)return
    if(b.locked){setSelIds(new Set([id]));return}
    if(e.shiftKey){setSelIds(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n})}
    else{if(!selIds.has(id))setSelIds(new Set([id]))}
    const starts=blocks.filter(bl=>selIds.has(bl.id)||bl.id===id).map(bl=>({id:bl.id,bx:bl.x,by:bl.y}))
    drag.current={ids:[...selIds,id].filter((v,i,a)=>a.indexOf(v)===i),sx:e.clientX,sy:e.clientY,starts}
  },[blocks,editId,innerEditId,selIds])

  const onHandleDown=useCallback((e:React.MouseEvent,id:string,handle:string)=>{
    e.stopPropagation();e.preventDefault()
    const b=blocks.find(b=>b.id===id);if(!b)return
    resize.current={id,handle,sx:e.clientX,sy:e.clientY,bx:b.x,by:b.y,bw:b.w,bh:b.h}
  },[blocks])

  useEffect(()=>{
    const move=(e:MouseEvent)=>{
      if(drag.current){
        const{ids,sx,sy,starts}=drag.current
        const dx=(e.clientX-sx)/dW,dy=(e.clientY-sy)/dH
        const updated=blocks.map(b=>{
          const start=starts.find(s=>s.id===b.id);if(!start)return b
          const nx=Math.max(-0.5,Math.min(1.5,start.bx+dx))
          const ny=Math.max(-0.5,Math.min(1.5,start.by+dy))
          if(ids.length===1){const{sx:snx,sy:sny}=computeSnap(b.id,nx,ny,b.w,b.h);return{...b,x:snx,y:sny}}
          return{...b,x:nx,y:ny}
        })
        saveBlocks(updated)
      }
      if(resize.current){
        const{id,handle,sx,sy,bx,by,bw,bh}=resize.current
        const dx=(e.clientX-sx)/dW,dy=(e.clientY-sy)/dH
        let nx=bx,ny=by,nw=bw,nh=bh
        if(handle.includes('e'))nw=Math.max(.02,bw+dx)
        if(handle.includes('s'))nh=Math.max(.005,bh+dy)
        if(handle.includes('w')){nx=bx+dx;nw=Math.max(.02,bw-dx)}
        if(handle.includes('n')){ny=by+dy;nh=Math.max(.005,bh-dy)}
        nx=Math.max(-0.5,nx);ny=Math.max(-0.5,ny)
        nw=Math.min(2,nw);nh=Math.min(2,nh)
        upd(id,{x:nx,y:ny,w:nw,h:nh})
      }
    }
    const up=()=>{drag.current=null;resize.current=null}
    document.addEventListener('mousemove',move);document.addEventListener('mouseup',up)
    return()=>{document.removeEventListener('mousemove',move);document.removeEventListener('mouseup',up)}
  },[blocks,dW,dH,upd,saveBlocks,computeSnap])

  useEffect(()=>{
    const kd=(e:KeyboardEvent)=>{
      if((e.key==='Delete'||e.key==='Backspace')&&selIds.size&&!editId&&!innerEditId){e.preventDefault();del()}
      if(e.key==='Escape'){setSelIds(new Set());setEditId(null);setInnerEditId(null)}
      if(e.ctrlKey||e.metaKey){
        if(e.key==='d'){e.preventDefault();dup()}
        if(e.key==='g'){e.preventDefault();group()}
      }
    }
    document.addEventListener('keydown',kd)
    return()=>document.removeEventListener('keydown',kd)
  },[selIds,editId,innerEditId,del,dup,group])

  // ── Render block ─────────────────────────────────────────────────────────

  const renderBlock=(b:ExtBlock)=>{
    const bx=b.x*PAGE_W,by=b.y*PAGE_H,bw=b.w*PAGE_W,bh=b.h*PAGE_H
    const isSel=selIds.has(b.id),isEdit=editId===b.id,isInnerEdit=innerEditId===b.id
    const fs=((b.fontSize||16)/72)*96
    const innerFs=((b.innerFontSize||16)/72)*96
    const textDec=[b.underline&&'underline',b.strikethrough&&'line-through',b.overline&&'overline'].filter(Boolean).join(' ')||'none'
    const isGradT=b.gradient_text&&b.useGradient&&b.gradient

    let content: React.ReactNode

    if(b.type==='text'){
      content=(
        <div contentEditable={isEdit} suppressContentEditableWarning
          onInput={e=>upd(b.id,{text:(e.currentTarget as HTMLElement).innerText})}
          onBlur={()=>setEditId(null)}
          style={{width:'100%',height:'100%',overflow:'hidden',outline:'none',fontSize:fs,
            fontWeight:b.fontWeight==='black'?900:b.fontWeight==='bold'?700:400,
            fontStyle:b.fontStyle||'normal',
            color:isGradT?'transparent':(b.color||'#0D1117'),
            textAlign:b.align||'left',letterSpacing:b.letterSpacing?`${b.letterSpacing}em`:'normal',
            lineHeight:b.lineHeight||1.35,fontFamily:(b as any).fontFamily||fontTitle,
            textDecoration:textDec,textTransform:(b as any).textTransform||'none',
            whiteSpace:'pre-wrap',wordBreak:'break-word',cursor:isEdit?'text':'inherit',
            textShadow:(b as any).textShadow||undefined,
            filter:b.useBlur&&b.blur?`blur(${b.blur}px)`:undefined,
            ...(isGradT?{background:`linear-gradient(${b.gradient!.angle||135}deg,${b.gradient!.color1},${b.gradient!.color2})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}:{}),
          }}
          dangerouslySetInnerHTML={isEdit?undefined:{__html:(b.text||'').replace(/\n/g,'<br/>')}}
        />
      )
    } else if(b.type==='image'||b.type==='logo'){
      content=b.src?(
        <img src={b.src} alt="" style={{width:'100%',height:'100%',objectFit:b.objectFit||'contain',display:'block',borderRadius:b.radius,filter:b.useBlur&&b.blur?`blur(${b.blur}px)`:undefined}}/>
      ):(
        <div onClick={()=>selIds.has(b.id)&&fileRef.current?.click()}
          style={{width:'100%',height:'100%',background:b.fill||'#F5F7FA',border:`${b.strokeWidth||1}px dashed ${b.stroke||'#DDE1EA'}`,borderRadius:b.radius||0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'#aaa',gap:4,cursor:'pointer'}}>
          <span style={{fontSize:18*zoom}}>{b.type==='logo'?'🏢':'🖼'}</span>
          <span style={{fontSize:8*zoom,fontWeight:700}}>Cliquer pour choisir</span>
        </div>
      )
    } else {
      const hasInner=b.innerText&&b.innerText.length>0
      const showInnerEdit=isInnerEdit
      const minPadding=Math.max(100,4*zoom)
      content=(
        <div style={{position:'relative',width:'100%',height:'100%'}}>
          {b.useBlur&&b.blur?<div style={{filter:`blur(${b.blur}px)`,width:'100%',height:'100%'}}><ShapeSVG b={b} accent={accent}/></div>:<ShapeSVG b={b} accent={accent}/>}
          {(hasInner||showInnerEdit)&&(
            <div contentEditable={showInnerEdit} suppressContentEditableWarning
              onInput={e=>upd(b.id,{innerText:(e.currentTarget as HTMLElement).innerText})}
              onBlur={()=>setInnerEditId(null)}
              style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',
                pointerEvents:showInnerEdit?'text':'none' as any,cursor:showInnerEdit?'text':'inherit',
                outline:'none',overflow:'hidden',padding:`${minPadding}px`,textAlign:b.innerAlign||'center',
                fontSize:innerFs,fontWeight:b.innerBold?700:400,fontStyle:b.innerItalic?'italic':'normal',
                color:b.innerColor||'#ffffff',fontFamily:(b as any).innerFontFamily||fontTitle,
                lineHeight:1.3,wordBreak:'break-word',whiteSpace:'pre-wrap',
              }}
              dangerouslySetInnerHTML={showInnerEdit?undefined:{__html:(b.innerText||'').replace(/\n/g,'<br/>')}}
            />
          )}
          {!hasInner&&!showInnerEdit&&isSel&&(
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none',opacity:.35}}>
              <span style={{fontSize:9*zoom,color:'var(--text4)',fontWeight:700,border:`1px dashed var(--border)`,padding:`${2*zoom}px ${5*zoom}px`,borderRadius:4*zoom}}>+ texte</span>
            </div>
          )}
        </div>
      )
    }

    return (
      <div key={b.id}
        style={{position:'absolute',left:bx,top:by,width:bw,height:bh,
          opacity:b.opacity??1,transform:b.rotation?`rotate(${b.rotation}deg)`:undefined,
          zIndex:(b.z||1)+5,cursor:b.locked?'default':isEdit||isInnerEdit?'text':'move',
          userSelect:isEdit||isInnerEdit?'text':'none',boxSizing:'border-box'}}
        onMouseDown={e=>onBlockDown(e,b.id)}
        onDoubleClick={e=>{
          e.stopPropagation()
          if(b.type==='text'&&!b.locked){setEditId(b.id);setSelIds(new Set([b.id]))}
          else if(b.type!=='image'&&b.type!=='logo'&&!b.locked){
            setInnerEditId(b.id);setSelIds(new Set([b.id]));setShowPanel(true);setPanelTab('inner')
          }
        }}
        onClick={e=>{e.stopPropagation();if(!e.shiftKey)setSelIds(new Set([b.id]));setShowPanel(true)}}
      >
        {content}
        {isSel&&!isEdit&&!isInnerEdit&&<div style={{position:'absolute',inset:-2,border:`2px solid ${accent}`,borderRadius:3,pointerEvents:'none',zIndex:99}}/>}
        {isSel&&!isEdit&&!isInnerEdit&&!b.locked&&HANDLE_DIRS.map(h=>(
          <div key={h} onMouseDown={e=>onHandleDown(e,b.id,h)}
            style={{position:'absolute',width:H_SZ,height:H_SZ,background:'#fff',border:`2px solid ${accent}`,borderRadius:2,zIndex:100,...HANDLE_POS[h]}}/>
        ))}
        {b.locked&&isSel&&<div style={{position:'absolute',top:-16,left:'50%',transform:'translateX(-50%)',fontSize:9,background:'rgba(0,0,0,.6)',color:'#fff',padding:'1px 4px',borderRadius:4,whiteSpace:'nowrap',pointerEvents:'none'}}>🔒</div>}
      </div>
    )
  }

  // ── Panel content ────────────────────────────────────────────────────────

  const renderPanel=()=>{

    if(panelTab==='elements') return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:6}}>
        <input placeholder="🔍 Rechercher une forme…" value={shapeSearch} onChange={e=>setShapeSearch(e.target.value)} style={{...INP,fontSize:10}}/>
        {(shapeSearch?[{group:'Résultats',shapes:ALL_SHAPES.filter(s=>s.l.toLowerCase().includes(shapeSearch.toLowerCase()))}]:SHAPE_CATALOG).map(group=>(
          group.shapes.length===0?null:
          <div key={group.group}>
            {!shapeSearch&&<label style={{...LBL,marginBottom:3,color:'var(--text3)'}}>{group.group}</label>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:2,marginBottom:4}}>
              {group.shapes.map(({s,i,l})=>(
                <button key={s} onClick={()=>add('rect',s)} title={l}
                  style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'5px 2px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',transition:'all .1s'}}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=accent;el.style.background=`${accent}12`}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border)';el.style.background='var(--bg)'}}>
                  <span style={{fontSize:13}}>{i}</span>
                  <span style={{fontSize:6,fontWeight:700,color:'var(--text4)',textAlign:'center',lineHeight:1.1}}>{l}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
        <Divider/>
        <label style={LBL}>Texte & Médias</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
          {[{type:'text',icon:'T',label:'Texte'},{type:'image',icon:'🖼',label:'Image'},{type:'logo',icon:'🏢',label:'Logo'}].map(({type,icon,label})=>(
            <button key={type} onClick={()=>add(type)}
              style={{padding:'7px 4px',borderRadius:7,border:'1px solid var(--border)',background:'var(--bg)',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,transition:'all .1s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=accent;el.style.background=`${accent}10`}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor='var(--border)';el.style.background='var(--bg)'}}>
              <span style={{fontSize:16}}>{icon}</span>
              <span style={{fontSize:9,fontWeight:700,color:'var(--text)'}}>{label}</span>
            </button>
          ))}
        </div>

        {sel&&<>
          <Divider/>
          {isShape&&<>
            <label style={LBL}>Changer la forme</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:2,maxHeight:100,overflowY:'auto'}}>
              {ALL_SHAPES.map(({s,i})=>(
                <button key={s} onClick={()=>upd(sel.id,{shape:s})} title={s}
                  style={{padding:'4px',borderRadius:4,border:`1.5px solid ${(sel as any).shape===s?accent:'var(--border)'}`,background:(sel as any).shape===s?`${accent}18`:'transparent',cursor:'pointer',fontSize:11,transition:'all .1s'}}>
                  {i}
                </button>
              ))}
            </div>
          </>}
          <label style={LBL}>Position & Taille</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4}}>
            {[['X %','x'],['Y %','y'],['L %','w'],['H %','h']].map(([l,k])=>(
              <div key={k}><span style={{fontSize:8,color:'var(--text4)',display:'block',marginBottom:2}}>{l}</span>
                <input type="number" min={0} max={100} value={Math.round((sel as any)[k]*100)} onChange={e=>upd(sel.id,{[k]:+e.target.value/100})} style={INP}/></div>
            ))}
          </div>
          <Slider label="Rotation" min={-180} max={180} value={sel.rotation||0} onChange={(v:number)=>upd(sel.id,{rotation:v})} accent={accent} unit="°"/>
          <Slider label="Opacité" min={0} max={100} value={Math.round((sel.opacity??1)*100)} onChange={(v:number)=>upd(sel.id,{opacity:v/100})} accent={accent} unit="%"/>
          <div style={{display:'flex',gap:4}}>
            <button onClick={()=>upd(sel.id,{z:(sel.z||1)+1})} style={{...ICOBTN,flex:1}}>↑ Avant</button>
            <button onClick={()=>upd(sel.id,{z:Math.max(1,(sel.z||1)-1)})} style={{...ICOBTN,flex:1}}>↓ Arrière</button>
            <button onClick={()=>upd(sel.id,{locked:!sel.locked})} style={{...ICOBTN,padding:'3px 9px',borderColor:sel.locked?accent:'var(--border)',color:sel.locked?accent:'var(--text4)'}}>{sel.locked?'🔒':'🔓'}</button>
          </div>
        </>}

        {multiSel&&<>
          <Divider/>
          <label style={LBL}>{selIds.size} éléments</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
            <button onClick={group} style={{...ICOBTN,padding:'5px',fontSize:10}}>⊞ Grouper</button>
            <button onClick={ungroup} style={{...ICOBTN,padding:'5px',fontSize:10}}>⊟ Dégrouper</button>
            <button onClick={()=>dup()} style={{...ICOBTN,padding:'5px',fontSize:10}}>⧉ Dupliquer</button>
            <button onClick={()=>del()} style={{...ICOBTN,padding:'5px',fontSize:10,color:'#DC2626',borderColor:'rgba(220,38,38,.3)'}}>✕ Supprimer</button>
          </div>
        </>}
      </div>
    )

    if(panelTab==='texte'&&isText) return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:6}}>
        <label style={LBL}>Contenu</label>
        <textarea rows={3} value={sel!.text||''} onChange={e=>upd(sel!.id,{text:e.target.value})} style={{...INP,height:56,resize:'vertical',lineHeight:1.4}}/>
        <label style={LBL}>Police</label>
        <input placeholder="🔍 Rechercher…" value={fontSearch} onChange={e=>setFontSearch(e.target.value)} style={{...INP,fontSize:10,marginBottom:2}}/>
        <div style={{maxHeight:140,overflowY:'auto',display:'flex',flexDirection:'column',gap:1,border:'1px solid var(--border)',borderRadius:7,padding:4}}>
          {(fontSearch?[{label:'Résultats',fonts:FONTS.filter(f=>f.toLowerCase().includes(fontSearch.toLowerCase()))}]:FONT_GROUPS).map(group=>(
            <div key={group.label}>
              {!fontSearch&&<div style={{fontSize:8,fontWeight:800,letterSpacing:'.08em',color:'var(--text4)',textTransform:'uppercase',padding:'4px 6px 2px'}}>{group.label}</div>}
              {group.fonts.map(f=>(
                <button key={f} onClick={()=>upd(sel!.id,{fontFamily:f})}
                  style={{textAlign:'left',padding:'4px 8px',borderRadius:5,border:'none',cursor:'pointer',fontSize:12,fontFamily:f,background:(sel as any).fontFamily===f?`${accent}18`:'transparent',color:(sel as any).fontFamily===f?accent:'var(--text2)',borderLeft:(sel as any).fontFamily===f?`2px solid ${accent}`:'2px solid transparent',transition:'all .1s'}}>
                  {f}
                </button>
              ))}
            </div>
          ))}
        </div>
        <Slider label="Taille" min={6} max={300} value={sel!.fontSize||16} onChange={(v:number)=>upd(sel!.id,{fontSize:v})} accent={accent} unit="pt"/>
        <label style={LBL}>Graisse</label>
        <div style={{display:'flex',gap:2}}>
          {[['normal','Normal',400],['bold','Gras',700],['black','Black',900]].map(([v,l,fw])=>(
            <button key={v as string} onClick={()=>upd(sel!.id,{fontWeight:v as any})}
              style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontSize:10,fontWeight:fw as number,borderColor:sel!.fontWeight===v?accent:'var(--border)',background:sel!.fontWeight===v?`${accent}18`:'transparent',color:sel!.fontWeight===v?accent:'var(--text4)'}}>
              {l as string}
            </button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
          <div>
            <label style={LBL}>Styles</label>
            <div style={{display:'flex',gap:2}}>
              <button onClick={()=>upd(sel!.id,{fontStyle:sel!.fontStyle==='italic'?'normal':'italic'})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontStyle:'italic',fontWeight:700,fontSize:12,borderColor:sel!.fontStyle==='italic'?accent:'var(--border)',background:sel!.fontStyle==='italic'?`${accent}18`:'transparent',color:sel!.fontStyle==='italic'?accent:'var(--text4)'}}>I</button>
              <button onClick={()=>upd(sel!.id,{underline:!sel!.underline})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',textDecoration:'underline',fontWeight:700,fontSize:12,borderColor:sel!.underline?accent:'var(--border)',background:sel!.underline?`${accent}18`:'transparent',color:sel!.underline?accent:'var(--text4)'}}>U</button>
              <button onClick={()=>upd(sel!.id,{strikethrough:!sel!.strikethrough})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',textDecoration:'line-through',fontWeight:700,fontSize:12,borderColor:sel!.strikethrough?accent:'var(--border)',background:sel!.strikethrough?`${accent}18`:'transparent',color:sel!.strikethrough?accent:'var(--text4)'}}>S</button>
            </div>
          </div>
          <div>
            <label style={LBL}>Alignement</label>
            <div style={{display:'flex',gap:2}}>
              {[['left','⬅'],['center','⬌'],['right','➡']].map(([a,icon])=>(
                <button key={a} onClick={()=>upd(sel!.id,{align:a as any})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontSize:12,borderColor:sel!.align===a?accent:'var(--border)',background:sel!.align===a?`${accent}18`:'transparent',color:sel!.align===a?accent:'var(--text4)'}}>{icon}</button>
              ))}
            </div>
          </div>
        </div>
        <label style={LBL}>Casse</label>
        <div style={{display:'flex',gap:2}}>
          {[['none','Aa'],['uppercase','AA'],['lowercase','aa'],['capitalize','Aa+']].map(([v,l])=>(
            <button key={v} onClick={()=>upd(sel!.id,{textTransform:v as any})} style={{flex:1,padding:'3px',borderRadius:4,border:'1px solid',cursor:'pointer',fontSize:9,fontWeight:700,borderColor:((sel as any).textTransform||'none')===v?accent:'var(--border)',background:((sel as any).textTransform||'none')===v?`${accent}18`:'transparent',color:((sel as any).textTransform||'none')===v?accent:'var(--text4)'}}>{l}</button>
          ))}
        </div>
        <Slider label="Espacement" min={-10} max={80} value={Math.round((sel!.letterSpacing||0)*100)} onChange={(v:number)=>upd(sel!.id,{letterSpacing:v/100})} accent={accent} unit="%"/>
        <Slider label="Interligne" min={60} max={400} value={Math.round((sel!.lineHeight||1.35)*100)} onChange={(v:number)=>upd(sel!.id,{lineHeight:v/100})} accent={accent} unit="%"/>
        <label style={LBL}>Couleur</label>
        <ColorRow value={sel!.color||'#0D1117'} onChange={v=>upd(sel!.id,{color:v})}/>
        <Divider/>
        <label style={LBL}>Texte dégradé</label>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,color:'var(--text3)'}}>Activer</span>
          <Toggle value={!!sel!.gradient_text} onChange={v=>upd(sel!.id,{gradient_text:v,useGradient:v})} accent={accent}/>
        </div>
        {sel!.gradient_text&&<GradEditor value={sel!.gradient} onChange={g=>upd(sel!.id,{gradient:g})} accent={accent}/>}
      </div>
    )

    if(panelTab==='inner'&&isShape&&sel) return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:7}}>
        <div style={{padding:'8px 10px',borderRadius:8,background:'var(--accentS)',border:`1px solid ${accent}30`,fontSize:10,color:accent,fontWeight:600,lineHeight:1.4}}>
          💡 Double-cliquez sur la forme dans le canvas pour éditer le texte directement
        </div>
        <label style={LBL}>Texte intérieur</label>
        <textarea rows={3} value={sel.innerText||''} onChange={e=>upd(sel.id,{innerText:e.target.value})} style={{...INP,height:56,resize:'vertical',lineHeight:1.4}} placeholder="Entrez le texte de la forme…"/>
        <label style={LBL}>Police</label>
        <select value={(sel as any).innerFontFamily||fontTitle} onChange={e=>upd(sel.id,{innerFontFamily:e.target.value})} style={INP}>
          {FONTS.map(f=><option key={f} value={f} style={{fontFamily:f}}>{f}</option>)}
        </select>
        <Slider label="Taille" min={6} max={200} value={sel.innerFontSize||16} onChange={(v:number)=>upd(sel.id,{innerFontSize:v})} accent={accent} unit="pt"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
          <div>
            <label style={LBL}>Style</label>
            <div style={{display:'flex',gap:2}}>
              <button onClick={()=>upd(sel.id,{innerBold:!sel.innerBold})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontWeight:700,fontSize:12,borderColor:sel.innerBold?accent:'var(--border)',background:sel.innerBold?`${accent}18`:'transparent',color:sel.innerBold?accent:'var(--text4)'}}>B</button>
              <button onClick={()=>upd(sel.id,{innerItalic:!sel.innerItalic})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontStyle:'italic',fontWeight:700,fontSize:12,borderColor:sel.innerItalic?accent:'var(--border)',background:sel.innerItalic?`${accent}18`:'transparent',color:sel.innerItalic?accent:'var(--text4)'}}>I</button>
            </div>
          </div>
          <div>
            <label style={LBL}>Alignement</label>
            <div style={{display:'flex',gap:2}}>
              {[['left','⬅'],['center','⬌'],['right','➡']].map(([a,icon])=>(
                <button key={a} onClick={()=>upd(sel.id,{innerAlign:a as any})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontSize:11,borderColor:sel.innerAlign===a?accent:'var(--border)',background:sel.innerAlign===a?`${accent}18`:'transparent',color:sel.innerAlign===a?accent:'var(--text4)'}}>{icon}</button>
              ))}
            </div>
          </div>
        </div>
        <label style={LBL}>Couleur du texte</label>
        <ColorRow value={sel.innerColor||'#ffffff'} onChange={v=>upd(sel.id,{innerColor:v})}/>
        {sel.innerText&&<><Divider/><button onClick={()=>upd(sel.id,{innerText:''})} style={{...ICOBTN,width:'100%',padding:'6px',color:'#DC2626',borderColor:'rgba(220,38,38,.3)',background:'#FEF2F2',fontSize:10}}>Effacer le texte intérieur</button></>}
      </div>
    )

    if(panelTab==='couleur'&&sel&&!isText) return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:7}}>
        {isShape&&<>
          <label style={LBL}>Couleur de remplissage</label>
          <ColorRow value={sel!.fill||accent} onChange={v=>upd(sel!.id,{fill:v})}/>
          <Slider label="Opacité fond" min={0} max={100} value={Math.round((sel!.fillOpacity??1)*100)} onChange={(v:number)=>upd(sel!.id,{fillOpacity:v/100})} accent={accent} unit="%"/>
          <Divider/>
          <label style={LBL}>Dégradé</label>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
            <span style={{fontSize:10,color:'var(--text3)'}}>Activer</span>
            <Toggle value={!!sel!.useGradient} onChange={v=>upd(sel!.id,{useGradient:v})} accent={accent}/>
          </div>
          {sel!.useGradient&&<GradEditor value={sel!.gradient} onChange={g=>upd(sel!.id,{gradient:g})} accent={accent}/>}
        </>}
        {isImg&&<>
          <label style={LBL}>Image</label>
          <button onClick={()=>fileRef.current?.click()} style={{width:'100%',padding:'10px',border:'1px dashed var(--border2)',borderRadius:8,background:'var(--bg)',cursor:'pointer',fontSize:11,fontWeight:700,color:'var(--text3)'}}>📁 Choisir une image…</button>
          {sel!.src&&<><div style={{borderRadius:8,overflow:'hidden',border:'1px solid var(--border)',background:'#f5f7fa',aspectRatio:'4/3'}}><img src={sel!.src} style={{width:'100%',height:'100%',objectFit:'contain'}} alt=""/></div>
            <div style={{display:'flex',gap:3}}>{(['contain','cover','fill'] as const).map(m=><button key={m} onClick={()=>upd(sel!.id,{objectFit:m})} style={{flex:1,padding:'4px',borderRadius:5,border:'1px solid',cursor:'pointer',fontSize:9,fontWeight:700,borderColor:sel!.objectFit===m?accent:'var(--border)',background:sel!.objectFit===m?`${accent}18`:'transparent',color:sel!.objectFit===m?accent:'var(--text4)'}}>{m}</button>)}</div>
            <button onClick={()=>upd(sel!.id,{src:undefined})} style={{width:'100%',padding:'5px',border:'1px solid rgba(220,38,38,.3)',background:'#FEF2F2',borderRadius:6,cursor:'pointer',fontSize:10,fontWeight:700,color:'#DC2626'}}>Retirer l'image</button>
          </>}
          <label style={LBL}>Fond placeholder</label>
          <ColorRow value={sel!.fill||'#F5F7FA'} onChange={v=>upd(sel!.id,{fill:v})}/>
          <Slider label="Coins arrondis" min={0} max={100} value={sel!.radius||0} onChange={(v:number)=>upd(sel!.id,{radius:v})} accent={accent} unit="px"/>
        </>}
      </div>
    )

    if(panelTab==='effets'&&sel) return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:7}}>
        <label style={LBL}>Ombre portée</label>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,color:'var(--text3)'}}>Activer</span>
          <Toggle value={!!sel.useShadow} onChange={v=>upd(sel.id,{useShadow:v,shadow:(sel as any).shadow||{x:4,y:4,blur:8,color:'#000000'}})} accent={accent}/>
        </div>
        {sel.useShadow&&(()=>{const sh=(sel as any).shadow||{x:4,y:4,blur:8,color:'#000000'};return<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4}}>
            {[['X','x'],['Y','y'],['Flou','blur']].map(([l,k])=><div key={k}><span style={{fontSize:8,color:'var(--text4)',display:'block',marginBottom:2}}>{l}</span><input type="number" value={sh[k]} onChange={e=>upd(sel.id,{shadow:{...sh,[k]:+e.target.value}})} style={INP}/></div>)}
          </div>
          <label style={LBL}>Couleur ombre</label>
          <ColorRow value={sh.color} onChange={v=>upd(sel.id,{shadow:{...sh,color:v}})}/>
        </>})()}
        <Divider/>
        <label style={LBL}>Bordure</label>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,color:'var(--text3)'}}>Activer</span>
          <Toggle value={!!sel.useBorder} onChange={v=>upd(sel.id,{useBorder:v,border:(sel as any).border||{width:2,color:'#ffffff',style:'solid'}})} accent={accent}/>
        </div>
        {sel.useBorder&&(()=>{const bd=(sel as any).border||{width:2,color:'#fff',style:'solid'};return<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
            <div><span style={{fontSize:8,color:'var(--text4)',display:'block',marginBottom:2}}>Épaisseur</span><input type="number" min={1} max={30} value={bd.width} onChange={e=>upd(sel.id,{border:{...bd,width:+e.target.value}})} style={INP}/></div>
            <div><span style={{fontSize:8,color:'var(--text4)',display:'block',marginBottom:2}}>Style</span><select value={bd.style} onChange={e=>upd(sel.id,{border:{...bd,style:e.target.value}})} style={INP}>{(['solid','dashed','dotted','double','groove','ridge'] as BorderStyle[]).map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <label style={LBL}>Couleur bordure</label>
          <ColorRow value={bd.color} onChange={v=>upd(sel.id,{border:{...bd,color:v}})}/>
        </>})()}
        <Divider/>
        <label style={LBL}>Flou gaussien</label>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:10,color:'var(--text3)'}}>Activer</span>
          <Toggle value={!!sel.useBlur} onChange={v=>upd(sel.id,{useBlur:v})} accent={accent}/>
        </div>
        {sel.useBlur&&<Slider label="Intensité" min={0} max={20} value={sel.blur||0} onChange={(v:number)=>upd(sel.id,{blur:v})} accent={accent} unit="px"/>}
        {isText&&<><Divider/>
          <label style={LBL}>Ombre texte CSS</label>
          <input placeholder="2px 2px 4px rgba(0,0,0,.5)" value={(sel as any).textShadow||''} onChange={e=>upd(sel.id,{textShadow:e.target.value})} style={{...INP,fontFamily:'monospace',fontSize:10}}/>
        </>}
      </div>
    )

    if(panelTab==='page') return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:7}}>
        <label style={LBL}>Fond de page</label>
        <div style={{display:'flex',gap:3,marginBottom:4}}>
          {([['solid','Couleur'],['gradient','Dégradé'],['pattern','Motif']] as [PageBgType,string][]).map(([t,l])=>(
            <button key={t} onClick={()=>saveConf({bgType:t})} style={{flex:1,padding:'5px',borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:9,fontWeight:700,borderColor:pageConf.bgType===t?accent:'var(--border)',background:pageConf.bgType===t?`${accent}18`:'transparent',color:pageConf.bgType===t?accent:'var(--text4)'}}>{l}</button>
          ))}
        </div>
        <label style={LBL}>{pageConf.bgType==='gradient'?'Couleur 1':'Couleur fond'}</label>
        <ColorRow value={pageConf.bgColor} onChange={v=>saveConf({bgColor:v})}/>
        {pageConf.bgType==='gradient'&&<><label style={LBL}>Couleur 2</label><ColorRow value={pageConf.bgColor2} onChange={v=>saveConf({bgColor2:v})}/><Slider label="Angle" min={0} max={360} value={pageConf.bgGradAngle} onChange={(v:number)=>saveConf({bgGradAngle:v})} accent={accent} unit="°"/></>}
        {pageConf.bgType==='pattern'&&<>
          <label style={LBL}>Motif</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3}}>
            {PATTERNS.map(({id,l})=><button key={id} onClick={()=>saveConf({bgPattern:id as PatternType})} style={{padding:'5px',borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:10,fontWeight:600,borderColor:pageConf.bgPattern===id?accent:'var(--border)',background:pageConf.bgPattern===id?`${accent}18`:'transparent',color:pageConf.bgPattern===id?accent:'var(--text4)'}}>{l}</button>)}
          </div>
          <label style={LBL}>Couleur motif</label>
          <ColorRow value={pageConf.bgPatternColor} onChange={v=>saveConf({bgPatternColor:v})}/>
          <Slider label="Opacité motif" min={0} max={30} value={Math.round(pageConf.bgPatternOpacity*100)} onChange={(v:number)=>saveConf({bgPatternOpacity:v/100})} accent={accent} unit="%"/>
        </>}
        <Divider/>
        <label style={LBL}>Encadrement de page</label>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3}}>
          {PAGE_BORDER_STYLES.map(({id,l})=>(
            <button key={id} onClick={()=>saveConf({borderStyle:id as PageBorderStyle})}
              style={{padding:'5px 3px',borderRadius:6,border:'1px solid',cursor:'pointer',fontSize:9,fontWeight:600,lineHeight:1.2,textAlign:'center',borderColor:pageConf.borderStyle===id?accent:'var(--border)',background:pageConf.borderStyle===id?`${accent}18`:'transparent',color:pageConf.borderStyle===id?accent:'var(--text4)'}}>
              {l}
            </button>
          ))}
        </div>
        {pageConf.borderStyle!=='none'&&<>
          <label style={LBL}>Couleur cadre</label>
          <ColorRow value={pageConf.borderColor} onChange={v=>saveConf({borderColor:v})}/>
          <Slider label="Épaisseur" min={2} max={40} value={pageConf.borderWidth} onChange={(v:number)=>saveConf({borderWidth:v})} accent={accent} unit="px"/>
        </>}
        <Divider/>
        <label style={LBL}>QR Code</label>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:11,color:'var(--text3)'}}>Afficher le QR code</span>
          <Toggle value={pageConf.showQr} onChange={v=>saveConf({showQr:v})} accent={accent}/>
        </div>
        {pageConf.showQr&&qrDataUrl&&<div style={{display:'flex',alignItems:'center',gap:8,padding:'8px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg2)'}}><img src={qrDataUrl} style={{width:38,height:38}} alt="QR"/><div style={{fontSize:10,color:'var(--text4)',lineHeight:1.4}}>QR code auto avec le titre du document.</div></div>}
      </div>
    )

    if(panelTab==='calques') return(
      <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:3}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
          <label style={{...LBL,marginBottom:0}}>{blocks.length} élément{blocks.length>1?'s':''}</label>
          {blocks.length>0&&<button onClick={()=>{if(confirm('Tout effacer?')){saveBlocks([]);setSelIds(new Set())}}} style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:5,border:'1px solid rgba(220,38,38,.3)',background:'#FEF2F2',color:'#DC2626',cursor:'pointer'}}>Tout effacer</button>}
        </div>
        {[...blocks].sort((a,b)=>(b.z||0)-(a.z||0)).map((b,i)=>{
          const isSel=selIds.has(b.id)
          const si=ALL_SHAPES.find(s=>s.s===(b as any).shape)
          return(
            <div key={b.id} onClick={e=>{if(e.shiftKey){setSelIds(prev=>{const n=new Set(prev);n.has(b.id)?n.delete(b.id):n.add(b.id);return n})}else setSelIds(new Set([b.id]));setPanelTab('elements')}}
              style={{display:'flex',alignItems:'center',gap:5,padding:'5px 7px',borderRadius:7,border:'1.5px solid',borderColor:isSel?accent:'var(--border)',background:isSel?`${accent}10`:'var(--bg)',cursor:'pointer',userSelect:'none'}}>
              <span style={{fontSize:10}}>{b.type==='text'?'T':b.type==='image'||b.type==='logo'?'🖼':(si?.i||'▬')}</span>
              <span style={{fontSize:9,fontWeight:600,color:'var(--text2)',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.type==='text'?(b.text||'Texte').slice(0,14):b.innerText?(b.innerText).slice(0,12):((b as any).shape||b.type)+` #${i+1}`}</span>
              {b.locked&&<span style={{fontSize:8}}>🔒</span>}
              {b.groupId&&<span style={{fontSize:7,padding:'1px 3px',borderRadius:3,background:'var(--accentS)',color:'var(--accent)',fontWeight:700}}>G</span>}
              <div style={{display:'flex',gap:1,flexShrink:0}}>
                <button onClick={e=>{e.stopPropagation();upd(b.id,{z:(b.z||1)+1})}} style={{...ICOBTN,padding:'1px 4px'}}>↑</button>
                <button onClick={e=>{e.stopPropagation();upd(b.id,{z:Math.max(1,(b.z||1)-1)})}} style={{...ICOBTN,padding:'1px 4px'}}>↓</button>
                <button onClick={e=>{e.stopPropagation();del([b.id])}} style={{...ICOBTN,padding:'1px 4px',color:'#DC2626',borderColor:'rgba(220,38,38,.3)'}}>×</button>
              </div>
            </div>
          )
        })}
        {blocks.length===0&&<div style={{textAlign:'center',fontSize:11,color:'var(--text4)',padding:'16px 0'}}>Aucun élément</div>}
      </div>
    )
    return null
  }

  const panelTabs:[PanelTab,string,string][]=[
    ['elements','◈','Formes'],
    ...(isText?[['texte','T','Texte'] as [PanelTab,string,string]]:[]),
    ...(isShape?[['inner','✏','Texte int.'] as [PanelTab,string,string]]:[]),
    ...(sel&&!isText?[['couleur','●','Couleur'] as [PanelTab,string,string]]:[]),
    ...(sel?[['effets','✦','Effets'] as [PanelTab,string,string]]:[]),
    ['page','🗒','Page'],
    ['calques','≡','Calques'],
  ]

  // ── Shared: the A4 canvas ────────────────────────────────────────────────

  const canvasEl = (
    <div style={{width:dW,height:dH,position:'relative',flexShrink:0,overflow:'hidden'}}>
      <div id="eetra-page-cover" ref={canvasRef}
        style={{
          width:PAGE_W,height:PAGE_H,
          position:'absolute',top:0,left:0,
          transform:`scale(${zoom})`,transformOrigin:'top left',
          overflow:'hidden',cursor:'default',
        }}
        onClick={e=>{if(!(e.target as HTMLElement).closest('[data-block]')){setSelIds(new Set());setEditId(null);setInnerEditId(null)}}}>
        <PageBackground config={pageConf}/>
        <div className="pdf-hidden" style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(0,0,0,.025) 1px,transparent 1px)',backgroundSize:'14px 14px',pointerEvents:'none',zIndex:2}}/>
        {/* DEFAULT PREVIEW */}
        {!hasBlocks&&(
          <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:3,display:'flex',flexDirection:'column',boxSizing:'border-box'}}>
            <div style={{position:'absolute',left:0,top:0,width:6,height:'100%',background:accent}}/>
            <div style={{position:'absolute',left:6,top:0,width:1.5,height:'100%',background:`${accent}22`}}/>
            <div style={{position:'absolute',top:-80,right:-80,width:240,height:240,borderRadius:'50%',background:`${accent}07`}}/>
            <div style={{padding:'44px 56px 0 68px',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexShrink:0}}>
              {profile.logoDataUrl?(
                <img src={profile.logoDataUrl} alt="logo" style={{height:46,maxWidth:155,objectFit:'contain'}}/>
              ):profile.name?(
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:42,height:42,borderRadius:11,background:accent,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 3px 16px ${accent}40`}}>
                    <span style={{color:'#fff',fontWeight:900,fontSize:19,fontFamily:`'${fontTitle}',sans-serif`}}>{(profile.name||'E').charAt(0)}</span>
                  </div>
                  <div>
                    <div style={{fontFamily:`'${fontTitle}',sans-serif`,fontWeight:900,fontSize:16,color:'#0A0F1E'}}>{profile.name}</div>
                    {profile.tagline&&<div style={{fontSize:9.5,color:'#9aa8b8',marginTop:1.5}}>{profile.tagline}</div>}
                  </div>
                </div>
              ):null}
              {confidentiality&&(
                <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 14px 6px 10px',borderRadius:4,border:`1.5px solid ${accent}`,background:`${accent}14`}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:accent}}/>
                  <span style={{fontSize:8.5,fontWeight:800,letterSpacing:'.26em',textTransform:'uppercase',color:accent}}>{confidentiality}</span>
                </div>
              )}
            </div>
            <div style={{flex:1,padding:'0 56px 0 68px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{maxWidth:580}}>
                {subtitle&&(
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                    <div style={{width:28,height:2.5,borderRadius:2,background:accent,flexShrink:0}}/>
                    <span style={{fontSize:10,fontWeight:700,letterSpacing:'.32em',textTransform:'uppercase',color:accent}}>{subtitle}</span>
                  </div>
                )}
                <h1 style={{fontFamily:`'${fontTitle}',serif`,fontSize:(({sm:34,md:44,lg:56,xl:70} as Record<string,number>)[cv.titleSize as string]??56),fontWeight:900,letterSpacing:'-.035em',lineHeight:1.06,color:'#0A0F1E',margin:0,wordBreak:'break-word'}}>
                  {title||'TITRE DU DOCUMENT'}
                </h1>
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:24,marginBottom:20}}>
                  <div style={{width:40,height:3.5,borderRadius:2,background:accent}}/>
                  <div style={{width:6,height:6,borderRadius:'50%',background:`${accent}55`}}/>
                </div>
                {(docRef||destination)&&(
                  <div style={{display:'flex',gap:48,flexWrap:'wrap'}}>
                    {docRef&&<div><div style={{fontSize:7.5,fontWeight:800,letterSpacing:'.24em',textTransform:'uppercase',color:'#a8b4c4',marginBottom:5}}>Référence</div><div style={{fontSize:13,fontWeight:700,color:accent,letterSpacing:'.05em',fontFamily:'monospace'}}>{docRef}</div></div>}
                    {destination&&<div><div style={{fontSize:7.5,fontWeight:800,letterSpacing:'.24em',textTransform:'uppercase',color:'#a8b4c4',marginBottom:5}}>Destinataire</div><div style={{fontSize:16,fontWeight:700,color:'#0A0F1E',lineHeight:1.2}}>{destination}</div></div>}
                  </div>
                )}
              </div>
            </div>
            <div style={{padding:'24px 56px 36px 68px',flexShrink:0}}>
              <div style={{height:1,background:`linear-gradient(90deg,${accent}44 0%,transparent 70%)`,marginBottom:20}}/>
              <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:7.5,fontWeight:800,letterSpacing:'.24em',textTransform:'uppercase',color:'#a8b4c4',marginBottom:5}}>Date d'émission</div>
                  <div style={{fontSize:13,fontWeight:600,color:'#0A0F1E'}}>{new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'})}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  {showWatermark&&<span style={{fontSize:7,letterSpacing:'.12em',color:'#d0d8e4'}}>Généré par EETRA</span>}
                  {pageConf.showQr&&qrDataUrl&&<div style={{padding:5,borderRadius:7,background:'#fff',border:'1px solid #edf2f7'}}><img src={qrDataUrl} alt="QR" style={{width:40,height:40,display:'block'}}/></div>}
                </div>
              </div>
            </div>
          </div>
        )}
        {[...blocks].sort((a,b)=>(a.z||0)-(b.z||0)).map(renderBlock)}
        <SnapGuides guides={guides}/>
        <PageBorder config={pageConf}/>
        {!hasBlocks&&(
          <div className="pdf-hidden" onClick={e=>{e.stopPropagation();add('text')}}
            style={{position:'absolute',bottom:10,right:10,zIndex:210,display:'flex',alignItems:'center',gap:4,padding:'5px 9px',borderRadius:7,border:`1px dashed ${accent}`,background:`${accent}14`,cursor:'pointer',color:accent,fontSize:9,fontWeight:700}}>
            + Personnaliser
          </div>
        )}
        {pageConf.showQr&&qrDataUrl&&hasBlocks&&<div style={{position:'absolute',bottom:6,right:6,pointerEvents:'none',zIndex:205}}><img src={qrDataUrl} alt="QR" style={{width:32,height:32}}/></div>}
        {showWatermark&&hasBlocks&&<div style={{position:'absolute',bottom:5,left:8,fontSize:6,color:'#ccc',pointerEvents:'none',zIndex:205}}>Généré par EETRA</div>}
      </div>
    </div>
  )

  // ── Shared: the panel tabs bar ───────────────────────────────────────────

  const panelTabBar = (
    <div style={{display:'flex',borderBottom:'1px solid var(--border)',flexShrink:0,overflowX:'auto',
      // hide scrollbar
      scrollbarWidth:'none',
    }}>
      {panelTabs.map(([id,icon,label])=>(
        <button key={id} onClick={()=>setPanelTab(id)}
          style={{flex:1,minWidth:40,display:'flex',flexDirection:'column',alignItems:'center',gap:1,padding:'7px 2px',border:'none',cursor:'pointer',background:'transparent',fontSize:12,borderBottom:`2px solid ${panelTab===id?accent:'transparent'}`,color:panelTab===id?accent:'var(--text4)',transition:'all .1s',whiteSpace:'nowrap'}}>
          <span>{icon}</span><span style={{fontSize:7,fontWeight:700}}>{label}</span>
        </button>
      ))}
    </div>
  )

  // ── Quick-action bar (mobile) ─────────────────────────────────────────────

  const quickBar = (
    <div className="pdf-hidden" style={{display:'flex',alignItems:'center',gap:3,padding:'6px 10px',borderBottom:'1px solid var(--border)',background:'var(--surface)',overflowX:'auto',scrollbarWidth:'none',flexShrink:0}}>
      {[{s:'rect',i:'▬'},{s:'ellipse',i:'●'},{s:'triangle_iso',i:'▲'},{s:'star5',i:'★'},{s:'heart',i:'♥'},{s:'ribbon_u',i:'🎀'},{s:'callout_rect',i:'💬'}].map(({s,i})=>(
        <button key={s} onClick={()=>add('rect',s)} title={s}
          style={{width:30,height:30,borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:13,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {i}
        </button>
      ))}
      <button onClick={()=>add('text')} style={{width:30,height:30,borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:11,fontWeight:900,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>T</button>
      <button onClick={()=>add('image')} style={{width:30,height:30,borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:13,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>🖼</button>
      {selIds.size>0&&<>
        <div style={{width:1,height:20,background:'var(--border)',flexShrink:0,margin:'0 2px'}}/>
        <button onClick={()=>dup()} style={{...ICOBTN,flexShrink:0,fontSize:13}}>⧉</button>
        <button onClick={()=>del()} style={{...ICOBTN,border:'1px solid rgba(220,38,38,.3)',background:'#FEF2F2',color:'#DC2626',flexShrink:0}}>✕</button>
      </>}
      <div style={{marginLeft:'auto',flexShrink:0}}>
        <Toggle value={pageConf.showQr} onChange={v=>saveConf({showQr:v})} accent={accent}/>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT: canvas on top, panel snapped below
  // ─────────────────────────────────────────────────────────────────────────

  if (mobileLayout) {
    return (
      <div style={{display:'flex',flexDirection:'column',width:'100%'}}>
        {/* The scaled A4 page */}
        {canvasEl}

        {/* Snackbar panel — always visible, attached to bottom of page */}
        <div className="pdf-hidden" style={{
          width:'100%',
          background:'var(--surface)',
          borderTop:'2px solid var(--border)',
          borderRadius:'0 0 12px 12px',
          boxShadow:'0 6px 24px rgba(0,0,0,.10)',
          display:'flex',
          flexDirection:'column',
          overflow:'hidden',
        }}>
          {/* Quick shape/text shortcuts */}
          {quickBar}

          {/* Tab selector */}
          {panelTabBar}

          {/* Panel content — scrollable, max height so it doesn't eat entire screen */}
          <div style={{
            maxHeight: 320,
            overflowY:'auto',
            overflowX:'hidden',
            scrollbarWidth:'none',
          }}>
            {renderPanel()}
          </div>

          {/* Bottom action row when something is selected */}
          {selIds.size>0&&(
            <div style={{padding:'6px 10px',borderTop:'1px solid var(--border)',display:'flex',gap:4,flexShrink:0,background:'var(--surface)'}}>
              <button onClick={()=>dup()} style={{flex:1,padding:'7px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:10,fontWeight:700,color:'var(--text3)'}}>⧉ Dupliquer</button>
              <button onClick={()=>del()} style={{flex:1,padding:'7px',borderRadius:6,border:'1px solid rgba(220,38,38,.3)',background:'#FEF2F2',cursor:'pointer',fontSize:10,fontWeight:700,color:'#DC2626'}}>✕ Supprimer</button>
            </div>
          )}
        </div>

        <input type="file" ref={fileRef} accept="image/*" style={{display:'none'}} onChange={e=>{
          const f=e.target.files?.[0];if(!f||![...selIds][0])return
          const r=new FileReader();r.onload=ev=>upd([...selIds][0],{src:ev.target?.result as string});r.readAsDataURL(f)
        }}/>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DESKTOP LAYOUT: original side panel
  // ─────────────────────────────────────────────────────────────────────────

  return(
    <div style={{position:'relative',display:'flex',flexDirection:'column',alignItems:'center'}}>

      {/* TOOLBAR */}
      <div className="pdf-hidden" style={{width:PAGE_W*zoom+(showPanel?240:0),height:46,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'10px 10px 0 0',display:'flex',alignItems:'center',gap:3,padding:'0 10px',flexShrink:0,overflowX:'auto'}}>
        <span style={{fontSize:9,fontWeight:700,color:'var(--text3)',whiteSpace:'nowrap',marginRight:2}}>{hasBlocks?`${blocks.length} él.`:'Couverture'}</span>
        <div style={{width:1,height:18,background:'var(--border)',flexShrink:0}}/>
        {[{s:'rect',i:'▬'},{s:'ellipse',i:'●'},{s:'triangle_iso',i:'▲'},{s:'star5',i:'★'},{s:'ribbon_u',i:'🎀'},{s:'heart',i:'♥'},{s:'barrow_r',i:'▶'},{s:'callout_rect',i:'💬'},{s:'line',i:'─'}].map(({s,i})=>(
          <button key={s} onClick={()=>add('rect',s)} title={s} style={{width:25,height:25,borderRadius:5,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i}</button>
        ))}
        <button onClick={()=>add('text')} style={{width:25,height:25,borderRadius:5,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:10,fontWeight:900,color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>T</button>
        <button onClick={()=>add('image')} style={{width:25,height:25,borderRadius:5,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>🖼</button>
        {selIds.size>0&&<>
          <div style={{width:1,height:18,background:'var(--border)',flexShrink:0}}/>
          <button onClick={()=>dup()} style={{...ICOBTN,flexShrink:0}}>⧉</button>
          {selIds.size>1&&<button onClick={group} style={{...ICOBTN,flexShrink:0}}>⊞</button>}
          {blocks.some(b=>selIds.has(b.id)&&b.groupId)&&<button onClick={ungroup} style={{...ICOBTN,flexShrink:0}}>⊟</button>}
          <button onClick={()=>del()} style={{...ICOBTN,border:'1px solid rgba(220,38,38,.3)',background:'#FEF2F2',color:'#DC2626',flexShrink:0}}>✕</button>
        </>}
        <div style={{width:1,height:18,background:'var(--border)',flexShrink:0,marginLeft:'auto'}}/>
        <button onClick={()=>saveConf({showQr:!pageConf.showQr})} style={{...ICOBTN,flexShrink:0,opacity:pageConf.showQr?1:.4,fontSize:11,padding:'3px 7px'}}>QR</button>
        <button onClick={()=>setShowPanel(v=>!v)} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:7,border:`1px solid ${showPanel?accent:'var(--border)'}`,background:showPanel?`${accent}14`:'var(--bg2)',color:showPanel?accent:'var(--text3)',cursor:'pointer',fontSize:10,fontWeight:700,flexShrink:0}}>
          {showPanel?'✕':'⚙'} {showPanel?'Fermer':'Propriétés'}
        </button>
      </div>

      {/* CANVAS + SIDE PANEL */}
      <div style={{display:'flex',alignItems:'flex-start'}}>
        {canvasEl}

        {showPanel&&(
          <div className="pdf-hidden" style={{width:240,height:dH,background:'var(--surface)',borderLeft:'1px solid var(--border)',display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
            {panelTabBar}
            <div style={{flex:1,overflowY:'auto'}}>{renderPanel()}</div>
            {selIds.size>0&&(
              <div style={{padding:'6px 10px',borderTop:'1px solid var(--border)',display:'flex',gap:4,flexShrink:0}}>
                <button onClick={()=>dup()} style={{flex:1,padding:'5px',borderRadius:6,border:'1px solid var(--border)',background:'var(--bg2)',cursor:'pointer',fontSize:9,fontWeight:700,color:'var(--text3)'}}>⧉ Dupliquer</button>
                <button onClick={()=>del()} style={{flex:1,padding:'5px',borderRadius:6,border:'1px solid rgba(220,38,38,.3)',background:'#FEF2F2',cursor:'pointer',fontSize:9,fontWeight:700,color:'#DC2626'}}>✕ Supprimer</button>
              </div>
            )}
          </div>
        )}
      </div>

      <input type="file" ref={fileRef} accept="image/*" style={{display:'none'}} onChange={e=>{
        const f=e.target.files?.[0];if(!f||![...selIds][0])return
        const r=new FileReader();r.onload=ev=>upd([...selIds][0],{src:ev.target?.result as string});r.readAsDataURL(f)
      }}/>
    </div>
  )
}