import { describe, it, expect } from 'vitest'
import { contentRegistry, getTopicMeta, getTopicsForSubjectGrade } from '../registry'

describe('getTopicMeta', () => {
  it('returns title/subject/grade/paper for a registered slug', () => {
    // Arrange
    const slug = 'trig-gr11'

    // Act
    const meta = getTopicMeta(slug)

    // Assert
    expect(meta).toEqual({
      title: 'Trigonometry',
      subject: 'maths',
      grade: 11,
      paper: 2,
    })
  })

  it('resolves an alias slug to the same content as its canonical slug', () => {
    // Arrange / Act
    const aliasMeta = getTopicMeta('trigonometry')
    const canonicalMeta = getTopicMeta('trig-gr11')

    // Assert
    expect(aliasMeta).toEqual(canonicalMeta)
  })

  it('returns null for an unregistered slug', () => {
    // Act
    const meta = getTopicMeta('does-not-exist')

    // Assert
    expect(meta).toBeNull()
  })
})

describe('getTopicsForSubjectGrade', () => {
  it('returns only canonical slugs, excluding aliases', () => {
    // Act
    const topics = getTopicsForSubjectGrade('maths', 11)

    // Assert
    const slugs = topics.map((t) => t.slug)
    expect(slugs).toContain('trig-gr11')
    expect(slugs).not.toContain('trigonometry')
  })

  it('returns no duplicate topics for a subject/grade', () => {
    // Act
    const topics = getTopicsForSubjectGrade('maths', 10)

    // Assert
    const slugs = topics.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('returns an empty array for a subject/grade combination with no content', () => {
    // Act - Grade 11 science only has 2 topics registered, none matching this contrived case
    const topics = getTopicsForSubjectGrade('science', 99 as never)

    // Assert
    expect(topics).toEqual([])
  })

  it('every returned slug exists in contentRegistry', () => {
    // Arrange
    const subjectsAndGrades: [('maths' | 'science'), (10 | 11 | 12)][] = [
      ['maths', 10], ['maths', 11], ['maths', 12],
      ['science', 10], ['science', 11], ['science', 12],
    ]

    // Act & Assert
    for (const [subject, grade] of subjectsAndGrades) {
      const topics = getTopicsForSubjectGrade(subject, grade)
      for (const topic of topics) {
        expect(contentRegistry[topic.slug]).toBeDefined()
      }
    }
  })
})
