import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProfileProvider } from '@/contexts/ProfileContext'
import { HistoryProvider } from '@/contexts/HistoryContext'
import { TeamProvider } from '@/contexts/TeamContext'
import { PlanProvider } from '@/contexts/PlanContext'

export const metadata: Metadata = {
  title: 'EETRA — Plateforme Document d\'Entreprise',
  description: 'Créez des documents professionnels de grade exécutif — Business Plans, Audits, Appels d\'Offres — avec votre charte graphique.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ProfileProvider>
            <PlanProvider>
              <HistoryProvider>
                <TeamProvider>
                  {children}
                </TeamProvider>
              </HistoryProvider>
            </PlanProvider>
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
