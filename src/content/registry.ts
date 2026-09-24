import type { Grade, Subject, TopicContent } from '@/types'
import { capsCurriculum } from '@/content/caps-curriculum'
import { capsScienceCurriculum } from '@/content/caps-science-curriculum'
import { wavesSoundLightGr10 } from '@/content/science/grade10/waves-sound-light'
import { electricityMagnetismGr10 } from '@/content/science/grade10/electricity-magnetism'
import { chemicalChangeGr10 } from '@/content/science/grade10/chemical-change'
import { chemicalSystemsGr10 } from '@/content/science/grade10/chemical-systems'
import { mechanicsGr11 } from '@/content/science/grade11/mechanics'
import { wavesSoundLightGr11 } from '@/content/science/grade11/waves-sound-light'
import { electricityMagnetismGr11 } from '@/content/science/grade11/electricity-magnetism'
import { matterMaterialsGr11 } from '@/content/science/grade11/matter-materials'
import { chemicalChangeGr11 } from '@/content/science/grade11/chemical-change'
import { chemicalSystemsGr11 } from '@/content/science/grade11/chemical-systems'
import { mechanicsGr12 } from '@/content/science/grade12/mechanics'
import { wavesSoundLightGr12 } from '@/content/science/grade12/waves-sound-light'
import { electricityMagnetismGr12 } from '@/content/science/grade12/electricity-magnetism'
import { opticalPhenomenaGr12 } from '@/content/science/grade12/optical-phenomena'
import { organicChemistryGr12 } from '@/content/science/grade12/organic-chemistry'
import { chemicalChangeGr12 } from '@/content/science/grade12/chemical-change'
import { chemicalSystemsGr12 } from '@/content/science/grade12/chemical-systems'

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
import { matterMaterialsGr10 } from '@/content/science/grade10/matter-materials'
// Import content - Grade 11 Physical Sciences
// Import content - Grade 12 Physical Sciences

/**
 * Single source of truth mapping a URL slug to its TopicContent.
 * Some slugs are aliases for the same content (e.g. 'trigonometry' ->
 * Grade 11 trig) - the canonical slug is the one matching `content.id`.
 *
 * Any page that needs topic content or metadata (title/subject/grade/paper)
 * should read from here rather than hand-maintaining its own copy.
 */
export const contentRegistry: Record<string, TopicContent> = {
  // ---- CAPS Physical Sciences (src/content/caps-science-curriculum.ts)
  'waves-sound-light-gr10': wavesSoundLightGr10,
  'electricity-magnetism-gr10': electricityMagnetismGr10,
  'chemical-change-gr10': chemicalChangeGr10,
  'chemical-systems-gr10': chemicalSystemsGr10,
  'mechanics-gr11': mechanicsGr11,
  'waves-sound-light-gr11': wavesSoundLightGr11,
  'electricity-magnetism-gr11': electricityMagnetismGr11,
  'matter-materials-gr11': matterMaterialsGr11,
  'chemical-change-gr11': chemicalChangeGr11,
  'chemical-systems-gr11': chemicalSystemsGr11,
  'mechanics-gr12': mechanicsGr12,
  'waves-sound-light-gr12': wavesSoundLightGr12,
  'electricity-magnetism-gr12': electricityMagnetismGr12,
  'optical-phenomena-gr12': opticalPhenomenaGr12,
  'organic-chemistry-gr12': organicChemistryGr12,
  'chemical-change-gr12': chemicalChangeGr12,
  'chemical-systems-gr12': chemicalSystemsGr12,

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
  'waves-gr10': wavesSoundLightGr10, // folded into the CAPS topic
  'sound-gr10': wavesSoundLightGr10, // folded into the CAPS topic
  'em-radiation-gr10': wavesSoundLightGr10, // folded into the CAPS topic
  'electric-circuits-gr10': electricityMagnetismGr10, // folded into the CAPS topic
  'matter-materials-gr10': matterMaterialsGr10,
  // Grade 11 Physical Sciences
  'newtons-laws-gr11': mechanicsGr11, // folded into the CAPS topic
  'waves-sound-gr11': wavesSoundLightGr11, // folded into the CAPS topic
  // Grade 12 Physical Sciences
  'momentum-gr12': mechanicsGr12, // folded into the CAPS topic
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
  titleAf?: string
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
  const maths = capsCurriculum.findIndex((topic) => topic.slug === slug)
  if (maths !== -1) return maths
  const science = capsScienceCurriculum.findIndex((topic) => topic.slug === slug)
  return science === -1 ? Number.MAX_SAFE_INTEGER : science
}

export function getTopicsForSubjectGrade(subject: Subject, grade: Grade): RegisteredTopic[] {
  const seen = new Set<string>()
  const result: RegisteredTopic[] = []

  for (const [slug, content] of Object.entries(contentRegistry)) {
    if (content.subject !== subject || content.grade !== grade) continue
    if (slug !== content.id) continue // skip aliases
    if (seen.has(content.id)) continue

    seen.add(content.id)
    result.push({
      slug,
      title: content.title,
      titleAf: content.titleAf,
      paper: content.paper,
    })
  }

  return result.sort((a, b) => capsOrder(a.slug) - capsOrder(b.slug))
}
