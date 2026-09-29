import { notFound } from 'next/navigation'
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

  // An unregistered slug is a broken link, and it must look like one.
  // This used to fall through to `topicName={slug}`, so /topics/mechanics/
  // practice rendered a page headed "mechanics" with an empty quiz and a
  // "Back to notes" button that then 404'd - a dead link disguised as a
  // real topic nobody had written questions for yet. /topics/[slug] and
  // /boss both notFound() already; this was the one that did not.
  const meta = getTopicMeta(slug)
  if (!meta) {
    notFound()
  }

  let initialQuestions: QuestionWithDetails[] = []

  if (!isDemoMode) {
    try {
      initialQuestions = await getQuestionsByTopic(slug, difficulty)
    } catch (error) {
      console.error(`Failed to load questions for topic "${slug}":`, error)
      initialQuestions = []
    }
  }

  return (
    <PracticePageClient
      slug={slug}
      difficulty={difficulty}
      initialQuestions={initialQuestions}
      isDemo={isDemoMode}
      topicName={meta.title}
      topicPaper={meta.paper}
    />
  )
}
