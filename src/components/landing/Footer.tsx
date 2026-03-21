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
      { label: 'Fonctionnalités', href: '/#features' },
      { label: 'Templates', href: '/#templates' },
      { label: 'Galerie de designs', href: '/designs' },
      { label: 'Tarifs', href: '/#pricing' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Bibliothèque guides', href: '/ebooks' },
      { label: 'Droit OHADA', href: '/ebooks' },
      { label: 'Comptabilité SYSCOHADA', href: '/ebooks' },
      { label: 'Marchés Publics', href: '/ebooks' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Entreprise',
    links: [
      { label: 'À propos', href: '#' },
      { label: 'Mentions légales', href: '/legal' },
      { label: 'Confidentialité', href: '/legal#privacy' },
      { label: 'CGU', href: '/legal' },
      { label: 'Contact', href: 'mailto:contact@eetra.buyticle.com' },
      { label: 'Presse', href: 'mailto:press@eetra.buyticle.com' },
    ],
  },
]

export function Footer() {
  const router = useRouter()

  return (
    <>
      {/* ── CTA Banner ── */}
      <section style={{
        width: '100%', padding: '80px 0',
        background: 'linear-gradient(135deg, #0F172A 0%, #1B2A4A 50%, #0F172A 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -80, left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(27,79,216,.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: '15%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(91,155,255,.1)', filter: 'blur(40px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: 'rgba(91,155,255,.15)', color: '#5B9BFF',
            border: '1px solid rgba(91,155,255,.2)',
            fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase',
            marginBottom: 24,
          }}>
            ✦ Commencez aujourd'hui
          </div>
          <h2 style={{
            fontSize: 'clamp(36px, 4vw, 60px)', fontWeight: 900,
            letterSpacing: '-.04em', lineHeight: .92,
            color: '#fff', marginBottom: 16,
          }}>
            Prêt à créer des documents<br />
            <span style={{ color: '#5B9BFF' }}>qui impressionnent ?</span>
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
            Rejoignez plus de 500 entreprises, cabinets et consultants qui font confiance à EETRA pour leurs documents d'entreprise.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '14px 32px', borderRadius: 14,
                background: '#1B4FD8', color: '#fff', border: 'none',
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(27,79,216,.4)',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all .2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = ''}
            >
              Démarrer gratuitement <ArrowRight size={15} />
            </button>
            <button
              onClick={() => router.push('/designs')}
              style={{
                padding: '14px 24px', borderRadius: 14,
                background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.85)',
                border: '1px solid rgba(255,255,255,.15)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Voir les designs →
            </button>
          </div>

          {/* Payment badges */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            {['🟠 Orange Money', '🟡 MTN MoMo', '🔵 Wave', '🏦 Virement UEMOA'].map(p => (
              <div key={p} style={{
                padding: '5px 14px', borderRadius: 99,
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                fontSize: 11, color: 'rgba(255,255,255,.5)', fontWeight: 600,
              }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer proper ── */}
      <footer style={{ background: '#080C14', borderTop: '1px solid rgba(255,255,255,.06)', padding: '64px 0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>

          {/* Top: logo + columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>

            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Image src={logo} alt="EETRA" width={32} height={32} style={{ borderRadius: 7 }} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-.03em' }}>EETRA</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.18em', textTransform: 'uppercase' }}>Document Intelligence</div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.65, marginBottom: 24 }}>
                Plateforme B2B de création de documents professionnels pour l'Afrique de l'Ouest.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: <MapPin size={11} />, text: 'Douala, Cameroun' },
                  { icon: <Mail size={11} />, text: 'contact@eetra.buyticle.com' },
                  { icon: <Globe size={11} />, text: 'eetra.buyticle.com' },
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
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 18 }}>
                  {col.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => (
                    <Link
                      key={link.label}
                      href={link.href}
                      style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontWeight: 500, transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.9)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.5)'}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>
              © 2026 EETRA · Tous droits réservés · Douala, Cameroun
            </span>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'CGU', href: '/legal' },
                { label: 'Confidentialité', href: '/legal#privacy' },
                { label: 'v2.2.0', href: '#' },
              ].map(l => (
                <Link key={l.label} href={l.href} style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', textDecoration: 'none', fontWeight: 500 }}>
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