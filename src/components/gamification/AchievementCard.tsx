'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Download, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type AchievementType = 'topic_mastery' | 'streak' | 'leaderboard' | 'questions_milestone'

type AchievementCardProps = {
  type: AchievementType
  data: {
    studentName: string
    topicName?: string
    score?: number
    streakDays?: number
    rank?: number
    questionsAnswered?: number
  }
  isOpen: boolean
  onClose: () => void
}

export default function AchievementCard({ type, data, isOpen, onClose }: AchievementCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const getAchievementText = () => {
    switch (type) {
      case 'topic_mastery':
        return `I mastered Grade 11 ${data.topicName}!`
      case 'streak':
        return `I'm on a ${data.streakDays}-day study streak!`
      case 'leaderboard':
        return `I made it to the Top ${data.rank} leaderboard!`
      case 'questions_milestone':
        return `I've answered ${data.questionsAnswered} questions!`
      default:
        return 'Achievement Unlocked!'
    }
  }

  const getScoreText = () => {
    switch (type) {
      case 'topic_mastery':
        return `${data.score}% accuracy`
      case 'streak':
        return `${data.streakDays} days`
      case 'leaderboard':
        return `#${data.rank}`
      case 'questions_milestone':
        return `${data.questionsAnswered} questions`
      default:
        return ''
    }
  }

  const getWhatsAppText = () => {
    const baseText = getAchievementText()
    const score = getScoreText()
    return encodeURIComponent(
      `${baseText} ${score} Check it out: angelotutoring.co.za`
    )
  }

  // Generate shareable image using Canvas API
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (Instagram story friendly)
    canvas.width = 540
    canvas.height = 540

    // Background
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border accent
    ctx.strokeStyle = '#e63946'
    ctx.lineWidth = 8
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

    // Logo "AT" top left
    ctx.fillStyle = '#e63946'
    ctx.font = 'bold 32px system-ui, -apple-system, sans-serif'
    ctx.fillText('AT', 32, 52)

    // Achievement badge circle
    const centerX = canvas.width / 2
    const badgeY = 180

    ctx.beginPath()
    ctx.arc(centerX, badgeY, 60, 0, Math.PI * 2)
    ctx.fillStyle = '#e63946'
    ctx.fill()

    // Badge icon (trophy emoji equivalent)
    ctx.fillStyle = '#ffffff'
    ctx.font = '48px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('🏆', centerX, badgeY + 18)

    // Achievement text
    ctx.fillStyle = '#e6edf3'
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'

    // Word wrap the achievement text
    const text = getAchievementText()
    const maxWidth = 460
    const words = text.split(' ')
    let line = ''
    let y = 290
    const lineHeight = 36

    for (const word of words) {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line.trim(), centerX, y)
        line = word + ' '
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line.trim(), centerX, y)

    // Score/stat
    ctx.fillStyle = '#2dd4bf'
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif'
    ctx.fillText(getScoreText(), centerX, y + 70)

    // Student name
    ctx.fillStyle = '#7d8590'
    ctx.font = '20px system-ui, -apple-system, sans-serif'
    ctx.fillText(data.studentName, centerX, y + 120)

    // Footer
    ctx.fillStyle = '#7d8590'
    ctx.font = '16px system-ui, -apple-system, sans-serif'
    ctx.fillText('Angelo Tutoring · angelotutoring.co.za', centerX, canvas.height - 32)

    // Convert to image URL
    setImageUrl(canvas.toDataURL('image/png'))
  }, [isOpen, type, data])

  const handleShare = () => {
    const text = getWhatsAppText()
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleDownload = () => {
    if (!imageUrl) return

    const link = document.createElement('a')
    link.download = `angelo-achievement-${Date.now()}.png`
    link.href = imageUrl
    link.click()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-xl overflow-hidden"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-custom)' }}
            >
              <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                Achievement Unlocked! 🎉
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'var(--muted-custom)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Image Preview */}
            {imageUrl && (
              <div className="p-4">
                <img
                  src={imageUrl}
                  alt="Achievement"
                  className="w-full rounded-lg"
                  style={{ border: '1px solid var(--border-custom)' }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 pt-0 space-y-3">
              {/* WhatsApp Share */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#25D366' }}
              >
                <MessageCircle className="w-5 h-5" />
                Share to WhatsApp
              </button>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{
                  background: 'var(--surface2)',
                  color: 'var(--text)',
                  border: '1px solid var(--border-custom)',
                }}
              >
                <Download className="w-5 h-5" />
                Save image
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
