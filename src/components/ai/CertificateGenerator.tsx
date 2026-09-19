'use client'

import { useRef, useState, useEffect } from 'react'
import { Download, Share2, Loader2, Check } from 'lucide-react'

interface CertificateGeneratorProps {
  studentName: string
  certificateId: string
  avgPromptScore: number
  modulesCompleted: number
  issuedAt: string
}

export default function CertificateGenerator({
  studentName,
  certificateId,
  avgPromptScore,
  modulesCompleted,
  issuedAt,
}: CertificateGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Generate QR code on mount
  useEffect(() => {
    const generateQR = async () => {
      try {
        // Dynamic import for QR code generation
        const QRCode = (await import('qrcode')).default
        // Points at the human-readable verify page (src/app/verify/[certificateId]/page.tsx),
        // not the JSON API route - someone scanning this QR code should
        // see a styled "valid certificate" card, not raw JSON.
        const verifyUrl = `${window.location.origin}/verify/${certificateId}`
        const dataUrl = await QRCode.toDataURL(verifyUrl, {
          width: 120,
          margin: 1,
          color: {
            dark: '#0d1117',
            light: '#ffffff',
          },
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error('QR generation error:', error)
      }
    }

    generateQR()
  }, [certificateId])

  const generateCertificate = async () => {
    const canvas = canvasRef.current
    if (!canvas || !qrDataUrl) return

    setIsGenerating(true)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Certificate dimensions (A4 landscape-ish)
    canvas.width = 1200
    canvas.height = 800

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0d1117')
    gradient.addColorStop(1, '#161b22')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 4
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

    // Inner decorative border
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

    // Logo/Brand
    ctx.fillStyle = '#e63946'
    ctx.beginPath()
    ctx.roundRect(80, 70, 60, 60, 10)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('AT', 110, 110)

    ctx.fillStyle = '#e6edf3'
    ctx.font = '18px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Angelo Tutoring', 160, 100)
    ctx.fillStyle = '#7d8590'
    ctx.font = '14px Arial'
    ctx.fillText('AI Literacy Programme', 160, 120)

    // Certificate Title
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 42px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 200)

    // Subtitle
    ctx.fillStyle = '#7d8590'
    ctx.font = '18px Arial'
    ctx.fillText('This certifies that', canvas.width / 2, 270)

    // Student Name
    ctx.fillStyle = '#e6edf3'
    ctx.font = 'bold 48px Arial'
    ctx.fillText(studentName, canvas.width / 2, 340)

    // Achievement Line
    ctx.fillStyle = '#7d8590'
    ctx.font = '18px Arial'
    ctx.fillText('has successfully completed the', canvas.width / 2, 400)

    // Course Name
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 28px Arial'
    ctx.fillText('AI Literacy Curriculum', canvas.width / 2, 450)

    // Stats
    ctx.fillStyle = '#e6edf3'
    ctx.font = '16px Arial'
    ctx.fillText(`${modulesCompleted} Modules Completed  •  Average Score: ${avgPromptScore.toFixed(1)}/5`, canvas.width / 2, 500)

    // Date
    const formattedDate = new Date(issuedAt).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    ctx.fillStyle = '#7d8590'
    ctx.font = '14px Arial'
    ctx.fillText(`Issued: ${formattedDate}`, canvas.width / 2, 550)

    // Certificate ID
    ctx.fillStyle = '#7d8590'
    ctx.font = '12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Certificate ID: ${certificateId}`, 80, canvas.height - 60)

    // QR Code
    const qrImg = new Image()
    qrImg.onload = () => {
      ctx.drawImage(qrImg, canvas.width - 180, canvas.height - 180, 120, 120)
      ctx.fillStyle = '#7d8590'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Scan to verify', canvas.width - 120, canvas.height - 50)
      setIsGenerating(false)
    }
    qrImg.src = qrDataUrl
  }

  // Generate on mount when QR is ready
  useEffect(() => {
    if (qrDataUrl) {
      generateCertificate()
    }
  }, [qrDataUrl])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `AI-Literacy-Certificate-${certificateId}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      )

      if (blob && navigator.share) {
        await navigator.share({
          title: 'AI Literacy Certificate',
          text: `I earned my AI Literacy Certificate from Angelo Tutoring! Certificate ID: ${certificateId}`,
          files: [new File([blob], `certificate-${certificateId}.png`, { type: 'image/png' })],
        })
      }
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border-custom)' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-auto"
          style={{ display: 'block' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{ background: 'var(--ai-purple)', color: 'white' }}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download Certificate
        </button>

        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all"
            style={{ background: 'var(--surface2)', color: 'var(--text)' }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}
      </div>

      {/* Verification Info */}
      <div
        className="p-4 rounded-lg text-center space-y-2"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
          This certificate can be verified at:
        </p>
        <code
          className="text-sm px-3 py-1 rounded inline-block"
          style={{ background: 'var(--surface2)', color: 'var(--ai-purple)' }}
        >
          {typeof window !== 'undefined' ? `${window.location.origin}/verify/${certificateId}` : ''}
        </code>
        <p className="text-xs" style={{ color: 'var(--muted-custom)' }}>
          Add this link or QR code to your CV for employer verification
        </p>
      </div>
    </div>
  )
}
