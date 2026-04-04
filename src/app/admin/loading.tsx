import { Loading } from '@/components/ui/Loading'

export default function AdminLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="dashboard"
      text="Chargement du panneau admin..."
      showTips
    />
  )
}
