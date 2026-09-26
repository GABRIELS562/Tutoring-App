import { DEMO_CERTIFICATE_ID } from '@/lib/certificate-id'
import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const { GET } = await import('@/app/api/verify/[certificateId]/route')

function makeRequest(ip: string) {
  return new NextRequest('http://localhost/api/verify/${DEMO_CERTIFICATE_ID}', {
    method: 'GET',
    headers: { 'x-forwarded-for': ip },
  })
}

function callRoute(ip: string) {
  return GET(makeRequest(ip), { params: Promise.resolve({ certificateId: DEMO_CERTIFICATE_ID }) })
}

describe('GET /api/verify/[certificateId] rate limiting', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  it('allows requests under the limit (demo certificate, 200)', async () => {
    const ip = `1.2.3.${Math.floor(Math.random() * 255)}`
    const res = await callRoute(ip)
    expect(res.status).toBe(200)
  })

  it('returns 429 once a single IP exceeds 30 requests within the window', async () => {
    const ip = `9.9.9.${Math.floor(Math.random() * 255)}-${Date.now()}`

    let lastStatus = 200
    for (let i = 0; i < 31; i++) {
      const res = await callRoute(ip)
      lastStatus = res.status
    }

    expect(lastStatus).toBe(429)
  })

  it('tracks separate IPs independently', async () => {
    const ipA = `10.0.0.${Math.floor(Math.random() * 255)}-${Date.now()}-a`
    const ipB = `10.0.0.${Math.floor(Math.random() * 255)}-${Date.now()}-b`

    for (let i = 0; i < 30; i++) {
      await callRoute(ipA)
    }
    const blockedA = await callRoute(ipA)
    const stillAllowedB = await callRoute(ipB)

    expect(blockedA.status).toBe(429)
    expect(stillAllowedB.status).toBe(200)
  })
})
