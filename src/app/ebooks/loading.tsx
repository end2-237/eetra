import { Loading } from '@/components/ui/Loading'

export default function EbooksLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="general"
      text="Chargement des ebooks..."
      showTips
    />
  )
}
