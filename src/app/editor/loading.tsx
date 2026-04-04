import { Loading } from '@/components/ui/Loading'

export default function EditorLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="document"
      text="Preparation de l'editeur..."
      showTips
    />
  )
}
