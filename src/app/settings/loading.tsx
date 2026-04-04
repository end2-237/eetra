import { Loading } from '@/components/ui/Loading'

export default function SettingsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement des parametres..."
      showTips
    />
  )
}
