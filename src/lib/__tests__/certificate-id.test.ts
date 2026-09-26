import { describe, it, expect } from 'vitest'
import {
  generateCertificateId,
  isCertificateIdShape,
  DEMO_CERTIFICATE_ID,
  CERT_ID_ALPHABET,
} from '@/lib/certificate-id'

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

/**
 * The public verify endpoint is unauthenticated and scrapeable, so an id
 * that cannot possibly match should be rejected before it costs a database
 * round trip and a rate-limit slot. The alphabet omits I, O, 0 and 1, so a
 * lookalike mistyped off a printed certificate fails here too.
 */
describe('isCertificateIdShape', () => {
  it('accepts an id this module generated', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateCertificateId(2026)
      expect(isCertificateIdShape(id), id).toBe(true)
    }
  })

  it.each([
    ['empty', ''],
    ['excluded lookalike letters', 'AT-2026-IIIIIIII'],
    ['two-digit year', 'AT-26-ABCDEFGH'],
    ['suffix too short', 'AT-2026-ABCDEFG'],
    ['suffix too long', 'AT-2026-ABCDEFGHJ'],
    ['lowercase', 'at-2026-abcdefgh'],
    ['wrong prefix', 'XX-2026-ABCDEFGH'],
    ['sql-looking', "AT-2026-'; DROP--"],
    ['newline injection', 'AT-2026-ABCDEFGH\nAT-2026-ABCDEFGH'],
  ])('rejects %s', (_label, value) => {
    expect(isCertificateIdShape(value)).toBe(false)
  })

  it('rejects an absurdly long string without hanging', () => {
    expect(isCertificateIdShape('A'.repeat(100_000))).toBe(false)
  })
})

/**
 * The demo certificate has to satisfy the same format as a real one.
 *
 * It did not: the id was 'AT-2026-DEMO...', and the alphabet deliberately
 * omits I, O, 0 and 1 as lookalikes, so the O made it invalid. Nothing
 * caught that until the public verify endpoint started rejecting malformed
 * ids before querying - at which point the demo certificate became
 * unverifiable. This pins the two together.
 */
describe('the demo certificate id', () => {
  it('satisfies the real certificate format', () => {
    expect(isCertificateIdShape(DEMO_CERTIFICATE_ID)).toBe(true)
  })

  it('uses only characters from the unambiguous alphabet', () => {
    const suffix = DEMO_CERTIFICATE_ID.split('-')[2]
    for (const character of suffix) {
      expect(CERT_ID_ALPHABET, `${character} is not in the alphabet`).toContain(character)
    }
  })
})
