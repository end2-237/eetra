import { Loading } from '@/components/ui/Loading'

export default function ViewDocumentLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="document"
      text="Ouverture du document..."
      showTips
    />
  )
}
