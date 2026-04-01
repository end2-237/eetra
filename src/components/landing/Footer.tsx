'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, MapPin, Mail, Globe, Sparkles } from 'lucide-react'
import logo from '../../app/icon.png'

const FOOTER_LINKS = [
  {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalites', href: '/#features' }, { label: 'Templates', href: '/#templates' },
      { label: 'Galerie de designs', href: '/designs' }, { label: 'Tarifs', href: '/#pricing' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Bibliotheque guides', href: '/ebooks' }, { label: 'Droit OHADA', href: '/ebooks' },
      { label: 'Comptabilite SYSCOHADA', href: '/ebooks' }, { label: 'Marches Publics', href: '/ebooks' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'Mentions legales', href: '/legal' }, { label: 'Confidentialite', href: '/legal#privacy' },
      { label: 'CGU', href: '/legal' }, { label: 'Contact', href: 'mailto:contact@eetra.buyticle.com' },
    ],
  },
]

const CSS = `
  .footer-cta { 
    width: 100%; 
    padding: 100px 0; 
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%); 
    position: relative; 
    overflow: hidden; 
  }
  .footer-cta-inner { max-width: 1280px; margin: 0 auto; padding: 0 56px; text-align: center; position: relative; z-index: 1; }
  .footer-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  
  .footer-cta-btn {
    transition: transform .3s cubic-bezier(.23,1,.32,1), box-shadow .3s;
    position: relative;
    overflow: hidden;
  }
  .footer-cta-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  .footer-cta-btn:hover::before { transform: translateX(100%); }
  .footer-cta-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 20px 50px var(--electricGlow) !important; }
  .footer-cta-btn-secondary:hover { 
    transform: translateY(-2px); 
    background: rgba(255,255,255,0.12) !important; 
    border-color: rgba(255,255,255,0.25) !important; 
  }
  
  .footer-pay-badges { display: flex; gap: 10px; justify-content: center; margin-top: 28px; flex-wrap: wrap; }
  .footer-main { background: #080C14; border-top: 1px solid rgba(255,255,255,0.06); padding: 72px 0 36px; }
  .footer-main-inner { max-width: 1280px; margin: 0 auto; padding: 0 56px; }
  .footer-grid { display: grid; grid-template-columns: 260px 1fr 1fr 1fr; gap: 56px; margin-bottom: 56px; }
  .footer-bottom { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
  
  .footer-link {
    transition: color .2s, transform .2s;
  }
  .footer-link:hover {
    color: #fff !important;
    transform: translateX(4px);
  }

  @media (max-width: 1023px) {
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
  }
  @media (max-width: 767px) {
    .footer-cta { padding: 64px 0; }
    .footer-cta-inner { padding: 0 20px; }
    .footer-cta-inner h2 { font-size: clamp(26px, 5vw, 48px) !important; line-height: 1.15; }
    .footer-cta-inner p { font-size: 14px; margin-bottom: 32px !important; }
    .footer-cta-btns { flex-direction: column; align-items: center; gap: 12px; }
    .footer-cta-btns button { width: 100%; max-width: 100%; justify-content: center; padding: 13px 20px !important; font-size: 14px !important; }
    .footer-pay-badges { gap: 7px; margin-top: 24px; }
    .footer-pay-badges > div { padding: 6px 12px !important; font-size: 11px; }
    .footer-main { padding: 48px 0 24px; }
    .footer-main-inner { padding: 0 20px; }
    .footer-grid { grid-template-columns: 1fr; gap: 28px; margin-bottom: 32px; }
    .footer-grid > div > div:first-child { margin-bottom: 14px !important; font-size: 14px !important; }
    .footer-grid a { font-size: 13px !important; }
    .footer-bottom { flex-direction: column; align-items: flex-start; gap: 12px; font-size: 12px; }
    .footer-bottom-links { flex-wrap: wrap; }
  }
  @media (max-width: 599px) {
    .footer-cta { padding: 56px 0; }
    .footer-cta-inner { padding: 0 16px; }
    .footer-cta-inner h2 { font-size: clamp(22px, 5vw, 40px) !important; line-height: 1.1; }
    .footer-cta-inner p { font-size: 13px; margin-bottom: 26px !important; }
    .footer-pay-badges { gap: 6px; margin-top: 20px; }
    .footer-pay-badges > div { padding: 5px 10px !important; font-size: 10px; }
    .footer-main { padding: 44px 0 20px; }
    .footer-main-inner { padding: 0 16px; }
    .footer-grid { gap: 26px; margin-bottom: 26px; }
  }
  @media (max-width: 479px) {
    .footer-cta { padding: 48px 0; }
    .footer-cta-inner { padding: 0 14px; }
    .footer-cta-inner h2 { font-size: clamp(20px, 4.5vw, 36px) !important; line-height: 1.1; }
    .footer-cta-inner p { font-size: 12px; margin-bottom: 20px !important; }
    .footer-cta-btns { gap: 10px; }
    .footer-cta-btns button { padding: 12px 16px !important; font-size: 13px !important; }
    .footer-pay-badges { gap: 5px; margin-top: 14px; }
    .footer-pay-badges > div { padding: 4px 8px !important; font-size: 9px; }
    .footer-main { padding: 36px 0 18px; }
    .footer-main-inner { padding: 0 14px; }
    .footer-grid { gap: 22px; margin-bottom: 22px; }
    .footer-grid > div > div:first-child { margin-bottom: 11px !important; font-size: 12px !important; }
    .footer-grid a { font-size: 11px !important; line-height: 1.5; }
    .footer-bottom { gap: 8px; font-size: 11px; }
  }
`

export function Footer() {
  const router = useRouter()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* CTA Banner */}
      <section className="footer-cta">
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: -100, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', opacity: 0.5 }} />
        <div style={{ position: 'absolute', bottom: -80, right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(236,72,153,0.3) 0%,transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

        <div className="footer-cta-inner">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(107,71,237,0.2)', color: '#A78BFA', border: '1px solid rgba(107,71,237,0.3)', fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 26 }}>
            <Sparkles size={12} /> Commencez aujourd&apos;hui
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 64px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .9, color: '#fff', marginBottom: 18 }}>
            Pret a creer des documents<br />
            <span style={{ background: 'linear-gradient(135deg,var(--accent) 0%,#A855F7 50%,#EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>qui impressionnent ?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Rejoignez plus de 500 entreprises, cabinets et consultants qui font confiance a EETRA.
          </p>

          <div className="footer-cta-btns">
            <button onClick={() => router.push('/login')} className="footer-cta-btn footer-cta-btn-primary"
              style={{ padding: '16px 32px', borderRadius: 16, background: 'linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 40px var(--electricGlow)', display: 'flex', alignItems: 'center', gap: 10 }}>
              Demarrer gratuitement <ArrowRight size={16} />
            </button>
            <button onClick={() => router.push('/designs')} className="footer-cta-btn footer-cta-btn-secondary"
              style={{ padding: '16px 26px', borderRadius: 16, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.85)', border: '1px solid rgba(255,255,255,.12)', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              Voir les designs
            </button>
          </div>

          <div className="footer-pay-badges">
            {['Orange Money', 'MTN MoMo', 'Wave', 'Virement UEMOA'].map((p, i) => (
              <div key={p} style={{ padding: '6px 14px', borderRadius: 99, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>{p}</div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <Image src={logo} alt="EETRA" width={36} height={36} style={{ borderRadius: 9 }} />
                <div>
                  <div style={{ fontSize: 19, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>EETRA</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Document Intelligence</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, marginBottom: 24 }}>
                Plateforme B2B de creation de documents professionnels pour l&apos;Afrique de l&apos;Ouest.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: <MapPin size={12} />, text: 'Douala, Cameroun' },
                  { icon: <Mail size={12} />, text: 'contact@eetra.buyticle.com' },
                  { icon: <Globe size={12} />, text: 'eetra.buyticle.com' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.35)', fontWeight: 500 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 20 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <Link key={link.label} href={link.href} className="footer-link"
                      style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', textDecoration: 'none', fontWeight: 500, display: 'inline-block' }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom */}
          <div className="footer-bottom">
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.25)' }}>© 2026 EETRA · Tous droits reserves · Douala, Cameroun</span>
            <div className="footer-bottom-links" style={{ display: 'flex', gap: 16 }}>
              {[{ label: 'CGU', href: '/legal' }, { label: 'Confidentialite', href: '/legal#privacy' }, { label: 'v2.2.0', href: '#' }].map(l => (
                <Link key={l.label} href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,.25)', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.6)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.25)'}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
