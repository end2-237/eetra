import { Loading } from '@/components/ui/Loading'

export default function DesignsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement de vos designs..."
      showTips
    />
  )
}
