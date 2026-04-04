import { Loading } from '@/components/ui/Loading'

export default function VerifyDocumentLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="auth"
      text="Verification du document..."
      showTips
    />
  )
}
