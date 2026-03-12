'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'EETRA fonctionne-t-il en mode hors ligne ?', a: "EETRA nécessite une connexion internet pour les fonctionnalités IA. L'éditeur de base fonctionne hors ligne pour les utilisateurs Pro." },
  { q: 'Puis-je utiliser EETRA en mode clair et sombre ?', a: 'Oui, EETRA supporte les deux thèmes. Utilisez l\'icône de basculement dans la navigation ou dans la barre latérale de l\'éditeur.' },
  { q: 'Comment payer en FCFA ?', a: 'Nous acceptons les paiements via Orange Money, MTN Mobile Money, Wave et virement bancaire. Toutes les transactions sont traitées en FCFA.' },
  { q: 'Puis-je retirer le filigrane EETRA ?', a: "Oui, cette option est disponible à partir du plan Pro. Vous pouvez l'activer depuis les paramètres de votre profil d'entreprise lors de l'onboarding ou à tout moment dans les réglages." },
  { q: "Y a-t-il une limite de pages par document ?", a: "Le plan Starter est limité à 2 pages par document. Les plans Pro, Business et Enterprise permettent un nombre illimité de pages." },
  { q: 'Les données de mon entreprise sont-elles sécurisées ?', a: 'Oui. EETRA est conforme RGPD. Vos documents et données sont chiffrés en transit et au repos. Nous ne partageons jamais vos données avec des tiers.' },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="faq" className="py-20 px-12 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg2)' }}>
      <div className="max-w-[640px] mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4"
            style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
            FAQ
          </div>
          <h2 className="text-[36px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
            Questions fréquentes
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left gap-3 cursor-pointer"
                style={{ background: 'var(--surface)', border: 'none' }}
              >
                <span className="text-[13px] font-600" style={{ color: 'var(--text)', fontWeight: 600 }}>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{ color: 'var(--text3)', transform: open === i ? 'rotate(180deg)' : 'none' }}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-[13px] leading-relaxed" style={{ color: 'var(--text3)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
