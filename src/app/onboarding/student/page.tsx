import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

const StudentChatConfig = dynamic(
  () => import('@/components/onboarding/StudentChatConfig'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Configurer mon rapport — EETRA',
  description: 'Configure ton rapport de stage ou mémoire en moins de 3 minutes.',
}

export default function StudentOnboardingPage() {
  return <StudentChatConfig />
}