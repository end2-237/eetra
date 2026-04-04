import { Loading } from '@/components/ui/Loading'

export default function TemplatesLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement des templates..."
      showTips
    />
  )
}
