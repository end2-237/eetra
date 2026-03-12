'use client'

import { Zap, Grid, Shield, Link2, Users, FileText } from 'lucide-react'

const FEATURES = [
  { icon: Zap,      title: 'IA Rédactionnelle',    desc: 'Génération automatique d\'introductions, reformulation en langage formel, vérification de cohérence logique.' },
  { icon: Grid,     title: 'Smart Templates',       desc: '5 modèles structurés par des experts : Business Plan, Audit, Appel d\'Offre, Contrat, Note de direction.' },
  { icon: Shield,   title: 'Charte Corporate',      desc: 'Logo, couleur principale, coordonnées — votre identité visuelle appliquée sur chaque page de chaque document.' },
  { icon: Link2,    title: 'Variable Sync',         desc: 'Modifiez le nom du client une fois — il se propage instantanément sur l\'intégralité du document.' },
  { icon: Users,    title: 'Revue Collaborative',   desc: 'Annotations, commentaires horodatés et workflow de validation intégré pour vos équipes.' },
  { icon: FileText, title: 'Export PDF Print-Ready',desc: 'PDF haute résolution A4, pagination automatique, page de garde et pied de page corporate inclus.' },
]

export function Features() {
  return (
    <section id="features" className="py-20 px-12 max-w-[1140px] mx-auto w-full">
      <div className="text-center mb-14">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4"
          style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}
        >
          Fonctionnalités
        </div>
        <h2
          className="text-[38px] font-black tracking-tight leading-tight"
          style={{ color: 'var(--text)' }}
        >
          Tout ce dont une entreprise a besoin,{' '}
          <span className="font-serif italic font-light" style={{ color: 'var(--text3)' }}>
            dans un seul outil.
          </span>
        </h2>
        <p className="text-[15px] mt-3 max-w-lg mx-auto" style={{ color: 'var(--text3)' }}>
          Conçu pour les équipes dirigeantes, les consultants et les PME africaines.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="p-6 rounded-xl border transition-all duration-200 cursor-default group"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--accent)'
              el.style.transform = 'translateY(-3px)'
              el.style.boxShadow = '0 8px 24px rgba(0,0,0,.07)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--border)'
              el.style.transform = ''
              el.style.boxShadow = ''
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ background: 'var(--accentS)', color: 'var(--accent)' }}
            >
              <Icon size={18} strokeWidth={2} />
            </div>
            <h3 className="text-[14px] font-bold mb-2" style={{ color: 'var(--text)' }}>{title}</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text3)' }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
