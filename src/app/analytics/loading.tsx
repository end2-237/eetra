import { Loading } from '@/components/ui/Loading'

export default function AnalyticsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="dashboard"
      text="Calcul de vos statistiques..."
      showTips
    />
  )
}
