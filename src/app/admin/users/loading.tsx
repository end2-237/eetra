import { Loading } from '@/components/ui/Loading'

export default function AdminUsersLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="dashboard"
      text="Chargement des utilisateurs..."
      showTips
    />
  )
}
