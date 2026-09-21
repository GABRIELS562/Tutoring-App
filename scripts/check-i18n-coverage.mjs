#!/usr/bin/env node
/**
 * Phase 5.1 verification helper.
 *
 * Greps a fixed list of files (the ones Phase 5.1 was scoped to) for JSX
 * text nodes of >= 3 words that are NOT already coming from a t(...) /
 * t.rich(...) call, an interpolated {expression}, or an aria-label/alt
 * attribute already using t(...). This is a heuristic regex pass over raw
 * source, not an AST walk - it will have false positives (JSX comments,
 * code fragments that happen to look like `>text<`) and should be read by
 * a human, not wired into CI as a hard gate.
 *
 * Usage: node scripts/check-i18n-coverage.mjs
 */
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

// The exact Phase 5.1 target list from docs/BUILD-PLAN.md / the task brief.
const TARGET_FILES = [
  'src/app/(app)/dashboard/page.tsx',
  'src/app/(app)/dashboard/GradeSelector.tsx',
  'src/components/dashboard/StudyPlanBanner.tsx',
  'src/components/dashboard/ExamCountdown.tsx',
  'src/components/dashboard/WeaknessCard.tsx',
  'src/app/(app)/progress/page.tsx',
  'src/app/(app)/papers/page.tsx',
  'src/app/(app)/papers/PapersPageClient.tsx',
  'src/app/(app)/formulas/page.tsx',
  'src/app/(app)/subjects/page.tsx',
  'src/app/(app)/topics/[slug]/TopicPageClient.tsx',
  'src/components/quiz/QuizEngine.tsx',
  'src/components/quiz/QuestionCard.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/components/layout/Topbar.tsx',
  'src/components/layout/LanguageToggle.tsx',
  'src/components/InstallPrompt.tsx',
  'src/components/ai/CameraScan.tsx',
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/signup/page.tsx',
  'src/app/(auth)/forgot-password/page.tsx',
  'src/app/(auth)/reset-password/page.tsx',
  'src/app/verify/[certificateId]/page.tsx',
  // Phase 7 (Boss Battle prototype). dashboard/page.tsx is already listed
  // above (Phase 5.1) and now also carries the "Boss battles" section.
  'src/app/(app)/topics/[slug]/boss/page.tsx',
]

// Expand subjects/[subject]/*, topics/[slug]/practice/* and boss/* globs.
const globbed = [
  'src/app/(app)/subjects/[subject]/*.tsx',
  'src/app/(app)/topics/[slug]/practice/*.tsx',
  'src/components/boss/*.tsx',
].flatMap((pattern) => globSync(pattern, { cwd: ROOT }))

const files = [...new Set([...TARGET_FILES, ...globbed])]

const WORD = /[A-Za-z][A-Za-z''-]*/g

function isTranslated(line) {
  // Line contains a t(...)/t.rich(...) call somewhere - good enough signal
  // for a heuristic pass since we're scanning per-line, not per-node.
  return /\bt(?:Nav|Common|Auth)?(?:\.rich)?\(/.test(line)
}

function findViolations(file) {
  const abs = path.join(ROOT, file)
  let text
  try {
    text = readFileSync(abs, 'utf8')
  } catch {
    return [{ line: 0, text: 'FILE NOT FOUND' }]
  }
  const lines = text.split('\n')
  const violations = []

  lines.forEach((line, i) => {
    // Skip lines that are clearly comments or already translated.
    const trimmed = line.trim()
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return
    if (isTranslated(line)) return

    // JSX text node heuristic: text between > and < with no braces.
    const matches = [...line.matchAll(/>([^<>{}]+)</g)]
    for (const m of matches) {
      const content = m[1].trim()
      if (!content) continue
      const words = content.match(WORD) ?? []
      if (words.length >= 3) {
        violations.push({ line: i + 1, text: content })
      }
    }
  })

  return violations
}

let total = 0
for (const file of files) {
  const violations = findViolations(file)
  if (violations.length === 0) continue
  console.log(`\n${file}`)
  for (const v of violations) {
    console.log(`  L${v.line}: ${v.text}`)
    total++
  }
}

console.log(`\n${total} potential untranslated JSX text node(s) across ${files.length} files.`)
