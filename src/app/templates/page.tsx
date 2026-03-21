'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Plus, Search, ArrowLeft, FileText,
  Trash2, Copy, Edit3, Check, X,
} from 'lucide-react'
import { useCustomTemplates, type CustomTemplate } from '@/contexts/CustomTemplateContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Toast }       from '@/components/ui/Toast'
import { useToast }    from '@/hooks/useToast'

const STORAGE_DRAFT = 'eetra-document-draft'

interface TplDef {
  id: string; name: string; desc: string; cat: string; subcat?: string;
  color: string; blocs: number; tags: string[];
  Cover: (props: { color: string }) => JSX.Element
}

// ── COVERS ───────────────────────────────────────────────────────────────────

function CoverBusiness({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="3" height="170" fill={color}/>
      <rect x="10" y="12" width="18" height="18" rx="4" fill={color}/>
      <text x="19" y="25" textAnchor="middle" fill="white" fontSize="8" fontWeight="900" fontFamily="Arial">B</text>
      <text x="33" y="22" fill="#111" fontSize="5.5" fontWeight="800" fontFamily="Arial">ENTREPRISE</text>
      <line x1="10" y1="60" x2="30" y2="60" stroke={color} strokeWidth="1.5"/>
      <text x="10" y="74" fill="#0D1117" fontSize="11" fontWeight="900" fontFamily="Arial">BUSINESS</text>
      <text x="10" y="87" fill="#0D1117" fontSize="11" fontWeight="900" fontFamily="Arial">PLAN</text>
      <text x="10" y="96" fill="#999" fontSize="4.5" fontFamily="Arial" fontStyle="italic">2026 — 2030</text>
      <rect x="10" y="104" width="100" height="26" rx="4" fill="#F8F9FB"/>
      <text x="14" y="114" fill="#BBB" fontSize="3" fontWeight="700" fontFamily="Arial">DATE</text>
      <text x="14" y="124" fill="#333" fontSize="4" fontFamily="Arial">15 jan. 2026</text>
      <text x="66" y="114" fill="#BBB" fontSize="3" fontWeight="700" fontFamily="Arial">RÉF.</text>
      <text x="66" y="124" fill="#333" fontSize="4" fontFamily="Arial">BP-001</text>
      <line x1="10" y1="155" x2="113" y2="155" stroke="#F0F0F0" strokeWidth=".6"/>
      <text x="10" y="162" fill="#AAA" fontSize="3.5" fontFamily="Arial">eetra.buyticle.com</text>
    </svg>
  )
}

function CoverAcademique({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="120" height="30" fill={color}/>
      <text x="60" y="11" textAnchor="middle" fill="rgba(255,255,255,.7)" fontSize="3.8" fontWeight="700" fontFamily="Arial" letterSpacing="1">UNIVERSITÉ DE YAOUNDÉ I</text>
      <line x1="15" y1="14" x2="105" y2="14" stroke="rgba(255,255,255,.2)" strokeWidth=".5"/>
      <text x="60" y="21" textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize="3.2" fontFamily="Arial">Faculté des Sciences · Dép. Informatique</text>
      <text x="60" y="28" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="3" fontFamily="Arial">Année Académique 2025-2026</text>
      <circle cx="60" cy="57" r="14" fill="none" stroke={color} strokeWidth=".7" opacity=".2"/>
      <text x="60" y="62" textAnchor="middle" fill={color} fontSize="4" fontWeight="700" fontFamily="Arial" letterSpacing=".5">RAPPORT DE STAGE</text>
      <line x1="20" y1="75" x2="100" y2="75" stroke="#E8E8E8" strokeWidth=".5"/>
      <text x="60" y="85" textAnchor="middle" fill="#111" fontSize="6" fontWeight="900" fontFamily="Arial">ANALYSE ET CONCEPTION</text>
      <text x="60" y="94" textAnchor="middle" fill="#111" fontSize="6" fontWeight="900" fontFamily="Arial">D'UN SYSTÈME WEB</text>
      <line x1="20" y1="98" x2="100" y2="98" stroke="#E8E8E8" strokeWidth=".5"/>
      <text x="60" y="108" textAnchor="middle" fill="#666" fontSize="3.5" fontFamily="Arial">Présenté par : Jean-Pierre MBALLA</text>
      <text x="60" y="115" textAnchor="middle" fill="#666" fontSize="3.5" fontFamily="Arial">Matricule : CM-2022-INFO-0147</text>
      <text x="60" y="122" textAnchor="middle" fill={color} fontSize="3.5" fontWeight="700" fontFamily="Arial">Licence 3 · Informatique de Gestion</text>
      <rect x="0" y="157" width="120" height="13" fill={color} opacity=".07"/>
      <text x="60" y="166" textAnchor="middle" fill={color} fontSize="3" fontFamily="Arial" fontWeight="600">SOUTENANCE · JUIN 2026</text>
    </svg>
  )
}

function CoverPV({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="120" height="5" fill={color}/>
      <rect x="0" y="165" width="120" height="5" fill={color} opacity=".3"/>
      <text x="30" y="20" fill="#111" fontSize="5" fontWeight="800" fontFamily="Arial">SOCIÉTÉ CAMEROUNAISE SARL</text>
      <text x="30" y="28" fill="#666" fontSize="3.5" fontFamily="Arial">Capital : 5 000 000 FCFA · Douala</text>
      <line x1="8" y1="36" x2="112" y2="36" stroke="#E8E8E8" strokeWidth=".8"/>
      <rect x="20" y="50" width="80" height="22" rx="4" fill={color}/>
      <text x="60" y="60" textAnchor="middle" fill="white" fontSize="7" fontWeight="900" fontFamily="Arial">PROCÈS-VERBAL</text>
      <text x="60" y="68" textAnchor="middle" fill="rgba(255,255,255,.75)" fontSize="4" fontFamily="Arial">DE RÉUNION DU CONSEIL</text>
      <text x="60" y="83" textAnchor="middle" fill="#999" fontSize="3.5" fontFamily="Arial">N° PV-2026-CA-04</text>
      <line x1="30" y1="88" x2="90" y2="88" stroke="#E8E8E8" strokeWidth=".5"/>
      <text x="14" y="100" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">DATE</text>
      <text x="55" y="100" fill="#333" fontSize="4" fontFamily="Arial">15 Mars 2026</text>
      <text x="14" y="112" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">LIEU</text>
      <text x="55" y="112" fill="#333" fontSize="4" fontFamily="Arial">Salle Conférence A — Douala</text>
      <text x="14" y="124" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">QUORUM</text>
      <text x="55" y="124" fill="#333" fontSize="4" fontFamily="Arial">7 / 9 membres présents</text>
      <line x1="8" y1="142" x2="112" y2="142" stroke="#E8E8E8" strokeWidth=".5"/>
      <text x="30" y="152" textAnchor="middle" fill="#CCC" fontSize="3.5" fontFamily="Arial">Le Président</text>
      <text x="90" y="152" textAnchor="middle" fill="#CCC" fontSize="3.5" fontFamily="Arial">Le Secrétaire</text>
      <line x1="14" y1="160" x2="46" y2="160" stroke="#DDD" strokeWidth=".5"/>
      <line x1="74" y1="160" x2="106" y2="160" stroke="#DDD" strokeWidth=".5"/>
    </svg>
  )
}

function CoverCR({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="4" height="170" fill={color}/>
      <text x="12" y="16" fill="#999" fontSize="3.5" fontWeight="700" fontFamily="Arial" letterSpacing=".8">DOCUMENT INTERNE · CONFIDENTIEL</text>
      <line x1="12" y1="20" x2="113" y2="20" stroke="#F0F0F0" strokeWidth=".6"/>
      <text x="12" y="36" fill={color} fontSize="4" fontWeight="700" fontFamily="Arial" letterSpacing=".8">COMPTE RENDU</text>
      <text x="12" y="48" fill="#0D1117" fontSize="9.5" fontWeight="900" fontFamily="Arial">DE RÉUNION</text>
      <rect x="12" y="54" width="14" height="1.5" rx=".75" fill={color}/>
      <rect x="12" y="62" width="100" height="11" rx="2" fill="#F5F7FA"/>
      <text x="16" y="70" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">OBJET</text>
      <text x="44" y="70" fill="#333" fontSize="3.5" fontFamily="Arial">Revue stratégique Q1 2026</text>
      <rect x="12" y="75" width="100" height="11" rx="2" fill="#FAFAFA"/>
      <text x="16" y="83" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">DATE</text>
      <text x="44" y="83" fill="#333" fontSize="3.5" fontFamily="Arial">15 Mars 2026 · 09h00</text>
      <rect x="12" y="88" width="100" height="11" rx="2" fill="#F5F7FA"/>
      <text x="16" y="96" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">LIEU</text>
      <text x="44" y="96" fill="#333" fontSize="3.5" fontFamily="Arial">Salle de Conférence — HQ</text>
      <rect x="12" y="101" width="100" height="11" rx="2" fill="#FAFAFA"/>
      <text x="16" y="109" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">ANIMATEUR</text>
      <text x="44" y="109" fill="#333" fontSize="3.5" fontFamily="Arial">Direction Générale</text>
      <text x="12" y="128" fill="#999" fontSize="3" fontWeight="700" fontFamily="Arial" letterSpacing=".5">PARTICIPANTS</text>
      <text x="12" y="135" fill="#555" fontSize="3.5" fontFamily="Arial">DG · DAF · DRH · Dir. Commercial</text>
      <line x1="12" y1="143" x2="113" y2="143" stroke="#F0F0F0" strokeWidth=".6"/>
      <text x="12" y="151" fill="#AAA" fontSize="3.5" fontFamily="Arial">Réf. CR-2026-03-15 · eetra.buyticle.com</text>
    </svg>
  )
}

function CoverArticle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="#0A0E1A"/>
      <rect x="0" y="0" width="120" height="38" fill={color}/>
      <text x="60" y="13" textAnchor="middle" fill="rgba(255,255,255,.6)" fontSize="3.5" fontWeight="700" fontFamily="Arial" letterSpacing="1.2">REVUE AFRICAINE DES AFFAIRES</text>
      <line x1="15" y1="17" x2="105" y2="17" stroke="rgba(255,255,255,.2)" strokeWidth=".4"/>
      <text x="60" y="26" textAnchor="middle" fill="white" fontSize="5" fontWeight="900" fontFamily="Arial">ARTICLE DE RECHERCHE</text>
      <text x="60" y="33" textAnchor="middle" fill="rgba(255,255,255,.55)" fontSize="3" fontFamily="Arial">Vol. 12, N° 3 · Septembre 2026</text>
      <text x="12" y="52" fill="white" fontSize="6.5" fontWeight="900" fontFamily="Arial">DIGITALISATION DES PME</text>
      <text x="12" y="62" fill="white" fontSize="6.5" fontWeight="900" fontFamily="Arial">EN AFRIQUE CENTRALE</text>
      <text x="12" y="70" fill="rgba(255,255,255,.45)" fontSize="3.5" fontFamily="Arial" fontStyle="italic">Défis, opportunités et perspectives</text>
      <rect x="12" y="75" width="18" height="1.5" rx=".75" fill={color}/>
      <rect x="12" y="82" width="96" height="4" rx="2" fill="rgba(255,255,255,.07)"/>
      <rect x="12" y="89" width="80" height="4" rx="2" fill="rgba(255,255,255,.07)"/>
      <rect x="12" y="96" width="96" height="4" rx="2" fill="rgba(255,255,255,.07)"/>
      <rect x="12" y="103" width="65" height="4" rx="2" fill="rgba(255,255,255,.07)"/>
      <line x1="12" y1="116" x2="108" y2="116" stroke="rgba(255,255,255,.1)" strokeWidth=".5"/>
      <text x="12" y="124" fill={color} fontSize="3.5" fontWeight="700" fontFamily="Arial">Auteurs :</text>
      <text x="12" y="131" fill="rgba(255,255,255,.6)" fontSize="3.5" fontFamily="Arial">Prof. NKENG A. · Dr. FOUDA B.</text>
      <text x="12" y="138" fill="rgba(255,255,255,.35)" fontSize="3" fontFamily="Arial">UY II · ESSEC Douala</text>
      <text x="12" y="148" fill="rgba(255,255,255,.3)" fontSize="3" fontFamily="Arial">DOI: 10.1234/raa.2026.12.3</text>
    </svg>
  )
}

function CoverExpose({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="120" height="3" fill={color}/>
      <rect x="0" y="0" width="120" height="28" fill={color} opacity=".06"/>
      <text x="60" y="13" textAnchor="middle" fill={color} fontSize="4" fontWeight="800" fontFamily="Arial" letterSpacing=".5">UNIVERSITÉ DE DOUALA</text>
      <text x="60" y="21" textAnchor="middle" fill="#666" fontSize="3.5" fontFamily="Arial">Institut Universitaire de Technologie</text>
      <text x="60" y="43" textAnchor="middle" fill={color} fontSize="4.5" fontWeight="700" fontFamily="Arial" letterSpacing=".8">EXPOSÉ</text>
      <line x1="35" y1="47" x2="85" y2="47" stroke={color} strokeWidth=".7" opacity=".4"/>
      <text x="60" y="63" textAnchor="middle" fill="#0D1117" fontSize="8" fontWeight="900" fontFamily="Arial">LES ENJEUX DE</text>
      <text x="60" y="74" textAnchor="middle" fill="#0D1117" fontSize="8" fontWeight="900" fontFamily="Arial">LA GESTION RH</text>
      <text x="60" y="84" textAnchor="middle" fill={color} fontSize="6.5" fontWeight="900" fontFamily="Arial">EN ENTREPRISE</text>
      <line x1="12" y1="90" x2="108" y2="90" stroke="#E8E8E8" strokeWidth=".7"/>
      <text x="60" y="100" textAnchor="middle" fill="#666" fontSize="3.5" fontFamily="Arial">UE : Gestion des Ressources Humaines</text>
      <text x="60" y="107" textAnchor="middle" fill="#888" fontSize="3.5" fontFamily="Arial">Semestre 5 · Groupe TD-3</text>
      <rect x="14" y="114" width="92" height="30" rx="4" fill="#F8F9FB"/>
      <text x="60" y="122" textAnchor="middle" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial" letterSpacing=".5">MEMBRES DU GROUPE</text>
      <text x="60" y="130" textAnchor="middle" fill="#444" fontSize="3.5" fontFamily="Arial">NJOYA Fatima · BELLO Kevin</text>
      <text x="60" y="137" textAnchor="middle" fill="#444" fontSize="3.5" fontFamily="Arial">ABANA Sandra · NGONO Paul</text>
      <rect x="0" y="157" width="120" height="13" fill={color} opacity=".06"/>
      <text x="60" y="166" textAnchor="middle" fill={color} fontSize="3" fontFamily="Arial" fontWeight="600">Présenté le 15 Avril 2026</text>
    </svg>
  )
}

function CoverFacture({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="120" height="36" fill={color}/>
      <text x="12" y="16" fill="white" fontSize="8" fontWeight="900" fontFamily="Arial">FACTURE</text>
      <text x="12" y="25" fill="rgba(255,255,255,.65)" fontSize="3.5" fontFamily="Arial">N° FAC-2026-0142 · Valide 30 jours</text>
      <text x="12" y="32" fill="rgba(255,255,255,.45)" fontSize="3" fontFamily="Arial">FCFA HT · TVA 19.25%</text>
      <text x="12" y="48" fill="#999" fontSize="3" fontWeight="700" fontFamily="Arial" letterSpacing=".5">FACTURÉ À</text>
      <text x="12" y="55" fill="#111" fontSize="4.5" fontWeight="700" fontFamily="Arial">ENTREPRISE ABC SARL</text>
      <text x="12" y="61" fill="#666" fontSize="3.5" fontFamily="Arial">Akwa, Douala · Cameroun</text>
      <rect x="8" y="67" width="104" height="8" rx="2" fill={color} opacity=".1"/>
      <text x="11" y="73" fill={color} fontSize="3" fontWeight="800" fontFamily="Arial">Désignation</text>
      <text x="69" y="73" fill={color} fontSize="3" fontWeight="800" fontFamily="Arial">Qté</text>
      <text x="84" y="73" fill={color} fontSize="3" fontWeight="800" fontFamily="Arial">P.U.</text>
      <text x="103" y="73" textAnchor="end" fill={color} fontSize="3" fontWeight="800" fontFamily="Arial">Total</text>
      {[['Développement web','1f','350k','350k'],['Formation équipe','2j','75k','150k'],['Maintenance','1m','80k','80k'],['Documentation','1f','45k','45k']].map(([d,q,u,t],i)=>(
        <g key={i}>
          <rect x="8" y={78+i*10} width="104" height="10" fill={i%2?'#FAFAFA':'white'}/>
          <text x="11" y={85+i*10} fill="#333" fontSize="3" fontFamily="Arial">{d}</text>
          <text x="69" y={85+i*10} fill="#666" fontSize="3" fontFamily="Arial">{q}</text>
          <text x="84" y={85+i*10} fill="#666" fontSize="3" fontFamily="Arial">{u}</text>
          <text x="103" y={85+i*10} textAnchor="end" fill="#111" fontSize="3" fontWeight="700" fontFamily="Arial">{t}</text>
        </g>
      ))}
      <rect x="64" y="122" width="48" height="26" rx="3" fill="#F8F9FB"/>
      <text x="68" y="131" fill="#888" fontSize="3" fontFamily="Arial">Sous-total HT</text>
      <text x="107" y="131" textAnchor="end" fill="#555" fontSize="3" fontFamily="Arial">625 000</text>
      <text x="68" y="140" fill="#888" fontSize="3" fontFamily="Arial">TVA 19.25%</text>
      <text x="107" y="140" textAnchor="end" fill="#555" fontSize="3" fontFamily="Arial">120 312</text>
      <rect x="64" y="144" width="48" height="7" rx="3" fill={color}/>
      <text x="68" y="149.5" fill="white" fontSize="3" fontWeight="800" fontFamily="Arial">TOTAL TTC</text>
      <text x="107" y="149.5" textAnchor="end" fill="white" fontSize="3" fontWeight="800" fontFamily="Arial">745 312</text>
      <line x1="8" y1="158" x2="112" y2="158" stroke="#F0F0F0" strokeWidth=".6"/>
      <text x="8" y="165" fill="#AAA" fontSize="3.5" fontFamily="Arial">eetra.buyticle.com</text>
    </svg>
  )
}

function CoverAudit({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill={color}/>
      <circle cx="110" cy="22" r="50" fill="rgba(255,255,255,.06)"/>
      <rect x="12" y="14" width="20" height="20" rx="5" fill="rgba(255,255,255,.15)"/>
      <text x="22" y="28" textAnchor="middle" fill="white" fontSize="9" fontFamily="Arial">Q</text>
      <text x="38" y="21" fill="rgba(255,255,255,.8)" fontSize="5" fontWeight="800" fontFamily="Arial">QUANTUM</text>
      <text x="38" y="29" fill="rgba(255,255,255,.45)" fontSize="3.5" fontFamily="Arial">AUDIT & CONSEIL</text>
      <text x="12" y="60" fill="rgba(255,255,255,.5)" fontSize="3.5" fontWeight="700" fontFamily="Arial" letterSpacing="1">RAPPORT D'AUDIT</text>
      <text x="12" y="74" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">EXERCICE</text>
      <text x="12" y="88" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">2025</text>
      <rect x="12" y="93" width="14" height="1.5" rx=".75" fill="rgba(255,255,255,.4)"/>
      <text x="12" y="105" fill="rgba(255,255,255,.45)" fontSize="3" fontFamily="Arial">ENTITÉ AUDITÉE</text>
      <text x="12" y="112" fill="white" fontSize="4" fontWeight="600" fontFamily="Arial">SOCIÉTÉ TARGET SARL</text>
      <text x="12" y="125" fill="rgba(255,255,255,.45)" fontSize="3" fontFamily="Arial">PÉRIODE</text>
      <text x="12" y="132" fill="white" fontSize="4" fontWeight="600" fontFamily="Arial">01/01 – 31/12/2025</text>
      <line x1="0" y1="150" x2="120" y2="150" stroke="rgba(255,255,255,.12)" strokeWidth=".6"/>
      <text x="12" y="159" fill="rgba(255,255,255,.45)" fontSize="3.5" fontFamily="Arial">CONFIDENTIEL · Usage strictement limité</text>
    </svg>
  )
}

function CoverContrat({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="167" width="120" height="3" fill={color}/>
      <text x="12" y="22" fill="#AAA" fontSize="4" fontWeight="700" fontFamily="Arial" letterSpacing=".8">ATLAS CORP · DROIT OHADA</text>
      <text x="12" y="49" fill="#0D1117" fontSize="12.5" fontWeight="900" fontFamily="Arial">CONTRAT</text>
      <text x="12" y="63" fill="#0D1117" fontSize="12.5" fontWeight="900" fontFamily="Arial">OHADA</text>
      <line x1="12" y1="69" x2="40" y2="69" stroke={color} strokeWidth="1.5"/>
      <line x1="12" y1="84" x2="12" y2="122" stroke="#E8E8E8" strokeWidth=".7"/>
      <text x="18" y="94" fill="#CCC" fontSize="3" fontWeight="700" fontFamily="Arial">NATURE</text>
      <text x="58" y="94" fill="#555" fontSize="3.5" fontFamily="Arial">Contrat de prestation</text>
      <text x="18" y="106" fill="#CCC" fontSize="3" fontWeight="700" fontFamily="Arial">RÉF.</text>
      <text x="58" y="106" fill="#555" fontSize="3.5" fontFamily="Arial">CT-2026-001</text>
      <text x="18" y="118" fill="#CCC" fontSize="3" fontWeight="700" fontFamily="Arial">PAYS</text>
      <text x="58" y="118" fill="#555" fontSize="3.5" fontFamily="Arial">Cameroun / OHADA</text>
      <rect x="12" y="132" width="44" height="16" rx="3" fill="#F5F5F5"/>
      <text x="34" y="142" textAnchor="middle" fill="#CCC" fontSize="3.5" fontFamily="Arial">PARTIE A</text>
      <rect x="64" y="132" width="44" height="16" rx="3" fill={color} opacity=".08" stroke={color} strokeWidth=".5" strokeOpacity=".3"/>
      <text x="86" y="142" textAnchor="middle" fill={color} fontSize="3.5" fontFamily="Arial">PARTIE B</text>
      <line x1="12" y1="156" x2="108" y2="156" stroke="#F0F0F0" strokeWidth=".6"/>
      <text x="12" y="163" fill="#CCC" fontSize="3.5" fontFamily="Arial">eetra.buyticle.com</text>
    </svg>
  )
}

// ── CATALOGUE ─────────────────────────────────────────────────────────────────

const CATALOGUE: TplDef[] = [
  { id:'bp',      name:'Business Plan',       desc:'Plan stratégique 5 ans · KPIs · Projections',      cat:'Business',     color:'#1B4FD8', blocs:14, tags:['PME','Startup','Financement'],         Cover: CoverBusiness  },
  { id:'ao',      name:"Appel d'Offre",        desc:'Réponse structurée à un marché public OHADA',       cat:'Business',     color:'#059669', blocs:10, tags:['Marchés Publics','Soumission'],        Cover: CoverBusiness  },
  { id:'audit-financier',  name:'Audit Financier',    desc:'Bilan · Résultat · Constatations SYSCOHADA', cat:'Audit',        color:'#7C3AED', blocs:16, tags:['SYSCOHADA','Commissaire'],            Cover: CoverAudit     },
  { id:'audit-conformite', name:'Audit de Conformité', desc:'Conformité légale OHADA · Contrôle',        cat:'Audit',        color:'#059669', blocs:12, tags:['OHADA','Réglementation'],             Cover: CoverAudit     },
  { id:'contrat',      name:'Contrat OHADA',    desc:'Contrat de prestation conforme OHADA',             cat:'Juridique',    color:'#DC2626', blocs:11, tags:['OHADA','Prestation','NDA'],            Cover: CoverContrat   },
  { id:'contrat-bail', name:'Contrat de Bail',  desc:'Bail commercial ou résidentiel · Droit camerounais',cat:'Juridique',   color:'#B45309', blocs:10, tags:['Bail','Location','Immobilier'],        Cover: CoverContrat   },
  { id:'facture',          name:'Facture Définitive', desc:'Facture officielle TVA 19.25% · FCFA',        cat:'Comptabilité', color:'#DC2626', blocs:8,  tags:['Facture','TVA 19.25%','FCFA'],         Cover: CoverFacture   },
  { id:'facture-proforma', name:'Facture Pro-forma',  desc:'Facture estimative avant réalisation',        cat:'Comptabilité', color:'#D97706', blocs:7,  tags:['Pro-forma','Export'],                 Cover: CoverFacture   },
  { id:'devis',            name:'Devis Professionnel', desc:'Devis FCFA · TVA 19.25% · Bon pour accord', cat:'Comptabilité', color:'#059669', blocs:7,  tags:['Devis','FCFA','Commerce'],             Cover: CoverFacture   },
  { id:'pv-conseil',    name:'PV Conseil d\'Admin.',  desc:'Délibérations CA · Résolutions · Quorum',    cat:'PV & Réunions',color:'#DC2626', blocs:9,  tags:['CA','Résolutions','Gouvernance'],      Cover: CoverPV        },
  { id:'pv-ag',         name:'PV Assemblée Générale', desc:'AGO/AGE · Vote · Actionnaires',               cat:'PV & Réunions',color:'#B45309', blocs:10, tags:['AGO','AGE','Vote'],                   Cover: CoverPV        },
  { id:'pv-reunion',    name:'PV Réunion Interne',    desc:'Réunion d\'équipe · Décisions · Actions',     cat:'PV & Réunions',color:'#059669', blocs:7,  tags:['Équipe','Décisions','Suivi'],          Cover: CoverPV        },
  { id:'compte-rendu',  name:'Compte Rendu Réunion',  desc:'CR structuré avec points et actions',         cat:'PV & Réunions',color:'#0E7490', blocs:8,  tags:['Réunion','Actions','CR'],              Cover: CoverCR        },
  { id:'compte-rendu-visite', name:'CR Visite Terrain', desc:'Inspection terrain · Observations · Suivi', cat:'PV & Réunions',color:'#059669', blocs:7,  tags:['Terrain','Inspection'],               Cover: CoverCR        },
  { id:'memo',     name:'Note de Direction',   desc:'Communication interne · Mémo exécutif DG',           cat:'Direction',    color:'#0E7490', blocs:6,  tags:['Interne','DG','Note'],                 Cover: CoverCR        },
  { id:'rapport-stage-licence', name:'Rapport de Stage Licence',  desc:'Stage Bac+3 · UY1, UDla, UBa · Soutenance', cat:'Académique', subcat:'Licence',  color:'#0E7490', blocs:13, tags:['Stage','Licence','Soutenance'],    Cover: CoverAcademique },
  { id:'rapport-stage-master',  name:'Rapport de Stage Master',   desc:'Stage recherche Bac+5 · Mémoire appliqué',   cat:'Académique', subcat:'Master',   color:'#4A1D96', blocs:16, tags:['Stage','Master','Mémoire'],       Cover: CoverAcademique },
  { id:'rapport-td',            name:'Rapport Activité TD',       desc:'Travaux dirigés · Structure académique',     cat:'Académique', subcat:'Licence',  color:'#1B4FD8', blocs:8,  tags:['TD','Rapport','Cours'],            Cover: CoverAcademique },
  { id:'memoire-master',        name:'Mémoire de Master',         desc:'Mémoire fin d\'études M1/M2 · IMRAD',        cat:'Académique', subcat:'Master',   color:'#7C3AED', blocs:20, tags:['Mémoire','Master','Soutenance'],   Cover: CoverAcademique },
  { id:'these-doctorat',        name:'Thèse de Doctorat',         desc:'Thèse PhD · Universités camerounaises',      cat:'Académique', subcat:'Doctorat', color:'#0F172A', blocs:24, tags:['Thèse','PhD','Doctorat'],          Cover: CoverAcademique },
  { id:'expose-licence', name:'Exposé Licence',  desc:'Exposé académique Bac+1-3 · Format TD',             cat:'Académique', subcat:'Licence', color:'#1B4FD8', blocs:8,  tags:['Exposé','TD','Cours'],              Cover: CoverExpose     },
  { id:'expose-master',  name:'Exposé Master',   desc:'Exposé avancé séminaire M1/M2',                     cat:'Académique', subcat:'Master',  color:'#4A1D96', blocs:10, tags:['Séminaire','Master','Exposé'],       Cover: CoverExpose     },
  { id:'article-recherche', name:'Article de Recherche', desc:'Article scientifique · Revues africaines · IMRAD', cat:'Publication', color:'#0F172A', blocs:12, tags:['Recherche','IMRAD','Revue','DOI'], Cover: CoverArticle   },
  { id:'note-politique',     name:'Note de Politique',    desc:'Policy brief · Note d\'expert · Décideurs',        cat:'Publication', color:'#1B4FD8', blocs:8,  tags:['Policy','Politique','Expert'],      Cover: CoverArticle   },
]

const NIVEAUX   = ['Tous niveaux', 'Licence', 'Master', 'Doctorat']
const FILIERES  = ['Toutes filières', 'Informatique', 'Droit', 'Sciences Éco', 'Lettres', 'Sciences', 'Médecine', 'Génie Civil']
const MAIN_CATS = ['Tous', 'Business', 'Audit', 'Juridique', 'Comptabilité', 'PV & Réunions', 'Direction', 'Académique', 'Publication', 'Mes templates']

const CSS = `
  .tpl-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:13px; font-family:var(--font-bricolage,sans-serif); }
  .tpl-top { position:sticky; top:0; z-index:10; height:52px; border-bottom:1px solid var(--border); background:var(--surface); display:flex; align-items:center; justify-content:space-between; padding:0 20px; }
  .tpl-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; }
  .tpl-back:hover { color:var(--text); }
  .tpl-sep { font-size:14px; color:var(--border2); }
  .tpl-body { max-width:1200px; margin:0 auto; padding:24px 20px 48px; }
  .tpl-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }
  .tpl-h1 { font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .tpl-sub { font-size:12px; color:var(--text4); margin:0; }
  .tpl-controls { display:flex; gap:10px; margin-bottom:14px; align-items:center; flex-wrap:wrap; }
  .tpl-search { display:flex; align-items:center; gap:7px; border:1px solid var(--border); border-radius:6px; padding:4px 10px; background:var(--surface); transition:border-color .15s; height:30px; flex:1; max-width:260px; }
  .tpl-search:focus-within { border-color:var(--accent); }
  .tpl-search input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:100%; }
  .tpl-search input::placeholder { color:var(--text4); }
  .tpl-filter-sel { height:30px; padding:0 8px; border-radius:6px; border:1px solid var(--border); background:var(--surface); font-size:11px; color:var(--text3); cursor:pointer; outline:none; }
  .tpl-filter-sel:focus { border-color:var(--accent); }
  .tpl-cats { display:flex; gap:0; border-bottom:1px solid var(--border); margin-bottom:20px; overflow-x:auto; }
  .tpl-cat { padding:7px 13px; font-size:12px; font-weight:500; color:var(--text4); border:none; background:transparent; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .12s,border-color .12s; white-space:nowrap; }
  .tpl-cat:hover { color:var(--text); }
  .tpl-cat.active { color:var(--accent); border-bottom-color:var(--accent); font-weight:600; }
  .tpl-section-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid var(--border); }
  .tpl-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(185px,1fr)); gap:14px; margin-bottom:28px; }
  .tpl-card { border:1px solid var(--border); border-radius:8px; background:var(--surface); overflow:hidden; cursor:pointer; transition:border-color .15s,transform .15s,box-shadow .15s; }
  .tpl-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.09); }
  .tpl-card-cover { height:136px; background:var(--bg2); display:flex; align-items:center; justify-content:center; padding:12px; position:relative; overflow:hidden; }
  .tpl-card-cover-inner { width:80px; aspect-ratio:.707; border-radius:5px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,.18); }
  .tpl-card-body { padding:10px 12px 12px; }
  .tpl-card-name { font-size:12px; font-weight:700; color:var(--text); margin-bottom:2px; line-height:1.3; }
  .tpl-card-desc { font-size:10px; color:var(--text4); line-height:1.4; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .tpl-card-footer { display:flex; align-items:center; justify-content:space-between; }
  .tpl-use-btn { height:24px; padding:0 10px; border-radius:4px; background:var(--accent); color:#fff; border:none; font-size:10px; font-weight:600; cursor:pointer; transition:opacity .12s; }
  .tpl-use-btn:hover { opacity:.88; }
  .bdg { display:inline-flex; align-items:center; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:600; }
  .bdg-cat    { background:var(--bg3); color:var(--text4); }
  .bdg-custom { background:var(--accentS); color:var(--accent); }
  .bdg-niveau { background:rgba(124,58,237,.1); color:#7C3AED; font-size:9px; }
  .tpl-table { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; margin-bottom:24px; }
  .tpl-th { display:grid; gap:10px; padding:7px 14px; background:var(--bg2); border-bottom:1px solid var(--border); }
  .tpl-th span { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); }
  .tpl-row { display:grid; gap:10px; padding:9px 14px; border-bottom:1px solid var(--border); align-items:center; transition:background .1s; }
  .tpl-row:last-child { border-bottom:none; }
  .tpl-row:hover { background:var(--bg2); }
  .tpl-icon-box { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .tpl-act-btn { width:24px; height:24px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; color:var(--text4); }
  .tpl-act-btn:hover { border-color:var(--border2); color:var(--text); }
  .tpl-act-btn.danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }
  .tpl-empty { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:48px 24px; text-align:center; }
  .tpl-overlay { position:fixed; inset:0; z-index:9000; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; padding:24px; }
  .tpl-modal { background:var(--surface); border-radius:8px; width:100%; max-width:520px; border:1px solid var(--border); display:flex; overflow:hidden; max-height:88vh; box-shadow:0 20px 60px rgba(0,0,0,.25); }
  .tpl-modal-left { width:190px; flex-shrink:0; background:var(--bg2); padding:18px; display:flex; flex-direction:column; align-items:center; gap:12px; }
  .tpl-modal-right { flex:1; padding:20px; overflow-y:auto; }
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; }
  .btn-primary:hover { opacity:.88; }
  .btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; background:transparent; color:var(--text2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .12s; }
  .btn-ghost:hover { border-color:var(--border2); background:var(--bg3); }
  .btn-sm { padding:4px 10px; font-size:11px; }
`

export default function TemplatesPage() {
  const router = useRouter()
  const { templates: custom, deleteTemplate, duplicateTemplate, incrementUsage } = useCustomTemplates()
  const { toast, showToast } = useToast()
  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('Tous')
  const [niveau,  setNiveau]  = useState('Tous niveaux')
  const [preview, setPreview] = useState<TplDef | null>(null)

  const useTpl = (id: string) => {
    try { localStorage.removeItem(STORAGE_DRAFT); sessionStorage.setItem('eetra-pending-template', id) } catch {}
    router.push('/editor')
  }
  const useCustom = (tpl: CustomTemplate) => {
    incrementUsage(tpl.id)
    try { localStorage.removeItem(STORAGE_DRAFT); sessionStorage.setItem('eetra-pending-custom-template', tpl.id) } catch {}
    router.push('/editor')
  }

  const q = search.toLowerCase()
  const filtered = CATALOGUE.filter(t => {
    const matchQ   = !search || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(g => g.toLowerCase().includes(q))
    const matchCat = cat === 'Tous' || cat === 'Mes templates' || t.cat === cat
    const matchNiv = niveau === 'Tous niveaux' || t.subcat === niveau
    return matchQ && matchCat && matchNiv && cat !== 'Mes templates'
  })

  const filterCustom = custom.filter(t => {
    const matchQ = !search || t.name.toLowerCase().includes(q)
    return matchQ && (cat === 'Tous' || cat === 'Mes templates' || t.category === cat)
  })

  const showBuiltin = cat !== 'Mes templates'
  const showCustom  = cat === 'Tous' || cat === 'Mes templates'
  const showAcadFilters = cat === 'Académique' || cat === 'Tous'
  const colsCustom = '1fr 120px 70px 80px 80px 110px'

  const groups: Record<string, TplDef[]> = {}
  filtered.forEach(t => { if (!groups[t.cat]) groups[t.cat] = []; groups[t.cat].push(t) })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="tpl-page">
        <header className="tpl-top">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button className="tpl-back" onClick={() => router.push('/dashboard')}><ArrowLeft size={13}/> Tableau de bord</button>
            <span className="tpl-sep">/</span>
            <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>Templates</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ThemeToggle/>
            <button className="btn-primary btn-sm" onClick={() => router.push('/templates/create')}><Plus size={12}/> Créer</button>
          </div>
        </header>

        <div className="tpl-body">
          <div className="tpl-header">
            <div>
              <h1 className="tpl-h1">Templates</h1>
              <p className="tpl-sub">{CATALOGUE.length} templates · {custom.length} personnalisés · Cameroun / OHADA</p>
            </div>
            <button className="btn-primary" onClick={() => router.push('/templates/create')}><Plus size={13}/> Nouveau template</button>
          </div>

          <div className="tpl-controls">
            <div className="tpl-search"><Search size={12} color="var(--text4)"/><input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}/></div>
            {showAcadFilters && (
              <>
                <select className="tpl-filter-sel" value={niveau} onChange={e => setNiveau(e.target.value)}>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select className="tpl-filter-sel" defaultValue="Toutes filières">
                  {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </>
            )}
          </div>

          <div className="tpl-cats">
            {MAIN_CATS.map(c => (
              <button key={c} className={`tpl-cat${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
                {c}
                {c === 'Mes templates' && custom.length > 0 && (
                  <span style={{ marginLeft:5, fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:3, background: cat === c ? 'var(--accentS)' : 'var(--bg3)', color: cat === c ? 'var(--accent)' : 'var(--text4)' }}>{custom.length}</span>
                )}
              </button>
            ))}
          </div>

          {showCustom && custom.length > 0 && (
            <div style={{ marginBottom:28 }}>
              <div className="tpl-section-label">Mes templates personnalisés</div>
              <div className="tpl-table">
                <div className="tpl-th" style={{ gridTemplateColumns:colsCustom }}>
                  <span>Nom</span><span>Catégorie</span><span>Blocs</span><span>Utilisations</span><span>Créé le</span><span></span>
                </div>
                {filterCustom.map(tpl => (
                  <div key={tpl.id} className="tpl-row" style={{ gridTemplateColumns:colsCustom }}>
                    <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
                      <div className="tpl-icon-box" style={{ background:'var(--accentS)' }}><LayoutGrid size={13} color="var(--accent)"/></div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tpl.name}</div>
                        <div style={{ fontSize:10, color:'var(--text4)' }}>{tpl.description}</div>
                      </div>
                    </div>
                    <span><span className="bdg bdg-custom">{tpl.category||'—'}</span></span>
                    <span style={{ fontSize:12, color:'var(--text4)' }}>{tpl.blocks.length}</span>
                    <span style={{ fontSize:12, color:'var(--text4)' }}>{tpl.usageCount||0}</span>
                    <span style={{ fontSize:12, color:'var(--text4)' }}>{tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}) : '—'}</span>
                    <div style={{ display:'flex', gap:5 }} onClick={e => e.stopPropagation()}>
                      <button className="tpl-use-btn" onClick={() => useCustom(tpl)}>Utiliser</button>
                      <button className="tpl-act-btn" onClick={() => router.push(`/templates/create?edit=${tpl.id}`)}><Edit3 size={10}/></button>
                      <button className="tpl-act-btn" onClick={() => { duplicateTemplate(tpl.id); showToast('Dupliqué','ok') }}><Copy size={10}/></button>
                      <button className="tpl-act-btn danger" onClick={() => { if(window.confirm('Supprimer ?')) deleteTemplate(tpl.id) }}><Trash2 size={10}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showCustom && custom.length === 0 && cat === 'Mes templates' && (
            <div className="tpl-empty">
              <LayoutGrid size={26} color="var(--text4)" style={{ margin:'0 auto 10px' }}/>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>Aucun template personnalisé</div>
              <p style={{ fontSize:12, color:'var(--text4)', margin:'0 0 14px' }}>Créez vos propres templates avec vos blocs préférés.</p>
              <button className="btn-primary btn-sm" onClick={() => router.push('/templates/create')}><Plus size={11}/> Créer</button>
            </div>
          )}

          {showBuiltin && (filtered.length === 0
            ? (
              <div className="tpl-empty">
                <FileText size={26} color="var(--text4)" style={{ margin:'0 auto 10px' }}/>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>Aucun résultat</div>
                <p style={{ fontSize:12, color:'var(--text4)', margin:0 }}>Modifiez la recherche ou changez de catégorie.</p>
              </div>
            )
            : Object.entries(groups).map(([groupCat, items]) => (
              <div key={groupCat} style={{ marginBottom:28 }}>
                <div className="tpl-section-label">{groupCat}</div>
                <div className="tpl-grid">
                  {items.map(tpl => (
                    <div key={tpl.id} className="tpl-card" onClick={() => setPreview(tpl)}>
                      <div className="tpl-card-cover">
                        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(0,0,0,.03) 1px,transparent 1px)', backgroundSize:'14px 14px' }}/>
                        <div className="tpl-card-cover-inner"><tpl.Cover color={tpl.color}/></div>
                        {tpl.subcat && <span className="bdg bdg-niveau" style={{ position:'absolute', top:8, right:8 }}>{tpl.subcat}</span>}
                      </div>
                      <div className="tpl-card-body">
                        <div className="tpl-card-name">{tpl.name}</div>
                        <div className="tpl-card-desc">{tpl.desc}</div>
                        <div className="tpl-card-footer">
                          <span style={{ fontSize:10, color:'var(--text4)' }}>{tpl.blocs} blocs</span>
                          <button className="tpl-use-btn" onClick={e => { e.stopPropagation(); useTpl(tpl.id) }}>Utiliser →</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {preview && (
        <div className="tpl-overlay" onClick={() => setPreview(null)}>
          <div className="tpl-modal" onClick={e => e.stopPropagation()}>
            <div className="tpl-modal-left">
              <div style={{ width:'100%', aspectRatio:'.707', borderRadius:7, overflow:'hidden', boxShadow:'0 8px 28px rgba(0,0,0,.2)' }}>
                <preview.Cover color={preview.color}/>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{preview.blocs} blocs</div>
                <div style={{ fontSize:10, color:'var(--text4)', marginTop:2 }}>prêts à personnaliser</div>
              </div>
              {preview.subcat && <span className="bdg bdg-niveau">{preview.subcat}</span>}
            </div>
            <div className="tpl-modal-right">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div>
                  <span className="bdg bdg-cat" style={{ marginBottom:8, display:'inline-block' }}>{preview.cat}</span>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', margin:'0 0 4px' }}>{preview.name}</div>
                  <div style={{ fontSize:12, color:'var(--text4)', margin:'0 0 14px' }}>{preview.desc}</div>
                </div>
                <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text4)', padding:0 }} onClick={() => setPreview(null)}><X size={14}/></button>
              </div>
              <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text4)', marginBottom:7 }}>Tags</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
                {preview.tags.map(t => <span key={t} className="bdg bdg-cat" style={{ fontSize:10 }}>{t}</span>)}
              </div>
              <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text4)', marginBottom:7 }}>Adapté pour</div>
              <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.6, marginBottom:18 }}>
                {preview.cat === 'Académique' ? `Universités camerounaises · Niveau ${preview.subcat||'Licence/Master'} · Conforme UY1, UDla, UBa`
                : preview.cat === 'PV & Réunions' ? 'Entreprises OHADA · SA, SARL · Gouvernance · Cameroun'
                : preview.cat === 'Comptabilité' ? 'PME camerounaises · TVA 19.25% · SYSCOHADA · FCFA'
                : preview.cat === 'Publication'  ? 'Chercheurs · Universités · Revues africaines · Think tanks'
                : 'PME, cabinets et entreprises en Afrique Centrale et de l\'Ouest'}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setPreview(null)}>Fermer</button>
                <button className="btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={() => { setPreview(null); useTpl(preview.id) }}>
                  <Check size={12}/> Utiliser ce template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast {...toast}/>
    </>
  )
}