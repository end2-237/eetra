import { Loading } from '@/components/ui/Loading'

export default function CreateTemplateLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="document"
      text="Preparation du createur de templates..."
      showTips
    />
  )
}
