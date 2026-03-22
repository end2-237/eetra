'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'Le PDF exporté ressemble-t-il exactement à l\'aperçu ?',
    a: 'Oui. EETRA capture directement les éléments rendus dans le navigateur (fonts chargées, CSS variables résolues, images présentes) via html2canvas + jsPDF — pas de re-rendu serveur. Ce que vous voyez est ce que vous obtenez, à 2× de résolution pour l\'impression.',
  },
  {
    q: 'Puis-je exporter mes documents au format Word ?',
    a: 'Absolument. L\'export .docx génère un fichier Microsoft Word structuré avec entêtes stylisés, tableaux formatés, clauses en italique, zones de signature, numérotation de pages et en-tête/pied de page corporate. Disponible sur tous les plans.',
  },
  {
    q: 'Mes données sont-elles stockées sur vos serveurs ?',
    a: 'Non. Vos documents, votre profil entreprise et votre bibliothèque sont stockés dans le localStorage de votre navigateur. Rien ne transite vers nos serveurs sauf les requêtes d\'IA (qui n\'incluent que le titre et le nom de l\'entité). Vous gardez un contrôle total.',
  },
  {
    q: 'Le cadre juridique OHADA est-il vraiment intégré ?',
    a: 'Oui. Les templates Contrat incluent des clauses OHADA (confidentialité, propriété intellectuelle, juridiction CCJA), le template Devis référence la TVA locale (18%) et les conditions UEMOA, et le template Appel d\'Offre suit la structure des dossiers de soumission des marchés publics.',
  },
  {
    q: 'Comment fonctionnent les paiements en FCFA ?',
    a: 'Nous acceptons Orange Money (CI, SN, ML, BF, CM), MTN Mobile Money (CI, GH, UG, RW), Wave (CI, SN, ML, BF) et virement bancaire UEMOA. Toutes les transactions sont traitées en Francs CFA. Pour les plans annuels, la réduction de 20% est appliquée automatiquement.',
  },
  {
    q: 'Y a-t-il une limite au nombre de pages par document ?',
    a: 'Plan Starter : 2 pages max. Plans Pro, Business et Enterprise : pages illimitées, avec pagination et overflow automatiques — un bloc trop long crée automatiquement une nouvelle page.',
  },
]

const CSS = `
  .faq-section { width:100%; padding:100px 0; background:var(--bg2); }
  .faq-inner { max-width:1200px; margin:0 auto; padding:0 48px; display:grid; grid-template-columns:1fr 2fr; gap:80px; align-items:start; }
  .faq-sticky { position:sticky; top:120px; }

  @media (max-width: 1023px) {
    .faq-inner { grid-template-columns:1fr; gap:36px; }
    .faq-sticky { position:static; }
  }
  @media (max-width: 767px) {
    .faq-section { padding:64px 0; }
    .faq-inner { padding:0 20px; gap:28px; }
  }
`

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section id="faq" className="faq-section">
        <div className="faq-inner">

          {/* Left */}
          <div className="faq-sticky">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)', fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 18 }}>
              FAQ
            </div>
            <h2 style={{ fontSize: 'clamp(26px,3vw,44px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .95, color: 'var(--text)', marginBottom: 14 }}>
              Questions<br />
              <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text3)' }}>fréquentes.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 280 }}>
              Une question non listée ?{' '}
              <a href="mailto:contact@eetra.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@eetra.app</a>
            </p>
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderRadius: 14, border: `1px solid ${open === i ? 'var(--accent)' : 'var(--border)'}`, background: open === i ? 'var(--surface)' : 'transparent', overflow: 'hidden', transition: 'all .2s' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '18px 22px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: open === i ? 'var(--accent)' : 'var(--text4)', marginTop: 2, flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: open === i ? 'var(--text)' : 'var(--text2)', lineHeight: 1.4 }}>{faq.q}</span>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: open === i ? 'var(--accentS)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                    {open === i ? <Minus size={12} color="var(--accent)" /> : <Plus size={12} color="var(--text4)" />}
                  </div>
                </button>
                {open === i && (
                  <div style={{ padding: '0 22px 18px 50px' }}>
                    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text3)', margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}