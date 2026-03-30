'use client'

import { useState, useRef } from 'react'
import { Upload, Sparkles, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import type { CoverStyle, CoverLayout } from '@/contexts/CustomTemplateContext'

interface GenerateCoverDialogProps {
  isOpen: boolean
  onClose: () => void
  currentCoverTitle: string
  onApply: (style: CoverStyle, newTitle?: string) => void
}

export function GenerateCoverDialog({
  isOpen,
  onClose,
  currentCoverTitle,
  onApply,
}: GenerateCoverDialogProps) {
  const { toast, showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'upload' | 'generating' | 'review'>('upload')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [generatedStyle, setGeneratedStyle] = useState<{
    layout: CoverLayout
    accentColor: string
    suggestedTitle: string
    rationale: string
  } | null>(null)
  const [acceptedTitle, setAcceptedTitle] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Veuillez sélectionner une image (JPG, PNG, WebP)', 'err')
      return
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image trop grande (max 5MB)', 'err')
      return
    }

    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          // Max width/height of 1024px for compression
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > 1024) {
              height = Math.round((height * 1024) / width)
              width = 1024
            }
          } else {
            if (height > 1024) {
              width = Math.round((width * 1024) / height)
              height = 1024
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            'image/jpeg',
            0.8 // 80% quality for JPEG compression
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleGenerate = async () => {
    if (!selectedImage) {
      showToast('Sélectionnez une image', 'err')
      return
    }

    if (description.trim().length < 10) {
      showToast('La description doit contenir au moins 10 caractères', 'err')
      return
    }

    setStep('generating')

    try {
      // Compress image
      const compressedBlob = await compressImage(selectedImage)

      // Prepare FormData
      const formData = new FormData()
      formData.append('image', compressedBlob, 'inspiration.jpg')
      formData.append('description', description.trim())
      formData.append('currentTitle', currentCoverTitle)

      // Call API
      const response = await fetch('/api/ai/generate-cover', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        const message = error.error || 'Erreur lors de la génération'
        if (response.status === 403) {
          showToast('Cette fonctionnalité est réservée aux utilisateurs PRO', 'err')
        } else if (response.status === 429) {
          showToast('Limite de requêtes atteinte. Réessayez dans une heure.', 'err')
        } else {
          showToast(message, 'err')
        }
        setStep('upload')
        return
      }

      const data = await response.json()
      setGeneratedStyle({
        layout: data.layout,
        accentColor: data.accentColor,
        suggestedTitle: data.suggestedTitle,
        rationale: data.rationale,
      })
      setAcceptedTitle(currentCoverTitle === data.suggestedTitle)
      setStep('review')
    } catch (err) {
      console.error('Error generating cover:', err)
      showToast('Erreur réseau. Réessayez.', 'err')
      setStep('upload')
    }
  }

  const handleApply = () => {
    if (!generatedStyle) return

    const newStyle: CoverStyle = {
      layout: generatedStyle.layout,
      accentColor: generatedStyle.accentColor,
      showLogo: true,
      showQr: true,
      showGrid: false,
      backgroundStyle: 'solid',
      titleSize: 'lg',
    }

    onApply(newStyle, acceptedTitle ? generatedStyle.suggestedTitle : undefined)
    handleClose()
  }

  const handleClose = () => {
    setStep('upload')
    setSelectedImage(null)
    setImagePreview(null)
    setDescription('')
    setGeneratedStyle(null)
    setAcceptedTitle(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" />
              <h2 className="text-xl font-semibold">Générer une couverture avec l'IA</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'upload' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Image d'inspiration
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="space-y-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded mx-auto"
                        />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {selectedImage?.name}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 underline"
                        >
                          Changer l'image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={32} className="mx-auto text-gray-400" />
                        <p className="font-medium">Glissez une image ou cliquez</p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG, WebP • Max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description du document
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le style et le contexte du document que vous souhaitez créer..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length} / 500 caractères
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleClose}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!selectedImage || description.trim().length < 10}
                    className="flex-1"
                  >
                    <Sparkles size={16} className="mr-2" />
                    Générer le style
                  </Button>
                </div>
              </div>
            )}

            {step === 'generating' && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin">
                  <Loader2 size={40} className="text-blue-600" />
                </div>
                <p className="text-lg font-medium">Génération en cours...</p>
                <p className="text-sm text-gray-500">
                  Analyse de l'image et création du style
                </p>
              </div>
            )}

            {step === 'review' && generatedStyle && (
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <p className="text-sm">{generatedStyle.rationale}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Layout</p>
                    <div className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded text-sm font-mono">
                      {generatedStyle.layout}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Couleur accent</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded border border-gray-300"
                        style={{ backgroundColor: generatedStyle.accentColor }}
                      />
                      <code className="text-sm">{generatedStyle.accentColor}</code>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={acceptedTitle}
                      onChange={(e) => setAcceptedTitle(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">
                      Utiliser le titre suggéré:{' '}
                      <strong>{generatedStyle.suggestedTitle}</strong>
                    </span>
                  </label>
                  {!acceptedTitle && (
                    <p className="text-xs text-gray-500 mt-2">
                      Le titre actuel "{currentCoverTitle}" sera conservé
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Réessayer
                  </Button>
                  <Button onClick={handleApply} className="flex-1">
                    <Check size={16} className="mr-2" />
                    Appliquer le style
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
