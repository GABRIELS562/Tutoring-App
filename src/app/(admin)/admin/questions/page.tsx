import { getTopicTree } from '@/db/queries/admin'
import QuestionsManager from './QuestionsManager'

export const dynamic = 'force-dynamic'

export default async function AdminQuestionsPage() {
  const topicTree = await getTopicTree()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Questions
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
          Create and manage quiz questions with step-by-step solutions
        </p>
      </div>

      <QuestionsManager initialTopicTree={topicTree} />
    </div>
  )
}
