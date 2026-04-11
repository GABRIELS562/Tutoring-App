'use client'

import 'katex/dist/katex.min.css'
import { BlockMath } from 'react-katex'
import katex from 'katex'

type FormulaBoxProps = {
  title: string
  formulas: string[]
}

// Validate LaTeX before rendering
function isValidLatex(math: string): boolean {
  try {
    katex.renderToString(math, { throwOnError: true, displayMode: true })
    return true
  } catch {
    return false
  }
}

function SafeBlockMath({ math }: { math: string }) {
  if (!isValidLatex(math)) {
    return (
      <div className="text-red-500 font-mono text-sm p-2" title="KaTeX error">
        {math}
      </div>
    )
  }
  return <BlockMath math={math} />
}

export default function FormulaBox({ title, formulas }: FormulaBoxProps) {
  return (
    <div
      className="rounded-lg p-4 my-4"
      style={{
        background: 'var(--surface2)',
        borderLeft: '3px solid var(--gold)',
      }}
    >
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: 'var(--gold)' }}
      >
        {title}
      </h4>
      <div className="space-y-2 font-mono">
        {formulas.map((formula, index) => (
          <div key={index} className="overflow-x-auto">
            <SafeBlockMath math={formula} />
          </div>
        ))}
      </div>
    </div>
  )
}
