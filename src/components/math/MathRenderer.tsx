'use client'

import { useMemo } from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'
import katex from 'katex'

// Validate LaTeX before rendering
function isValidLatex(math: string, displayMode: boolean): boolean {
  try {
    katex.renderToString(math, { throwOnError: true, displayMode })
    return true
  } catch {
    return false
  }
}

type MathRendererProps = {
  content: string
  block?: boolean
}

type ParsedPart = {
  type: 'text' | 'inline' | 'block'
  content: string
}

function parseMathContent(content: string): ParsedPart[] {
  const parts: ParsedPart[] = []
  let remaining = content

  // Pattern for block math: $$...$$ (must come first)
  // Pattern for inline math: $...$
  const blockRegex = /\$\$([\s\S]*?)\$\$/
  const inlineRegex = /\$([^\$\n]+?)\$/

  while (remaining.length > 0) {
    const blockMatch = remaining.match(blockRegex)
    const inlineMatch = remaining.match(inlineRegex)

    let nextMatch: { type: 'block' | 'inline'; match: RegExpMatchArray } | null = null

    if (blockMatch && inlineMatch) {
      // Use whichever comes first
      if (blockMatch.index! <= inlineMatch.index!) {
        nextMatch = { type: 'block', match: blockMatch }
      } else {
        nextMatch = { type: 'inline', match: inlineMatch }
      }
    } else if (blockMatch) {
      nextMatch = { type: 'block', match: blockMatch }
    } else if (inlineMatch) {
      nextMatch = { type: 'inline', match: inlineMatch }
    }

    if (nextMatch) {
      const { type, match } = nextMatch
      const index = match.index!

      // Add text before the match
      if (index > 0) {
        parts.push({ type: 'text', content: remaining.slice(0, index) })
      }

      // Add the math content
      parts.push({ type, content: match[1] })

      // Continue with the rest
      remaining = remaining.slice(index + match[0].length)
    } else {
      // No more math, add remaining as text
      if (remaining.length > 0) {
        parts.push({ type: 'text', content: remaining })
      }
      break
    }
  }

  return parts
}

/**
 * Content files write emphasis as markdown (`**Exponent Laws**`), which used
 * to reach the page as literal asterisks on every topic. Only bold is
 * supported - that is all the curriculum content uses, and a full markdown
 * parser here would fight the KaTeX splitting above.
 */
function renderText(text: string, keyPrefix: number) {
  const segments = text.split(/(\*\*[^*]+\*\*)/g)
  return segments.map((segment, i) => {
    const bold = segment.match(/^\*\*([^*]+)\*\*$/)
    if (bold) {
      return <strong key={`${keyPrefix}-${i}`}>{bold[1]}</strong>
    }
    return <span key={`${keyPrefix}-${i}`}>{segment}</span>
  })
}

function SafeInlineMath({ math }: { math: string }) {
  if (!isValidLatex(math, false)) {
    return (
      <span className="text-red-500 font-mono text-sm" title="KaTeX error">
        {math}
      </span>
    )
  }
  return <InlineMath math={math} />
}

function SafeBlockMath({ math }: { math: string }) {
  if (!isValidLatex(math, true)) {
    return (
      <div className="text-red-500 font-mono text-sm p-2" title="KaTeX error">
        {math}
      </div>
    )
  }
  return <BlockMath math={math} />
}

export default function MathRenderer({ content, block = false }: MathRendererProps) {
  const parts = useMemo(() => parseMathContent(content), [content])

  if (block) {
    return (
      <div className="math-content">
        {parts.map((part, index) => {
          if (part.type === 'block') {
            return <SafeBlockMath key={index} math={part.content} />
          } else if (part.type === 'inline') {
            return <SafeInlineMath key={index} math={part.content} />
          } else {
            return renderText(part.content, index)
          }
        })}
      </div>
    )
  }

  return (
    <span className="math-content">
      {parts.map((part, index) => {
        if (part.type === 'block') {
          return <SafeBlockMath key={index} math={part.content} />
        } else if (part.type === 'inline') {
          return <SafeInlineMath key={index} math={part.content} />
        } else {
          return renderText(part.content, index)
        }
      })}
    </span>
  )
}
