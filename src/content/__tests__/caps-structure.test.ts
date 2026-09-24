/**
 * The app has to read the way the CAPS handbook a student revises from does:
 * docs/curriculum/Grade_10-12_Math_CAPS_Handbook.pdf, transcribed into
 * src/content/caps-curriculum.ts.
 *
 * These pin the navigation to that document. Registry insertion order once put
 * Calculus at the top of Grade 12 Paper 1 where the handbook starts with
 * Algebra, and Grade 10 carried an "Equations and Inequalities" topic that the
 * handbook does not have and that duplicated Algebra's sub-topics.
 */
import { describe, it, expect } from 'vitest'
import { capsCurriculum } from '../caps-curriculum'
import { capsScienceCurriculum } from '../caps-science-curriculum'
import { contentRegistry, getTopicsForSubjectGrade } from '../registry'

const GRADES = [10, 11, 12] as const

describe('the maths curriculum follows the CAPS handbook', () => {
  it.each(GRADES)('Grade %i lists exactly the handbook topics, in its order', (grade) => {
    const listed = getTopicsForSubjectGrade('maths', grade).map((topic) => topic.slug)
    const handbook = capsCurriculum.filter((topic) => topic.grade === grade).map((t) => t.slug)

    expect(listed).toEqual(handbook)
  })

  it.each(GRADES)('Grade %i splits into the handbook’s two papers', (grade) => {
    for (const paper of [1, 2] as const) {
      const listed = getTopicsForSubjectGrade('maths', grade)
        .filter((topic) => topic.paper === paper)
        .map((topic) => topic.slug)
      const handbook = capsCurriculum
        .filter((topic) => topic.grade === grade && topic.paper === paper)
        .map((topic) => topic.slug)

      expect(listed).toEqual(handbook)
    }
  })

  it('names every topic as the handbook names it', () => {
    for (const topic of capsCurriculum) {
      expect(contentRegistry[topic.slug]?.title).toBe(topic.title)
    }
  })

  it('gives every sub-topic its own section, in handbook order', () => {
    for (const topic of capsCurriculum) {
      const sections = contentRegistry[topic.slug].sections
        .filter((section) => section.id !== 'overview')
        .map((section) => section.title)

      expect(sections).toEqual(topic.subTopics)
    }
  })

  it('shows a video or an honest note in every sub-topic section', () => {
    for (const topic of capsCurriculum) {
      for (const section of contentRegistry[topic.slug].sections) {
        if (section.id === 'overview') continue
        const kinds = section.blocks.map((block) => block.type)
        expect(kinds.some((kind) => kind === 'video' || kind === 'tip')).toBe(true)
      }
    }
  })
})

describe('the science curriculum follows the CAPS Physical Sciences document', () => {
  it.each(GRADES)('Grade %i lists exactly the CAPS topics, in its order', (grade) => {
    const listed = getTopicsForSubjectGrade('science', grade).map((topic) => topic.slug)
    const caps = capsScienceCurriculum.filter((t) => t.grade === grade).map((t) => t.slug)

    expect(listed).toEqual(caps)
  })

  it('names every science topic as the document names it', () => {
    for (const topic of capsScienceCurriculum) {
      expect(contentRegistry[topic.slug]?.title).toBe(topic.title)
    }
  })

  it('splits physics into paper 1 and chemistry into paper 2', () => {
    for (const topic of capsScienceCurriculum) {
      expect(contentRegistry[topic.slug]?.paper).toBe(topic.paper)
    }
  })

  it('keeps the folded-in slugs resolving, so old links still work', () => {
    // These nine topics predate the CAPS transcription and do not map
    // one-to-one onto the curriculum's nineteen - Grade 10 had Transverse
    // Waves, Sound and EM Radiation where CAPS has one Waves, Sound & Light.
    const folded: Record<string, string> = {
      'waves-gr10': 'waves-sound-light-gr10',
      'sound-gr10': 'waves-sound-light-gr10',
      'em-radiation-gr10': 'waves-sound-light-gr10',
      'electric-circuits-gr10': 'electricity-magnetism-gr10',
      'newtons-laws-gr11': 'mechanics-gr11',
      'waves-sound-gr11': 'waves-sound-light-gr11',
      'momentum-gr12': 'mechanics-gr12',
    }
    for (const [old, into] of Object.entries(folded)) {
      expect(contentRegistry[old]?.id).toBe(into)
    }
  })

  it('does not show a folded-in slug as a topic of its own', () => {
    for (const grade of GRADES) {
      const slugs = getTopicsForSubjectGrade('science', grade).map((t) => t.slug)
      expect(slugs).not.toContain('waves-gr10')
      expect(slugs).not.toContain('newtons-laws-gr11')
      expect(slugs).not.toContain('momentum-gr12')
    }
  })
})
