import { getAllTopicsWithCounts } from '@/db/queries/admin'
import TopicsTable from './TopicsTable'
import AddTopicModal from './AddTopicModal'

export const dynamic = 'force-dynamic'

export default async function AdminTopicsPage() {
  const topics = await getAllTopicsWithCounts()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Topics
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-custom)' }}>
            Manage curriculum topics and their organization
          </p>
        </div>
        <AddTopicModal />
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-custom)' }}
      >
        <TopicsTable topics={topics} />
      </div>
    </div>
  )
}
