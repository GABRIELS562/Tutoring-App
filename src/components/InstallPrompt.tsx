'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [canShow, setCanShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if we should show the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) return

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)

    // Batch state updates in a microtask to avoid cascading renders
    queueMicrotask(() => {
      setIsIOS(isIOSDevice)
      setCanShow(true)
    })

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Show prompt after 45 seconds
    const timer = setTimeout(() => {
      setShowPrompt(true)
    }, 45000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if conditions aren't met
  if (!canShow || !showPrompt) return null

  // On Android, only show if we have the install prompt event
  if (!isIOS && !deferredPrompt) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe animate-slide-up"
      style={{ background: 'var(--surface)', borderTop: '1px solid var(--border-custom)' }}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent-red)' }}
          >
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
              Install Angelo Tutoring
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--muted-custom)' }}>
              {isIOS
                ? 'Tap the share button and select "Add to Home Screen" for the best experience.'
                : 'Install the app on your device for quick access and offline learning.'}
            </p>
            <div className="flex gap-2">
              {!isIOS && (
                <button
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  style={{ background: 'var(--accent-red)', color: 'white' }}
                >
                  Install
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                style={{ background: 'var(--surface2)', color: 'var(--text)' }}
              >
                {isIOS ? 'Got it' : 'Not now'}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg transition-colors shrink-0"
            style={{ color: 'var(--muted-custom)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
