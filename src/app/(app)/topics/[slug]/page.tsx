import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import TopicPageClient from './TopicPageClient'

// Import content - Grade 10 Mathematics
import { trigonometryGr10 } from '@/content/maths/grade10/trigonometry'
import { functionsGr10 } from '@/content/maths/grade10/functions'
import { euclideanGeometryGr10 } from '@/content/maths/grade10/euclidean-geometry'
import { analyticalGeometryGr10 } from '@/content/maths/grade10/analytical-geometry'
import { statisticsGr10 } from '@/content/maths/grade10/statistics'
import { algebraGr10 } from '@/content/maths/grade10/algebra'
import { equationsGr10 } from '@/content/maths/grade10/equations'
import { numberPatternsGr10 } from '@/content/maths/grade10/number-patterns'
import { financeGr10 } from '@/content/maths/grade10/finance'
import { probabilityGr10 } from '@/content/maths/grade10/probability'
// Import content - Grade 11 Mathematics
import { trigonometryGr11 } from '@/content/maths/grade11/trigonometry'
import { analyticalGeometryGr11 } from '@/content/maths/grade11/analytical-geometry'
import { euclideanGeometryGr11 } from '@/content/maths/grade11/euclidean-geometry'
import { statisticsGr11 } from '@/content/maths/grade11/statistics'
// Import content - Grade 12 Mathematics
import { calculusGr12 } from '@/content/maths/grade12/calculus'
import { sequencesSeriesGr12 } from '@/content/maths/grade12/sequences-series'
import { analyticalGeometryGr12 } from '@/content/maths/grade12/analytical-geometry'
import { euclideanGeometryGr12 } from '@/content/maths/grade12/euclidean-geometry'
import { probabilityGr12 } from '@/content/maths/grade12/probability'
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
import type { TopicContent } from '@/types'

// Content registry - add more topics here as they're created
const contentRegistry: Record<string, TopicContent> = {
  // Grade 10 Mathematics
  'trig-gr10': trigonometryGr10,
  'functions-gr10': functionsGr10,
  'euclidean-geometry-gr10': euclideanGeometryGr10,
  'analytical-geometry-gr10': analyticalGeometryGr10,
  'statistics-gr10': statisticsGr10,
  'algebra-gr10': algebraGr10,
  'equations-gr10': equationsGr10,
  'number-patterns-gr10': numberPatternsGr10,
  'finance-gr10': financeGr10,
  'probability-gr10': probabilityGr10,
  // Grade 11 Mathematics
  'trig-gr11': trigonometryGr11,
  'trigonometry': trigonometryGr11, // alias
  'analytical-geometry-gr11': analyticalGeometryGr11,
  'euclidean-geometry-gr11': euclideanGeometryGr11,
  'statistics-gr11': statisticsGr11,
  // Grade 12 Mathematics
  'calculus-gr12': calculusGr12,
  'sequences-series-gr12': sequencesSeriesGr12,
  'analytical-geometry-gr12': analyticalGeometryGr12,
  'euclidean-geometry-gr12': euclideanGeometryGr12,
  'probability-gr12': probabilityGr12,
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

// Generate static params for all topics
export function generateStaticParams() {
  return Object.keys(contentRegistry).map((slug) => ({
    slug,
  }))
}

type TopicPageProps = {
  params: Promise<{ slug: string }>
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params

  // Get content for this topic
  const content = contentRegistry[slug]

  if (!content) {
    return (
      <div>
        <Topbar title="Topic Not Found" />
        <div className="p-6">
          <p style={{ color: 'var(--muted-custom)' }}>
            The topic &quot;{slug}&quot; was not found. Please check the URL or go back to subjects.
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg"
            style={{ background: 'var(--accent-red)', color: 'white' }}
          >
            Back to Subjects
          </Link>
        </div>
      </div>
    )
  }

  return <TopicPageClient slug={slug} content={content} />
}
