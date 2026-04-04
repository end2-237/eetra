'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutGrid, Plus, Search, ArrowLeft, FileText,
  Trash2, Copy, Edit3, Check, X, Globe, Lock,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useCustomTemplates, type CustomTemplate } from '@/contexts/CustomTemplateContext'
import { usePlan } from '@/contexts/PlanContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Toast }       from '@/components/ui/Toast'
import { useToast }    from '@/hooks/useToast'
import { CoverMini } from '@/components/ui/CoverMini'

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
      <text x="60" y="21" textAnchor="middle" fill="rgba(255,255,255,.85)" fontSize="3.2" fontFamily="Arial">Faculté des Sciences · Dép. Informatique</text>
      <text x="60" y="28" textAnchor="middle" fill="rgba(255,255,255,.5)" fontSize="3" fontFamily="Arial">Année Académique 2025-2026</text>
      <text x="60" y="62" textAnchor="middle" fill={color} fontSize="4" fontWeight="700" fontFamily="Arial" letterSpacing=".5">RAPPORT DE STAGE</text>
      <text x="60" y="85" textAnchor="middle" fill="#111" fontSize="6" fontWeight="900" fontFamily="Arial">ANALYSE ET CONCEPTION</text>
      <text x="60" y="94" textAnchor="middle" fill="#111" fontSize="6" fontWeight="900" fontFamily="Arial">D'UN SYSTÈME WEB</text>
      <text x="60" y="108" textAnchor="middle" fill="#666" fontSize="3.5" fontFamily="Arial">Présenté par : Jean-Pierre MBALLA</text>
      <text x="60" y="122" textAnchor="middle" fill={color} fontSize="3.5" fontWeight="700" fontFamily="Arial">Licence 3 · Informatique de Gestion</text>
      <text x="60" y="166" textAnchor="middle" fill={color} fontSize="3" fontFamily="Arial" fontWeight="600">SOUTENANCE · JUIN 2026</text>
    </svg>
  )
}

function CoverPV({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="120" height="5" fill={color}/>
      <rect x="20" y="50" width="80" height="22" rx="4" fill={color}/>
      <text x="60" y="60" textAnchor="middle" fill="white" fontSize="7" fontWeight="900" fontFamily="Arial">PROCÈS-VERBAL</text>
      <text x="60" y="68" textAnchor="middle" fill="rgba(255,255,255,.75)" fontSize="4" fontFamily="Arial">DE RÉUNION DU CONSEIL</text>
      <text x="60" y="83" textAnchor="middle" fill="#999" fontSize="3.5" fontFamily="Arial">N° PV-2026-CA-04</text>
      <text x="14" y="100" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">DATE</text>
      <text x="55" y="100" fill="#333" fontSize="4" fontFamily="Arial">15 Mars 2026</text>
      <text x="14" y="112" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">LIEU</text>
      <text x="55" y="112" fill="#333" fontSize="4" fontFamily="Arial">Salle Conférence A — Douala</text>
      <line x1="8" y1="142" x2="112" y2="142" stroke="#E8E8E8" strokeWidth=".5"/>
    </svg>
  )
}

function CoverCR({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="4" height="170" fill={color}/>
      <text x="12" y="36" fill={color} fontSize="4" fontWeight="700" fontFamily="Arial" letterSpacing=".8">COMPTE RENDU</text>
      <text x="12" y="48" fill="#0D1117" fontSize="9.5" fontWeight="900" fontFamily="Arial">DE RÉUNION</text>
      <rect x="12" y="62" width="100" height="11" rx="2" fill="#F5F7FA"/>
      <text x="16" y="70" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">OBJET</text>
      <text x="44" y="70" fill="#333" fontSize="3.5" fontFamily="Arial">Revue stratégique Q1 2026</text>
      <rect x="12" y="75" width="100" height="11" rx="2" fill="#FAFAFA"/>
      <text x="16" y="83" fill="#AAA" fontSize="3" fontWeight="700" fontFamily="Arial">DATE</text>
      <text x="44" y="83" fill="#333" fontSize="3.5" fontFamily="Arial">15 Mars 2026 · 09h00</text>
    </svg>
  )
}

function CoverArticle({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="#0A0E1A"/>
      <rect x="0" y="0" width="120" height="38" fill={color}/>
      <text x="60" y="26" textAnchor="middle" fill="white" fontSize="5" fontWeight="900" fontFamily="Arial">ARTICLE DE RECHERCHE</text>
      <text x="12" y="52" fill="white" fontSize="6.5" fontWeight="900" fontFamily="Arial">DIGITALISATION DES PME</text>
      <text x="12" y="62" fill="white" fontSize="6.5" fontWeight="900" fontFamily="Arial">EN AFRIQUE CENTRALE</text>
      <text x="12" y="70" fill="rgba(255,255,255,.45)" fontSize="3.5" fontFamily="Arial" fontStyle="italic">Défis, opportunités et perspectives</text>
    </svg>
  )
}

function CoverExpose({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="0" width="120" height="3" fill={color}/>
      <text x="60" y="13" textAnchor="middle" fill={color} fontSize="4" fontWeight="800" fontFamily="Arial" letterSpacing=".5">UNIVERSITÉ DE DOUALA</text>
      <text x="60" y="43" textAnchor="middle" fill={color} fontSize="4.5" fontWeight="700" fontFamily="Arial" letterSpacing=".8">EXPOSÉ</text>
      <text x="60" y="63" textAnchor="middle" fill="#0D1117" fontSize="8" fontWeight="900" fontFamily="Arial">LES ENJEUX DE</text>
      <text x="60" y="74" textAnchor="middle" fill="#0D1117" fontSize="8" fontWeight="900" fontFamily="Arial">LA GESTION RH</text>
      <text x="60" y="84" textAnchor="middle" fill={color} fontSize="6.5" fontWeight="900" fontFamily="Arial">EN ENTREPRISE</text>
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
      <text x="12" y="55" fill="#111" fontSize="4.5" fontWeight="700" fontFamily="Arial">ENTREPRISE ABC SARL</text>
      <rect x="64" y="144" width="48" height="7" rx="3" fill={color}/>
      <text x="68" y="149.5" fill="white" fontSize="3" fontWeight="800" fontFamily="Arial">TOTAL TTC</text>
    </svg>
  )
}

function CoverAudit({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill={color}/>
      <circle cx="110" cy="22" r="50" fill="rgba(255,255,255,.06)"/>
      <text x="38" y="21" fill="rgba(255,255,255,.8)" fontSize="5" fontWeight="800" fontFamily="Arial">QUANTUM</text>
      <text x="38" y="29" fill="rgba(255,255,255,.45)" fontSize="3.5" fontFamily="Arial">AUDIT & CONSEIL</text>
      <text x="12" y="60" fill="rgba(255,255,255,.5)" fontSize="3.5" fontWeight="700" fontFamily="Arial" letterSpacing="1">RAPPORT D'AUDIT</text>
      <text x="12" y="74" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">EXERCICE</text>
      <text x="12" y="88" fill="white" fontSize="12" fontWeight="900" fontFamily="Arial">2025</text>
    </svg>
  )
}

function CoverContrat({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 170" xmlns="http://www.w3.org/2000/svg" style={{ width:'100%', height:'100%', display:'block' }}>
      <rect width="120" height="170" fill="white"/>
      <rect x="0" y="167" width="120" height="3" fill={color}/>
      <text x="12" y="49" fill="#0D1117" fontSize="12.5" fontWeight="900" fontFamily="Arial">CONTRAT</text>
      <text x="12" y="63" fill="#0D1117" fontSize="12.5" fontWeight="900" fontFamily="Arial">OHADA</text>
      <line x1="12" y1="69" x2="40" y2="69" stroke={color} strokeWidth="1.5"/>
      <rect x="12" y="132" width="44" height="16" rx="3" fill="#F5F5F5"/>
      <text x="34" y="142" textAnchor="middle" fill="#CCC" fontSize="3.5" fontFamily="Arial">PARTIE A</text>
      <rect x="64" y="132" width="44" height="16" rx="3" fill={color} opacity=".08" stroke={color} strokeWidth=".5" strokeOpacity=".3"/>
      <text x="86" y="142" textAnchor="middle" fill={color} fontSize="3.5" fontFamily="Arial">PARTIE B</text>
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
  { id:'pv-conseil',    name:"PV Conseil d'Admin.",  desc:'Délibérations CA · Résolutions · Quorum',    cat:'PV & Réunions',color:'#DC2626', blocs:9,  tags:['CA','Résolutions','Gouvernance'],      Cover: CoverPV        },
  { id:'pv-ag',         name:'PV Assemblée Générale', desc:'AGO/AGE · Vote · Actionnaires',               cat:'PV & Réunions',color:'#B45309', blocs:10, tags:['AGO','AGE','Vote'],                   Cover: CoverPV        },
  { id:'pv-reunion',    name:'PV Réunion Interne',    desc:"Réunion d'équipe · Décisions · Actions",     cat:'PV & Réunions',color:'#059669', blocs:7,  tags:['Équipe','Décisions','Suivi'],          Cover: CoverPV        },
  { id:'compte-rendu',  name:'Compte Rendu Réunion',  desc:'CR structuré avec points et actions',         cat:'PV & Réunions',color:'#0E7490', blocs:8,  tags:['Réunion','Actions','CR'],              Cover: CoverCR        },
  { id:'compte-rendu-visite', name:'CR Visite Terrain', desc:'Inspection terrain · Observations · Suivi', cat:'PV & Réunions',color:'#059669', blocs:7,  tags:['Terrain','Inspection'],               Cover: CoverCR        },
  { id:'memo',     name:'Note de Direction',   desc:'Communication interne · Mémo exécutif DG',           cat:'Direction',    color:'#0E7490', blocs:6,  tags:['Interne','DG','Note'],                 Cover: CoverCR        },
  { id:'rapport-stage-licence', name:'Rapport de Stage Licence',  desc:'Stage Bac+3 · UY1, UDla, UBa · Soutenance', cat:'Académique', subcat:'Licence',  color:'#0E7490', blocs:13, tags:['Stage','Licence','Soutenance'], Cover: CoverAcademique },
  { id:'rapport-stage-master',  name:'Rapport de Stage Master',   desc:'Stage recherche Bac+5 · Mémoire appliqué',   cat:'Académique', subcat:'Master',   color:'#4A1D96', blocs:16, tags:['Stage','Master','Mémoire'],    Cover: CoverAcademique },
  { id:'rapport-td',            name:'Rapport Activité TD',       desc:'Travaux dirigés · Structure académique',     cat:'Académique', subcat:'Licence',  color:'#1B4FD8', blocs:8,  tags:['TD','Rapport','Cours'],         Cover: CoverAcademique },
  { id:'memoire-master',        name:'Mémoire de Master',         desc:"Mémoire fin d'études M1/M2 · IMRAD",         cat:'Académique', subcat:'Master',   color:'#7C3AED', blocs:20, tags:['Mémoire','Master','Soutenance'],Cover: CoverAcademique },
  { id:'these-doctorat',        name:'Thèse de Doctorat',         desc:'Thèse PhD · Universités camerounaises',      cat:'Académique', subcat:'Doctorat', color:'#0F172A', blocs:24, tags:['Thèse','PhD','Doctorat'],       Cover: CoverAcademique },
  { id:'expose-licence', name:'Exposé Licence',  desc:'Exposé académique Bac+1-3 · Format TD',             cat:'Académique', subcat:'Licence', color:'#1B4FD8', blocs:8,  tags:['Exposé','TD','Cours'],         Cover: CoverExpose     },
  { id:'expose-master',  name:'Exposé Master',   desc:'Exposé avancé séminaire M1/M2',                     cat:'Académique', subcat:'Master',  color:'#4A1D96', blocs:10, tags:['Séminaire','Master','Exposé'], Cover: CoverExpose     },
  { id:'article-recherche', name:'Article de Recherche', desc:'Article scientifique · Revues africaines · IMRAD', cat:'Publication', color:'#0F172A', blocs:12, tags:['Recherche','IMRAD','Revue','DOI'], Cover: CoverArticle },
  { id:'note-politique',     name:'Note de Politique',    desc:"Policy brief · Note d'expert · Décideurs",        cat:'Publication', color:'#1B4FD8', blocs:8,  tags:['Policy','Politique','Expert'],      Cover: CoverArticle },
]

const NIVEAUX   = ['Tous niveaux', 'Licence', 'Master', 'Doctorat']
const FILIERES  = ['Toutes filières', 'Informatique', 'Droit', 'Sciences Éco', 'Lettres', 'Sciences', 'Médecine', 'Génie Civil']
const MAIN_CATS = ['Tous', 'Business', 'Audit', 'Juridique', 'Comptabilité', 'PV & Réunions', 'Direction', 'Académique', 'Publication', 'Communauté', 'Mes templates']

const CSS = `
  /* ── Base ────────────────────────────────────────────────────────────────── */
  .tpl-page { min-height:100vh; background:var(--bg); color:var(--text); font-size:16px; font-family:var(--font-bricolage,sans-serif); }

.tpl-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.tpl-card {
  border:1px solid var(--border);
  border-radius:8px;
  background:var(--surface);
  overflow:hidden;
  cursor:pointer;
  transition:border-color .15s,transform .15s,box-shadow .15s;
  min-height: 200px; /* Augmenter la hauteur des cartes */
}

.tpl-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.09); }

  /* ── Topbar ──────────────────────────────────────────────────────────────── */
  .tpl-top {
    position:sticky; top:0; z-index:10;
    height:52px; border-bottom:1px solid var(--border); background:var(--surface);
    display:flex; align-items:center; justify-content:space-between;
    padding:0 20px; gap:10px;
  }
  .tpl-top-left { display:flex; align-items:center; gap:8px; min-width:0; flex:1; overflow:hidden; }
  .tpl-top-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .tpl-back { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text4); background:none; border:none; cursor:pointer; padding:0; white-space:nowrap; }
  .tpl-back:hover { color:var(--text); }
  .tpl-breadcrumb-sep { color:var(--border2); font-size:14px; }
  .tpl-breadcrumb-title { font-size:14px; font-weight:700; color:var(--text); white-space:nowrap; }

  /* ── Body & layout ───────────────────────────────────────────────────────── */
  .tpl-body { max-width:1200px; margin:0 auto; padding:24px 20px 48px; }
  .tpl-header { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:20px; }
  .tpl-h1 { font-size:18px; font-weight:700; letter-spacing:-.02em; color:var(--text); margin:0 0 3px; }
  .tpl-sub { font-size:12px; color:var(--text4); margin:0; }

  /* ── Controls (search + filters) ────────────────────────────────────────── */
  .tpl-controls { display:flex; gap:8px; margin-bottom:14px; align-items:center; flex-wrap:wrap; }
  .tpl-search {
    display:flex; align-items:center; gap:7px;
    border:1px solid var(--border); border-radius:6px;
    padding:4px 10px; background:var(--surface);
    transition:border-color .15s; height:30px;
    flex:1; min-width:160px; max-width:280px;
  }
  .tpl-search:focus-within { border-color:var(--accent); }
  .tpl-search input { border:none; outline:none; background:transparent; font-size:12px; color:var(--text); width:100%; min-width:0; }
  .tpl-search input::placeholder { color:var(--text4); }
  .tpl-filter-sel {
    height:30px; padding:0 8px; border-radius:6px;
    border:1px solid var(--border); background:var(--surface);
    font-size:11px; color:var(--text3); cursor:pointer; outline:none;
    flex-shrink:0;
  }

  /* ── Category tabs ───────────────────────────────────────────────────────── */
  .tpl-cats { display:flex; gap:0; border-bottom:1px solid var(--border); margin-bottom:20px; overflow-x:auto; scrollbar-width:none; }
  .tpl-cats::-webkit-scrollbar { display:none; }
  .tpl-cat { padding:7px 13px; font-size:12px; font-weight:500; color:var(--text4); border:none; background:transparent; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-1px; transition:color .12s,border-color .12s; white-space:nowrap; flex-shrink:0; }
  .tpl-cat:hover { color:var(--text); }
  .tpl-cat.active { color:var(--accent); border-bottom-color:var(--accent); font-weight:600; }

  /* ── Section label ───────────────────────────────────────────────────────── */
  .tpl-section-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text4); margin-bottom:12px; padding-bottom:6px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:8px; }

  /* ── Template grid (built-in & community) ────────────────────────────────── */
  .tpl-grid  { display:grid; grid-template-columns:repeat(auto-fill,minmax(185px,2fr)); gap:14px; margin-bottom:28px; }
  .comm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(185px,2fr)); gap:14px; margin-bottom:28px; }

  /* ── Template card ───────────────────────────────────────────────────────── */
  .tpl-card { border:1px solid var(--border); border-radius:8px; background:var(--surface); overflow:hidden; cursor:pointer; transition:border-color .15s,transform .15s,box-shadow .15s; }
  .tpl-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.09); }
  .comm-card { border:1px solid var(--border); border-radius:8px; background:var(--surface); overflow:hidden; cursor:pointer; transition:border-color .15s,transform .15s,box-shadow .15s; }
  .comm-card:hover { border-color:var(--border2); transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.09); }
  .tpl-card-cover { height:136px; background:var(--bg2); display:flex; align-items:center; justify-content:center; padding:12px; position:relative; overflow:hidden; }
  .tpl-card-cover-inner { width:80px; aspect-ratio:.707; border-radius:5px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,.18); }
  .tpl-card-body { padding:10px 12px 12px; }
  .tpl-card-name { font-size:12px; font-weight:700; color:var(--text); margin-bottom:2px; line-height:1.3; }
  .tpl-card-desc { font-size:10px; color:var(--text4); line-height:1.4; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .tpl-card-footer { display:flex; align-items:center; justify-content:space-between; }
  .tpl-use-btn { height:24px; padding:0 10px; border-radius:4px; background:var(--accent); color:#fff; border:none; font-size:10px; font-weight:600; cursor:pointer; transition:opacity .12s; display:inline-flex; align-items:center; gap:4px; }
  .tpl-use-btn:hover { opacity:.88; }
  .tpl-use-btn:disabled { opacity:.5; cursor:not-allowed; }

  /* ── Badges ──────────────────────────────────────────────────────────────── */
  .bdg { display:inline-flex; align-items:center; padding:2px 7px; border-radius:4px; font-size:10px; font-weight:600; }
  .bdg-cat    { background:var(--bg3); color:var(--text4); }
  .bdg-custom { background:var(--accentS); color:var(--accent); }
  .bdg-niveau { background:rgba(124,58,237,.1); color:#7C3AED; font-size:9px; }
  .bdg-pub    { background:rgba(5,150,105,.1); color:#059669; font-size:9px; }

  /* ── Custom templates table ──────────────────────────────────────────────── */
  .tpl-table { border:1px solid var(--border); border-radius:7px; background:var(--surface); overflow:hidden; margin-bottom:24px; }
  .tpl-th { display:grid; gap:10px; padding:7px 14px; background:var(--bg2); border-bottom:1px solid var(--border); }
  .tpl-th span { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--text4); }
  .tpl-row { display:grid; gap:10px; padding:9px 14px; border-bottom:1px solid var(--border); align-items:center; transition:background .1s; }
  .tpl-row:last-child { border-bottom:none; }
  .tpl-row:hover { background:var(--bg2); }
  .tpl-icon-box { width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

  /* ── Action buttons ──────────────────────────────────────────────────────── */
  .tpl-act-btn { width:24px; height:24px; border-radius:5px; border:1px solid var(--border); background:var(--bg2); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .12s; color:var(--text4); flex-shrink:0; }
  .tpl-act-btn:hover { border-color:var(--border2); color:var(--text); }
  .tpl-act-btn.danger:hover { background:#FEE2E2; border-color:#FCA5A5; color:#DC2626; }
  .tpl-act-btn.publish { border-color:rgba(5,150,105,.3); color:#059669; background:rgba(5,150,105,.06); }
  .tpl-act-btn.publish:hover { background:rgba(5,150,105,.12); }
  .tpl-act-btn.unpublish { border-color:rgba(107,114,128,.2); color:var(--text4); }
  .tpl-act-btn:disabled { opacity:.4; cursor:not-allowed; pointer-events:none; }

  /* ── Empty state ─────────────────────────────────────────────────────────── */
  .tpl-empty { border:1px solid var(--border); border-radius:7px; background:var(--surface); padding:48px 24px; text-align:center; }

  /* ── Preview modal ───────────────────────────────────────────────────────── */
  .tpl-overlay { position:fixed; inset:0; z-index:9000; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; padding:24px; }
  .tpl-modal { background:var(--surface); border-radius:8px; width:100%; max-width:520px; border:1px solid var(--border); display:flex; overflow:hidden; max-height:88vh; box-shadow:0 20px 60px rgba(0,0,0,.25); }
  .tpl-modal-left { width:190px; flex-shrink:0; background:var(--bg2); padding:18px; display:flex; flex-direction:column; align-items:center; gap:12px; }
  .tpl-modal-right { flex:1; padding:20px; overflow-y:auto; min-width:0; }

  /* ── Buttons ─────────────────────────────────────────────────────────────── */
  .btn-primary { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; border-radius:6px; background:var(--accent); color:#fff; border:none; font-size:12px; font-weight:600; cursor:pointer; transition:opacity .15s; white-space:nowrap; }
  .btn-primary:hover { opacity:.88; }
  .btn-ghost { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:6px; background:transparent; color:var(--text2); border:1px solid var(--border); font-size:12px; font-weight:500; cursor:pointer; transition:all .12s; white-space:nowrap; }
  .btn-ghost:hover { border-color:var(--border2); background:var(--bg3); }
  .btn-sm { padding:4px 10px; font-size:11px; }
  @keyframes spin { to { transform:rotate(360deg) } }
  .spin { animation:spin .7s linear infinite; }

  /* ════════════════════════════════════════════════════════════════════════════
     RESPONSIVE
  ════════════════════════════════════════════════════════════════════════════ */

  /* ── Tablet 768-1023px ───────────────────────────────────────────────────── */
  @media(max-width:1023px){
    .tpl-grid  { grid-template-columns:repeat(auto-fill,minmax(165px,2fr)); gap:12px; }
    .comm-grid { grid-template-columns:repeat(auto-fill,minmax(165px,2fr)); gap:12px; }
  }

  /* ── Mobile ≤767px ───────────────────────────────────────────────────────── */
  @media(max-width:767px){
    /* Topbar */
    .tpl-top { padding:0 12px; gap:8px; height:50px; }
    .tpl-back span { display:none; }  /* hide "Tableau de bord" text, keep arrow */
    .tpl-breadcrumb-sep { display:none; }

    /* Body */
    .tpl-body { padding:14px 12px 48px; }

    /* Header : stack title + hide desktop "New template" btn (there's one in topbar) */
    .tpl-header { flex-direction:column; gap:10px; align-items:flex-start; margin-bottom:14px; }
    .tpl-header-btn-desktop { display:none; }
    .tpl-h1 { font-size:16px; }

    /* Controls */
    .tpl-controls { gap:6px; margin-bottom:10px; }
    .tpl-search { max-width:none; flex:1; min-width:0; }
    .tpl-filter-sel { flex:1; min-width:0; font-size:11px; }

    /* Category tabs */
    .tpl-cat { padding:6px 10px; font-size:11px; }

    /* Grids */
    .tpl-grid  { grid-template-columns:repeat(auto-fill,minmax(140px,2fr)); gap:10px; }
    .comm-grid { grid-template-columns:repeat(auto-fill,minmax(140px,2fr)); gap:10px; }
    .tpl-card-cover { height:110px; padding:8px; }
    .tpl-card-cover-inner { width:64px; }
    .tpl-card-body { padding:8px 10px 10px; }

    /* Custom templates table → card list on mobile */
    .tpl-th { display:none !important; }
    .tpl-row {
      grid-template-columns: 1fr auto !important;
      gap: 10px !important;
      padding: 10px 12px !important;
      align-items: center !important;
    }
    /* Hide metadata columns (category, blocs, usages, date) */
    .tpl-row > span { display:none !important; }
    /* Show only name block + actions */
    .tpl-row > div:first-child { min-width:0; }
    .tpl-row > div:last-child { gap:6px !important; }

    /* Modal → full screen */
    .tpl-overlay { padding:0; align-items:flex-end; }
    .tpl-modal {
      flex-direction:column;
      max-width:100% !important;
      border-radius:14px 14px 0 0;
      max-height:90dvh;
      height:auto;
      width:100%;
    }
    .tpl-modal-left {
      width:100% !important;
      flex-direction:row;
      padding:14px 16px;
      gap:14px;
      align-items:center;
      flex-shrink:0;
      border-bottom:1px solid var(--border);
    }
    .tpl-modal-left > div:first-child {
      width:56px !important;
      height:80px !important;
      aspect-ratio:unset !important;
      flex-shrink:0;
    }
    .tpl-modal-left > div:nth-child(2) { text-align:left; }
    .tpl-modal-right { flex:1; padding:16px; overflow-y:auto; }
  }

  /* ── XS phones ≤479px ────────────────────────────────────────────────────── */
  @media(max-width:479px){
    .tpl-grid  { grid-template-columns:2fr 2fr; gap:8px; }
    .comm-grid { grid-template-columns:2fr 2fr; gap:8px; }
    .tpl-card-cover { height:96px; padding:6px; }
    .tpl-card-cover-inner { width:54px; }
    .tpl-card-name { font-size:11px; }
    .tpl-card-desc { font-size:9px; -webkit-line-clamp:1; }

    /* Filters: keep only search on very small screens */
    .tpl-filter-sel { display:none; }
    .tpl-search { max-width:none; }

    /* Cat tabs even smaller */
    .tpl-cat { padding:5px 8px; font-size:10px; }

    /* Modal */
    .tpl-modal { border-radius:0; max-height:100dvh; height:100dvh; }
  }
`

export default function TemplatesPage() {
  const router = useRouter()
  const {
    templates: custom,
    communityTemplates,
    loading,
    communityLoading,
    deleteTemplate,
    duplicateTemplate,
    incrementUsage,
    publishTemplate,
    unpublishTemplate,
    refreshCommunity,
  } = useCustomTemplates()
  const { toast, showToast } = useToast()
  const { canCreateDocument, checkDocumentLimit, plan, getRemainingDocs } = usePlan()
  const limitReached = !canCreateDocument()

  const [search,  setSearch]  = useState('')
  const [cat,     setCat]     = useState('Tous')
  const [niveau,  setNiveau]  = useState('Tous niveaux')
  const [preview, setPreview] = useState<TplDef | null>(null)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const setBusy = (id: string, val: boolean) => setBusyIds(prev => {
    const next = new Set(prev); val ? next.add(id) : next.delete(id); return next
  })

  const useTpl = async (id: string) => {
    const allowed = await checkDocumentLimit()
    if (!allowed) return
    try { localStorage.removeItem(STORAGE_DRAFT); sessionStorage.setItem('eetra-pending-template', id) } catch {}
    router.push('/editor')
  }

  const useCustom = async (tpl: CustomTemplate) => {
    const allowed = await checkDocumentLimit()
    if (!allowed) return
    incrementUsage(tpl.id)
    try { localStorage.removeItem(STORAGE_DRAFT); sessionStorage.setItem('eetra-pending-custom-template', tpl.id) } catch {}
    router.push('/editor')
  }

  const handlePublishToggle = async (tpl: CustomTemplate) => {
    setBusy(tpl.id, true)
    try {
      if (tpl.isPublic) {
        await unpublishTemplate(tpl.id)
        showToast('Template retiré de la communauté', 'ok')
      } else {
        await publishTemplate(tpl.id)
        showToast('Template publié dans la communauté', 'ok')
      }
    } catch {
      showToast('Erreur lors de la publication', 'err')
    } finally {
      setBusy(tpl.id, false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce template définitivement ?')) return
    setBusy(id, true)
    try {
      await deleteTemplate(id)
      showToast('Template supprimé', 'ok')
    } catch {
      showToast('Erreur lors de la suppression', 'err')
    } finally {
      setBusy(id, false)
    }
  }

  const handleDuplicate = async (id: string) => {
    setBusy(id + '_dup', true)
    try {
      await duplicateTemplate(id)
      showToast('Template dupliqué', 'ok')
    } catch {
      showToast('Erreur lors de la duplication', 'err')
    } finally {
      setBusy(id + '_dup', false)
    }
  }

  const q = search.toLowerCase()
  const filtered = CATALOGUE.filter(t => {
    const matchQ   = !search || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.tags.some(g => g.toLowerCase().includes(q))
    const matchCat = cat === 'Tous' || cat === 'Mes templates' || cat === 'Communauté' || t.cat === cat
    const matchNiv = niveau === 'Tous niveaux' || t.subcat === niveau
    return matchQ && matchCat && matchNiv && cat !== 'Mes templates' && cat !== 'Communauté'
  })

  const filterCustom = custom.filter(t => {
    const matchQ = !search || t.name.toLowerCase().includes(q)
    return matchQ && (cat === 'Tous' || cat === 'Mes templates' || t.category === cat)
  })

  const filterCommunity = communityTemplates.filter(t => {
    const matchQ = !search || t.name.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.tags?.some(g => g.toLowerCase().includes(q))
    return matchQ
  })

  const showBuiltin   = cat !== 'Mes templates' && cat !== 'Communauté'
  const showCustom    = cat === 'Tous' || cat === 'Mes templates'
  const showCommunity = cat === 'Communauté'
  const showAcadFilters = cat === 'Académique' || cat === 'Tous'
  const colsCustom = '1fr 120px 70px 80px 80px 130px'

  const groups: Record<string, TplDef[]> = {}
  filtered.forEach(t => { if (!groups[t.cat]) groups[t.cat] = []; groups[t.cat].push(t) })

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }}/>
      <div className="tpl-page">

        {/* ── Topbar ──────────────────────────────────────────────────────── */}
        <header className="tpl-top">
          <div className="tpl-top-left">
            <button className="tpl-back" onClick={() => router.push('/dashboard')}>
              <ArrowLeft size={13}/>
              <span>Tableau de bord</span>
            </button>
            <span className="tpl-breadcrumb-sep">/</span>
            <span className="tpl-breadcrumb-title">Templates</span>
          </div>
          <div className="tpl-top-right">
            <ThemeToggle/>
            <button className="btn-primary btn-sm" onClick={() => router.push('/templates/create')}>
              <Plus size={12}/> Créer
            </button>
          </div>
        </header>

        <div className="tpl-body">

          {/* ── Limit banner ────────────────────────────────────────────── */}
          {limitReached && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.2)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Lock size={14} color="#DC2626" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Limite de documents atteinte</div>
                <div style={{ fontSize: 11, color: 'var(--text4)' }}>
                  Vous avez utilisé vos {plan.maxDocsPerMonth === Infinity ? '∞' : plan.maxDocsPerMonth} documents/mois. Les templates sont temporairement indisponibles.
                </div>
              </div>
              <button
                onClick={() => router.push('/settings#plan')}
                style={{ padding: '5px 12px', borderRadius: 7, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                Upgrader
              </button>
            </div>
          )}

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="tpl-header">
            <div>
              <h1 className="tpl-h1">Templates</h1>
              <p className="tpl-sub">
                {CATALOGUE.length} templates · {custom.length} personnalisés · {communityTemplates.length} communauté
                {plan.maxDocsPerMonth !== Infinity && (
                  <span style={{ marginLeft: 10, color: limitReached ? '#DC2626' : 'var(--text4)' }}>
                    · {getRemainingDocs()}/{plan.maxDocsPerMonth} restants
                  </span>
                )}
              </p>
            </div>
            {/* Desktop only — hidden on mobile via CSS */}
            <button className="btn-primary tpl-header-btn-desktop" onClick={() => router.push('/templates/create')}>
              <Plus size={13}/> Nouveau template
            </button>
          </div>

          {/* ── Search + filters ────────────────────────────────────────── */}
          <div className="tpl-controls">
            <div className="tpl-search">
              <Search size={12} color="var(--text4)" style={{ flexShrink: 0 }}/>
              <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)}/>
            </div>
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

          {/* ── Category tabs ───────────────────────────────────────────── */}
          <div className="tpl-cats">
            {MAIN_CATS.map(c => (
              <button key={c} className={`tpl-cat${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>
                {c}
                {c === 'Mes templates' && custom.length > 0 && (
                  <span style={{ marginLeft:5, fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:3, background: cat === c ? 'var(--accentS)' : 'var(--bg3)', color: cat === c ? 'var(--accent)' : 'var(--text4)' }}>
                    {loading ? '…' : custom.length}
                  </span>
                )}
                {c === 'Communauté' && communityTemplates.length > 0 && (
                  <span style={{ marginLeft:5, fontSize:10, fontWeight:700, padding:'1px 5px', borderRadius:3, background: cat === c ? 'rgba(5,150,105,.15)' : 'var(--bg3)', color: cat === c ? '#059669' : 'var(--text4)' }}>
                    {communityLoading ? '…' : communityTemplates.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Communauté ──────────────────────────────────────────────── */}
          {showCommunity && (
            <div style={{ marginBottom:28 }}>
              {communityLoading ? (
                <div style={{ textAlign:'center', padding:'48px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <LoadingSpinner size={22} className="text-[var(--text4)]" />
                  <span style={{ fontSize:12, color:'var(--text4)' }}>Chargement des templates communautaires…</span>
                </div>
              ) : filterCommunity.length === 0 ? (
                <div className="tpl-empty">
                  <Globe size={26} color="var(--text4)" style={{ margin:'0 auto 10px' }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>Galerie communautaire</div>
                  <p style={{ fontSize:12, color:'var(--text4)', margin:'0 0 14px' }}>
                    Publiez vos propres templates depuis "Mes templates" pour les partager.
                  </p>
                  <button className="btn-primary btn-sm" onClick={() => setCat('Mes templates')}>Voir mes templates</button>
                </div>
              ) : (
                <>
                  <div className="tpl-section-label">
                    <Globe size={12}/>
                    Communauté · {filterCommunity.length} template{filterCommunity.length > 1 ? 's' : ''}
                    <button onClick={refreshCommunity} style={{ marginLeft:'auto', fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:5, border:'1px solid var(--border)', background:'var(--bg2)', color:'var(--text4)', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}>
                      {communityLoading ? <LoadingSpinner size={10} className="text-current" /> : '↻'} Actualiser
                    </button>
                  </div>
                  <div className="comm-grid">
                    {filterCommunity.map(tpl => (
                      <div key={tpl.id} className="comm-card" style={{ opacity: limitReached ? .5 : 1, cursor: limitReached ? 'not-allowed' : 'pointer' }} onClick={() => !limitReached && useCustom(tpl)}>
                        <div className="tpl-card-cover">
                          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle,rgba(0,0,0,.03) 1px,transparent 1px)', backgroundSize:'14px 14px' }}/>
                          <div className="tpl-card-cover-inner"><CoverMini coverStyle={tpl.coverStyle} name={tpl.name} /></div>
                          {tpl.usageCount > 0 && (
                            <span style={{ position:'absolute', top:8, right:8, fontSize:9, fontWeight:700, padding:'2px 6px', borderRadius:4, background:'rgba(0,0,0,.45)', color:'#fff' }}>
                              ×{tpl.usageCount}
                            </span>
                          )}
                        </div>
                        <div className="tpl-card-body">
                          <div className="tpl-card-name">{tpl.name}</div>
                          <div className="tpl-card-desc">{tpl.description || tpl.category}</div>
                          <div className="tpl-card-footer">
                            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                              <span style={{ fontSize:9, color:'var(--text4)', fontWeight:500 }}>{tpl.author || 'Communauté'}</span>
                              <span style={{ fontSize:9, color:'var(--text4)' }}>{tpl.blocks.length} blocs{tpl.likes ? ` · ${tpl.likes} ♥` : ''}</span>
                            </div>
                            <button className="tpl-use-btn" disabled={limitReached} onClick={e => { e.stopPropagation(); useCustom(tpl) }}>
                              {limitReached ? <Lock size={10}/> : 'Utiliser →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Mes templates ───────────────────────────────────────────── */}
          {showCustom && (
            <div style={{ marginBottom:28 }}>
              {loading ? (
                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'24px 0' }}>
                  <LoadingSpinner size={16} className="text-[var(--text4)]" />
                  <span style={{ fontSize:12, color:'var(--text4)' }}>Chargement de vos templates…</span>
                </div>
              ) : custom.length === 0 && cat === 'Mes templates' ? (
                <div className="tpl-empty">
                  <LayoutGrid size={26} color="var(--text4)" style={{ margin:'0 auto 10px' }}/>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text2)', marginBottom:4 }}>Aucun template personnalisé</div>
                  <p style={{ fontSize:12, color:'var(--text4)', margin:'0 0 14px' }}>Créez vos propres templates avec vos blocs préférés.</p>
                  <button className="btn-primary btn-sm" onClick={() => router.push('/templates/create')}>
                    <Plus size={11}/> Créer
                  </button>
                </div>
              ) : filterCustom.length > 0 ? (
                <>
                  <div className="tpl-section-label">
                    <LayoutGrid size={12}/>
                    Mes templates personnalisés
                    {loading && <LoadingSpinner size={11} className="text-[var(--text4)]" />}
                  </div>
                  <div className="tpl-table">
                    {/* Desktop header */}
                    <div className="tpl-th" style={{ gridTemplateColumns: colsCustom }}>
                      <span>Nom</span>
                      <span>Catégorie</span>
                      <span>Blocs</span>
                      <span>Utilisations</span>
                      <span>Créé le</span>
                      <span></span>
                    </div>

                    {filterCustom.map(tpl => (
                      <div key={tpl.id} className="tpl-row" style={{ gridTemplateColumns: colsCustom }}>

                        {/* Col 1 : name */}
                        <div style={{ display:'flex', alignItems:'center', gap:9, minWidth:0 }}>
                          <div className="tpl-icon-box" style={{ background:'var(--accentS)' }}>
                            <LayoutGrid size={13} color="var(--accent)"/>
                          </div>
                          <div style={{ minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:1, flexWrap:'wrap' }}>
                              <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {tpl.name}
                              </div>
                              {tpl.isPublic && <span className="bdg bdg-pub">publié</span>}
                            </div>
                            <div style={{ fontSize:10, color:'var(--text4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tpl.description}</div>
                          </div>
                        </div>

                        {/* Col 2 : category (hidden on mobile via CSS) */}
                        <span><span className="bdg bdg-custom">{tpl.category || '—'}</span></span>

                        {/* Col 3 : blocs (hidden on mobile) */}
                        <span style={{ fontSize:12, color:'var(--text4)' }}>{tpl.blocks.length}</span>

                        {/* Col 4 : usage (hidden on mobile) */}
                        <span style={{ fontSize:12, color:'var(--text4)' }}>{tpl.usageCount || 0}</span>

                        {/* Col 5 : date (hidden on mobile) */}
                        <span style={{ fontSize:12, color:'var(--text4)' }}>
                          {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' }) : '—'}
                        </span>

                        {/* Col 6 : actions */}
                        <div style={{ display:'flex', gap:4, flexWrap:'nowrap', justifyContent:'flex-end' }} onClick={e => e.stopPropagation()}>
                          <button className="tpl-use-btn" disabled={limitReached} onClick={() => useCustom(tpl)}>
                            {limitReached ? <Lock size={10}/> : 'Utiliser'}
                          </button>
                          <button
                            className={`tpl-act-btn ${tpl.isPublic ? 'unpublish' : 'publish'}`}
                            title={tpl.isPublic ? 'Retirer de la communauté' : 'Publier dans la communauté'}
                            disabled={busyIds.has(tpl.id)}
                            onClick={() => handlePublishToggle(tpl)}
                          >
                            {busyIds.has(tpl.id)
                              ? <LoadingSpinner size={10} className="text-current" />
                              : tpl.isPublic ? <Lock size={10}/> : <Globe size={10}/>
                            }
                          </button>
                          <button className="tpl-act-btn" onClick={() => router.push(`/templates/create?edit=${tpl.id}`)}>
                            <Edit3 size={10}/>
                          </button>
                          <button className="tpl-act-btn" disabled={busyIds.has(tpl.id + '_dup')} onClick={() => handleDuplicate(tpl.id)}>
                            {busyIds.has(tpl.id + '_dup') ? <LoadingSpinner size={10} className="text-current" /> : <Copy size={10}/>}
                          </button>
                          <button className="tpl-act-btn danger" disabled={busyIds.has(tpl.id)} onClick={() => handleDelete(tpl.id)}>
                            {busyIds.has(tpl.id) ? <LoadingSpinner size={10} className="text-current" /> : <Trash2 size={10}/>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* ── Built-in templates ──────────────────────────────────────── */}
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
                    <div key={tpl.id} className="tpl-card" style={{ opacity: limitReached ? .5 : 1 }} onClick={() => setPreview(tpl)}>
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
                          <button className="tpl-use-btn" disabled={limitReached} onClick={e => { e.stopPropagation(); useTpl(tpl.id) }}>
                            {limitReached ? <Lock size={10}/> : 'Utiliser →'}
                          </button>
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

      {/* ── Preview modal ────────────────────────────────────────────────── */}
      {preview && (
        <div className="tpl-overlay" onClick={() => setPreview(null)}>
          <div className="tpl-modal" onClick={e => e.stopPropagation()}>

            {/* Left / top panel */}
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

            {/* Right / bottom panel */}
            <div className="tpl-modal-right">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ minWidth:0 }}>
                  <span className="bdg bdg-cat" style={{ marginBottom:8, display:'inline-block' }}>{preview.cat}</span>
                  <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', margin:'0 0 4px' }}>{preview.name}</div>
                  <div style={{ fontSize:12, color:'var(--text4)', margin:'0 0 14px' }}>{preview.desc}</div>
                </div>
                <button style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text4)', padding:0, flexShrink:0, marginLeft:8 }} onClick={() => setPreview(null)}>
                  <X size={14}/>
                </button>
              </div>

              <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text4)', marginBottom:7 }}>Tags</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
                {preview.tags.map(t => <span key={t} className="bdg bdg-cat" style={{ fontSize:10 }}>{t}</span>)}
              </div>

              <div style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text4)', marginBottom:7 }}>Adapté pour</div>
              <div style={{ fontSize:12, color:'var(--text3)', lineHeight:1.6, marginBottom:18 }}>
                {preview.cat === 'Académique' ? `Universités camerounaises · Niveau ${preview.subcat || 'Licence/Master'} · Conforme UY1, UDla, UBa`
                : preview.cat === 'PV & Réunions' ? 'Entreprises OHADA · SA, SARL · Gouvernance · Cameroun'
                : preview.cat === 'Comptabilité' ? 'PME camerounaises · TVA 19.25% · SYSCOHADA · FCFA'
                : preview.cat === 'Publication'  ? 'Chercheurs · Universités · Revues africaines · Think tanks'
                : "PME, cabinets et entreprises en Afrique Centrale et de l'Ouest"}
              </div>

              <div style={{ display:'flex', gap:8 }}>
                <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => setPreview(null)}>Fermer</button>
                <button
                  className="btn-primary"
                  style={{ flex:2, justifyContent:'center', opacity: limitReached ? .5 : 1, cursor: limitReached ? 'not-allowed' : 'pointer' }}
                  disabled={limitReached}
                  onClick={() => { setPreview(null); useTpl(preview.id) }}
                >
                  {limitReached ? <><Lock size={12}/> Limite atteinte</> : <><Check size={12}/> Utiliser ce template</>}
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