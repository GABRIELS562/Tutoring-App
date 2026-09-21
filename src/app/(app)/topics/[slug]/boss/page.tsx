import { notFound } from 'next/navigation'
import { contentRegistry, getTopicMeta } from '@/content/registry'
import { demoQuestions } from '@/content/demo-questions'
import { getQuestionsByTopic, type QuestionWithDetails } from '@/db/queries/questions'
import { isDemoMode } from '@/db'
import { getSessionUser } from '@/lib/auth/require-user'
import BossBattleClient from '@/components/boss/BossBattleClient'

type BossPageProps = {
  params: Promise<{ slug: string }>
}

/**
 * Boss Battle route - same topic/question data as Practice
 * (src/app/(app)/topics/[slug]/practice/page.tsx), just handed to
 * BossBattleClient instead of QuizEngine. Mirrors that page's
 * demo-mode/error-handling shape so the two stay easy to compare.
 */
export default async function BossPage({ params }: BossPageProps) {
  const { slug } = await params

  const meta = getTopicMeta(slug)
  if (!meta) {
    notFound()
  }

  let questions: QuestionWithDetails[]

  if (isDemoMode) {
    // Demo mode has no real question bank to draw from - use the shared
    // demo set, scoped to this topic when it has matching questions, or
    // the full demo set otherwise so every topic's boss is still
    // playable (bosses are cosmetic framing over the same bank, see
    // src/content/bosses.ts).
    const topicDemoQuestions = demoQuestions.filter((q) => q.topicSlug === slug)
    questions = topicDemoQuestions.length > 0 ? topicDemoQuestions : demoQuestions
  } else {
    try {
      questions = await getQuestionsByTopic(slug)
    } catch (error) {
      console.error(`Failed to load boss questions for topic "${slug}":`, error)
      questions = []
    }
  }

  // The (app) layout already guarantees a signed-in (or demo) user before
  // this page can render; getSessionUser() here just resolves the id to
  // hand to BossBattleClient (which uses it the same defense-in-depth way
  // QuizEngine does - see its userId prop doc comment).
  const user = await getSessionUser()

  const content = contentRegistry[slug]
  const firstVideoBlock = content?.sections
    .flatMap((section) => section.blocks)
    .find((block) => block.type === 'video' && block.videoId)

  const video = firstVideoBlock
    ? {
        videoId: firstVideoBlock.videoId as string,
        videoIdAf: firstVideoBlock.videoIdAf,
        title: firstVideoBlock.title,
        titleAf: firstVideoBlock.titleAf,
      }
    : null

  return (
    <BossBattleClient
      topicSlug={slug}
      topicName={meta.title}
      questions={questions}
      isDemo={isDemoMode}
      userId={user?.id ?? 'demo-user'}
      video={video}
    />
  )
}
