import { Loading } from '@/components/ui/Loading'

export default function HistoryLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="document"
      text="Chargement de votre historique..."
      showTips
    />
  )
}
