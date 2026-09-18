/**
 * Certificate ID generation.
 *
 * Format: AT-YYYY-XXXXXXXX - 8 characters drawn from an unambiguous
 * 32-symbol alphabet (no I, O, 0, 1), giving 32^8 (~1.1e12) possible
 * suffixes per year. Uses crypto.getRandomValues (Web Crypto, available
 * in both the Next.js Edge and Node runtimes) instead of Math.random(),
 * which is not cryptographically strong and had a ~1,000,000-id space at
 * 4 characters.
 *
 * 256 % 32 === 0, so mapping a random byte to an alphabet index with
 * `byte % 32` is uniform - no modulo bias.
 */
export const CERT_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CERT_ID_SUFFIX_LENGTH = 8

export function generateCertificateId(year: number = new Date().getFullYear()): string {
  const randomBytes = new Uint8Array(CERT_ID_SUFFIX_LENGTH)
  crypto.getRandomValues(randomBytes)

  let suffix = ''
  for (let i = 0; i < CERT_ID_SUFFIX_LENGTH; i++) {
    suffix += CERT_ID_ALPHABET[randomBytes[i] % CERT_ID_ALPHABET.length]
  }

  return `AT-${year}-${suffix}`
}
