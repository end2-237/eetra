import { Loading } from '@/components/ui/Loading'

export default function OnboardingLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Preparation de votre experience..."
      showTips
    />
  )
}
