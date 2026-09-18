import { describe, it, expect, vi, beforeEach } from 'vitest'

const requireUserMock = vi.fn()
const getApiSupabaseMock = vi.fn()

vi.mock('@/lib/auth/require-user', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/require-user')>(
    '@/lib/auth/require-user'
  )
  return {
    ...actual,
    requireUser: requireUserMock,
  }
})

vi.mock('@/lib/supabase/api', () => ({
  getApiSupabase: getApiSupabaseMock,
}))

const { POST } = await import('@/app/api/ai-skills/issue-certificate/route')

const ALL_MODULES = ['ai-what-is', 'ai-prompts', 'ai-study', 'ai-ethics', 'ai-careers']

interface CertRow {
  id: string
  user_id: string
  certificate_id: string
  student_name: string
  avg_prompt_score: number
  modules_completed: number
  issued_at: string
}

function makeSupabaseMock(options: {
  completedModules: string[]
  studentName?: string
  attemptScores?: number[]
  existingCert?: CertRow | null
}) {
  const { completedModules, studentName = 'Thabo', attemptScores = [], existingCert = null } = options
  const insertedRows: Record<string, unknown>[] = []
  let cert = existingCert

  const client = {
    from(table: string) {
      if (table === 'users') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { name: studentName, ai_modules_completed: completedModules },
                error: null,
              }),
            }),
          }),
        }
      }

      if (table === 'ai_certificates') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: cert, error: null }),
            }),
          }),
          insert: (row: Record<string, unknown>) => {
            insertedRows.push(row)
            cert = {
              id: 'cert-1',
              user_id: row.user_id as string,
              certificate_id: row.certificate_id as string,
              student_name: row.student_name as string,
              avg_prompt_score: row.avg_prompt_score as number,
              modules_completed: row.modules_completed as number,
              issued_at: new Date().toISOString(),
            }
            return { error: null }
          },
        }
      }

      if (table === 'prompt_challenge_attempts') {
        return {
          select: () => ({
            eq: async () => ({
              data: attemptScores.map((score) => ({ ai_score: score })),
              error: null,
            }),
          }),
        }
      }

      throw new Error(`Unexpected table in test mock: ${table}`)
    },
  }

  return { client, insertedRows }
}

describe('POST /api/ai-skills/issue-certificate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when there is no session', async () => {
    requireUserMock.mockRejectedValueOnce(
      Object.assign(new Error('Unauthorized'), { status: 401, name: 'AuthError' })
    )

    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('returns 403 for an authenticated user who has not completed all 5 modules', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', email: 'a@b.com' })
    const { client } = makeSupabaseMock({ completedModules: ALL_MODULES.slice(0, 3) })
    getApiSupabaseMock.mockReturnValue(client)

    const res = await POST()
    expect(res.status).toBe(403)
  })

  it('issues a certificate with a server-computed avg score for an eligible user', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', email: 'a@b.com' })
    const { client, insertedRows } = makeSupabaseMock({
      completedModules: ALL_MODULES,
      attemptScores: [3, 4, 5],
    })
    getApiSupabaseMock.mockReturnValue(client)

    const res = await POST()
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(insertedRows).toHaveLength(1)
    expect(insertedRows[0].avg_prompt_score).toBeCloseTo(4) // (3+4+5)/3
    expect(insertedRows[0].user_id).toBe('user-1')
    expect(body.certificate.avgPromptScore).toBeCloseTo(4)
    expect(body.certificate.certificateId).toMatch(/^AT-\d{4}-[A-Z0-9]{8}$/)
  })

  it('is idempotent: returns the existing certificate instead of minting a second one', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', email: 'a@b.com' })
    const existing: CertRow = {
      id: 'cert-existing',
      user_id: 'user-1',
      certificate_id: 'AT-2026-EXISTING',
      student_name: 'Thabo',
      avg_prompt_score: 4.5,
      modules_completed: 5,
      issued_at: new Date().toISOString(),
    }
    const { client, insertedRows } = makeSupabaseMock({
      completedModules: ALL_MODULES,
      existingCert: existing,
    })
    getApiSupabaseMock.mockReturnValue(client)

    const res = await POST()
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(insertedRows).toHaveLength(0)
    expect(body.certificate.certificateId).toBe('AT-2026-EXISTING')
  })

  it('returns a demo certificate when Supabase is not configured', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'demo-user', email: 'demo@example.com' })
    getApiSupabaseMock.mockReturnValue(null)

    const res = await POST()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.certificate.certificateId).toBe('AT-2026-DEMO')
  })
})
