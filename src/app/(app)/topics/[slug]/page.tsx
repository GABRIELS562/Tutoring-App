import { notFound } from 'next/navigation'
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

  // notFound() rather than a hand-rolled page: the boss route under this
  // one already does it, and a bad topic URL should not answer as if it
  // were a real page. (The response still carries 200 because the (app)
  // layout is force-dynamic and streams - headers are flushed before this
  // throws - but the rendered page is the real 404.)
  if (!content) {
    notFound()
  }

  return <TopicPageClient slug={slug} content={content} />
}
