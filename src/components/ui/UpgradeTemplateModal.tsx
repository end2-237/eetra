'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap, Check, ArrowRight, Lock, Sparkles, FileText, Users, Download, Shield, GraduationCap } from 'lucide-react'

interface Props {
  onClose: () => void
  reason?: string
  context?: 'template' | 'document' | 'community'
}

const CONTEXT_CONFIG = {
  template: {
    emoji: '📑',
    title: 'Débloquez toutes les fonctionnalités',
    subtitle: 'Accédez aux templates communautaires, modèles personnalisés, IA rédactionnelle et bien plus.',
  },
  document: {
    emoji: '📄',
    title: 'Limite de documents atteinte',
    subtitle: 'Votre plan actuel est limité. Passez à un plan supérieur pour continuer à créer des documents.',
  },
  community: {
    emoji: '🌐',
    title: 'Templates communautaires Pro',
    subtitle: 'Les templates partagés par la communauté EETRA sont réservés aux plans Pro et Business.',
  },
}

export function UpgradeTemplateModal({ onClose, reason, context = 'template' }: Props) {
  const router = useRouter()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const cfg = CONTEXT_CONFIG[context]

  const plans = [
    {
      id: 'student',
      label: 'Étudiant',
      icon: <GraduationCap size={14} />,
      color: '#059669',
      monthly: 2000,
      annual: 1700,
      cta: 'Plan Étudiant',
      featured: false,
      desc: 'Pour les étudiants',
      features: [
        'Templates intégrés inclus',
        'Modèles personnalisés',
        '20 documents / mois',
        '2 pages max / doc',
        'Export PDF + Word',
      ],
    },
    {
      id: 'pro',
      label: 'Pro',
      icon: <Zap size={14} />,
      color: '#1B4FD8',
      monthly: 14900,
      annual: 11900,
      cta: 'Passer au Pro',
      featured: true,
      desc: 'Pour les professionnels',
      features: [
        'Documents illimités',
        'Pages illimitées',
        'IA rédactionnelle',
        'Templates communauté',
        'Sans filigrane',
        'Export PDF + Word',
      ],
    },
    {
      id: 'business',
      label: 'Business',
      icon: <Users size={14} />,
      color: '#7C3AED',
      monthly: 39900,
      annual: 31900,
      cta: 'Business',
      featured: false,
      desc: "Jusqu'à 10 membres",
      features: [
        'Tout le plan Pro',
        "10 utilisateurs",
        'Espace partagé',
        'Gestion des rôles',
        'Analytics avancés',
        'Support 24h',
      ],
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes slideUpM { from { opacity:0; transform:translateY(20px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }
        .upm-plan { transition: transform .18s, box-shadow .18s; }
        .upm-plan:hover { transform: translateY(-2px); }
        .upm-cta { transition: opacity .15s, transform .15s; }
        .upm-cta:hover { opacity:.88; transform:translateY(-1px); }
        @media (max-width:600px) {
          .upm-plans { grid-template-columns: 1fr !important; }
          .upm-features { grid-template-columns: 1fr !important; }
        }
        @media (max-width:800px) {
          .upm-plans { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: 700,
        background: 'linear-gradient(160deg, #0A0F1E 0%, #0F1A35 50%, #0A0F1E 100%)',
        borderRadius: 20,
        border: '1px solid rgba(91,155,255,.2)',
        boxShadow: '0 24px 80px rgba(0,0,0,.5)',
        animation: 'slideUpM .3s cubic-bezier(.23,1,.32,1)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Glow */}
        <div style={{ position:'absolute', top:-80, left:'50%', transform:'translateX(-50%)', width:400, height:240, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(27,79,216,.2) 0%,transparent 70%)', pointerEvents:'none' }}/>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:30, height:30, borderRadius:8, border:'1px solid rgba(255,255,255,.1)', background:'rgba(255,255,255,.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.5)', zIndex:10 }}>
          <X size={14}/>
        </button>

        <div style={{ padding: '28px 24px 24px' }}>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>{cfg.emoji}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'3px 10px', borderRadius:99, background:'rgba(220,38,38,.15)', border:'1px solid rgba(220,38,38,.25)', marginBottom:10 }}>
              <Lock size={9} color='#f87171'/>
              <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.12em', color:'#f87171', textTransform:'uppercase' }}>
                {context === 'document' ? 'Limite atteinte' : 'Fonctionnalité verrouillée'}
              </span>
            </div>
            <h2 style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-.02em', lineHeight:1.15, marginBottom:8 }}>
              {cfg.title}
            </h2>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.6, maxWidth:440, margin:'0 auto' }}>
              {reason || cfg.subtitle}
            </p>
          </div>

          {/* Billing toggle */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
            <div style={{ display:'flex', background:'rgba(255,255,255,.06)', borderRadius:99, padding:3, gap:2, border:'1px solid rgba(255,255,255,.1)' }}>
              {([['monthly','Mensuel'],['annual','Annuel −15%']] as const).map(([val,lbl])=>(
                <button key={val} onClick={()=>setBilling(val)}
                  style={{ padding:'5px 14px', borderRadius:99, border:'none', cursor:'pointer', fontSize:10, fontWeight:700, transition:'all .15s',
                    background: billing===val ? 'rgba(27,79,216,.8)' : 'transparent',
                    color: billing===val ? '#fff' : 'rgba(255,255,255,.4)',
                  }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Plans grid */}
          <div className="upm-plans" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:18 }}>
            {plans.map(plan => {
              const price = billing === 'annual' ? plan.annual : plan.monthly
              return (
                <div key={plan.id} className="upm-plan" style={{
                  borderRadius:14, padding:'16px 14px',
                  background: plan.featured ? 'linear-gradient(135deg,rgba(27,79,216,.4),rgba(91,155,255,.2))' : 'rgba(255,255,255,.05)',
                  border: `1.5px solid ${plan.featured ? 'rgba(91,155,255,.5)' : 'rgba(255,255,255,.1)'}`,
                  position:'relative',
                  boxShadow: plan.featured ? '0 6px 24px rgba(27,79,216,.25)' : 'none',
                  display:'flex', flexDirection:'column',
                }}>
                  {plan.featured && (
                    <div style={{ position:'absolute', top:8, right:8, padding:'2px 7px', borderRadius:99, background:'rgba(91,155,255,.25)', border:'1px solid rgba(91,155,255,.35)', fontSize:7, fontWeight:800, color:'#5B9BFF', letterSpacing:'.1em' }}>
                      RECOMMANDÉ
                    </div>
                  )}
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:`${plan.color}22`, display:'flex', alignItems:'center', justifyContent:'center', color:plan.color, flexShrink:0 }}>
                      {plan.icon}
                    </div>
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', color: plan.featured ? '#5B9BFF' : 'rgba(255,255,255,.5)' }}>
                      {plan.label}
                    </div>
                  </div>
                  <div style={{ marginBottom:4 }}>
                    <span style={{ fontSize:20, fontWeight:900, color:'#fff', letterSpacing:'-.02em' }}>
                      {price.toLocaleString('fr-FR')}
                    </span>
                    <span style={{ fontSize:9, color:'rgba(255,255,255,.35)', marginLeft:2 }}>FCFA/mois</span>
                  </div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,.35)', marginBottom:10 }}>{plan.desc}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1, marginBottom:12 }}>
                    {plan.features.map((f,i)=>(
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:5 }}>
                        <div style={{ width:12, height:12, borderRadius:'50%', background:'rgba(5,150,105,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                          <Check size={7} color='#34d399' strokeWidth={3}/>
                        </div>
                        <span style={{ fontSize:9, color:'rgba(255,255,255,.55)', lineHeight:1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button className="upm-cta" onClick={()=>router.push('/settings#plan')}
                    style={{ width:'100%', padding:'8px', borderRadius:9, border:'none', cursor:'pointer', fontSize:10, fontWeight:800,
                      background: plan.featured ? 'linear-gradient(135deg,#1B4FD8,#3B82F6)' : 'rgba(255,255,255,.1)',
                      color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                      boxShadow: plan.featured ? '0 3px 12px rgba(27,79,216,.4)' : 'none',
                    }}>
                    {plan.cta} <ArrowRight size={10}/>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center' }}>
            <p style={{ fontSize:9, color:'rgba(255,255,255,.2)', marginBottom:8 }}>
              Orange Money · MTN MoMo · Wave · Virement · En FCFA · Annulation à tout moment
            </p>
            <button onClick={onClose} style={{ fontSize:10, color:'rgba(255,255,255,.3)', background:'transparent', border:'none', cursor:'pointer', textDecoration:'underline', textDecorationColor:'rgba(255,255,255,.15)' }}>
              Continuer avec le plan actuel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}