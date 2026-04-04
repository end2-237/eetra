import { Loading } from '@/components/ui/Loading'

export default function AdminSettingsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement des parametres..."
      showTips
    />
  )
}
