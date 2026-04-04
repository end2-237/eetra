import { Loading } from '@/components/ui/Loading'

export default function AdminPaymentsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="dashboard"
      text="Chargement des paiements..."
      showTips
    />
  )
}
