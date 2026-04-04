import { Loading } from '@/components/ui/Loading'

export default function DocumentsLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="document"
      text="Chargement de vos documents..."
      showTips
    />
  )
}
