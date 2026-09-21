/**
 * Boss battle step content (correctAnswer/instruction/explanation/hint)
 * often comes back as bare LaTeX with no `$…$`/`$$…$$` delimiters (e.g.
 * `\cos^2\theta = 1 - \sin^2\theta`) - MathRenderer only typesets content
 * wrapped in those delimiters, so unwrapped strings rendered raw LaTeX
 * source instead of KaTeX output.
 *
 * `asMath` is a small, conservative heuristic: a string that already
 * contains a `$` is assumed to have been authored with explicit math
 * delimiters (possibly mixed with prose) and is left untouched: wrapping
 * it again in `$$…$$` would break the existing delimiters. A string with
 * no `$` but at least one backslash is assumed to be bare LaTeX and gets
 * wrapped as display math. Anything else (plain prose, empty strings) is
 * returned unchanged.
 */
export function asMath(text: string): string {
  if (text.includes('$')) return text
  if (text.includes('\\')) return `$$${text}$$`
  return text
}
