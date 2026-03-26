'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Mail, Globe } from 'lucide-react'
import logo from '../../app/icon.png'

const FOOTER_LINKS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '/#features' }, { label: 'Templates', href: '/#templates' },
      { label: 'Galerie de designs', href: '/designs' }, { label: 'Tarifs', href: '/#pricing' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Bibliothèque guides', href: '/ebooks' }, { label: 'Droit OHADA', href: '/ebooks' },
      { label: 'Comptabilité SYSCOHADA', href: '/ebooks' }, { label: 'Marchés Publics', href: '/ebooks' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'Mentions légales', href: '/legal' }, { label: 'Confidentialité', href: '/legal#privacy' },
      { label: 'CGU', href: '/legal' }, { label: 'Contact', href: 'mailto:contact@eetra.buyticle.com' },
    ],
  },
]

const CSS = `
  .footer-cta { width:100%; padding:80px 0; background:linear-gradient(135deg,#0F172A 0%,#1B2A4A 50%,#0F172A 100%); position:relative; overflow:hidden; }
  .footer-cta-inner { max-width:1200px; margin:0 auto; padding:0 48px; text-align:center; position:relative; z-index:1; }
  .footer-cta-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
  .footer-pay-badges { display:flex; gap:8px; justify-content:center; margin-top:24px; flex-wrap:wrap; }
  .footer-main { background:#080C14; border-top:1px solid rgba(255,255,255,.06); padding:64px 0 32px; }
  .footer-main-inner { max-width:1200px; margin:0 auto; padding:0 48px; }
  .footer-grid { display:grid; grid-template-columns:240px 1fr 1fr 1fr; gap:48px; margin-bottom:48px; }
  .footer-bottom { border-top:1px solid rgba(255,255,255,.06); padding-top:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }

  @media (max-width: 1023px) {
    .footer-grid { grid-template-columns:1fr 1fr; gap:32px; }
  }
  @media (max-width: 767px) {
    .footer-cta { padding:56px 0; }
    .footer-cta-inner { padding:0 20px; }
    .footer-cta-btns { flex-direction:column; align-items:center; }
    .footer-cta-btns button { width:100%; max-width:320px; justify-content:center; }
    .footer-main { padding:48px 0 24px; }
    .footer-main-inner { padding:0 20px; }
    .footer-grid { grid-template-columns:1fr; gap:28px; margin-bottom:32px; }
    .footer-bottom { flex-direction:column; align-items:flex-start; gap:12px; }
    .footer-bottom-links { flex-wrap:wrap; }
  }
  @media (max-width: 479px) {
    .footer-cta { padding:48px 0; }
    .footer-cta-inner { padding:0 16px; }
    .footer-cta-inner h2 { font-size:clamp(24px,5vw,40px)!important; }
    .footer-cta-inner p { font-size:13px; }
    .footer-cta-btns { gap:10px; }
    .footer-cta-btns button { padding:12px 20px!important; font-size:12px!important; }
    .footer-pay-badges { gap:6px; margin-top:16px; }
    .footer-pay-badges > div { padding:4px 10px!important; font-size:10px; }
    .footer-main { padding:40px 0 20px; }
    .footer-main-inner { padding:0 16px; }
    .footer-bottom { gap:8px; }
  }
`

export function Footer() {
  const router = useRouter()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* CTA Banner */}
      <section className="footer-cta">
        <div style={{ position: 'absolute', top: -80, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(27,79,216,.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(91,155,255,.1)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div className="footer-cta-inner">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(91,155,255,.15)', color: '#5B9BFF', border: '1px solid rgba(91,155,255,.2)', fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 22 }}>
            ✦ Commencez aujourd'hui
          </div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,60px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .92, color: '#fff', marginBottom: 14 }}>
            Prêt à créer des documents<br />
            <span style={{ color: '#5B9BFF' }}>qui impressionnent ?</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Rejoignez plus de 500 entreprises, cabinets et consultants qui font confiance à EETRA.
          </p>

          <div className="footer-cta-btns">
            <button onClick={() => router.push('/login')}
              style={{ padding: '14px 28px', borderRadius: 14, background: '#1B4FD8', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 32px rgba(27,79,216,.4)', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s' }}>
              Démarrer gratuitement <ArrowRight size={15} />
            </button>
            <button onClick={() => router.push('/designs')}
              style={{ padding: '14px 22px', borderRadius: 14, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.15)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              Voir les designs →
            </button>
          </div>

          <div className="footer-pay-badges">
            {['🟠 Orange Money', '🟡 MTN MoMo', '🔵 Wave', '🏦 Virement UEMOA'].map(p => (
              <div key={p} style={{ padding: '5px 13px', borderRadius: 99, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-main">
        <div className="footer-main-inner">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <Image src={logo} alt="EETRA" width={30} height={30} style={{ borderRadius: 7 }} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>EETRA</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Document Intelligence</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.65, marginBottom: 20 }}>
                Plateforme B2B de création de documents professionnels pour l'Afrique de l'Ouest.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {[
                  { icon: <MapPin size={10} />, text: 'Douala, Cameroun' },
                  { icon: <Mail size={10} />, text: 'contact@eetra.buyticle.com' },
                  { icon: <Globe size={10} />, text: 'eetra.buyticle.com' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>
                    {icon} {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {col.links.map(link => (
                    <Link key={link.label} href={link.href}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 500, transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.9)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>© 2026 EETRA · Tous droits réservés · Douala, Cameroun</span>
            <div className="footer-bottom-links" style={{ display: 'flex', gap: 14 }}>
              {[{ label: 'CGU', href: '/legal' }, { label: 'Confidentialité', href: '/legal#privacy' }, { label: 'v2.2.0', href: '#' }].map(l => (
                <Link key={l.label} href={l.href} style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', textDecoration: 'none', fontWeight: 500 }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
