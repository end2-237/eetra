'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'Le PDF exporté ressemble-t-il exactement à l\'aperçu ?',
    a: 'Oui. EETRA capture directement les éléments rendus dans le navigateur (fonts chargées, CSS variables résolues, images présentes) via html2canvas + jsPDF — pas de re-rendu serveur qui tronque ou dépixelise. Ce que vous voyez est ce que vous obtenez, à 2× de résolution pour l\'impression.',
  },
  {
    q: 'Puis-je exporter mes documents au format Word ?',
    a: 'Absolument. L\'export .docx génère un fichier Microsoft Word structuré avec entêtes stylisés, tableaux formatés (couleur de marque), clauses en italique, zones de signature, numérotation de pages et en-tête/pied de page corporate. Disponible sur tous les plans.',
  },
  {
    q: 'Mes données sont-elles stockées sur vos serveurs ?',
    a: 'Non. Vos documents, votre profil entreprise et votre bibliothèque sont stockés dans le localStorage de votre navigateur. Rien ne transite vers nos serveurs sauf les requêtes d\'IA (qui n\'incluent que le titre et le nom de l\'entité, jamais le contenu complet du document). Vous gardez un contrôle total.',
  },
  {
    q: 'Le cadre juridique OHADA est-il vraiment intégré ?',
    a: 'Oui. Les templates Contrat incluent des clauses OHADA (confidentialité, propriété intellectuelle, juridiction CCJA), le template Devis référence la TVA locale (18%) et les conditions UEMOA, et le template Appel d\'Offre suit la structure des dossiers de soumission des marchés publics de la sous-région.',
  },
  {
    q: 'Comment fonctionnent les paiements en FCFA ?',
    a: 'Nous acceptons Orange Money (CI, SN, ML, BF, CM), MTN Mobile Money (CI, GH, UG, RW), Wave (CI, SN, ML, BF) et virement bancaire UEMOA. Toutes les transactions sont traitées en Francs CFA. Pour les plans annuels, la réduction de 20% est appliquée automatiquement.',
  },
  {
    q: 'Puis-je utiliser mes propres polices et couleurs ?',
    a: 'Oui. Vous pouvez saisir n\'importe quelle couleur hexadécimale comme couleur d\'accent corporate, et choisir parmi 6 polices de titre et 5 polices de corps (toutes chargées depuis Google Fonts). La page de couverture, l\'en-tête et le pied de page reflètent automatiquement votre charte.',
  },
  {
    q: 'Y a-t-il une limite au nombre de pages par document ?',
    a: 'Plan Starter : 2 pages max. Plans Pro, Business et Enterprise : pages illimitées, avec pagination et overflow automatiques (un bloc trop long crée automatiquement une nouvelle page). La barre de progression dans l\'éditeur vous indique en temps réel le taux de remplissage de chaque page.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" style={{ width: '100%', padding: '100px 0', background: 'var(--bg2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, alignItems: 'start' }}>

        {/* Left: sticky label */}
        <div style={{ position: 'sticky', top: 120 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 99,
            background: 'var(--accentS2)', color: 'var(--accent)',
            fontSize: 10, fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            FAQ
          </div>
          <h2 style={{
            fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900,
            letterSpacing: '-.04em', lineHeight: .95,
            color: 'var(--text)', marginBottom: 16,
          }}>
            Questions<br />
            <span style={{ fontFamily: 'var(--font-playfair, Georgia, serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--text3)' }}>
              fréquentes.
            </span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text3)', lineHeight: 1.6, maxWidth: 280 }}>
            Une question non listée ? Écrivez-nous à{' '}
            <a href="mailto:contact@eetra.app" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact@eetra.app</a>
          </p>
        </div>

        {/* Right: accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQS.map((faq, i) => (
            <div
              key={i}
              style={{
                borderRadius: 14,
                border: `1px solid ${open === i ? 'var(--accent)' : 'var(--border)'}`,
                background: open === i ? 'var(--surface)' : 'transparent',
                overflow: 'hidden',
                transition: 'all .2s',
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16,
                  padding: '20px 24px', background: 'transparent', border: 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <span style={{
                    fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                    color: open === i ? 'var(--accent)' : 'var(--text4)',
                    marginTop: 2, flexShrink: 0, letterSpacing: '.05em',
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: open === i ? 'var(--text)' : 'var(--text2)',
                    lineHeight: 1.4,
                  }}>
                    {faq.q}
                  </span>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: open === i ? 'var(--accentS)' : 'var(--bg3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s',
                }}>
                  {open === i
                    ? <Minus size={13} color="var(--accent)" />
                    : <Plus size={13} color="var(--text4)" />
                  }
                </div>
              </button>

              {open === i && (
                <div style={{ padding: '0 24px 20px 56px' }}>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text3)', margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}