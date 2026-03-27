import type { Metadata } from 'next'
import {
  Bricolage_Grotesque, Playfair_Display, DM_Serif_Display, Syne,
  Space_Grotesk, Cormorant_Garamond, Libre_Caslon_Text, Source_Serif_4,
  DM_Sans, Lato, DM_Mono,
} from 'next/font/google'
import './globals.css'
import './mobile.css'

import { ThemeProvider }          from '@/contexts/ThemeContext'
import { ProfileProvider }        from '@/contexts/ProfileContext'
import { PlanProvider }           from '@/contexts/PlanContext'
import { LibraryProvider }        from '@/contexts/LibraryContext'
import { HistoryProvider }        from '@/contexts/HistoryContext'
import { TeamProvider }           from '@/contexts/TeamContext'
import { NotificationProvider }   from '@/contexts/NotificationContext'
import { CustomTemplateProvider } from '@/contexts/CustomTemplateContext'
import { RealtimeProvider }       from '@/contexts/RealtimeContext'
import { NextAuthProvider }       from '@/components/providers/NextAuthProvider'
import { FloatingHelpChat }       from '@/components/ui/FloatingHelpChat'

const bricolage    = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage',     display: 'swap' })
const playfair     = Playfair_Display   ({ subsets: ['latin'], variable: '--font-playfair',      display: 'swap' })
const dmSerif      = DM_Serif_Display   ({ weight: '400',      subsets: ['latin'], variable: '--font-dm-serif',     display: 'swap' })
const syne         = Syne               ({ subsets: ['latin'], variable: '--font-syne',          display: 'swap' })
const spaceGrotesk = Space_Grotesk      ({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' })
const cormorant    = Cormorant_Garamond ({ weight: ['400','600','700'], subsets: ['latin'], variable: '--font-cormorant', display: 'swap' })
const caslonText   = Libre_Caslon_Text  ({ weight: ['400','700'],      subsets: ['latin'], variable: '--font-caslon',    display: 'swap' })
const sourceSerif  = Source_Serif_4     ({ subsets: ['latin'], variable: '--font-source-serif',  display: 'swap' })
const dmSans       = DM_Sans            ({ subsets: ['latin'], variable: '--font-dm-sans',       display: 'swap' })
const lato         = Lato               ({ weight: ['400','700'],      subsets: ['latin'], variable: '--font-lato',     display: 'swap' })
const dmMono       = DM_Mono            ({ weight: ['400','500'],      subsets: ['latin'], variable: '--font-dm-mono',  display: 'swap' })

export const metadata: Metadata = {
  title:       'EETRA — Documents Professionnels',
  description: "Plateforme de création de documents professionnels pour l'Afrique de l'Ouest",
  viewport:    'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor:  '#1B4FD8',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    bricolage.variable, playfair.variable, dmSerif.variable, syne.variable,
    spaceGrotesk.variable, cormorant.variable, caslonText.variable,
    sourceSerif.variable, dmSans.variable, lato.variable, dmMono.variable,
  ].join(' ')

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={fontVars}>
        <NextAuthProvider>
          <ThemeProvider>
            <ProfileProvider>
              <PlanProvider>
                <NotificationProvider>
                  <CustomTemplateProvider>
                    <LibraryProvider>
                      <HistoryProvider>
                        <TeamProvider>
                          <RealtimeProvider>
                            {children}
                            <FloatingHelpChat />
                          </RealtimeProvider>
                        </TeamProvider>
                      </HistoryProvider>
                    </LibraryProvider>
                  </CustomTemplateProvider>
                </NotificationProvider>
              </PlanProvider>
            </ProfileProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
