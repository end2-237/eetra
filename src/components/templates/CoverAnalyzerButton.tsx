'use client'

import { useState, useRef } from 'react'
import { Sparkles, Upload, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import type { CoverStyle } from '@/contexts/CustomTemplateContext'

interface CoverAnalyzerButtonProps {
  onApplyCover: (style: CoverStyle, suggestedTitle?: string) => void
  currentTitle: string
  isPro: boolean
}

export function CoverAnalyzerButton({ onApplyCover, currentTitle, isPro }: CoverAnalyzerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()

  if (!isPro) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('L\'image doit être inférieure à 5MB', 'err')
        return
      }
      setSelectedImage(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage || !description.trim()) {
      showToast('Veuillez fournir une image et une description', 'err')
      return
    }

    setIsAnalyzing(true)
    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string
          const base64Data = base64.split(',')[1]

          // Call API to analyze image using AI
          const response = await fetch('/api/ai/analyze-cover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              description: description.trim(),
              currentTitle,
            }),
          })

          if (!response.ok) {
            const error = await response.json()
            showToast(error.error || 'Erreur lors de l\'analyse', 'err')
            setIsAnalyzing(false)
            return
          }

          const coverData = await response.json()

          // Validate and apply
          if (!coverData.layout || !coverData.accentColor) {
            showToast('Données IA incomplètes', 'err')
            setIsAnalyzing(false)
            return
          }

          const newStyle: CoverStyle = {
            layout: coverData.layout || 'classic',
            accentColor: coverData.accentColor || '#1B4FD8',
            showLogo: coverData.showLogo ?? true,
            showQr: coverData.showQr ?? true,
            showGrid: false,
            backgroundStyle: 'solid',
            titleSize: coverData.titleSize || 'lg',
            coverBlocks: [],
          }

          onApplyCover(newStyle, coverData.suggestedTitle)
          showToast('Style de couverture appliqué!', 'ok')
          setIsOpen(false)
          setSelectedImage(null)
          setDescription('')
        } catch (err) {
          console.error('[v0] Analysis error:', err)
          showToast('Erreur lors de l\'analyse', 'err')
        } finally {
          setIsAnalyzing(false)
        }
      }
      reader.readAsDataURL(selectedImage)
    } catch (err) {
      console.error('[v0] Image reading error:', err)
      showToast('Erreur lors de la lecture du fichier', 'err')
      setIsAnalyzing(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer border transition-all hover:opacity-80"
        style={{ borderColor: '#F59E0B40', background: '#F59E0B10', color: '#F59E0B' }}
        title="Générer le style avec l'IA (PRO)"
      >
        <Sparkles size={10} />
        IA
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" style={{ color: 'var(--text)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Générer le style avec l&apos;IA</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">Image d&apos;inspiration</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                {selectedImage ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1 text-sm">{selectedImage.name}</div>
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <Upload size={24} style={{ color: 'var(--text4)' }} />
                    <span className="text-sm font-medium">Cliquez pour uploader</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">Description du document</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Rapport trimestriel d'une entreprise de technologie..."
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--border)', '--tw-ring-color': '#F59E0B' } as any}
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg font-medium transition hover:bg-gray-50"
                  style={{ borderColor: 'var(--border)' }}
                >
                  Annuler
                </button>
                <Button
                  onClick={analyzeImage}
                  disabled={isAnalyzing || !selectedImage || !description.trim()}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Générer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
