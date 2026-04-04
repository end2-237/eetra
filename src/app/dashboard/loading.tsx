import { Loading } from '@/components/ui/Loading'

export default function DashboardLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="dashboard"
      text="Chargement du tableau de bord..."
      showTips
    />
  )
}
