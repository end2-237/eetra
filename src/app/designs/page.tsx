'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import logo from '../../app/icon.png'
import { Lock, Check, ArrowRight, Eye, X, Zap, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

// ── Scroll & parallax engine ─────────────────────────────────────────────────

function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sr-in')
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    )
    document.querySelectorAll('[data-sr]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useParallax() {
  useEffect(() => {
    let raf: number
    const tick = () => {
      const sy = window.scrollY
      document.querySelectorAll<HTMLElement>('[data-p]').forEach(el => {
        const r = parseFloat(el.dataset.p || '0.2')
        el.style.transform = `translateY(${sy * r}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
}

function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById('__dpg')
    const onScroll = () => {
      if (!bar) return
      const h = document.documentElement.scrollHeight - window.innerHeight
      bar.style.width = h > 0 ? `${(window.scrollY / h) * 100}%` : '0%'
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}

// ── SR wrapper ───────────────────────────────────────────────────────────────

function SR({ children, d = 0, from = 'up', style = {} }:
  { children: React.ReactNode; d?: number; from?: 'up'|'left'|'right'|'scale'|'fade'; style?: React.CSSProperties }) {
  const transforms: Record<string, string> = {
    up: 'translateY(48px)', left: 'translateX(-40px)',
    right: 'translateX(40px)', scale: 'scale(0.9)', fade: 'translateY(20px)',
  }
  return (
    <div data-sr style={{
      opacity: 0, transform: transforms[from],
      transition: `opacity .8s cubic-bezier(.23,1,.32,1) ${d}ms, transform .8s cubic-bezier(.23,1,.32,1) ${d}ms`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Cursor glow ───────────────────────────────────────────────────────────────

function useCursorGlow(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--cx', `${e.clientX - r.left}px`)
      el.style.setProperty('--cy', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [ref])
}

// ── Cover SVG components ──────────────────────────────────────────────────────

function ClassicCover({ accent = '#1B4FD8', name = 'ACACIA', title = 'BUSINESS PLAN', logoChar = 'A' }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="220" height="310" fill="white"/>
      <rect x="0" y="0" width="5" height="310" fill={accent}/>
      <rect x="5" y="0" width="215" height="4" fill={accent} opacity=".12"/>
      <rect x="18" y="20" width="32" height="32" rx="6" fill={accent}/>
      <text x="34" y="41" textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="Arial">{logoChar}</text>
      <text x="58" y="36" fill="#111" fontSize="10" fontWeight="800" fontFamily="Arial">{name}</text>
      <text x="58" y="47" fill="#999" fontSize="6" fontFamily="Arial">CABINET DE CONSEIL</text>
      <rect x="150" y="22" width="54" height="12" rx="3" fill="none" stroke={accent} strokeWidth=".8"/>
      <text x="177" y="31.5" textAnchor="middle" fill={accent} fontSize="5.5" fontWeight="700" fontFamily="Arial" letterSpacing=".5">CONFIDENTIEL</text>
      <line x1="18" y1="108" x2="52" y2="108" stroke={accent} strokeWidth="2.5"/>
      <line x1="52" y1="108" x2="205" y2="108" stroke="#E8E8E8" strokeWidth="1"/>
      <text x="18" y="103" fill={accent} fontSize="5.5" fontWeight="700" fontFamily="Arial" letterSpacing="1.5">DOCUMENT STRATÉGIQUE</text>
      <text x="18" y="136" fill="#0D1117" fontSize="21" fontWeight="900" fontFamily="Arial">{title.split(' ')[0]}</text>
      <text x="18" y="160" fill="#0D1117" fontSize="21" fontWeight="900" fontFamily="Arial">{(title.split(' ').slice(1).join(' ')) || '&nbsp;'}</text>
      <text x="18" y="177" fill="#999" fontSize="7.5" fontFamily="Arial" fontStyle="italic">2026 — 2030</text>
      <rect x="18" y="183" width="22" height="2.5" rx="1.25" fill={accent}/>
      <rect x="18" y="198" width="185" height="46" rx="7" fill="#F8F9FB"/>
      {[['Date','15 jan. 2026'],['Signataire','Direction'],['Réf.','BP-001']].map(([l,v],i)=>(
        <g key={i}>
          <text x={26+i*63} y="215" fill="#BBB" fontSize="5" fontWeight="700" fontFamily="Arial">{l.toUpperCase()}</text>
          <text x={26+i*63} y="230" fill="#333" fontSize="7" fontWeight="600" fontFamily="Arial">{v}</text>
        </g>
      ))}
      <line x1="18" y1="272" x2="205" y2="272" stroke="#F0F0F0" strokeWidth="1"/>
      <text x="18" y="283" fill="#AAA" fontSize="5.5" fontFamily="Arial">{name} · eetra.buyticle.com</text>
      <rect x="185" y="267" width="18" height="18" rx="3" fill="#F5F5F5"/>
      <rect x="187" y="269" width="5" height="5" fill="#CCC" rx=".5"/>
      <rect x="195" y="269" width="5" height="5" fill="#CCC" rx=".5"/>
      <rect x="187" y="278" width="5" height="5" fill="#CCC" rx=".5"/>
      <rect x="195" y="278" width="2.5" height="2.5" fill="#CCC" rx=".5"/>
    </svg>
  )
}

function BoldCover({ accent = '#059669', name = 'QUANTUM', title = 'RAPPORT AUDIT' }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id={`bg-${accent.replace('#','')}`} cx="70%" cy="25%" r="80%">
          <stop offset="0%" stopColor={accent} stopOpacity="1"/>
          <stop offset="100%" stopColor={accent} stopOpacity=".7"/>
        </radialGradient>
      </defs>
      <rect width="220" height="310" fill={`url(#bg-${accent.replace('#','')})`}/>
      <circle cx="205" cy="35" r="75" fill="rgba(255,255,255,.07)"/>
      <circle cx="175" cy="285" r="55" fill="rgba(255,255,255,.04)"/>
      <circle cx="10" cy="120" r="40" fill="rgba(0,0,0,.06)"/>
      <rect x="18" y="22" width="36" height="36" rx="9" fill="rgba(255,255,255,.18)"/>
      <text x="36" y="45" textAnchor="middle" fill="white" fontSize="17" fontWeight="900" fontFamily="Arial">{name.charAt(0)}</text>
      <text x="62" y="37" fill="rgba(255,255,255,.88)" fontSize="10" fontWeight="800" fontFamily="Arial">{name}</text>
      <text x="62" y="49" fill="rgba(255,255,255,.5)" fontSize="5.5" fontFamily="Arial">CABINET D'AUDIT</text>
      <text x="18" y="148" fill="rgba(255,255,255,.55)" fontSize="6" fontWeight="700" fontFamily="Arial" letterSpacing="2">DOCUMENT CONFIDENTIEL</text>
      <text x="18" y="174" fill="white" fontSize="23" fontWeight="900" fontFamily="Arial">{title.split(' ')[0]}</text>
      <text x="18" y="200" fill="white" fontSize="23" fontWeight="900" fontFamily="Arial">{title.split(' ').slice(1).join(' ')}</text>
      <rect x="18" y="209" width="24" height="2.5" rx="1.25" fill="rgba(255,255,255,.4)"/>
      {[['15 Jan.','Date'],['Réf. AU-026','Référence']].map(([v,l],i)=>(
        <g key={i}>
          <text x={18+i*92} y="236" fill="rgba(255,255,255,.48)" fontSize="5" fontFamily="Arial">{l.toUpperCase()}</text>
          <text x={18+i*92} y="250" fill="white" fontSize="8.5" fontWeight="600" fontFamily="Arial">{v}</text>
        </g>
      ))}
      <line x1="0" y1="280" x2="220" y2="280" stroke="rgba(255,255,255,.14)" strokeWidth="1"/>
      <text x="18" y="295" fill="rgba(255,255,255,.48)" fontSize="5.5" fontFamily="Arial">{name} · eetra.buyticle.com</text>
    </svg>
  )
}

function MinimalCover({ accent = '#374151', name = 'ATLAS CORP', title = 'CONTRAT OHADA' }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="220" height="310" fill="white"/>
      <rect x="0" y="307" width="220" height="3" fill={accent}/>
      <text x="18" y="38" fill="#AAA" fontSize="6.5" fontWeight="700" fontFamily="Arial" letterSpacing="1.5">{name.toUpperCase()}</text>
      <text x="190" y="38" textAnchor="end" fill="#DDD" fontSize="6" fontFamily="Arial">2026</text>
      <text x="18" y="150" fill="#0D1117" fontSize="27" fontWeight="900" fontFamily="Arial">{title.split(' ')[0]}</text>
      <text x="18" y="181" fill="#0D1117" fontSize="27" fontWeight="900" fontFamily="Arial">{title.split(' ').slice(1).join(' ')}</text>
      <line x1="18" y1="200" x2="62" y2="200" stroke={accent} strokeWidth="2.5"/>
      <line x1="18" y1="220" x2="18" y2="264" stroke="#E8E8E8" strokeWidth="1"/>
      {[['Date','15/01/2026'],['Réf.','CT-2026-001'],['Usage','CONFIDENTIEL']].map(([l,v],i)=>(
        <g key={i}>
          <text x="28" y={232+i*14} fill="#CCC" fontSize="5" fontWeight="700" fontFamily="Arial">{l.toUpperCase()}</text>
          <text x="95" y={232+i*14} fill="#555" fontSize="6.5" fontWeight="600" fontFamily="Arial">{v}</text>
        </g>
      ))}
      <rect x="170" y="254" width="32" height="32" rx="5" fill="#F5F7FA"/>
      {[[172,256],[184,256],[172,268],[184,268]].map(([x,y],i)=>(
        <rect key={i} x={x} y={y} width={i===3?5:8} height={i===3?5:8} rx="1" fill="#DDD"/>
      ))}
      <line x1="18" y1="290" x2="205" y2="290" stroke="#F0F0F0" strokeWidth=".75"/>
      <text x="18" y="302" fill="#CCC" fontSize="5.5" fontFamily="Arial">{name} · eetra.buyticle.com</text>
    </svg>
  )
}

function SplitCover({ accent = '#7C3AED', name = 'NOVA SAS', title = "APPEL D'OFFRE" }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="220" height="310" fill="white"/>
      <rect x="0" y="0" width="106" height="310" fill={accent}/>
      <circle cx="53" cy="18" r="85" fill="rgba(255,255,255,.06)"/>
      <circle cx="10" cy="290" r="50" fill="rgba(0,0,0,.1)"/>
      <rect x="14" y="22" width="30" height="30" rx="7" fill="rgba(255,255,255,.2)"/>
      <text x="29" y="41" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="Arial">{name.charAt(0)}</text>
      <text x="14" y="68" fill="rgba(255,255,255,.7)" fontSize="7" fontWeight="700" fontFamily="Arial">{name}</text>
      <text x="14" y="148" fill="rgba(255,255,255,.55)" fontSize="5.5" fontFamily="Arial" letterSpacing="1.2">DOCUMENT</text>
      <text x="14" y="168" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial">{title.split(' ')[0]}</text>
      <text x="14" y="187" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial">D'OFFRE</text>
      <rect x="14" y="198" width="18" height="2" rx="1" fill="rgba(255,255,255,.35)"/>
      <text x="14" y="214" fill="rgba(255,255,255,.52)" fontSize="6.5" fontFamily="Arial">15/01/2026</text>
      <text x="14" y="227" fill="rgba(255,255,255,.38)" fontSize="5.5" fontFamily="Arial">RÉPONSE À AO-026</text>
      <rect x="122" y="22" width="52" height="13" rx="4" fill={accent} opacity=".12"/>
      <text x="148" y="32" textAnchor="middle" fill={accent} fontSize="5" fontWeight="700" fontFamily="Arial" letterSpacing=".5">CONFIDENTIEL</text>
      {[['Date','15/01/2026'],['Réf.','AO-026-01'],['Statut','En attente']].map(([l,v],i)=>(
        <g key={i}>
          <rect x="115" y={108+i*42} width="96" height="30" rx="5" fill="#F8F9FB"/>
          <text x="123" y={122+i*42} fill="#AAA" fontSize="5" fontWeight="700" fontFamily="Arial">{l.toUpperCase()}</text>
          <text x="123" y={133+i*42} fill="#333" fontSize="8" fontWeight="600" fontFamily="Arial">{v}</text>
        </g>
      ))}
      <text x="115" y="280" fill="#CCC" fontSize="6" fontStyle="italic" fontFamily="Arial">"Votre partenaire de confiance"</text>
    </svg>
  )
}

function EditorialCover({ accent = '#B45309', name = 'SOLEIL GROUP', title = 'NOTE DE DIRECTION' }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="220" height="310" fill="#0A0E1A"/>
      <rect x="0" y="0" width="220" height="72" fill={accent}/>
      <polygon points="0,72 220,72 220,94 0,94" fill={accent} opacity=".25"/>
      <polygon points="0,72 80,72 0,110" fill={accent} opacity=".12"/>
      <text x="18" y="26" fill="white" fontSize="8.5" fontWeight="900" fontFamily="Arial" letterSpacing="1">{name.toUpperCase()}</text>
      <line x1="18" y1="34" x2="205" y2="34" stroke="rgba(255,255,255,.18)" strokeWidth=".6"/>
      <text x="18" y="50" fill="rgba(255,255,255,.75)" fontSize="6" fontFamily="Arial">Mémo Interne · Confidentiel</text>
      <text x="18" y="63" fill="rgba(255,255,255,.38)" fontSize="5.5" fontFamily="Arial">Direction Générale · Q1 2026</text>
      <text x="168" y="32" fill="rgba(255,255,255,.35)" fontSize="42" fontWeight="900" fontFamily="Arial" opacity=".2">07</text>
      <text x="18" y="132" fill="white" fontSize="12.5" fontWeight="800" fontFamily="Arial" letterSpacing=".5">{title}</text>
      <rect x="18" y="142" width="185" height=".6" fill="rgba(255,255,255,.1)"/>
      {[0,1,2,3,4].map(i=>(
        <rect key={i} x="18" y={152+i*15} width={[175,130,175,100,155][i]} height="4.5" rx="2.25" fill="rgba(255,255,255,.07)"/>
      ))}
      <rect x="0" y="283" width="220" height="27" fill={accent}/>
      <text x="18" y="300" fill="rgba(255,255,255,.78)" fontSize="6.5" fontFamily="Arial">USAGE STRICTEMENT INTERNE</text>
      <text x="160" y="300" fill="rgba(255,255,255,.48)" fontSize="6.5" fontFamily="Arial">P. 01</text>
    </svg>
  )
}

function CorporateCover({ accent = '#0E7490', name = 'CREST & CO', title = 'PLAN STRATÉGIQUE' }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="220" height="310" fill="white"/>
      <rect x="0" y="0" width="220" height="7" fill={accent}/>
      <polygon points="0,7 52,7 0,50" fill={accent} opacity=".07"/>
      <text x="18" y="20" fill={accent} fontSize="8" fontWeight="900" fontFamily="Arial" letterSpacing="2">{name.toUpperCase()}</text>
      <text x="170" y="20" fill="#BBB" fontSize="6" fontFamily="Arial">2026</text>
      <line x1="18" y1="25" x2="205" y2="25" fill="none" stroke="#EEE" strokeWidth="1"/>
      {[['12M','CA cible'],['+34%','Croissance'],['47','Effectifs']].map(([v,l],i)=>(
        <g key={i}>
          <rect x={18+i*68} y="38" width="60" height="42" rx="6" fill={accent} opacity={.07+i*.02}/>
          <rect x={18+i*68} y="38" width="60" height="4" rx="2" fill={accent}/>
          <text x={48+i*68} y="66" textAnchor="middle" fill="#111" fontSize="14" fontWeight="900" fontFamily="Arial">{v}</text>
          <text x={48+i*68} y="75" textAnchor="middle" fill="#888" fontSize="5" fontFamily="Arial">{l.toUpperCase()}</text>
        </g>
      ))}
      <line x1="18" y1="97" x2="52" y2="97" stroke={accent} strokeWidth="2.5"/>
      <text x="18" y="122" fill="#111" fontSize="20" fontWeight="900" fontFamily="Arial">{title.split(' ')[0]}</text>
      <text x="18" y="146" fill="#111" fontSize="20" fontWeight="900" fontFamily="Arial">{title.split(' ').slice(1).join(' ')}</text>
      <text x="18" y="163" fill="#999" fontSize="7" fontFamily="Arial" fontStyle="italic">Exercice 2026 – 2030</text>
      <line x1="18" y1="177" x2="205" y2="177" stroke="#F0F0F0" strokeWidth="1"/>
      {[0,1,2,3].map(i=>(
        <rect key={i} x="18" y={185+i*16} width={[175,140,175,100][i]} height="6" rx="3" fill="#F5F5F5"/>
      ))}
      <line x1="18" y1="280" x2="205" y2="280" stroke="#F0F0F0" strokeWidth="1"/>
      <text x="18" y="292" fill="#CCC" fontSize="5.5" fontFamily="Arial">{name} · eetra.buyticle.com</text>
      <rect x="194" y="277" width="14" height="14" rx="2" fill="#F5F5F5"/>
    </svg>
  )
}

function DevisCover({ accent = '#DC2626' }: any) {
  return (
    <svg viewBox="0 0 220 310" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="220" height="310" fill="white"/>
      <rect x="0" y="0" width="220" height="52" fill={accent}/>
      <text x="18" y="23" fill="white" fontSize="9.5" fontWeight="900" fontFamily="Arial">DEVIS N° DEV-2026-042</text>
      <text x="18" y="40" fill="rgba(255,255,255,.68)" fontSize="6.5" fontFamily="Arial">Valable 30 jours · FCFA HT · eetra.buyticle.com</text>
      <rect x="10" y="64" width="200" height="17" rx="4" fill={accent} opacity=".1"/>
      {['Désignation','Qté','P.U.','Total'].map((h,i)=>(
        <text key={i} x={[15,112,148,183][i]} y="76" fill={accent} fontSize="5.5" fontWeight="800" fontFamily="Arial">{h}</text>
      ))}
      {[['Conseil stratégique','5j','150k','750k'],['Audit organisationnel','1f','500k','500k'],['Rapport final','1f','200k','200k'],['Formation équipe','2s','250k','500k']].map(([d,q,u,t],i)=>(
        <g key={i}>
          <rect x="10" y={85+i*23} width="200" height="21" fill={i%2?'#FAFAFA':'white'}/>
          <line x1="10" y1={106+i*23} x2="210" y2={106+i*23} stroke="#F0F0F0" strokeWidth=".6"/>
          <text x="15" y={99+i*23} fill="#333" fontSize="6" fontFamily="Arial">{d}</text>
          <text x="116" y={99+i*23} fill="#666" fontSize="6" fontFamily="Arial">{q}</text>
          <text x="150" y={99+i*23} fill="#666" fontSize="6" fontFamily="Arial">{u}</text>
          <text x="185" y={99+i*23} fill="#111" fontSize="6" fontWeight="700" fontFamily="Arial">{t}</text>
        </g>
      ))}
      <rect x="122" y="180" width="88" height="54" rx="6" fill="#F8F9FB"/>
      {[['Sous-total HT','1 950 000'],['TVA (18%)','351 000']].map(([l,v],i)=>(
        <g key={i}>
          <text x="128" y={195+i*17} fill="#888" fontSize="6" fontFamily="Arial">{l}</text>
          <text x="204" y={195+i*17} textAnchor="end" fill="#555" fontSize="6" fontFamily="Arial">{v}</text>
        </g>
      ))}
      <rect x="122" y="226" width="88" height="8" rx="4" fill={accent}/>
      <text x="128" y="232.5" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Arial">TOTAL TTC</text>
      <text x="204" y="232.5" textAnchor="end" fill="white" fontSize="5.5" fontWeight="800" fontFamily="Arial">2 301 000 FCFA</text>
      <text x="18" y="255" fill="#AAA" fontSize="5" fontWeight="700" fontFamily="Arial">CONDITIONS GÉNÉRALES DE VENTE</text>
      <rect x="18" y="261" width="175" height="5" rx="2.5" fill="#F5F5F5"/>
      <rect x="18" y="270" width="120" height="5" rx="2.5" fill="#F5F5F5"/>
      <rect x="18" y="285" width="82" height="20" rx="5" fill="#F5F5F5"/>
      <text x="59" y="297" textAnchor="middle" fill="#CCC" fontSize="6" fontFamily="Arial">BON POUR ACCORD</text>
      <rect x="128" y="285" width="82" height="20" rx="5" fill={accent} opacity=".1"/>
      <text x="169" y="297" textAnchor="middle" fill={accent} fontSize="6" fontWeight="700" fontFamily="Arial">CACHET + SIGNATURE</text>
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const DESIGNS = [
  { id:'classic',       name:'Classic Corporate',  subtitle:'L\'élégance intemporelle du document d\'entreprise',      cat:'Business',          style:'Bande latérale · Grille meta',  free:true,  accent:'#1B4FD8', Preview:(a:string)=><ClassicCover accent={a} name="ACACIA" title="BUSINESS PLAN" logoChar="A"/>,    uses:['Business Plan','Rapport annuel','Proposition commerciale'],  feats:['Bande latérale colorée','Grille de méta-données','QR code authenticité'] },
  { id:'bold',          name:'Bold Statement',      subtitle:'Un fond saturé qui impose l\'autorité visuelle',          cat:'Audit',             style:'Fond plein · Titre massif',    free:true,  accent:'#059669', Preview:(a:string)=><BoldCover accent={a} name="QUANTUM" title="RAPPORT AUDIT"/>,                   uses:['Rapport d\'audit','Note de conformité','Bilan de projet'],   feats:['Fond coloré full-bleed','Cercles décoratifs','Typographie white-on-color'] },
  { id:'minimal',       name:'Minimal Precision',  subtitle:'L\'épure comme signature d\'excellence absolue',          cat:'Juridique',         style:'Épuré · Ligne de bas',         free:true,  accent:'#374151', Preview:(a:string)=><MinimalCover accent={a} name="ATLAS CORP" title="CONTRAT OHADA"/>,              uses:['Contrat OHADA','Convention de service','NDA / Accord'],      feats:['Design ultra-épuré','Fine ligne bas de page','Typographie grand format'] },
  { id:'split',         name:'Split Duality',       subtitle:'Deux mondes visuels en tension harmonieuse',             cat:'Appels d\'Offres',  style:'Split 45/55 · Cartes droite',  free:false, accent:'#7C3AED', Preview:(a:string)=><SplitCover accent={a} name="NOVA SAS" title="APPEL D'OFFRE"/>,                  uses:['Appel d\'offres','Proposition technique','Dossier de soumission'],feats:['Composition split','Cartes méta-données','Identité forte gauche'] },
  { id:'editorial',     name:'Editorial Dark',      subtitle:'L\'esthétique de la presse premium nocturne',            cat:'Direction',         style:'Fond sombre · Bande header',   free:false, accent:'#B45309', Preview:(a:string)=><EditorialCover accent={a} name="SOLEIL GROUP" title="NOTE DE DIRECTION"/>,       uses:['Note de direction','Compte-rendu COMEX','Mémo exécutif'],    feats:['Fond sombre premium','Header couleur accent','Typographie éditoriale'] },
  { id:'corporate',     name:'Corporate KPI',       subtitle:'Les données au premier plan, dès la couverture',         cat:'Stratégie',         style:'Data-first · KPIs cover',      free:false, accent:'#0E7490', Preview:(a:string)=><CorporateCover accent={a} name="CREST & CO" title="PLAN STRATÉGIQUE"/>,         uses:['Plan stratégique 5 ans','Rapport financier','Dashboard investisseurs'],feats:['KPIs en couverture','Diagonale géométrique','Grille de données'] },
  { id:'devis',         name:'Commerce Pro',        subtitle:'Le devis comme outil de vente à part entière',           cat:'Commercial',        style:'Transactionnel · Tableau HT',  free:true,  accent:'#DC2626', Preview:(a:string)=><DevisCover accent={a}/>,                                                         uses:['Devis professionnel','Facture pro-forma','Proposition commerciale'],feats:['Tableau de tarification','Récap TVA/TTC','Zone bon pour accord'] },
  { id:'classic-em',    name:'Classic Emerald',     subtitle:'Le classique revisité dans les verts profonds',          cat:'Business',          style:'Bande latérale · Vert',        free:true,  accent:'#065F46', Preview:(a:string)=><ClassicCover accent={a} name="VERDANT" title="PLAN DE DÉVELOPPEMENT" logoChar="V"/>,uses:['Business plan PME','Dossier de financement','Présentation investisseurs'],feats:['Palette verts profonds','Structure Classic','Cohérence durabilité'] },
  { id:'bold-violet',   name:'Bold Violet',         subtitle:'L\'autorité des tons violets sur fond saturé',           cat:'Conseil',           style:'Fond plein · Violet deep',     free:false, accent:'#4A1D96', Preview:(a:string)=><BoldCover accent={a} name="PRAXIS" title="ÉTUDE DE MARCHÉ"/>,                   uses:['Étude de marché','Rapport de consulting','Analyse sectorielle'],feats:['Violet profond de prestige','Layout Bold','Différenciation premium'] },
]

const CATS = ['Tous','Business','Audit','Juridique','Appels d\'Offres','Direction','Stratégie','Commercial','Conseil']

// ── Global styles ─────────────────────────────────────────────────────────────

const CSS = `
  [data-sr].sr-in { opacity:1!important; transform:none!important; }

  @keyframes float-slow {
    0%,100% { transform:translateY(0px) rotate(-0.5deg); }
    50%      { transform:translateY(-12px) rotate(0.5deg); }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1); opacity:.6; }
    100% { transform:scale(2.2); opacity:0; }
  }
  @keyframes shimmer-line {
    0%   { transform:translateX(-100%); }
    100% { transform:translateX(400%); }
  }
  @keyframes fade-in-up {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes gradient-shift {
    0%,100% { background-position:0% 50%; }
    50%      { background-position:100% 50%; }
  }

  .design-card {
    border-radius: 20px;
    border: 1.5px solid var(--border);
    overflow: hidden;
    background: var(--surface);
    transition: transform .35s cubic-bezier(.23,1,.32,1),
                box-shadow .35s ease,
                border-color .2s;
    cursor: pointer;
    position: relative;
  }
  .design-card::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at var(--cx,50%) var(--cy,50%), rgba(255,255,255,.06) 0%, transparent 60%);
    pointer-events: none;
    opacity: 0;
    transition: opacity .3s;
    border-radius: inherit;
    z-index: 5;
  }
  .design-card:hover::after { opacity: 1; }
  .design-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 20px 56px rgba(0,0,0,.14), 0 8px 20px rgba(0,0,0,.08);
  }

  .doc-preview {
    transition: transform .35s cubic-bezier(.23,1,.32,1), box-shadow .35s ease;
    animation: float-slow 6s ease-in-out infinite;
  }
  .design-card:hover .doc-preview {
    transform: scale(1.06) rotate(1deg);
    box-shadow: 0 32px 80px rgba(0,0,0,.28), 0 12px 24px rgba(0,0,0,.12);
    animation-play-state: paused;
  }

  .cat-pill {
    padding: 7px 16px; border-radius: 99px; border: none;
    cursor: pointer; white-space: nowrap;
    font-size: 12px; font-weight: 700;
    transition: all .2s cubic-bezier(.23,1,.32,1);
  }
  .cat-pill:hover { transform: translateY(-1px); }

  .cta-primary {
    transition: transform .25s cubic-bezier(.23,1,.32,1), box-shadow .25s;
  }
  .cta-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 48px rgba(27,79,216,.45)!important;
  }

  .feature-row {
    display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
  }
  .feature-dot {
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--accentS);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .progress-bar {
    position: fixed; top: 0; left: 0; right: 0; height: 3px;
    z-index: 9999; pointer-events: none;
  }
  #__dpg {
    height: 100%; width: 0%;
    background: linear-gradient(90deg,#1B4FD8,#5B9BFF 50%,#7C3AED);
    box-shadow: 0 0 16px rgba(91,155,255,.7);
    transition: width .04s linear;
  }

  .grid-bg {
    background-image:
      linear-gradient(rgba(27,79,216,.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(27,79,216,.035) 1px, transparent 1px);
    background-size: 44px 44px;
  }

  .hero-glow {
    position: absolute; border-radius: 50%; pointer-events: none;
    background: radial-gradient(ellipse, rgba(27,79,216,.16) 0%, transparent 70%);
    filter: blur(1px);
  }

  .mini-doc-strip {
    transition: transform .2s cubic-bezier(.23,1,.32,1), box-shadow .2s;
  }
  .mini-doc-strip:hover {
    transform: translateY(-5px) scale(1.08);
    box-shadow: 0 12px 32px rgba(0,0,0,.2);
    z-index: 2;
  }

  .preview-modal-content {
    animation: fade-in-up .3s cubic-bezier(.23,1,.32,1);
  }
`

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DesignsPage() {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState('Tous')
  const [previewId, setPreviewId] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useScrollReveal()
  useParallax()
  useScrollProgress()
  useCursorGlow(gridRef as React.RefObject<HTMLDivElement>)

  const filtered = DESIGNS.filter(d => activeCat === 'Tous' || d.cat === activeCat)
  const preview  = DESIGNS.find(d => d.id === previewId)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>

      {/* Progress bar */}
      <div className="progress-bar"><div id="__dpg"/></div>

      <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)' }}>

        {/* ── Navbar ── */}
        <nav style={{ position:'sticky', top:0, zIndex:50, background:'var(--surface)', borderBottom:'1px solid var(--border)', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 36px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
              <Image src={logo} alt="EETRA" width={30} height={30} style={{ borderRadius:7 }}/>
              <span style={{ fontSize:17, fontWeight:900, color:'var(--text)', letterSpacing:'-.03em' }}>EETRA</span>
            </Link>
            <span style={{ color:'var(--border2)', fontSize:18 }}>/</span>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text4)' }}>Galerie de Designs</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <ThemeToggle/>
            <button
              onClick={() => router.push('/login')}
              className="cta-primary"
              style={{ padding:'9px 20px', borderRadius:11, background:'var(--accent)', color:'#fff', border:'none', cursor:'pointer', fontSize:13, fontWeight:800 }}
            >
              Créer un document →
            </button>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div style={{ position:'relative', overflow:'hidden', textAlign:'center', padding:'100px 0 0' }}>
          {/* Background */}
          <div className="grid-bg" style={{ position:'absolute', inset:0, pointerEvents:'none' }}/>
          <div className="hero-glow" data-p="0.06" style={{ top:-120, left:'50%', transform:'translateX(-50%)', width:700, height:420 }}/>
          <div className="hero-glow" data-p="0.04" style={{ bottom:0, left:'15%', width:300, height:300, background:'radial-gradient(ellipse,rgba(124,58,237,.1),transparent 70%)' }}/>

          <div style={{ position:'relative', maxWidth:760, margin:'0 auto', padding:'0 36px 72px' }}>

            <SR d={0}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:99, background:'var(--accentS2)', color:'var(--accent)', fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:28, border:'1px solid rgba(27,79,216,.2)' }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block', position:'relative' }}>
                  <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent)', animation:'pulse-ring 2s ease-out infinite' }}/>
                </span>
                9 designs · Mise en page A4
              </div>
            </SR>

            <SR d={80}>
              <h1 style={{ fontSize:'clamp(44px,7vw,76px)', fontWeight:900, letterSpacing:'-.05em', lineHeight:.88, color:'var(--text)', marginBottom:24 }}>
                Choisissez votre<br/>
                <span style={{ background:'linear-gradient(135deg,var(--accent) 0%,#5B9BFF 50%,#7C3AED 100%)', backgroundSize:'200% 200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'gradient-shift 4s ease infinite' }}>
                  signature visuelle
                </span>
              </h1>
            </SR>

            <SR d={160}>
              <p style={{ fontSize:17, color:'var(--text3)', lineHeight:1.65, maxWidth:540, margin:'0 auto 48px' }}>
                Chaque design est une couverture A4 pensée pour l'Afrique de l'Ouest — disponible dans l'éditeur avec votre logo, couleurs et typographie.
              </p>
            </SR>

            {/* Mini document strip */}
            <SR d={240}>
              <div style={{ display:'flex', gap:10, justifyContent:'center', alignItems:'flex-end', flexWrap:'wrap' }}>
                {DESIGNS.slice(0,5).map((d, i) => (
                  <div
                    key={d.id}
                    className="mini-doc-strip"
                    onClick={() => setPreviewId(d.id)}
                    style={{
                      width: [52, 60, 48, 60, 52][i],
                      height: [74, 85, 68, 85, 74][i],
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: '1.5px solid var(--border)',
                      boxShadow: '0 4px 16px rgba(0,0,0,.1)',
                      cursor: 'pointer',
                      position: 'relative',
                      animationDelay: `${i * .4}s`,
                    }}
                  >
                    {d.Preview(d.accent)}
                  </div>
                ))}
                <div
                  onClick={() => router.push('#grid')}
                  style={{ width:52, height:74, borderRadius:8, border:'1.5px dashed var(--border2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'var(--text4)', cursor:'pointer' }}
                >
                  +{DESIGNS.length-5}
                </div>
              </div>
            </SR>
          </div>
        </div>

        {/* ── Sticky category filter ── */}
        <div style={{ position:'sticky', top:56, zIndex:40, background:'var(--surface)', borderBottom:'1px solid var(--border)', padding:'0 36px' }}>
          <div style={{ maxWidth:1240, margin:'0 auto', display:'flex', gap:3, overflowX:'auto', padding:'10px 0' }}>
            {CATS.map(cat => (
              <button
                key={cat}
                className="cat-pill"
                onClick={() => setActiveCat(cat)}
                style={{
                  background: activeCat === cat ? 'var(--accent)' : 'transparent',
                  color: activeCat === cat ? '#fff' : 'var(--text4)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main grid ── */}
        <div id="grid" style={{ maxWidth:1240, margin:'0 auto', padding:'56px 36px 80px' }} ref={gridRef}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:24 }}>
            {filtered.map((design, i) => (
              <SR key={design.id} d={i * 60} from="up">
                <div
                  className="design-card"
                  style={{ '--cx':'50%', '--cy':'50%' } as any}
                  onMouseMove={e => {
                    const r = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--cx', `${e.clientX - r.left}px`)
                    e.currentTarget.style.setProperty('--cy', `${e.clientY - r.top}px`)
                  }}
                >
                  {/* Preview zone */}
                  <div style={{ height:340, background:'var(--bg2)', display:'flex', alignItems:'center', justifyContent:'center', padding:'28px 52px', position:'relative', overflow:'hidden' }}>
                    {/* Dot grid bg */}
                    <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)', backgroundSize:'18px 18px', pointerEvents:'none' }}/>
                    {/* Parallax glow */}
                    <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:`radial-gradient(ellipse,${design.accent}18,transparent 70%)`, pointerEvents:'none' }}/>
                    {/* Shimmer line on hover */}
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'100%', overflow:'hidden', pointerEvents:'none', zIndex:3 }}>
                      <div style={{ position:'absolute', top:0, left:0, width:'40%', height:'100%', background:`linear-gradient(90deg,transparent,${design.accent}08,transparent)`, animation:'shimmer-line 3s ease-in-out infinite 1s' }}/>
                    </div>
                    {/* Document */}
                    <div className="doc-preview" style={{ position:'relative', zIndex:2, width:'100%', maxWidth:185, aspectRatio:'.707', borderRadius:10, overflow:'hidden', boxShadow:'0 10px 40px rgba(0,0,0,.2),0 4px 12px rgba(0,0,0,.1)' }}>
                      {design.Preview(design.accent)}
                    </div>
                    {/* Free/Pro badge */}
                    <div style={{ position:'absolute', top:14, right:14, padding:'5px 11px', borderRadius:99, background:design.free?'rgba(5,150,105,.12)':'rgba(27,79,216,.12)', color:design.free?'#059669':'var(--accent)', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', gap:4, backdropFilter:'blur(8px)', border:`1px solid ${design.free?'rgba(5,150,105,.2)':'rgba(27,79,216,.2)'}`, zIndex:4 }}>
                      {design.free ? <><Check size={9}/> Gratuit</> : <><Lock size={9}/> Pro</>}
                    </div>
                    {/* Hover: full preview btn */}
                    <button
                      onClick={() => setPreviewId(design.id)}
                      style={{ position:'absolute', bottom:16, left:'50%', transform:'translateX(-50%)', padding:'9px 22px', borderRadius:11, border:'none', background:'rgba(0,0,0,.75)', color:'#fff', backdropFilter:'blur(10px)', cursor:'pointer', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6, opacity:0, transition:'opacity .2s', zIndex:6, whiteSpace:'nowrap' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                      onFocus={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    >
                      <Eye size={12}/> Aperçu plein écran
                    </button>
                    <style>{`.design-card:hover button { opacity:1!important; }`}</style>
                  </div>

                  {/* Card body */}
                  <div style={{ padding:'22px 24px 24px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:17, fontWeight:800, color:'var(--text)', letterSpacing:'-.02em' }}>{design.name}</div>
                        <div style={{ fontSize:11, color:'var(--text4)', marginTop:3 }}>{design.style}</div>
                      </div>
                      <div style={{ position:'relative', flexShrink:0, marginTop:4 }}>
                        <div style={{ width:11, height:11, borderRadius:'50%', background:design.accent }}/>
                        <div style={{ position:'absolute', inset:-3, borderRadius:'50%', border:`1.5px solid ${design.accent}`, opacity:.35 }}/>
                      </div>
                    </div>

                    <p style={{ fontSize:13, color:'var(--text3)', lineHeight:1.6, marginBottom:16 }}>{design.subtitle}</p>

                    <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:18 }}>
                      {design.uses.map(u => (
                        <span key={u} style={{ fontSize:9, fontWeight:700, padding:'3px 9px', borderRadius:99, background:'var(--bg3)', color:'var(--text4)', letterSpacing:'.04em' }}>{u}</span>
                      ))}
                    </div>

                    <div style={{ marginBottom:20 }}>
                      {design.feats.map(f => (
                        <div key={f} className="feature-row">
                          <div className="feature-dot"><Check size={8} color="var(--accent)" strokeWidth={3}/></div>
                          <span style={{ fontSize:12, color:'var(--text3)' }}>{f}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => router.push('/login')}
                      style={{ width:'100%', padding:'11px', borderRadius:12, border:`1.5px solid var(--border)`, background:'transparent', cursor:'pointer', fontSize:13, fontWeight:700, color:'var(--text2)', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transition:'all .2s' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background=design.accent; el.style.borderColor=design.accent; el.style.color='#fff'; el.style.transform='translateY(-1px)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='transparent'; el.style.borderColor='var(--border)'; el.style.color='var(--text2)'; el.style.transform='' }}
                    >
                      Utiliser ce design <ArrowRight size={13}/>
                    </button>
                  </div>
                </div>
              </SR>
            ))}
          </div>

          {/* Bottom CTA */}
          <SR d={0} style={{ marginTop:88 }}>
            <div style={{ textAlign:'center', padding:'56px 64px', borderRadius:28, border:'1px solid var(--border)', background:'var(--surface)', position:'relative', overflow:'hidden' }}>
              <div data-p="0.05" style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:500, height:300, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(27,79,216,.08),transparent 70%)', pointerEvents:'none' }}/>
              <div style={{ position:'relative' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:99, background:'var(--accentS2)', color:'var(--accent)', fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', marginBottom:20 }}>
                  <Sparkles size={10}/> Votre marque, votre design
                </div>
                <div style={{ fontSize:30, fontWeight:900, color:'var(--text)', marginBottom:14, letterSpacing:'-.03em' }}>
                  Chaque design, 100% à votre marque
                </div>
                <p style={{ fontSize:15, color:'var(--text3)', marginBottom:32, maxWidth:480, margin:'0 auto 32px', lineHeight:1.65 }}>
                  Logo, couleurs, typographie, coordonnées — tout s'adapte à votre charte en quelques clics.
                </p>
                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:32 }}>
                  {['9 designs A4','Export PDF & Word','Couleurs personnalisées','Logo corporate','QR authenticité'].map(l => (
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:99, background:'var(--bg2)', border:'1px solid var(--border)', fontSize:12, fontWeight:600, color:'var(--text3)' }}>
                      <Check size={11} color="var(--success)"/> {l}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push('/login')}
                  className="cta-primary"
                  style={{ padding:'15px 40px', borderRadius:15, background:'var(--accent)', color:'#fff', border:'none', cursor:'pointer', fontSize:14, fontWeight:800, display:'inline-flex', alignItems:'center', gap:8, boxShadow:'0 8px 32px rgba(27,79,216,.3)' }}
                >
                  <Zap size={15}/> Commencer gratuitement
                </button>
              </div>
            </div>
          </SR>
        </div>

        {/* ── Full-screen preview modal ── */}
        {preview && (
          <div
            style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,.8)', backdropFilter:'blur(16px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
            onClick={() => setPreviewId(null)}
          >
            <div
              className="preview-modal-content"
              style={{ background:'var(--surface)', borderRadius:24, border:'1px solid var(--border)', overflow:'hidden', maxWidth:980, width:'100%', maxHeight:'92vh', display:'flex', boxShadow:'0 48px 120px rgba(0,0,0,.4)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Left: document */}
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:52, background:'var(--bg3)', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px)', backgroundSize:'22px 22px' }}/>
                <div data-p="0.04" style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 70% 30%,${preview.accent}12,transparent 60%)`, pointerEvents:'none' }}/>
                <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:270, aspectRatio:'.707', borderRadius:12, overflow:'hidden', boxShadow:'0 32px 96px rgba(0,0,0,.35),0 12px 32px rgba(0,0,0,.15)', animation:'float-slow 6s ease-in-out infinite' }}>
                  {preview.Preview(preview.accent)}
                </div>
              </div>
              {/* Right: info */}
              <div style={{ width:340, flexShrink:0, padding:'36px 32px', overflowY:'auto', position:'relative' }}>
                <button
                  onClick={() => setPreviewId(null)}
                  style={{ position:'absolute', top:20, right:20, width:34, height:34, borderRadius:9, border:'1px solid var(--border)', background:'var(--bg2)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text4)', transition:'all .15s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--bg3)'; el.style.color='var(--text)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='var(--bg2)'; el.style.color='var(--text4)' }}
                >
                  <X size={14}/>
                </button>

                <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:99, marginBottom:18, background:preview.free?'rgba(5,150,105,.1)':'rgba(27,79,216,.1)', color:preview.free?'#059669':'var(--accent)', fontSize:10, fontWeight:800 }}>
                  {preview.free ? <><Check size={9}/> Gratuit</> : <><Lock size={9}/> Plan Pro</>}
                </div>

                <div style={{ fontSize:24, fontWeight:900, color:'var(--text)', marginBottom:6, letterSpacing:'-.02em' }}>{preview.name}</div>
                <div style={{ fontSize:12, color:'var(--text4)', marginBottom:14 }}>{preview.style}</div>
                <p style={{ fontSize:14, color:'var(--text3)', lineHeight:1.65, marginBottom:28 }}>{preview.subtitle}</p>

                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'.16em', textTransform:'uppercase', color:'var(--text4)', marginBottom:12 }}>Cas d'usage</div>
                {preview.uses.map(uc => (
                  <div key={uc} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:preview.accent, flexShrink:0 }}/>
                    <span style={{ fontSize:13, color:'var(--text2)' }}>{uc}</span>
                  </div>
                ))}

                <div style={{ height:1, background:'var(--border)', margin:'22px 0' }}/>

                <div style={{ fontSize:9, fontWeight:800, letterSpacing:'.16em', textTransform:'uppercase', color:'var(--text4)', marginBottom:12 }}>Caractéristiques</div>
                {preview.feats.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:9 }}>
                    <div style={{ width:17, height:17, borderRadius:'50%', background:'var(--accentS)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Check size={9} color="var(--accent)" strokeWidth={3}/>
                    </div>
                    <span style={{ fontSize:13, color:'var(--text3)' }}>{f}</span>
                  </div>
                ))}

                <button
                  onClick={() => router.push('/login')}
                  className="cta-primary"
                  style={{ marginTop:32, width:'100%', padding:'13px', borderRadius:13, background:preview.accent, color:'#fff', border:'none', cursor:'pointer', fontSize:14, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                >
                  Utiliser ce design <ArrowRight size={13}/>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}