import { useEffect, useState } from 'react'

interface UseQROptions {
  docId: string
  title?: string
  entityName?: string
}

export function useQR({ docId, title, entityName }: UseQROptions): string {
  const [dataUrl, setDataUrl] = useState('')

  useEffect(() => {
    const text = `https://eetra.app/verify/${docId}`

    import('qrcode').then(QRCode => {
      QRCode.toDataURL(text, {
        width: 80,
        margin: 1,
        color: { dark: '#0D1117', light: '#FFFFFF' },
      }).then(url => setDataUrl(url)).catch(() => {})
    }).catch(() => {
      // qrcode not installed — generate a placeholder SVG
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
        <rect width="80" height="80" fill="white"/>
        <rect x="5" y="5" width="30" height="30" fill="none" stroke="#0D1117" stroke-width="3"/>
        <rect x="12" y="12" width="16" height="16" fill="#0D1117"/>
        <rect x="45" y="5" width="30" height="30" fill="none" stroke="#0D1117" stroke-width="3"/>
        <rect x="52" y="12" width="16" height="16" fill="#0D1117"/>
        <rect x="5" y="45" width="30" height="30" fill="none" stroke="#0D1117" stroke-width="3"/>
        <rect x="12" y="52" width="16" height="16" fill="#0D1117"/>
        <rect x="45" y="45" width="8" height="8" fill="#0D1117"/>
        <rect x="57" y="45" width="8" height="8" fill="#0D1117"/>
        <rect x="45" y="57" width="8" height="8" fill="#0D1117"/>
        <rect x="57" y="57" width="8" height="8" fill="#0D1117"/>
      </svg>`
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      setDataUrl(URL.createObjectURL(blob))
    })
  }, [docId])

  return dataUrl
}