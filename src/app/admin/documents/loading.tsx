import { Loading } from '@/components/ui/Loading'

export default function AdminDocumentsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="document"
      text="Chargement des documents..."
      showTips
    />
  )
}
