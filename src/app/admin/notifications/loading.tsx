import { Loading } from '@/components/ui/Loading'

export default function AdminNotificationsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement des notifications..."
      showTips
    />
  )
}
