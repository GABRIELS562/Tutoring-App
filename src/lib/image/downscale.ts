// Long edge cap and JPEG quality for camera-scan uploads. A phone photo
// straight off the camera can be 4000px+ on the long edge and several MB
// - sent as base64 JSON, that both costs more per Anthropic API call
// (larger image = more input tokens) and risks Vercel's request body cap
// (see the server-side 413 check in src/app/api/ai-hint/route.ts, which
// this constant's ~4M-char budget is sized around).
export const MAX_LONG_EDGE_PX = 1280
const JPEG_QUALITY = 0.75
const OUTPUT_MIME_TYPE = 'image/jpeg'

export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Pure function: given an image's natural size, returns the target size
 * scaled down so the long edge is at most `maxLongEdge`, aspect ratio
 * preserved. Returns the input unchanged (never upscales) when it's
 * already within the cap.
 *
 * Split out from downscaleImage() so the scaling math can be unit-tested
 * without a canvas/createImageBitmap - neither is implemented by jsdom,
 * this project's default test environment.
 */
export function computeDownscaledDimensions(
  { width, height }: ImageDimensions,
  maxLongEdge: number = MAX_LONG_EDGE_PX
): ImageDimensions {
  const longEdge = Math.max(width, height)

  if (longEdge <= maxLongEdge) {
    return { width, height }
  }

  const scale = maxLongEdge / longEdge

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  }
}

/**
 * Downscales an image Blob/File client-side so its long edge is capped
 * at MAX_LONG_EDGE_PX, re-encoded as JPEG at quality 0.75 - run before
 * base64-encoding a camera-scan photo in CameraScan.tsx, so the app
 * never uploads a full-resolution phone photo.
 *
 * Falls back to returning the original blob unchanged if the runtime
 * doesn't support createImageBitmap/canvas (very old browsers) or if
 * re-encoding fails for any reason - a larger upload beats a broken
 * camera-scan feature.
 */
export async function downscaleImage(
  file: Blob,
  maxLongEdge: number = MAX_LONG_EDGE_PX
): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  try {
    const { width, height } = computeDownscaledDimensions(
      { width: bitmap.width, height: bitmap.height },
      maxLongEdge
    )

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return file
    }

    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, OUTPUT_MIME_TYPE, JPEG_QUALITY)
    })

    return blob ?? file
  } finally {
    bitmap.close()
  }
}
