/**
 * WCAG 2.x relative luminance / contrast ratio helpers.
 *
 * Used once, at boss-registry authoring time (see src/content/bosses.ts),
 * to derive each boss's `onAccent` field - whether white or near-black
 * text reads legibly on top of that boss's accent colour. Kept generic
 * (hex in, ratio out) rather than boss-specific so it's reusable anywhere
 * else in the app that draws text on an arbitrary background colour.
 */

/** Text colour to use when a background needs light (white) text. */
export const ACCENT_TEXT_LIGHT = '#ffffff'
/** Text colour to use when a background needs dark (near-black) text.
 * Plain black rather than the app's dark-theme `--bg` (#0d1117) - it's
 * the more legible of the two against every current boss accent and
 * leaves headroom for future accents without re-deriving the constant. */
export const ACCENT_TEXT_DARK = '#000000'

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized
  const int = parseInt(value, 16)
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255]
}

function channelLuminance(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** WCAG relative luminance (0 = black, 1 = white) of a hex colour. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
}

/** WCAG contrast ratio (1 to 21) between two hex colours. */
export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA)
  const luminanceB = relativeLuminance(hexB)
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Picks whichever of ACCENT_TEXT_LIGHT / ACCENT_TEXT_DARK contrasts more
 * strongly against `backgroundHex`, returning the semantic label the
 * caller stores/uses ('light' means "use ACCENT_TEXT_LIGHT text").
 */
export function pickAccentTextColor(backgroundHex: string): 'light' | 'dark' {
  const lightContrast = contrastRatio(backgroundHex, ACCENT_TEXT_LIGHT)
  const darkContrast = contrastRatio(backgroundHex, ACCENT_TEXT_DARK)
  return lightContrast >= darkContrast ? 'light' : 'dark'
}
