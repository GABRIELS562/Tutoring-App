import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { lookupCertificate } from '@/lib/certificates/verify-certificate'
import { isCertificateIdShape } from '@/lib/certificate-id'

interface RouteParams {
  params: Promise<{ certificateId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Public endpoint (certificate verification must not require a session),
  // so a best-effort per-IP rate limit is the only guard against scraping.
  const rateLimit = checkRateLimit(`verify:${getClientIp(request.headers)}`)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { valid: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { certificateId } = await params

  // Reject anything that is not shaped like a certificate id before touching
  // the database. Not an injection guard - the query builder parameterises -
  // but a malformed id can never match, so querying it only burns a round
  // trip, and this endpoint is public and scrapeable.
  if (!isCertificateIdShape(certificateId)) {
    return NextResponse.json(
      { valid: false, error: 'Certificate not found' },
      { status: 404 }
    )
  }

  const certificate = await lookupCertificate(certificateId)

  if (!certificate) {
    return NextResponse.json(
      { valid: false, error: 'Certificate not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ valid: true, certificate })
}
