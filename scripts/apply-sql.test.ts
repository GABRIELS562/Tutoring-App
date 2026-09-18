import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const queryMock = vi.fn()
const releaseMock = vi.fn()
const connectMock = vi.fn(async () => ({ query: queryMock, release: releaseMock }))
const endMock = vi.fn(async () => {})
const PoolMock = vi.fn().mockImplementation((config: { connectionString: string }) => ({
  connectionString: config.connectionString,
  connect: connectMock,
  end: endMock,
}))

vi.mock('pg', () => ({
  Pool: PoolMock,
}))

vi.mock('node:fs', () => {
  const readFileSync = vi.fn(() => 'CREATE POLICY ...;')
  return { readFileSync, default: { readFileSync } }
})

const { applySqlFile, main } = await import('./apply-sql')

describe('applySqlFile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryMock.mockResolvedValue(undefined)
  })

  it('runs BEGIN, the file contents, then COMMIT, and releases the connection', async () => {
    await applySqlFile('supabase/migrations/0001_rls.sql', 'postgres://example')

    expect(PoolMock).toHaveBeenCalledWith({ connectionString: 'postgres://example' })
    expect(queryMock.mock.calls.map((c) => c[0])).toEqual(['BEGIN', 'CREATE POLICY ...;', 'COMMIT'])
    expect(releaseMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()
  })

  it('rolls back and sets a non-zero exit code when a statement fails', async () => {
    queryMock
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error('syntax error')) // the file contents

    const originalExitCode = process.exitCode
    await applySqlFile('supabase/migrations/0001_rls.sql', 'postgres://example')

    expect(queryMock.mock.calls.map((c) => c[0])).toEqual(['BEGIN', 'CREATE POLICY ...;', 'ROLLBACK'])
    expect(process.exitCode).toBe(1)
    expect(releaseMock).toHaveBeenCalled()
    expect(endMock).toHaveBeenCalled()

    process.exitCode = originalExitCode
  })
})

describe('main (CLI arg / env validation)', () => {
  const originalArgv = [...process.argv]
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.clearAllMocks()
    queryMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    process.argv = [...originalArgv]
    process.env = { ...originalEnv }
    process.exitCode = undefined
  })

  it('refuses to run and never touches the database when no sql path is given', async () => {
    process.argv = ['node', 'apply-sql.ts']
    delete process.env.DATABASE_URL

    await main()

    expect(process.exitCode).toBe(1)
    expect(PoolMock).not.toHaveBeenCalled()
  })

  it('refuses to run and never touches the database when DATABASE_URL is unset', async () => {
    process.argv = ['node', 'apply-sql.ts', 'supabase/migrations/0001_rls.sql']
    delete process.env.DATABASE_URL

    await main()

    expect(process.exitCode).toBe(1)
    expect(PoolMock).not.toHaveBeenCalled()
  })

  it('applies the file when both a path and DATABASE_URL are present', async () => {
    process.argv = ['node', 'apply-sql.ts', 'supabase/migrations/0001_rls.sql']
    process.env.DATABASE_URL = 'postgres://example'

    await main()

    expect(PoolMock).toHaveBeenCalledWith({ connectionString: 'postgres://example' })
  })
})
