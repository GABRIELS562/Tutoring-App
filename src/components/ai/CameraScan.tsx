'use client'

import { useState, useRef } from 'react'
import { Camera, X, Loader2, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMotionSafe } from '@/hooks/useMotionSafe'
import { downscaleImage } from '@/lib/image/downscale'
import { useTranslations } from 'next-intl'

export default function CameraScan() {
  const { transition } = useMotionSafe()
  const t = useTranslations('cameraScan')
  const tCommon = useTranslations('common')
  const tQuiz = useTranslations('quiz')
  const [isOpen, setIsOpen] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCameraClick = () => {
    // Create file input and trigger
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Downscale before base64-encoding - a phone photo can be 4000px+
      // on the long edge and several MB; the model doesn't need more
      // than MAX_LONG_EDGE_PX to read a maths question off it, and a
      // smaller image means less request payload and fewer input tokens.
      const downscaled = await downscaleImage(file)

      // Convert to base64
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setImage(base64)
        setIsOpen(true)
        analyzeImage(base64)
      }
      reader.readAsDataURL(downscaled)
    }

    input.click()
  }

  const analyzeImage = async (base64Image: string) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'camera_scan',
          imageBase64: base64Image,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 429) {
          setError(data.message || t('hintLimitReached'))
        } else {
          setError(data.error || t('failedToAnalyze'))
        }
        return
      }

      setResponse(data.hint)
    } catch (err) {
      setError(t('failedToConnect'))
      console.error('Camera scan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setResponse(null)
    setError(null)
    handleCameraClick()
  }

  const handleClose = () => {
    setIsOpen(false)
    setImage(null)
    setResponse(null)
    setError(null)
  }

  return (
    <>
      {/* Floating Camera Button */}
      <button
        onClick={handleCameraClick}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: 'var(--accent-red)' }}
        title={t('scanQuestion')}
        aria-label={t('scanQuestionWithCamera')}
      >
        <Camera className="w-6 h-6 text-white" />
      </button>

      {/* Hidden file input for programmatic access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Full-screen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition({})}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'var(--bg)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-custom)' }}
            >
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                {t('askAngelo')}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--text)' }}
                aria-label={tCommon('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              <div className="max-w-lg mx-auto space-y-4">
                {/* Image Preview */}
                {image && (
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-custom)' }}>
                    <img
                      src={image}
                      alt={t('capturedQuestionAlt')}
                      className="w-full h-auto max-h-[40vh] object-contain"
                      style={{ background: 'var(--surface2)' }}
                    />
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div
                    className="rounded-xl p-6 text-center"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
                  >
                    <Loader2
                      className="w-8 h-8 mx-auto mb-3 animate-spin"
                      style={{ color: 'var(--accent-red-text)' }}
                    />
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {t('readingQuestion')}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted-custom)' }}>
                      {t('mayTakeSeconds')}
                    </p>
                  </div>
                )}

                {/* Error State */}
                {error && !loading && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'rgba(230, 57, 70, 0.1)', border: '1px solid var(--accent-red)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--accent-red-text)' }}>
                      {error}
                    </p>
                  </div>
                )}

                {/* Response */}
                {response && !loading && (
                  <div
                    className="rounded-xl p-4"
                    style={{ background: 'var(--surface)', border: '1px solid var(--teal)' }}
                  >
                    <div className="flex gap-3">
                      {/* Angelo Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
                        style={{ background: 'var(--accent-red)' }}
                      >
                        A
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--teal)' }}>
                          {tQuiz('angeloSays')}
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                          {response}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {(response || error) && !loading && (
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: 'var(--accent-red)' }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('askAnotherQuestion')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
