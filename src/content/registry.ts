import type { Grade, Subject, TopicContent } from '@/types'
import { capsCurriculum } from '@/content/caps-curriculum'

// Import content - Grade 10 Mathematics
import { trigonometryGr10 } from '@/content/maths/grade10/trigonometry'
import { functionsGr10 } from '@/content/maths/grade10/functions'
import { euclideanGeometryGr10 } from '@/content/maths/grade10/euclidean-geometry'
import { analyticalGeometryGr10 } from '@/content/maths/grade10/analytical-geometry'
import { statisticsGr10 } from '@/content/maths/grade10/statistics'
import { algebraGr10 } from '@/content/maths/grade10/algebra'
import { numberPatternsGr10 } from '@/content/maths/grade10/number-patterns'
import { financeGr10 } from '@/content/maths/grade10/finance'
import { probabilityGr10 } from '@/content/maths/grade10/probability'
// Import content - Grade 11 Mathematics
import { trigonometryGr11 } from '@/content/maths/grade11/trigonometry'
import { analyticalGeometryGr11 } from '@/content/maths/grade11/analytical-geometry'
import { euclideanGeometryGr11 } from '@/content/maths/grade11/euclidean-geometry'
import { statisticsGr11 } from '@/content/maths/grade11/statistics'
import { algebraGr11 } from '@/content/maths/grade11/algebra'
import { numberPatternsGr11 } from '@/content/maths/grade11/number-patterns'
import { functionsGr11 } from '@/content/maths/grade11/functions'
import { financeGr11 } from '@/content/maths/grade11/finance'
import { probabilityGr11 } from '@/content/maths/grade11/probability'
// Import content - Grade 12 Mathematics
import { calculusGr12 } from '@/content/maths/grade12/calculus'
import { sequencesSeriesGr12 } from '@/content/maths/grade12/sequences-series'
import { analyticalGeometryGr12 } from '@/content/maths/grade12/analytical-geometry'
import { euclideanGeometryGr12 } from '@/content/maths/grade12/euclidean-geometry'
import { probabilityGr12 } from '@/content/maths/grade12/probability'
import { algebraGr12 } from '@/content/maths/grade12/algebra'
import { functionsGr12 } from '@/content/maths/grade12/functions'
import { financeGr12 } from '@/content/maths/grade12/finance'
import { trigGr12 } from '@/content/maths/grade12/trig'
import { statisticsGr12 } from '@/content/maths/grade12/statistics'
// Import content - Grade 10 Physical Sciences
import { mechanicsGr10 } from '@/content/science/grade10/mechanics'
import { wavesGr10 } from '@/content/science/grade10/waves'
import { soundGr10 } from '@/content/science/grade10/sound'
import { emRadiationGr10 } from '@/content/science/grade10/electromagnetic-radiation'
import { electricCircuitsGr10 } from '@/content/science/grade10/electric-circuits'
import { matterMaterialsGr10 } from '@/content/science/grade10/matter-materials'
// Import content - Grade 11 Physical Sciences
import { newtonsLawsGr11 } from '@/content/science/grade11/newtons-laws'
import { wavesSoundGr11 } from '@/content/science/grade11/waves-sound'
// Import content - Grade 12 Physical Sciences
import { momentumGr12 } from '@/content/science/grade12/momentum'

/**
 * Single source of truth mapping a URL slug to its TopicContent.
 * Some slugs are aliases for the same content (e.g. 'trigonometry' ->
 * Grade 11 trig) - the canonical slug is the one matching `content.id`.
 *
 * Any page that needs topic content or metadata (title/subject/grade/paper)
 * should read from here rather than hand-maintaining its own copy.
 */
export const contentRegistry: Record<string, TopicContent> = {
  // Grade 10 Mathematics
  'trig-gr10': trigonometryGr10,
  'functions-gr10': functionsGr10,
  'euclidean-geometry-gr10': euclideanGeometryGr10,
  'analytical-geometry-gr10': analyticalGeometryGr10,
  'statistics-gr10': statisticsGr10,
  'algebra-gr10': algebraGr10,
  // Predates the CAPS handbook transcription and duplicated Algebra's
  // equations and inequalities sub-topics, so it no longer appears as its own
  // Grade 10 topic. Kept as an alias so existing links still resolve.
  'equations-gr10': algebraGr10,
  'number-patterns-gr10': numberPatternsGr10,
  'finance-gr10': financeGr10,
  'probability-gr10': probabilityGr10,
  // Grade 11 Mathematics
  'trig-gr11': trigonometryGr11,
  'trigonometry': trigonometryGr11, // alias
  'analytical-geometry-gr11': analyticalGeometryGr11,
  'euclidean-geometry-gr11': euclideanGeometryGr11,
  'statistics-gr11': statisticsGr11,
  'algebra-gr11': algebraGr11,
  'number-patterns-gr11': numberPatternsGr11,
  'functions-gr11': functionsGr11,
  'finance-gr11': financeGr11,
  'probability-gr11': probabilityGr11,
  // Grade 12 Mathematics
  'calculus-gr12': calculusGr12,
  'sequences-series-gr12': sequencesSeriesGr12,
  'analytical-geometry-gr12': analyticalGeometryGr12,
  'euclidean-geometry-gr12': euclideanGeometryGr12,
  'probability-gr12': probabilityGr12,
  'algebra-gr12': algebraGr12,
  'functions-gr12': functionsGr12,
  'finance-gr12': financeGr12,
  'trig-gr12': trigGr12,
  'statistics-gr12': statisticsGr12,
  // Grade 10 Physical Sciences
  'mechanics-gr10': mechanicsGr10,
  'waves-gr10': wavesGr10,
  'sound-gr10': soundGr10,
  'em-radiation-gr10': emRadiationGr10,
  'electric-circuits-gr10': electricCircuitsGr10,
  'matter-materials-gr10': matterMaterialsGr10,
  // Grade 11 Physical Sciences
  'newtons-laws-gr11': newtonsLawsGr11,
  'waves-sound-gr11': wavesSoundGr11,
  // Grade 12 Physical Sciences
  'momentum-gr12': momentumGr12,
}

export type TopicMeta = {
  title: string
  subject: Subject
  grade: Grade
  paper: 1 | 2 | null
}

/**
 * Lightweight metadata for a topic slug, without pulling in the full
 * content body. Returns null when the slug isn't registered.
 */
export function getTopicMeta(slug: string): TopicMeta | null {
  const content = contentRegistry[slug]
  if (!content) return null

  return {
    title: content.title,
    subject: content.subject,
    grade: content.grade,
    paper: content.paper,
  }
}

export type RegisteredTopic = {
  slug: string
  title: string
  paper: 1 | 2 | null
}

/**
 * Canonical (non-alias) topics for a subject/grade, in registry
 * insertion order (the de facto CAPS term order the content files were
 * added in - the content files don't carry a numeric sortOrder field).
 * Dedupes aliases by keeping only the slug that matches `content.id`.
 */
/**
 * Topics in the order the CAPS handbook lists them, so the app reads the way
 * the document a student revises from does. Registry insertion order put
 * Calculus at the top of Grade 12 Paper 1 where the handbook starts with
 * Algebra. Anything not in the handbook keeps its position at the end.
 */
function capsOrder(slug: string): number {
  const index = capsCurriculum.findIndex((topic) => topic.slug === slug)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

export function getTopicsForSubjectGrade(subject: Subject, grade: Grade): RegisteredTopic[] {
  const seen = new Set<string>()
  const result: RegisteredTopic[] = []

  for (const [slug, content] of Object.entries(contentRegistry)) {
    if (content.subject !== subject || content.grade !== grade) continue
    if (slug !== content.id) continue // skip aliases
    if (seen.has(content.id)) continue

    seen.add(content.id)
    result.push({ slug, title: content.title, paper: content.paper })
  }

  return result.sort((a, b) => capsOrder(a.slug) - capsOrder(b.slug))
}
