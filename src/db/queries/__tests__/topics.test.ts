import { describe, it, expect, vi, beforeEach } from 'vitest'

type Chain = {
  from: ReturnType<typeof vi.fn>
  where: ReturnType<typeof vi.fn>
  limit: ReturnType<typeof vi.fn>
  then: (resolve: (value: unknown) => void) => void
}

function makeChain(result: unknown): Chain {
  const chain = {} as Chain
  chain.from = vi.fn(() => chain)
  chain.where = vi.fn(() => chain)
  chain.limit = vi.fn(() => chain)
  chain.then = (resolve: (value: unknown) => void) => resolve(result)
  return chain
}

const dbMock = { select: vi.fn() }

vi.mock('@/db', () => ({ db: dbMock }))

const { pastPaperExists } = await import('../topics')

const naturalKey = {
  subject: 'maths',
  grade: 12,
  year: 2024,
  paperNumber: 1,
  examType: 'november',
}

describe('pastPaperExists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when a paper with the same natural key already exists', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([{ id: 'existing-1' }]))

    const result = await pastPaperExists(naturalKey)

    expect(result).toBe(true)
  })

  it('returns false when no matching paper exists', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    const result = await pastPaperExists(naturalKey)

    expect(result).toBe(false)
  })
})
