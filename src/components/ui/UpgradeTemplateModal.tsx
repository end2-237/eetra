'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap, Check, ArrowRight, Lock, Sparkles, FileText, Users, Download, Shield } from 'lucide-react'

interface Props {
  onClose: () => void
  reason?: string
  context?: 'template' | 'document' | 'community'
}

const PLAN_FEATURES = [
  { icon: <FileText size={14} />, text: 'Documents & pages illimités', plans: ['pro', 'business'] },
  { icon: <Sparkles size={14} />, text: 'Tous les templates inclus', plans: ['pro', 'business'] },
  { icon: <Zap size={14} />, text: 'IA rédactionnelle avancée', plans: ['pro', 'business'] },
  { icon: <Download size={14} />, text: 'Export PDF + Word .docx sans filigrane', plans: ['pro', 'business'] },
  { icon: <Users size={14} />, text: 'Collaboration en équipe (10 membres)', plans: ['business'] },
  { icon: <Shield size={14} />, text: 'Support prioritaire 24h', plans: ['business'] },
]

const CONTEXT_CONFIG = {
  template: {
    emoji: '📑',
    title: 'Débloquez tous les templates',
    subtitle: 'Accédez à l\'ensemble de la bibliothèque de templates professionnels : Business Plan, Audit, Contrat OHADA, Appel d\'Offre et bien plus.',
    highlight: 'Templates inclus',
  },
  document: {
    emoji: '📄',
    title: 'Limite de documents atteinte',
    subtitle: 'Votre plan Starter est limité à 5 documents par mois. Passez au plan Pro pour créer des documents illimités avec toutes les fonctionnalités.',
    highlight: 'Documents illimités',
  },
  community: {
    emoji: '🌐',
    title: 'Templates communautaires Pro',
    subtitle: 'Les templates partagés par la communauté EETRA sont réservés aux plans Pro et Business. Rejoignez-nous pour y accéder.',
    highlight: 'Communauté Pro',
  },
}

export function UpgradeTemplateModal({ onClose, reason, context = 'template' }: Props) {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const cfg = CONTEXT_CONFIG[context]

  const plans = [
    {
      id: 'pro',
      label: 'Pro',
      color: '#1B4FD8',
      monthly: 14900,
      annual: 11900,
      cta: 'Passer au Pro',
      featured: true,
      desc: 'Pour les professionnels exigeants',
    },
    {
      id: 'business',
      label: 'Business',
      color: '#059669',
      monthly: 39900,
      annual: 31900,
      cta: 'Choisir Business',
      featured: false,
      desc: 'Pour les équipes jusqu\'à 10',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.72)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn .2s ease',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(28px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .upgrade-plan-card { transition: transform .2s, box-shadow .2s; }
        .upgrade-plan-card:hover { transform: translateY(-3px); box-shadow: 0 20px 56px rgba(0,0,0,.28) !important; }
        .upgrade-cta-btn { transition: transform .2s, opacity .15s; }
        .upgrade-cta-btn:hover { transform: translateY(-1px); opacity:.9; }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 680,
        background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1A35 40%, #0A0F1E 100%)',
        borderRadius: 24,
        border: '1px solid rgba(91,155,255,.2)',
        boxShadow: '0 32px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.08)',
        overflow: 'hidden',
        animation: 'slideUp .3s cubic-bezier(.23,1,.32,1)',
        position: 'relative',
      }}>

        {/* Background glow effects */}
        <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:400, height:280, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(27,79,216,.22) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-60, right:-40, width:240, height:200, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(124,58,237,.14) 0%,transparent 70%)', pointerEvents:'none' }}/>

        {/* Close button */}
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:8, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.5)', zIndex:10, transition:'all .15s' }}
          onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,.12)') }
          onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,.06)') }>
          <X size={14}/>
        </button>

        <div style={{ padding: '36px 36px 32px', position:'relative', zIndex:2 }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:42, marginBottom:14, display:'inline-block', animation:'float 4s ease-in-out infinite' }}>
              {cfg.emoji}
            </div>

            {/* Lock badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:99, background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.25)', marginBottom:14 }}>
              <Lock size={10} color='#f87171'/>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.14em', color:'#f87171', textTransform:'uppercase' }}>
                Plan Starter — Fonctionnalité verrouillée
              </span>
            </div>

            <h2 style={{ fontSize:26, fontWeight:900, color:'#fff', letterSpacing:'-.03em', lineHeight:1.1, marginBottom:10 }}>
              {cfg.title}
            </h2>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.52)', lineHeight:1.65, maxWidth:440, margin:'0 auto' }}>
              {reason || cfg.subtitle}
            </p>
          </div>

          {/* Features preview */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:24 }}>
            {PLAN_FEATURES.slice(0, 6).map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 10px', borderRadius:9, background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.07)' }}>
                <div style={{ width:24, height:24, borderRadius:6, background:'rgba(27,79,216,.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#5B9BFF', flexShrink:0 }}>
                  {f.icon}
                </div>
                <span style={{ fontSize:10, color:'rgba(255,255,255,.65)', fontWeight:600, lineHeight:1.3 }}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
            <div style={{ display:'flex', background:'rgba(255,255,255,.07)', borderRadius:99, padding:3, gap:2, border:'1px solid rgba(255,255,255,.1)' }}>
              {([['monthly','Mensuel'],['annual','Annuel −20%']] as const).map(([val,lbl])=>(
                <button key={val} onClick={()=>setBilling(val)}
                  style={{ padding:'6px 16px', borderRadius:99, border:'none', cursor:'pointer', fontSize:11, fontWeight:700, transition:'all .18s',
                    background: billing===val ? 'rgba(27,79,216,.8)' : 'transparent',
                    color: billing===val ? '#fff' : 'rgba(255,255,255,.45)',
                    boxShadow: billing===val ? '0 2px 8px rgba(27,79,216,.4)' : 'none',
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Plan cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            {plans.map(plan => {
              const price = billing === 'annual' ? plan.annual : plan.monthly
              return (
                <div key={plan.id} className="upgrade-plan-card" style={{
                  borderRadius:16, padding:'20px 18px',
                  background: plan.featured ? `linear-gradient(135deg,rgba(27,79,216,.35),rgba(91,155,255,.2))` : 'rgba(255,255,255,.06)',
                  border: `1.5px solid ${plan.featured ? 'rgba(91,155,255,.4)' : 'rgba(255,255,255,.1)'}`,
                  position:'relative', overflow:'hidden',
                  boxShadow: plan.featured ? '0 8px 32px rgba(27,79,216,.25)' : 'none',
                }}>
                  {plan.featured && (
                    <div style={{ position:'absolute', top:10, right:10, padding:'2px 8px', borderRadius:99, background:'rgba(91,155,255,.25)', border:'1px solid rgba(91,155,255,.35)', fontSize:8, fontWeight:800, color:'#5B9BFF', letterSpacing:'.1em' }}>
                      RECOMMANDÉ
                    </div>
                  )}
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color: plan.featured ? '#5B9BFF' : 'rgba(255,255,255,.4)', marginBottom:8 }}>
                    {plan.label}
                  </div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:3, marginBottom:4 }}>
                    <span style={{ fontSize:24, fontWeight:900, color:'#fff', letterSpacing:'-.03em' }}>
                      {price.toLocaleString('fr-FR')}
                    </span>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,.35)', fontWeight:500 }}>FCFA/mois</span>
                  </div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,.4)', marginBottom:14 }}>{plan.desc}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:16 }}>
                    {PLAN_FEATURES.filter(f=>f.plans.includes(plan.id)).slice(0,4).map((f,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:13, height:13, borderRadius:'50%', background:'rgba(5,150,105,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Check size={8} color='#34d399' strokeWidth={3}/>
                        </div>
                        <span style={{ fontSize:10, color:'rgba(255,255,255,.6)' }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                  <button className="upgrade-cta-btn" onClick={()=>router.push('/dashboard')}
                    style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', cursor:'pointer', fontSize:12, fontWeight:800,
                      background: plan.featured ? 'linear-gradient(135deg,#1B4FD8,#3B82F6)' : 'rgba(255,255,255,.1)',
                      color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                      boxShadow: plan.featured ? '0 4px 16px rgba(27,79,216,.5)' : 'none',
                    }}>
                    {plan.cta} <ArrowRight size={12}/>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:10, color:'rgba(255,255,255,.25)', marginBottom:10 }}>
              Paiements Orange Money · MTN MoMo · Wave · Virement · En FCFA · Annulation à tout moment
            </p>
            <button onClick={onClose} style={{ fontSize:11, color:'rgba(255,255,255,.3)', background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(255,255,255,.15)' }}>
              Continuer avec le plan Starter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}