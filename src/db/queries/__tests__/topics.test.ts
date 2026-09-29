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

/**
 * Language belongs in the natural key. Without it the English and
 * Afrikaans editions of the same paper collide, and seed-papers.ts -
 * which calls this before every insert - keeps whichever it reaches
 * first and silently drops the other. On a bilingual app that leaves
 * Afrikaans students with an English paper or none at all.
 *
 * These assert on the WHERE that was actually built, because the bug
 * they guard was a missing comparison, not a wrong result.
 */
function whereMentions(value: string): boolean {
  const chain = dbMock.select.mock.results[0].value as Chain
  const [condition] = chain.where.mock.calls[0]
  const seen = new Set<unknown>()

  const walk = (node: unknown): boolean => {
    if (node === value) return true
    if (node === null || typeof node !== 'object') return false
    if (seen.has(node)) return false
    seen.add(node)
    return Object.values(node as Record<string, unknown>).some(walk)
  }

  return walk(condition)
}

describe('pastPaperExists keys on language', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('compares against the language it was given', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    await pastPaperExists({ ...naturalKey, language: 'afrikaans' })

    expect(whereMentions('afrikaans')).toBe(true)
  })

  it('falls back to english when no language is given', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    await pastPaperExists(naturalKey)

    expect(whereMentions('english')).toBe(true)
    expect(whereMentions('afrikaans')).toBe(false)
  })

  it('treats a null language as english, matching the column default', async () => {
    dbMock.select.mockReturnValueOnce(makeChain([]))

    await pastPaperExists({ ...naturalKey, language: null })

    expect(whereMentions('english')).toBe(true)
  })
})
