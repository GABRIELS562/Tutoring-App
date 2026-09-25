import { gr11P2Exemplar2013 } from '@/content/exam/gr11-p2-2013'
import ExamPageClient from './ExamPageClient'

export const dynamic = 'force-dynamic'

export default function ExamPage() {
  return <ExamPageClient items={gr11P2Exemplar2013} />
}
