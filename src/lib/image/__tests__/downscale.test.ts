import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { computeDownscaledDimensions, downscaleImage } from '@/lib/image/downscale'

describe('computeDownscaledDimensions (pure size-cap math)', () => {
  it('leaves dimensions unchanged when already within the cap', () => {
    expect(computeDownscaledDimensions({ width: 800, height: 600 })).toEqual({
      width: 800,
      height: 600,
    })
  })

  it('scales down a width-dominant image so the long edge is exactly the cap', () => {
    const result = computeDownscaledDimensions({ width: 4000, height: 2000 })
    expect(result.width).toBe(1280)
    expect(result.height).toBe(640)
  })

  it('scales down a height-dominant image so the long edge is exactly the cap', () => {
    const result = computeDownscaledDimensions({ width: 2000, height: 4000 })
    expect(result.width).toBe(640)
    expect(result.height).toBe(1280)
  })

  it('respects a custom maxLongEdge', () => {
    const result = computeDownscaledDimensions({ width: 1000, height: 500 }, 400)
    expect(result.width).toBe(400)
    expect(result.height).toBe(200)
  })

  it('never upscales a small image', () => {
    expect(computeDownscaledDimensions({ width: 100, height: 50 })).toEqual({
      width: 100,
      height: 50,
    })
  })

  it('treats a square image at exactly the cap as unchanged', () => {
    expect(computeDownscaledDimensions({ width: 1280, height: 1280 })).toEqual({
      width: 1280,
      height: 1280,
    })
  })
})

describe('downscaleImage', () => {
  const originalCreateImageBitmap = globalThis.createImageBitmap

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalCreateImageBitmap) {
      globalThis.createImageBitmap = originalCreateImageBitmap
    } else {
      // @ts-expect-error - jsdom does not define this by default
      delete globalThis.createImageBitmap
    }
  })

  function mockCanvas(outputBlob: Blob | null) {
    const toBlob = vi.fn((callback: BlobCallback) => {
      callback(outputBlob)
    })
    const drawImage = vi.fn()
    const getContext = vi.fn(() => ({ drawImage }))

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext,
          toBlob,
        } as unknown as HTMLCanvasElement
      }
      return document.createElement(tagName)
    })

    return { toBlob, drawImage, getContext }
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('downscales an oversized image and re-encodes as JPEG at quality 0.75', async () => {
    const closeMock = vi.fn()
    globalThis.createImageBitmap = vi.fn(async () => ({
      width: 4000,
      height: 2000,
      close: closeMock,
    })) as unknown as typeof createImageBitmap

    const outputBlob = new Blob(['downscaled'], { type: 'image/jpeg' })
    const { toBlob, drawImage } = mockCanvas(outputBlob)

    const inputFile = new File(['original'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await downscaleImage(inputFile)

    expect(globalThis.createImageBitmap).toHaveBeenCalledWith(inputFile)
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1280, 640)
    expect(toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      'image/jpeg',
      0.75
    )
    expect(result).toBe(outputBlob)
    expect(closeMock).toHaveBeenCalled()
  })

  it('falls back to the original file when createImageBitmap is unsupported', async () => {
    // @ts-expect-error - simulate an environment without createImageBitmap
    delete globalThis.createImageBitmap

    const inputFile = new File(['original'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await downscaleImage(inputFile)

    expect(result).toBe(inputFile)
  })

  it('falls back to the original file when canvas.toBlob yields null', async () => {
    globalThis.createImageBitmap = vi.fn(async () => ({
      width: 4000,
      height: 2000,
      close: vi.fn(),
    })) as unknown as typeof createImageBitmap

    mockCanvas(null)

    const inputFile = new File(['original'], 'photo.jpg', { type: 'image/jpeg' })
    const result = await downscaleImage(inputFile)

    expect(result).toBe(inputFile)
  })
})
