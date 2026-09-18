import { describe, it, expect } from 'vitest'
import { selectVideosForTopic, selectAfrikaansVideo, parseDuration, type VideoCandidate } from './select-videos'

function video(overrides: Partial<VideoCandidate> = {}): VideoCandidate {
  return {
    id: 'id',
    title: 'Title',
    channel: 'Channel',
    views: '100 views',
    dur: '5:00',
    embeddable: true,
    ...overrides,
  }
}

describe('parseDuration', () => {
  it('parses an mm:ss duration into seconds', () => {
    // Arrange
    const dur = '4:23'

    // Act
    const seconds = parseDuration(dur)

    // Assert
    expect(seconds).toBe(263)
  })

  it('parses an h:mm:ss duration into seconds', () => {
    expect(parseDuration('1:02:52')).toBe(3772)
  })

  it('returns +Infinity for an unparseable duration', () => {
    expect(parseDuration('not-a-duration')).toBe(Number.POSITIVE_INFINITY)
  })
})

describe('selectVideosForTopic', () => {
  it('excludes non-embeddable candidates', () => {
    // Arrange
    const candidates = [video({ id: 'blocked', embeddable: false }), video({ id: 'ok', embeddable: true })]

    // Act
    const picks = selectVideosForTopic(candidates)

    // Assert
    expect(picks.map((v) => v.id)).toEqual(['ok'])
  })

  it('skips candidates longer than 2 hours', () => {
    // Arrange
    const candidates = [video({ id: 'too-long', dur: '2:30:00' }), video({ id: 'fine', dur: '10:00' })]

    // Act
    const picks = selectVideosForTopic(candidates)

    // Assert
    expect(picks.map((v) => v.id)).toEqual(['fine'])
  })

  it('includes a candidate at exactly 2 hours but excludes one a second over', () => {
    const candidates = [video({ id: 'exactly-2h', dur: '2:00:00' }), video({ id: 'one-over', dur: '2:00:01' })]

    const picks = selectVideosForTopic(candidates)

    expect(picks.map((v) => v.id)).toEqual(['exactly-2h'])
  })

  it('never returns more than the max picks (default 2)', () => {
    // Arrange
    const candidates = [video({ id: 'a' }), video({ id: 'b' }), video({ id: 'c' }), video({ id: 'd' })]

    // Act
    const picks = selectVideosForTopic(candidates)

    // Assert
    expect(picks).toHaveLength(2)
  })

  it('prefers a short (<=15 min) video and an exam-question-style video when both exist', () => {
    // Arrange
    const candidates = [
      video({ id: 'long-lesson', dur: '45:00', title: 'Full lesson on the topic' }),
      video({ id: 'short-explainer', dur: '4:00', title: 'Quick recap' }),
      video({ id: 'exam-qs', dur: '30:00', title: 'Grade 11 Exam Questions Practice' }),
    ]

    // Act
    const picks = selectVideosForTopic(candidates)

    // Assert
    expect(picks.map((v) => v.id)).toEqual(['short-explainer', 'exam-qs'])
  })

  it('returns an empty array when no candidate is eligible', () => {
    const candidates = [video({ id: 'a', embeddable: false }), video({ id: 'b', dur: '3:00:00' })]

    expect(selectVideosForTopic(candidates)).toEqual([])
  })
})

describe('selectAfrikaansVideo', () => {
  it('falls back to null when no embeddable Afrikaans candidate exists', () => {
    // Arrange
    const candidates = [video({ id: 'a', embeddable: false }), video({ id: 'b', embeddable: false })]

    // Act
    const pick = selectAfrikaansVideo(candidates)

    // Assert
    expect(pick).toBeNull()
  })

  it('falls back to null for an empty candidate list', () => {
    expect(selectAfrikaansVideo([])).toBeNull()
  })

  it('picks the first embeddable candidate', () => {
    // Arrange
    const candidates = [
      video({ id: 'blocked', embeddable: false }),
      video({ id: 'first-ok', embeddable: true }),
      video({ id: 'second-ok', embeddable: true }),
    ]

    // Act
    const pick = selectAfrikaansVideo(candidates)

    // Assert
    expect(pick?.id).toBe('first-ok')
  })
})
