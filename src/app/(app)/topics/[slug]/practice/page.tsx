import { getQuestionsByTopic, type QuestionWithDetails } from '@/db/queries/questions'
import { isDemoMode } from '@/db'
import { getTopicMeta } from '@/content/registry'
import PracticePageClient from './PracticePageClient'

type PracticePageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ difficulty?: string }>
}

export default async function PracticePage({ params, searchParams }: PracticePageProps) {
  const { slug } = await params
  const { difficulty: difficultyParam } = await searchParams
  const difficulty = difficultyParam ? parseInt(difficultyParam, 10) : undefined

  let initialQuestions: QuestionWithDetails[] = []

  if (!isDemoMode) {
    try {
      initialQuestions = await getQuestionsByTopic(slug, difficulty)
    } catch (error) {
      console.error(`Failed to load questions for topic "${slug}":`, error)
      initialQuestions = []
    }
  }

  const meta = getTopicMeta(slug)

  return (
    <PracticePageClient
      slug={slug}
      difficulty={difficulty}
      initialQuestions={initialQuestions}
      isDemo={isDemoMode}
      topicName={meta?.title ?? slug}
      topicPaper={meta?.paper ?? null}
    />
  )
}
