'use client'

import { useState } from 'react'
import { Plus, Minus, Sparkles } from 'lucide-react'

const FAQS = [
  {
    q: 'Le PDF exporte ressemble-t-il exactement a l\'apercu ?',
    a: 'Oui. EETRA capture directement les elements rendus dans le navigateur (fonts chargees, CSS variables resolues, images presentes) via html2canvas + jsPDF — pas de re-rendu serveur. Ce que vous voyez est ce que vous obtenez, a 2x de resolution pour l\'impression.',
  },
  {
    q: 'Puis-je exporter mes documents au format Word ?',
    a: 'Absolument. L\'export .docx genere un fichier Microsoft Word structure avec entetes stylises, tableaux formates, clauses en italique, zones de signature, numerotation de pages et en-tete/pied de page corporate. Disponible sur tous les plans.',
  },
  {
    q: 'Mes donnees sont-elles stockees sur vos serveurs ?',
    a: 'Non. Vos documents, votre profil entreprise et votre bibliotheque sont stockes dans le localStorage de votre navigateur. Rien ne transite vers nos serveurs sauf les requetes d\'IA (qui n\'incluent que le titre et le nom de l\'entite). Vous gardez un controle total.',
  },
  {
    q: 'Le cadre juridique OHADA est-il vraiment integre ?',
    a: 'Oui. Les templates Contrat incluent des clauses OHADA (confidentialite, propriete intellectuelle, juridiction CCJA), le template Devis reference la TVA locale (18%) et les conditions UEMOA, et le template Appel d\'Offre suit la structure des dossiers de soumission des marches publics.',
  },
  {
    q: 'Comment fonctionnent les paiements en FCFA ?',
    a: 'Nous acceptons Orange Money (CI, SN, ML, BF, CM), MTN Mobile Money (CI, GH, UG, RW), Wave (CI, SN, ML, BF) et virement bancaire UEMOA. Toutes les transactions sont traitees en Francs CFA. Pour les plans annuels, la reduction de 20% est appliquee automatiquement.',
  },
  {
    q: 'Y a-t-il une limite au nombre de pages par document ?',
    a: 'Plan Starter : 2 pages max. Plans Pro, Business et Enterprise : pages illimitees, avec pagination et overflow automatiques — un bloc trop long cree automatiquement une nouvelle page.',
  },
]

const CSS = `
  .faq-section { width: 100%; padding: 120px 0; background: var(--bg); position: relative; overflow: hidden; }
  .faq-inner { max-width: 1280px; margin: 0 auto; padding: 0 56px; display: grid; grid-template-columns: 1fr 2fr; gap: 100px; align-items: start; }
  .faq-sticky { position: sticky; top: 140px; }
  
  .faq-item {
    transition: all .25s cubic-bezier(.23,1,.32,1);
  }
  .faq-item:hover {
    border-color: var(--accent) !important;
  }
  .faq-item.active {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-color: var(--accent) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  }
  .dark .faq-item.active {
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  
  .faq-toggle {
    transition: all .25s cubic-bezier(.23,1,.32,1);
  }
  .faq-item:hover .faq-toggle {
    background: var(--accentS);
  }
  .faq-item.active .faq-toggle {
    background: linear-gradient(135deg,var(--accent) 0%,var(--electric) 100%);
    box-shadow: 0 4px 12px var(--electricGlow);
  }

  @media (max-width: 1023px) {
    .faq-inner { grid-template-columns: 1fr; gap: 40px; }
    .faq-sticky { position: static; }
  }
  @media (max-width: 767px) {
    .faq-section { padding: 80px 0; }
    .faq-inner { padding: 0 24px; gap: 32px; }
  }
  @media (max-width: 479px) {
    .faq-section { padding: 56px 0; }
    .faq-inner { padding: 0 18px; gap: 28px; }
    .faq-sticky h2 { font-size: clamp(24px, 6vw, 36px) !important; }
    .faq-sticky p { font-size: 14px; }
  }
`

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section id="faq" className="faq-section">
        {/* Ambient glow */}
        <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse,var(--electricGlow) 0%,transparent 70%)', pointerEvents: 'none', opacity: 0.3 }} />
        
        <div className="faq-inner">

          {/* Left */}
          <div className="faq-sticky">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'var(--accentS2)', color: 'var(--accent)', fontSize: 11, fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 22 }}>
              <Sparkles size={12} /> FAQ
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .92, color: 'var(--text)', marginBottom: 18 }}>
              Questions<br />
              <span style={{ fontFamily: 'var(--font-playfair,Georgia,serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text3)' }}>frequentes.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text3)', lineHeight: 1.7, maxWidth: 300 }}>
              Une question non listee ?{' '}
              <a href="mailto:contact@eetra.app" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>contact@eetra.app</a>
            </p>
          </div>

          {/* Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className={`faq-item${open === i ? ' active' : ''}`} style={{ borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <button onClick={() => setOpen(open === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '20px 24px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <span style={{ fontFamily: 'var(--font-dm-mono,monospace)', fontSize: 12, fontWeight: 700, color: open === i ? 'var(--accent)' : 'var(--text4)', marginTop: 3, flexShrink: 0, opacity: 0.7 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: open === i ? 'var(--text)' : 'var(--text2)', lineHeight: 1.45 }}>{faq.q}</span>
                  </div>
                  <div className="faq-toggle" style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {open === i ? <Minus size={14} color="#fff" /> : <Plus size={14} color="var(--text4)" />}
                  </div>
                </button>
                <div style={{ 
                  maxHeight: open === i ? '300px' : '0px', 
                  overflow: 'hidden', 
                  transition: 'max-height .35s cubic-bezier(.23,1,.32,1), padding .35s',
                  padding: open === i ? '0 24px 22px 56px' : '0 24px 0 56px'
                }}>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--text3)', margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
