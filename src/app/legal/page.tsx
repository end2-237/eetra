'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const section = (title: string, children: React.ReactNode) => (
  <section className="mb-10">
    <h2 className="text-[20px] font-black tracking-tight mb-4" style={{ color: 'var(--text)' }}>{title}</h2>
    {children}
  </section>
)

const p = (text: string) => (
  <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--text3)' }}>{text}</p>
)

export default function LegalPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 h-14 border-b flex items-center justify-between px-8"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--text4)' }}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <FileText size={13} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-[16px] font-black tracking-tight" style={{ color: 'var(--text)' }}>EETRA</span>
            <span className="text-[12px]" style={{ color: 'var(--text4)' }}>/ Mentions Légales</span>
          </Link>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-[760px] mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accentS)' }}>
            <Shield size={18} color="var(--accent)" />
          </div>
          <div>
            <h1 className="text-[28px] font-black tracking-tight" style={{ color: 'var(--text)' }}>
              Mentions Légales & Politique de Confidentialité
            </h1>
            <p className="text-[13px]" style={{ color: 'var(--text4)' }}>Mise à jour : Mars 2026 · EETRA Document Platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 rounded-xl border p-1" style={{ background: 'var(--bg2)', borderColor: 'var(--border)', maxWidth: 360 }}>
          {['Conditions d\'Utilisation', 'Confidentialité'].map((t, i) => (
            <a key={t} href={i === 1 ? '#privacy' : '#cgu'}
              className="flex-1 py-2 rounded-lg text-[13px] font-bold text-center transition-all"
              style={{ background: 'var(--surface)', color: 'var(--text)', textDecoration: 'none', display: 'block' }}
            >
              {t}
            </a>
          ))}
        </div>

        {/* CGU */}
        <div id="cgu" style={{ scrollMarginTop: 80 }}>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-6"
            style={{ background: 'var(--accentS2)', color: 'var(--accent)' }}>
            Conditions Générales d'Utilisation
          </div>

          {section('1. Objet', <>
            {p("Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme EETRA, accessible à l'adresse eetra.app et via ses applications associées. En accédant à la plateforme, vous acceptez sans réserve les présentes CGU.")}
            {p("EETRA est une plateforme B2B de création de documents professionnels (Business Plans, Audits, Appels d'Offres, Contrats) destinée aux entreprises, consultants et professionnels d'Afrique francophone.")}
          </>)}

          {section('2. Accès et Compte', <>
            {p("L'accès aux fonctionnalités de la plateforme nécessite la création d'un compte. Vous vous engagez à fournir des informations exactes et à maintenir la confidentialité de vos identifiants de connexion.")}
            {p("EETRA se réserve le droit de suspendre ou supprimer tout compte faisant l'objet d'une utilisation frauduleuse, abusive ou contraire aux présentes CGU.")}
          </>)}

          {section('3. Plans et Facturation', <>
            {p("EETRA propose plusieurs plans tarifaires (Starter, Pro, Business) dont les caractéristiques sont détaillées sur la page Tarifs. Les prix sont exprimés en Francs CFA (FCFA) hors taxes.")}
            {p("Le règlement s'effectue par Orange Money, MTN Mobile Money, Wave ou virement bancaire. Toute période commencée est due dans son intégralité. Les abonnements sont renouvelés automatiquement sauf résiliation 30 jours avant échéance.")}
          </>)}

          {section('4. Propriété Intellectuelle', <>
            {p("L'utilisateur conserve la propriété des documents créés via la plateforme. EETRA dispose d'une licence non exclusive pour stocker et traiter ces documents dans le seul but de fournir le service.")}
            {p("Les marques, logos, templates et interfaces d'EETRA sont la propriété exclusive d'EETRA et ne peuvent être reproduits sans autorisation écrite préalable.")}
          </>)}

          {section('5. Limitation de Responsabilité', <>
            {p("EETRA met tout en œuvre pour assurer la disponibilité et la fiabilité du service, sans obligation de résultat. La plateforme est fournie 'en l'état' et EETRA ne saurait être tenue responsable de pertes de données, d'interruptions de service ou d'inexactitudes dans les documents générés par l'IA.")}
            {p("Il appartient à l'utilisateur de vérifier les documents avant signature ou publication. EETRA n'est pas un cabinet juridique ou financier et ses templates n'ont pas valeur de conseil professionnel.")}
          </>)}

          {section('6. Droit Applicable', <>
            {p("Les présentes CGU sont régies par le droit applicable dans les pays membres de l'OHADA et, à défaut, par le droit ivoirien. Tout litige relatif à leur interprétation ou exécution sera soumis aux juridictions compétentes d'Abidjan, Côte d'Ivoire.")}
          </>)}
        </div>

        <div className="my-10 h-px" style={{ background: 'var(--border)' }} />

        {/* Privacy */}
        <div id="privacy" style={{ scrollMarginTop: 80 }}>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-6"
            style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}>
            Politique de Confidentialité
          </div>

          {section('7. Données Collectées', <>
            {p("Dans le cadre de l'utilisation d'EETRA, nous collectons les données suivantes : informations de compte (nom, email, entreprise), données de profil entreprise (logo, couleur, coordonnées), contenu des documents créés, et données d'usage (logs de connexion, exports réalisés).")}
            {p("Les contenus des documents sont stockés localement dans votre navigateur (localStorage) et ne sont pas transmis à nos serveurs, sauf en cas d'utilisation explicite des fonctionnalités d'IA ou de partage de liens.")}
          </>)}

          {section('8. Utilisation des Données', <>
            {p("Vos données sont utilisées pour : la fourniture et l'amélioration du service, l'authentification et la sécurité du compte, la personnalisation de l'expérience utilisateur, et la facturation.")}
            {p("EETRA ne vend jamais vos données à des tiers. Les informations de profil et documents ne sont jamais partagés ou exploités à des fins commerciales tierces.")}
          </>)}

          {section('9. Cookies et Stockage Local', <>
            {p("EETRA utilise le stockage local du navigateur (localStorage) pour sauvegarder vos préférences, votre profil entreprise et vos documents en cours. Ces données restent sur votre appareil et peuvent être effacées depuis les paramètres de votre navigateur.")}
            {p("Aucun cookie de tracking ou publicitaire n'est utilisé sur la plateforme.")}
          </>)}

          {section('10. Droits des Utilisateurs', <>
            {p("Conformément au RGPD et aux législations africaines applicables en matière de protection des données, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données.")}
            {p("Pour exercer ces droits ou pour toute question relative à la protection de vos données, contactez-nous à : privacy@eetra.app")}
          </>)}

          {section('11. Sécurité', <>
            {p("EETRA met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction. Les communications entre votre navigateur et nos serveurs sont chiffrées via HTTPS/TLS.")}
          </>)}
        </div>

        {/* Contact block */}
        <div className="rounded-2xl border p-6 mt-10" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-[13px] font-bold mb-2" style={{ color: 'var(--text)' }}>Nous contacter</div>
          <p className="text-[13px]" style={{ color: 'var(--text3)' }}>
            EETRA · contact@eetra.app · Abidjan, Côte d'Ivoire<br />
            Pour toute question légale ou relative à vos données : legal@eetra.app
          </p>
        </div>
      </div>
    </div>
  )
}
