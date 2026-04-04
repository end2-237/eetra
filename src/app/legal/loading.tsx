import { Loading } from '@/components/ui/Loading'

export default function LegalLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement des informations legales..."
      showTips={false}
    />
  )
}
