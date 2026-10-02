'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'

type VoicePlayerProps = {
  text: string
  topicSlug: string
  sectionId: string
}

type PlayerState = 'idle' | 'loading' | 'playing' | 'error'

export default function VoicePlayer({ text, topicSlug, sectionId }: VoicePlayerProps) {
  const [state, setState] = useState<PlayerState>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (speechRef.current && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Strip LaTeX/math notation from text for speech
  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      // Remove block math
      .replace(/\$\$[^$]+\$\$/g, '')
      // Remove inline math
      .replace(/\$[^$]+\$/g, '')
      // Remove LaTeX commands
      .replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
      .replace(/\\[a-zA-Z]+/g, '')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  }

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setState('idle')
  }

  const playWithSpeechSynthesis = (cleanText: string) => {
    if (!window.speechSynthesis) {
      setState('error')
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 0.85 // Slow and clear
    utterance.pitch = 1
    utterance.volume = 1

    // Try to get a South African or British English voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v =>
      v.lang.includes('en-ZA') ||
      v.lang.includes('en-GB') ||
      v.name.toLowerCase().includes('english')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onend = () => setState('idle')
    utterance.onerror = () => setState('error')

    speechRef.current = utterance
    setState('playing')
    window.speechSynthesis.speak(utterance)
  }

  const handlePlay = async () => {
    if (state === 'playing') {
      stopPlayback()
      return
    }

    setState('loading')

    // First, try to load MP3 from Supabase Storage
    const audioPath = `/audio/${topicSlug}/${sectionId}.mp3`

    try {
      // Check if audio file exists
      const response = await fetch(audioPath, { method: 'HEAD' })

      if (response.ok) {
        // Audio file exists, play it
        const audio = new Audio(audioPath)
        audioRef.current = audio

        audio.onended = () => setState('idle')
        audio.onerror = () => {
          // Fallback to speech synthesis
          playWithSpeechSynthesis(cleanTextForSpeech(text))
        }

        setState('playing')
        await audio.play()
      } else {
        // No audio file, use speech synthesis fallback
        playWithSpeechSynthesis(cleanTextForSpeech(text))
      }
    } catch {
      // Network error or file doesn't exist, use speech synthesis
      playWithSpeechSynthesis(cleanTextForSpeech(text))
    }
  }

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'playing':
        return <VolumeX className="w-4 h-4" />
      case 'error':
        return <VolumeX className="w-4 h-4" style={{ color: 'var(--muted-custom)' }} />
      default:
        return <Volume2 className="w-4 h-4" />
    }
  }

  const getTitle = () => {
    switch (state) {
      case 'loading':
        return 'Loading...'
      case 'playing':
        return 'Tap to stop'
      case 'error':
        return 'Audio unavailable'
      default:
        return 'Listen to Angelo explain'
    }
  }

  return (
    <button
      onClick={handlePlay}
      disabled={state === 'loading' || state === 'error'}
      className="p-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: state === 'playing' ? 'rgba(220, 30, 46, 0.2)' : 'var(--surface2)',
        color: state === 'error' ? 'var(--muted-custom)' : 'var(--accent-red-text)',
      }}
      title={getTitle()}
      aria-label={getTitle()}
    >
      {getIcon()}
    </button>
  )
}
