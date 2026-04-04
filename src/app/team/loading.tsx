import { Loading } from '@/components/ui/Loading'

export default function TeamLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement de votre equipe..."
      showTips
    />
  )
}
