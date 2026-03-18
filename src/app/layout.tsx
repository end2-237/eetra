import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { HistoryProvider } from '@/contexts/HistoryContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { PlanProvider } from '@/contexts/PlanContext'
import { LibraryProvider } from '@/contexts/LibraryContext'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://eetra.app'

export const metadata: Metadata = {
  title: 'EETRA — Plateforme Document d\'Entreprise',
  description: 'Créez des documents professionnels de grade exécutif — Business Plans, Audits, Appels d\'Offres — avec votre charte graphique. Exportez en PDF haute qualité.',
  keywords: ['business plan', 'document professionnel', 'OHADA', 'Afrique', 'PDF', 'audit', 'appel offres'],
  authors: [{ name: 'EETRA' }],
  creator: 'EETRA',
  publisher: 'EETRA',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  metadataBase: new URL(APP_URL),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: APP_URL,
    siteName: 'EETRA',
    title: 'EETRA — Documents Professionnels',
    description: 'Créez Business Plans, Audits, Contrats avec votre charte corporate. Export PDF haute qualité.',
    images: [
      {
        url: `${APP_URL}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: 'EETRA — Plateforme Document d\'Entreprise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EETRA — Documents Professionnels',
    description: 'Créez Business Plans, Audits, Contrats avec votre charte corporate.',
    images: [`${APP_URL}/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    // Security meta tags
    'X-UA-Compatible': 'IE=edge',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Prevent clickjacking via meta (belt-and-suspenders with CSP header) */}
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="theme-color" content="#1B4FD8" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EETRA" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <ProfileProvider>
            <PlanProvider>
              <HistoryProvider>
                <TeamProvider>
                  <LibraryProvider>
                    {children}
                  </LibraryProvider>
                </TeamProvider>
              </HistoryProvider>
            </PlanProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
