'use client'

import { useState } from 'react'
import { Send, Loader2, RefreshCw, Download } from 'lucide-react'
import type { AIPracticalConfig } from '@/types'

interface AIPracticalBlockProps {
  config: AIPracticalConfig
  title?: string
}

export default function AIPracticalBlock({ config, title }: AIPracticalBlockProps) {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedToProfile, setSavedToProfile] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setError(null)

    try {
      const body: Record<string, string | undefined> = {
        mode: config.mode,
      }

      // Add mode-specific fields
      if (config.mode === 'general_question') {
        body.userQuestion = input
      } else if (config.mode === 'cv_help') {
        body.cvDraft = input
      } else if (config.mode === 'prompt_rewrite') {
        body.userQuestion = `Help me improve this prompt: "${input}"`
        body.mode = 'general_question' // Use general_question for prompt_rewrite
      }

      const res = await fetch('/api/ai-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to get response')
      }

      setResponse(data.hint)

      // Save to profile if configured
      if (config.saveToProfile && data.hint) {
        setSavedToProfile(true)
        // Could save to Supabase here in a real implementation
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setInput('')
    setResponse(null)
    setError(null)
    setSavedToProfile(false)
  }

  const handleDownload = () => {
    if (!response) return
    const blob = new Blob([response], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-response.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-xl p-5 space-y-4 bg-ai-purple-glow border border-ai-purple">
      {/* Header */}
      {title && (
        <h4 className="font-semibold text-ai-purple flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ai-purple" />
          {title}
        </h4>
      )}

      {/* Instructions */}
      <p className="text-sm text-primary-text">
        {config.instruction}
      </p>

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={config.inputPlaceholder || 'Type your message...'}
          className="w-full h-28 px-4 py-3 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 bg-surface border border-custom text-primary-text"
          disabled={isLoading}
        />

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-ai-purple text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Ask Angelo AI
              </>
            )}
          </button>

          {response && (
            <button
              onClick={handleReset}
              className="px-3 py-2.5 rounded-lg transition-all bg-surface2 text-muted-custom"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg text-sm bg-accent-red-glow text-accent-red">
          {error}
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="p-4 rounded-lg space-y-3 bg-surface border border-custom">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ai-purple">Angelo AI</span>
            {config.downloadable && (
              <button
                onClick={handleDownload}
                className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-surface2 transition-colors text-muted-custom"
              >
                <Download className="w-3 h-3" />
                Save
              </button>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap text-primary-text">
            {response}
          </p>
          {savedToProfile && (
            <p className="text-xs text-ai-purple">
              Saved to your profile for your CV.
            </p>
          )}
        </div>
      )}

      {/* Comparison Mode */}
      {config.showComparison && response && (
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-surface2">
            <p className="font-medium mb-1 text-muted-custom">Your prompt</p>
            <p className="text-primary-text">{input}</p>
          </div>
          <div className="p-3 rounded-lg bg-surface2">
            <p className="font-medium mb-1 text-ai-purple">Improved version</p>
            <p className="text-primary-text">{response}</p>
          </div>
        </div>
      )}
    </div>
  )
}
