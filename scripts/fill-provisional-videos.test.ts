import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { replaceVideoRegion, buildRegion, MARKER } from './fill-provisional-videos'
import type { VideoCandidate, AfrikaansPick } from './lib/select-videos'

const FIXTURE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '__fixtures__/example-after-video.ts.txt'
)

function video(overrides: Partial<VideoCandidate> = {}): VideoCandidate {
  return {
    id: 'id',
    title: 'Fixture pick',
    channel: 'Fixture Channel',
    views: '1 view',
    dur: '5:00',
    embeddable: true,
    ...overrides,
  }
}

describe('replaceVideoRegion with a trailing example block', () => {
  it('preserves an example block that immediately follows the video block, across two runs', () => {
    // Arrange
    const original = fs.readFileSync(FIXTURE_PATH, 'utf8')
    expect(original).toContain("type: 'example'")
    expect(original).toContain('PLACEHOLDER_FIXTURE_GR10')

    const enPicks = [video({ id: 'firstPick' }), video({ id: 'secondPick', title: 'Second pick' })]
    const afPick: AfrikaansPick = { id: 'afPick1', title: 'AF pick', channel: 'AF Channel' }

    // Act — first run: replaces the original placeholder video block
    const region1 = buildRegion(enPicks, afPick)
    const afterFirstRun = replaceVideoRegion(FIXTURE_PATH, original, region1)

    // Assert — the placeholder is gone, the new picks are in, and the example block is
    // preserved byte-for-byte, still immediately after the video region
    expect(afterFirstRun).not.toContain('PLACEHOLDER_FIXTURE_GR10')
    expect(afterFirstRun).toContain('firstPick')
    expect(afterFirstRun).toContain('secondPick')
    expect(afterFirstRun).toContain(MARKER)
    expect(afterFirstRun).toContain("type: 'example'")
    expect(afterFirstRun).toContain(
      'This example block immediately follows the video block. It must never be consumed by the video-block region replacement, even across repeated runs.'
    )

    // Act — second run: an idempotent rerun over the already-filled content
    const region2 = buildRegion(enPicks, afPick)
    const afterSecondRun = replaceVideoRegion(FIXTURE_PATH, afterFirstRun, region2)

    // Assert — identical picks produce identical output, the example block still
    // survives, and the marker comment is not duplicated
    expect(afterSecondRun).toBe(afterFirstRun)
    expect(afterSecondRun).toContain("type: 'example'")
    expect(afterSecondRun).toContain(
      'This example block immediately follows the video block. It must never be consumed by the video-block region replacement, even across repeated runs.'
    )
    expect(afterSecondRun.split(MARKER)).toHaveLength(2)
  })

  it('appends a video region (rather than silently no-op-ing) when no video block exists yet', () => {
    // Arrange — a file whose "blocks" array has no video block at all (e.g.
    // maths/grade12/probability.ts before its first fill)
    const content = `import type { TopicContent } from '@/types'

export const noVideoFixture: TopicContent = {
  id: 'no-video-fixture',
  slug: 'no-video-fixture',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'No Video Fixture',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'No Video Fixture',
      blocks: [
        {
          type: 'tip',
          body: \`No video block exists in this fixture, only a tip block.\`
        }
      ]
    }
  ]
}

export default noVideoFixture
`
    const region = buildRegion([video({ id: 'appended-pick' })], null)

    // Act
    const result = replaceVideoRegion('/fake/path/no-video-fixture.ts', content, region)

    // Assert
    expect(result).toContain(MARKER)
    expect(result).toContain("type: 'video'")
    expect(result).toContain('appended-pick')
    expect(result).toContain("type: 'tip'") // the original block is preserved
  })

  it('throws, naming the file, when the region after the marker is not a video block', () => {
    // Arrange — a hand-corrupted file: the marker is present, but the block right after
    // it is not actually a video block. This must never happen from the script's own
    // output, but the region-replacement must refuse to guess and destroy content.
    const content = `import type { TopicContent } from '@/types'

export const corruptFixture: TopicContent = {
  id: 'corrupt-fixture',
  slug: 'corrupt-fixture',
  subject: 'maths',
  grade: 10,
  paper: 1,
  title: 'Corrupt Fixture',
  capsWeight: 10,
  sections: [
    {
      id: 'coming-soon',
      title: 'Corrupt Fixture',
      blocks: [
        {
          type: 'theory',
          title: 'What this topic covers',
          body: \`• Fixture bullet\`
        },
        ${MARKER}
        {
          type: 'tip',
          body: \`This is not a video block, even though the marker precedes it.\`
        }
      ]
    }
  ]
}

export default corruptFixture
`
    const region = buildRegion([video({ id: 'x' })], null)

    // Act / Assert
    expect(() => replaceVideoRegion('/fake/path/corrupt-fixture.ts', content, region)).toThrow(
      /corrupt-fixture\.ts/
    )
  })
})
