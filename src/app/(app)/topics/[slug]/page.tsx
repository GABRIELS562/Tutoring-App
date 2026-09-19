import Link from 'next/link'
import Topbar from '@/components/layout/Topbar'
import TopicPageClient from './TopicPageClient'
import { contentRegistry } from '@/content/registry'

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
