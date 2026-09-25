/**
 * Extracts NSC question papers and their memoranda into structured exam items.
 *
 *   npx tsx scripts/extract-exam-papers.ts [--paper p2-eng] [--json]
 *
 * The memo is the valuable half. South African memoranda name every mark -
 * question 1.1 is not "2 marks", it is a mark for writing 408/19 and a mark
 * for the answer - which is what lets the app mark like an examiner rather
 * than like a quiz, and award method marks where the working is right and
 * the answer is wrong.
 *
 * Nothing here is trusted. Every paper has a known mark total printed on it,
 * and the extractor reports what it parsed against that total; a paper that
 * does not reconcile is reported, not silently accepted.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

export interface MarkPoint {
  /** The memo's own words for this mark, e.g. 'Q1 = 18'. */
  descriptor: string
  kind: 'method' | 'answer' | 'reason'
  value: number
}

export interface ExamItem {
  id: string
  paper: 'P1' | 'P2'
  grade: 10 | 11 | 12
  year: number
  source: string
  language: 'en' | 'af'
  question: string
  /** Stem shared by the sub-parts of one question. */
  context?: string
  prompt: string
  marks: number
  /** The question cannot be answered without a diagram we do not have yet. */
  needsDiagram: boolean
  /** The answer is a drawing, so it cannot be auto-marked from text. */
  requiresDrawing: boolean
  markScheme: MarkPoint[]
}

interface PaperSpec {
  key: string
  qp: string
  memo: string
  paper: 'P1' | 'P2'
  grade: 10 | 11 | 12
  year: number
  language: 'en' | 'af'
  source: string
  expectedMarks: number
}

const PAPERS: PaperSpec[] = [
  {
    key: 'p2-eng',
    qp: 'Maths-P2-Gr11-Exemplar-2013-Eng-QP.pdf',
    memo: 'Maths-P2-Gr11-Exemplar-2013-Eng-Memo.pdf',
    paper: 'P2',
    grade: 11,
    year: 2013,
    language: 'en',
    source: 'DBE Grade 11 Exemplar 2013',
    expectedMarks: 150,
  },
  {
    key: 'p1-afr',
    qp: 'Maths-P1-Gr11-Exemplar-2013-Afr-QP.pdf',
    memo: 'Maths-P1-Gr11-Exemplar-2013-Afr-Memo.pdf',
    paper: 'P1',
    grade: 11,
    year: 2013,
    language: 'af',
    source: 'DBE Graad 11 Eksemplaar 2013',
    expectedMarks: 150,
  },
]

const DIR = 'docs/curriculum/past-papers/'

/** pypdf via python: the only PDF text extractor already available here. */
function pdfText(file: string): string {
  return execFileSync(
    'python3',
    [
      '-c',
      [
        'import warnings,sys; warnings.filterwarnings("ignore")',
        'from pypdf import PdfReader',
        'r=PdfReader(sys.argv[1])',
        'sys.stdout.write("\\n".join((p.extract_text() or "") for p in r.pages))',
      ].join('\n'),
      DIR + file,
    ],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stderr: 'pipe' } as never
  )
}

/** Page headers and footers repeat on every page and break the parse. */
function stripFurniture(text: string): string {
  return text
    .replace(
      /^.*(copyright reserved|kopiereg voorbehou|please turn over|blaai om asseblief|dbe\/2013|nsc\s*[-–]|nss\s*[-–]|mathematics\/p\d|wiskunde\/v\d).*$/gim,
      ''
    )
    .replace(/\n{3,}/g, '\n\n')
}

const GIVEN_DIAGRAM =
  /in the (?:diagram|figure|sketch)|diagram below|graph below|shown below|as shown|histogram below|in die (?:diagram|figuur|skets)|hieronder|onderstaande|soos getoon/i
const ASKS_DRAWING = /\b(draw|sketch|plot)\b|\b(teken|skets|stip)\b/i

function main() {
  const wantJson = process.argv.includes('--json')
  const only = process.argv[process.argv.indexOf('--paper') + 1]
  const all: ExamItem[] = []

  for (const spec of PAPERS) {
    if (only && only !== spec.key && process.argv.includes('--paper')) continue

    const qp = stripFurniture(pdfText(spec.qp))
    const blocks = qp.split(/(?=(?:QUESTION|VRAAG)\s+\d+\s)/)
    const items: ExamItem[] = []

    for (const block of blocks) {
      const qMatch = block.match(/^(?:QUESTION|VRAAG)\s+(\d+)/)
      if (!qMatch) continue
      const qNum = qMatch[1]

      // Everything before the first "N.1" is the stem the sub-parts share.
      const firstSub = block.search(new RegExp(`^\\s*${qNum}\\.\\d`, 'm'))
      const context =
        firstSub > 0
          ? block.slice(qMatch[0].length, firstSub).replace(/\s+/g, ' ').trim()
          : ''
      const body = firstSub > 0 ? block.slice(firstSub) : ''

      // A sub-part runs until the next one starts or the question total.
      const subRe = new RegExp(
        `^\\s*(${qNum}\\.\\d(?:\\.\\d)?)\\s+([\\s\\S]*?)(?=^\\s*${qNum}\\.\\d|\\[\\d+\\]|$)`,
        'gm'
      )
      for (const m of body.matchAll(subRe)) {
        const raw = m[2]
        const markMatch = raw.match(/\((\d{1,2})\)\s*$/m) ?? raw.match(/\((\d{1,2})\)/)
        if (!markMatch) continue
        const prompt = raw
          .replace(/\((\d{1,2})\)/g, '')
          .replace(/\s+/g, ' ')
          .trim()
        if (prompt.length < 4) continue
        const scope = `${context} ${prompt}`
        items.push({
          id: `${spec.key}-${m[1]}`,
          paper: spec.paper,
          grade: spec.grade,
          year: spec.year,
          source: spec.source,
          language: spec.language,
          question: m[1],
          context: context || undefined,
          prompt,
          marks: parseInt(markMatch[1], 10),
          needsDiagram: GIVEN_DIAGRAM.test(scope),
          requiresDrawing: ASKS_DRAWING.test(prompt),
          markScheme: [],
        })
      }
    }

    const parsed = items.reduce((n, i) => n + i.marks, 0)
    const ok = parsed === spec.expectedMarks
    console.log(
      `${spec.key.padEnd(8)} ${String(items.length).padStart(3)} sub-parts  ` +
        `${String(parsed).padStart(3)}/${spec.expectedMarks} marks  ${ok ? 'reconciles' : '** DOES NOT RECONCILE **'}`
    )
    const diagram = items.filter((i) => i.needsDiagram).length
    const drawing = items.filter((i) => i.requiresDrawing).length
    console.log(
      `         text-only ${items.length - diagram - drawing}, needs a diagram ${diagram}, answer is a drawing ${drawing}`
    )
    all.push(...items)
  }

  if (wantJson) {
    mkdirSync('docs/curriculum/exam-items', { recursive: true })
    writeFileSync('docs/curriculum/exam-items/items.json', JSON.stringify(all, null, 2))
    console.log(`\nWrote docs/curriculum/exam-items/items.json — ${all.length} items`)
  }
}

main()
