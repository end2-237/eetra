'use client'

import { useState, useCallback, useRef } from 'react'

type ToastType = 'default' | 'ok' | 'err'

interface Toast {
  message: string
  type: ToastType
  visible: boolean
}

export function useToast() {
  const [toast, setToast] = useState<Toast>({ message: '', type: 'default', visible: false })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, type: ToastType = 'default') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type, visible: true })
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3200)
  }, [])

  return { toast, showToast }
}
