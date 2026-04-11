/**
 * IndexedDB-based offline storage for Angelo Tutoring
 * Stores questions and audio files for offline access
 */

const DB_NAME = 'angelo-offline'
const DB_VERSION = 1

// Store names
const STORES = {
  TOPICS: 'topics',
  QUESTIONS: 'questions',
  AUDIO: 'audio',
  META: 'meta',
} as const

// Types
export interface OfflineTopic {
  slug: string
  title: string
  downloadedAt: string
  questionCount: number
  audioCount: number
}

export interface OfflineQuestion {
  id: string
  topicSlug: string
  questionText: string
  marks: number
  difficulty: number
  options: { letter: string; text: string; isCorrect: boolean }[]
}

export interface OfflineAudio {
  key: string // `${topicSlug}/${sectionId}`
  topicSlug: string
  blob: Blob
}

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'))
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Topics store
      if (!db.objectStoreNames.contains(STORES.TOPICS)) {
        db.createObjectStore(STORES.TOPICS, { keyPath: 'slug' })
      }

      // Questions store with index by topic
      if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
        const questionsStore = db.createObjectStore(STORES.QUESTIONS, { keyPath: 'id' })
        questionsStore.createIndex('topicSlug', 'topicSlug', { unique: false })
      }

      // Audio store
      if (!db.objectStoreNames.contains(STORES.AUDIO)) {
        const audioStore = db.createObjectStore(STORES.AUDIO, { keyPath: 'key' })
        audioStore.createIndex('topicSlug', 'topicSlug', { unique: false })
      }

      // Meta store for settings
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' })
      }
    }
  })
}

// Get all downloaded topics
export async function getDownloadedTopics(): Promise<OfflineTopic[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TOPICS, 'readonly')
    const store = transaction.objectStore(STORES.TOPICS)
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

// Check if topic is downloaded
export async function isTopicDownloaded(slug: string): Promise<boolean> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TOPICS, 'readonly')
    const store = transaction.objectStore(STORES.TOPICS)
    const request = store.get(slug)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(!!request.result)
  })
}

// Get downloaded topic count (for free tier limit)
export async function getDownloadedTopicCount(): Promise<number> {
  const topics = await getDownloadedTopics()
  return topics.length
}

// Store topic metadata
export async function storeTopic(topic: OfflineTopic): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.TOPICS, 'readwrite')
    const store = transaction.objectStore(STORES.TOPICS)
    const request = store.put(topic)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Store questions for a topic
export async function storeQuestions(questions: OfflineQuestion[]): Promise<void> {
  if (questions.length === 0) return

  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.QUESTIONS, 'readwrite')
    const store = transaction.objectStore(STORES.QUESTIONS)

    transaction.onerror = () => reject(transaction.error)
    transaction.oncomplete = () => resolve()

    for (const question of questions) {
      store.put(question)
    }
  })
}

// Get questions for a topic
export async function getQuestionsForTopic(topicSlug: string): Promise<OfflineQuestion[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.QUESTIONS, 'readonly')
    const store = transaction.objectStore(STORES.QUESTIONS)
    const index = store.index('topicSlug')
    const request = index.getAll(topicSlug)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result || [])
  })
}

// Store audio blob
export async function storeAudio(topicSlug: string, sectionId: string, blob: Blob): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.AUDIO, 'readwrite')
    const store = transaction.objectStore(STORES.AUDIO)
    const request = store.put({
      key: `${topicSlug}/${sectionId}`,
      topicSlug,
      blob,
    })

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

// Get audio blob
export async function getAudio(topicSlug: string, sectionId: string): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.AUDIO, 'readonly')
    const store = transaction.objectStore(STORES.AUDIO)
    const request = store.get(`${topicSlug}/${sectionId}`)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result?.blob || null)
  })
}

// Delete topic and all its data
export async function deleteTopic(slug: string): Promise<void> {
  const db = await openDB()

  // Delete topic metadata
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORES.TOPICS, 'readwrite')
    const store = transaction.objectStore(STORES.TOPICS)
    const request = store.delete(slug)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })

  // Delete questions
  const questions = await getQuestionsForTopic(slug)
  if (questions.length > 0) {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORES.QUESTIONS, 'readwrite')
      const store = transaction.objectStore(STORES.QUESTIONS)
      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
      for (const q of questions) {
        store.delete(q.id)
      }
    })
  }

  // Delete audio
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORES.AUDIO, 'readwrite')
    const store = transaction.objectStore(STORES.AUDIO)
    const index = store.index('topicSlug')
    const cursorRequest = index.openCursor(IDBKeyRange.only(slug))

    cursorRequest.onerror = () => reject(cursorRequest.error)
    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        cursor.delete()
        cursor.continue()
      } else {
        resolve()
      }
    }
  })
}

// Check storage usage
export async function getStorageUsage(): Promise<{ used: number; quota: number }> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0,
    }
  }
  return { used: 0, quota: 0 }
}
