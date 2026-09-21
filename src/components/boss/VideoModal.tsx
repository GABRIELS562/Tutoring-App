'use client'

import { useEffect, useRef } from 'react'
import { X, ShieldPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

const VIDEO_SHIELD_WATCH_MS = 30_000

type VideoModalProps = {
  open: boolean
  onClose: () => void
  videoId: string
  title?: string
  shieldAlreadyEarned: boolean
  onShieldEarned: () => void
}

/**
 * "Watch the theory first" video, opened from the intro screen. Grants one
 * bonus shield after the modal has been open 30s - either while it's still
 * open (a timer fires the grant), or on close if the student already spent
 * >=30s in it. Either way the grant only ever fires once per battle
 * (battleReducer's GRANT_VIDEO_SHIELD is itself idempotent, but the local
 * ref here also avoids scheduling a redundant timer).
 */
export default function VideoModal({
  open,
  onClose,
  videoId,
  title,
  shieldAlreadyEarned,
  onShieldEarned,
}: VideoModalProps) {
  const t = useTranslations('boss')
  const openedAtRef = useRef<number | null>(null)
  const grantedRef = useRef(shieldAlreadyEarned)

  useEffect(() => {
    grantedRef.current = shieldAlreadyEarned
  }, [shieldAlreadyEarned])

  useEffect(() => {
    if (!open || grantedRef.current) return

    openedAtRef.current = Date.now()
    const timer = setTimeout(() => {
      if (!grantedRef.current) {
        grantedRef.current = true
        onShieldEarned()
      }
    }, VIDEO_SHIELD_WATCH_MS)

    return () => clearTimeout(timer)
  }, [open, onShieldEarned])

  if (!open) return null

  const handleClose = () => {
    if (!grantedRef.current && openedAtRef.current !== null) {
      const elapsed = Date.now() - openedAtRef.current
      if (elapsed >= VIDEO_SHIELD_WATCH_MS) {
        grantedRef.current = true
        onShieldEarned()
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label={t('closeVideo')}
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)' }}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || t('videoModalLabel')}
        className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold flex items-center gap-1.5" style={{ color: 'var(--teal)' }}>
            <ShieldPlus className="w-4 h-4" aria-hidden="true" />
            {t('videoShieldHint')}
          </p>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('closeVideo')}
            className="p-1.5 rounded-full"
            style={{ color: 'var(--muted-custom)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px' }}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || t('videoModalLabel')}
          />
        </div>
      </div>
    </div>
  )
}
