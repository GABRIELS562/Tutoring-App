import { describe, it, expect } from 'vitest'
import { createCertificateWithRetry } from '@/lib/certificates/create-certificate'

function makeSupabaseMock(insertResults: Array<{ error: { code: string } | null }>) {
  let call = 0
  const insertedIds: string[] = []

  const client = {
    from: () => ({
      insert: (row: { certificate_id: string }) => {
        insertedIds.push(row.certificate_id)
        const result = insertResults[call] ?? insertResults[insertResults.length - 1]
        call += 1
        return Promise.resolve(result)
      },
    }),
  }

  return { client, insertedIds, callCount: () => call }
}

describe('createCertificateWithRetry', () => {
  it('succeeds on the first attempt when the id is unique', async () => {
    const { client, callCount } = makeSupabaseMock([{ error: null }])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createCertificateWithRetry(client as any, {
      userId: 'u1',
      studentName: 'Thabo',
      avgPromptScore: 4.2,
    })

    expect(result.error).toBeUndefined()
    expect(result.certificateId).toMatch(/^AT-\d{4}-[A-Z0-9]{8}$/)
    expect(callCount()).toBe(1)
  })

  it('retries on a unique-constraint conflict (Postgres 23505) up to 3 attempts', async () => {
    const { client, callCount, insertedIds } = makeSupabaseMock([
      { error: { code: '23505' } },
      { error: { code: '23505' } },
      { error: null },
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createCertificateWithRetry(client as any, {
      userId: 'u1',
      studentName: 'Thabo',
      avgPromptScore: 4.2,
    })

    expect(result.certificateId).toBeTruthy()
    expect(callCount()).toBe(3)
    // Each retry must generate a fresh id, not resend the colliding one.
    expect(new Set(insertedIds).size).toBe(3)
  })

  it('gives up after 3 conflicting attempts and returns an error', async () => {
    const { client, callCount } = makeSupabaseMock([
      { error: { code: '23505' } },
      { error: { code: '23505' } },
      { error: { code: '23505' } },
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createCertificateWithRetry(client as any, {
      userId: 'u1',
      studentName: 'Thabo',
      avgPromptScore: 4.2,
    })

    expect(result.certificateId).toBeUndefined()
    expect(result.error).toBeTruthy()
    expect(callCount()).toBe(3)
  })

  it('does not retry on a non-conflict error, and surfaces it immediately', async () => {
    const { client, callCount } = makeSupabaseMock([{ error: { code: '42501' } }])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await createCertificateWithRetry(client as any, {
      userId: 'u1',
      studentName: 'Thabo',
      avgPromptScore: 4.2,
    })

    expect(result.certificateId).toBeUndefined()
    expect(result.error).toBeTruthy()
    expect(callCount()).toBe(1)
  })
})
