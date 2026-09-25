import { describe, it, expect } from 'vitest'
import { capsScienceCurriculum, allScienceSubTopics } from '@/content/caps-science-curriculum'
import {
  capsScienceSubTopicsAf,
  capsScienceTopicTitlesAf,
} from '@/content/caps-science-curriculum-af'

/**
 * A missing key here is invisible: the heading silently falls back to
 * English, so an Afrikaans student gets an Afrikaans video under an English
 * heading and nothing reports it. These tests make that loud instead.
 */
describe('Afrikaans science curriculum names', () => {
  it('translates every topic', () => {
    const missing = capsScienceCurriculum
      .filter((topic) => !capsScienceTopicTitlesAf[topic.slug])
      .map((topic) => topic.slug)

    expect(missing, `topics with no Afrikaans name: ${missing.join(', ')}`).toEqual([])
  })

  it('translates every sub-topic', () => {
    const missing = [...new Set(allScienceSubTopics().map((s) => s.subTopic))].filter(
      (subTopic) => !capsScienceSubTopicsAf[subTopic]
    )

    expect(missing, `sub-topics with no Afrikaans name:\n${missing.join('\n')}`).toEqual([])
  })

  // A key that matches no sub-topic is dead weight that looks like coverage.
  it('has no keys that match nothing in the curriculum', () => {
    const real = new Set(allScienceSubTopics().map((s) => s.subTopic))
    const stray = Object.keys(capsScienceSubTopicsAf).filter((key) => !real.has(key))

    expect(stray, `keys matching no sub-topic:\n${stray.join('\n')}`).toEqual([])
  })

  it('does not leave a translation identical to the English', () => {
    const untranslated = Object.entries(capsScienceSubTopicsAf)
      .filter(([english, afrikaans]) => english === afrikaans)
      .map(([english]) => english)

    expect(untranslated).toEqual([])
  })

  // Afrikaans writes a named law with "se": "Newton se wette", not
  // "Newton's laws". Getting this wrong reads as machine translation.
  it('uses the Afrikaans possessive for named laws', () => {
    for (const english of Object.keys(capsScienceSubTopicsAf)) {
      if (!english.includes("'s Law") && !english.includes("'s law")) continue
      expect(capsScienceSubTopicsAf[english], `${english} should read "<name> se wet"`).toMatch(/ se /)
    }
  })
})
