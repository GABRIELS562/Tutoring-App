import { getAllPastPapers, type PastPaperRecord } from '@/db/queries/topics'
import { isDemoMode } from '@/db'
import { demoPapers } from '@/content/demo-papers'
import PapersPageClient from './PapersPageClient'

export default async function PapersPage() {
  let papers: PastPaperRecord[] = demoPapers

  if (!isDemoMode) {
    try {
      papers = await getAllPastPapers()
    } catch (error) {
      console.error('Failed to load past papers:', error)
      papers = []
    }
  }

  return <PapersPageClient papers={papers} />
}
