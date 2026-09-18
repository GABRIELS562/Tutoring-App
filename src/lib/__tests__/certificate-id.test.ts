import { describe, it, expect } from 'vitest'
import { generateCertificateId, CERT_ID_ALPHABET } from '@/lib/certificate-id'

describe('generateCertificateId', () => {
  it('matches the AT-YYYY-XXXXXXXX format with an 8-char unambiguous alphabet', () => {
    const id = generateCertificateId(2026)
    expect(id).toMatch(/^AT-2026-[A-Z0-9]{8}$/)
  })

  it('only uses characters from the unambiguous 32-symbol alphabet', () => {
    expect(CERT_ID_ALPHABET).toHaveLength(32)
    // No ambiguous characters: I, O, 0, 1
    expect(CERT_ID_ALPHABET).not.toMatch(/[IO01]/)

    for (let i = 0; i < 200; i++) {
      const id = generateCertificateId(2026)
      const suffix = id.slice('AT-2026-'.length)
      expect(suffix).toHaveLength(8)
      for (const char of suffix) {
        expect(CERT_ID_ALPHABET).toContain(char)
      }
    }
  })

  it('defaults to the current year when none is given', () => {
    const id = generateCertificateId()
    const year = new Date().getFullYear()
    expect(id.startsWith(`AT-${year}-`)).toBe(true)
  })

  it('produces different ids across calls (no fixed seed)', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateCertificateId(2026)))
    // Astronomically unlikely to collide 50 times out of 32^8 possibilities
    expect(ids.size).toBe(50)
  })
})
