import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { aiModules, moduleOrder, badges, promptScenarios } from '@/content/ai-skills'

/**
 * The whole AI Skills section was English-only: not one of its six pages
 * called useTranslations, and none of them rendered a Topbar - which is
 * where the language toggle lives. So an Afrikaans student who navigated
 * in got an English section AND no control to get back out of it, plus no
 * XP, streak or account menu.
 *
 * The lesson BODIES are still English (about 11,900 words across five
 * modules; translating those is a content project, not a UI one). What is
 * pinned here is the chrome and the metadata: everything a student reads
 * while deciding what to open, and everything they press.
 */

const ROOT = join(__dirname, '..', '..', '..', '..', '..')
const SECTION = join(ROOT, 'src', 'app', '(app)', 'ai-skills')
const COMPONENTS = join(ROOT, 'src', 'components', 'ai')

function tsxFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...tsxFiles(full))
    else if (entry.endsWith('.tsx')) out.push(full)
  }
  return out
}

const pages = tsxFiles(SECTION)
const components = tsxFiles(COMPONENTS)

function messages(locale: 'en' | 'af'): Record<string, string> {
  const all = JSON.parse(
    readFileSync(join(ROOT, 'src', 'messages', `${locale}.json`), 'utf-8')
  )
  return all.aiSkills
}

describe('the AI Skills section is translated', () => {
  it('has an aiSkills namespace in both languages with the same keys', () => {
    const en = messages('en')
    const af = messages('af')

    expect(Object.keys(en).length).toBeGreaterThan(40)
    expect(Object.keys(af).sort()).toEqual(Object.keys(en).sort())
  })

  it('never leaves an Afrikaans value identical to the English one by accident', () => {
    const en = messages('en')
    const af = messages('af')

    // A handful legitimately match (Modules, Scenario). Anything longer
    // than that being identical means a key was copied, not translated.
    const suspicious = Object.keys(en).filter(
      (key) => en[key] === af[key] && en[key].length > 14
    )

    expect(suspicious).toEqual([])
  })

  /**
   * RENDERED, not merely imported. The first version of this test checked
   * for the string "Topbar" and passed on two pages that imported it and
   * never used it - lint caught that, this test did not.
   */
  it('gives every page a Topbar, so the language toggle is reachable', () => {
    const withoutTopbar = pages
      .filter((file) => !/error\.tsx$|loading\.tsx$/.test(file))
      .filter((file) => !/<Topbar\b/.test(readFileSync(file, 'utf-8')))
      .map((file) => file.replace(ROOT, ''))

    expect(withoutTopbar).toEqual([])
  })

  it('reads its text from the message namespace on every page', () => {
    const withoutTranslations = pages
      .filter((file) => !/loading\.tsx$/.test(file))
      .filter((file) => {
        const source = readFileSync(file, 'utf-8')
        return !/useTranslations|getTranslations/.test(source)
      })
      .map((file) => file.replace(ROOT, ''))

    expect(withoutTranslations).toEqual([])
  })
})

/**
 * Regex, not a parser: it catches the shape these files actually used -
 * a capitalised sentence sitting directly between two JSX tags. It is
 * deliberately narrow, because a false positive here blocks a commit.
 */
function hardcodedStrings(file: string): string[] {
  const source = readFileSync(file, 'utf-8')
  const found = new Set<string>()

  for (const match of source.matchAll(/(?<=>)\s*([A-Z][^<>{}\n]{3,70}?)\s*(?=<)/g)) {
    const text = match[1].trim()
    if (/[A-Za-z]{3}/.test(text)) found.add(text)
  }
  for (const match of source.matchAll(/\bplaceholder="([^"]{3,70})"/g)) {
    found.add(match[1])
  }

  return [...found]
}

describe('no English is hardcoded into the AI Skills UI', () => {
  it.each([...pages, ...components].map((f) => [f.replace(ROOT, ''), f]))(
    '%s',
    (_label, file) => {
      expect(hardcodedStrings(file)).toEqual([])
    }
  )
})

describe('module and badge names carry Afrikaans', () => {
  it('gives every module an Afrikaans title and description', () => {
    for (const id of moduleOrder) {
      const aiModule = aiModules[id]
      expect(aiModule.titleAf, `${id} titleAf`).toBeTruthy()
      expect(aiModule.descriptionAf, `${id} descriptionAf`).toBeTruthy()
      expect(aiModule.titleAf, `${id} titleAf is just the English`).not.toBe(aiModule.title)
    }
  })

  it('gives every prompt-challenge scenario Afrikaans context and task', () => {
    for (const scenario of promptScenarios) {
      expect(scenario.contextAf, `${scenario.id} contextAf`).toBeTruthy()
      expect(scenario.taskAf, `${scenario.id} taskAf`).toBeTruthy()
      expect(scenario.contextAf, `${scenario.id} contextAf is just the English`).not.toBe(
        scenario.context
      )
    }
  })

  it('gives every badge an Afrikaans name and description', () => {
    for (const badge of Object.values(badges)) {
      expect(badge.nameAf, `${badge.id} nameAf`).toBeTruthy()
      expect(badge.descriptionAf, `${badge.id} descriptionAf`).toBeTruthy()
    }
  })

  /**
   * The lesson bodies are NOT translated yet, and this records that
   * honestly rather than letting it look finished. Delete this test when
   * the module content is localised.
   */
  it('documents that the lesson bodies are still English only', () => {
    const anySectionTranslated = moduleOrder.some((id) =>
      aiModules[id].sections.some((section) => 'titleAf' in section && section.titleAf)
    )

    expect(
      anySectionTranslated,
      'lesson bodies now have Afrikaans - update this test and the README note'
    ).toBe(false)
  })
})
