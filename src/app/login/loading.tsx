import { Loading } from '@/components/ui/Loading'

export default function LoginLoading() {
  return (
    <Loading 
      size="fullscreen" 
      context="auth"
      text="Preparation de la connexion..."
      showTips
    />
  )
}
