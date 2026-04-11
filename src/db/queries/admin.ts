import { db } from '@/db'
import { users, topics, questions, questionOptions, steps } from '@/db/schema'
import { eq, sql, desc, asc } from 'drizzle-orm'

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const result = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return result[0]?.isAdmin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get all topics with question counts
export type TopicWithCount = {
  id: string
  name: string
  subject: string
  grade: number
  paper: number | null
  slug: string
  term: number | null
  capsWeightPercent: number | null
  sortOrder: number | null
  questionCount: number
}

export async function getAllTopicsWithCounts(): Promise<TopicWithCount[]> {
  try {
    const result = await db
      .select({
        id: topics.id,
        name: topics.name,
        subject: topics.subject,
        grade: topics.grade,
        paper: topics.paper,
        slug: topics.slug,
        term: topics.term,
        capsWeightPercent: topics.capsWeightPercent,
        sortOrder: topics.sortOrder,
        questionCount: sql<number>`(
          SELECT COUNT(*) FROM questions WHERE questions.topic_id = ${topics.id}
        )`,
      })
      .from(topics)
      .orderBy(asc(topics.subject), asc(topics.grade), asc(topics.sortOrder))

    return result.map(r => ({
      ...r,
      questionCount: Number(r.questionCount) || 0,
    }))
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

// Create a new topic
export type CreateTopicInput = {
  name: string
  subject: string
  grade: number
  paper?: number | null
  slug: string
  term?: number | null
  capsWeightPercent?: number | null
  sortOrder?: number | null
}

export async function createTopic(input: CreateTopicInput): Promise<string | null> {
  try {
    const result = await db
      .insert(topics)
      .values({
        name: input.name,
        subject: input.subject,
        grade: input.grade,
        paper: input.paper,
        slug: input.slug,
        term: input.term,
        capsWeightPercent: input.capsWeightPercent,
        sortOrder: input.sortOrder,
      })
      .returning({ id: topics.id })

    return result[0]?.id || null
  } catch (error) {
    console.error('Error creating topic:', error)
    return null
  }
}

// Delete a topic
export async function deleteTopic(topicId: string): Promise<boolean> {
  try {
    await db.delete(topics).where(eq(topics.id, topicId))
    return true
  } catch (error) {
    console.error('Error deleting topic:', error)
    return false
  }
}

// Get questions for a topic (admin view - includes unapproved)
export type AdminQuestion = {
  id: string
  questionText: string
  source: string | null
  year: number | null
  examType: string | null
  marks: number | null
  difficulty: number | null
  isMultipleChoice: boolean | null
  isApproved: boolean | null
  createdAt: Date | null
}

export async function getQuestionsForTopic(topicId: string): Promise<AdminQuestion[]> {
  try {
    const result = await db
      .select({
        id: questions.id,
        questionText: questions.questionText,
        source: questions.source,
        year: questions.year,
        examType: questions.examType,
        marks: questions.marks,
        difficulty: questions.difficulty,
        isMultipleChoice: questions.isMultipleChoice,
        isApproved: questions.isApproved,
        createdAt: questions.createdAt,
      })
      .from(questions)
      .where(eq(questions.topicId, topicId))
      .orderBy(desc(questions.createdAt))

    return result
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

// Get full question details for editing
export type FullQuestion = {
  id: string
  topicId: string | null
  questionText: string
  source: string | null
  year: number | null
  examType: string | null
  marks: number | null
  difficulty: number | null
  hasDiagram: boolean | null
  diagramUrl: string | null
  isMultipleChoice: boolean | null
  isApproved: boolean | null
  options: {
    id: string
    optionLetter: string | null
    optionText: string
    isCorrect: boolean | null
  }[]
  steps: {
    id: string
    stepNumber: number
    instruction: string
    hint: string | null
    correctAnswer: string
    explanation: string | null
    createdBy: string | null
  }[]
}

export async function getQuestionById(questionId: string): Promise<FullQuestion | null> {
  try {
    const questionRows = await db
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1)

    if (questionRows.length === 0) return null

    const q = questionRows[0]

    const [optionRows, stepRows] = await Promise.all([
      db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, questionId))
        .orderBy(questionOptions.optionLetter),
      db
        .select()
        .from(steps)
        .where(eq(steps.questionId, questionId))
        .orderBy(steps.stepNumber),
    ])

    return {
      id: q.id,
      topicId: q.topicId,
      questionText: q.questionText,
      source: q.source,
      year: q.year,
      examType: q.examType,
      marks: q.marks,
      difficulty: q.difficulty,
      hasDiagram: q.hasDiagram,
      diagramUrl: q.diagramUrl,
      isMultipleChoice: q.isMultipleChoice,
      isApproved: q.isApproved,
      options: optionRows.map(o => ({
        id: o.id,
        optionLetter: o.optionLetter,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
      steps: stepRows.map(s => ({
        id: s.id,
        stepNumber: s.stepNumber,
        instruction: s.instruction,
        hint: s.hint,
        correctAnswer: s.correctAnswer,
        explanation: s.explanation,
        createdBy: s.createdBy,
      })),
    }
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

// Create or update a question
export type SaveQuestionInput = {
  id?: string
  topicId: string
  questionText: string
  source: string
  year?: number | null
  examType: string
  marks: number
  difficulty: number
  isMultipleChoice: boolean
  isApproved: boolean
  options: {
    optionLetter: string
    optionText: string
    isCorrect: boolean
  }[]
  steps: {
    stepNumber: number
    instruction: string
    hint?: string
    correctAnswer: string
    explanation?: string
    createdBy?: string
  }[]
}

export async function saveQuestion(input: SaveQuestionInput): Promise<string | null> {
  try {
    let questionId: string

    if (input.id) {
      // Update existing question
      await db
        .update(questions)
        .set({
          topicId: input.topicId,
          questionText: input.questionText,
          source: input.source,
          year: input.year,
          examType: input.examType,
          marks: input.marks,
          difficulty: input.difficulty,
          isMultipleChoice: input.isMultipleChoice,
          isApproved: input.isApproved,
        })
        .where(eq(questions.id, input.id))

      questionId = input.id

      // Delete existing options and steps
      await Promise.all([
        db.delete(questionOptions).where(eq(questionOptions.questionId, questionId)),
        db.delete(steps).where(eq(steps.questionId, questionId)),
      ])
    } else {
      // Create new question
      const result = await db
        .insert(questions)
        .values({
          topicId: input.topicId,
          questionText: input.questionText,
          source: input.source,
          year: input.year,
          examType: input.examType,
          marks: input.marks,
          difficulty: input.difficulty,
          isMultipleChoice: input.isMultipleChoice,
          isApproved: input.isApproved,
        })
        .returning({ id: questions.id })

      questionId = result[0].id
    }

    // Insert options if multiple choice
    if (input.isMultipleChoice && input.options.length > 0) {
      await db.insert(questionOptions).values(
        input.options.map(o => ({
          questionId,
          optionLetter: o.optionLetter,
          optionText: o.optionText,
          isCorrect: o.isCorrect,
        }))
      )
    }

    // Insert steps
    if (input.steps.length > 0) {
      await db.insert(steps).values(
        input.steps.map(s => ({
          questionId,
          stepNumber: s.stepNumber,
          instruction: s.instruction,
          hint: s.hint || null,
          correctAnswer: s.correctAnswer,
          explanation: s.explanation || null,
          createdBy: s.createdBy || 'angelo',
        }))
      )
    }

    return questionId
  } catch (error) {
    console.error('Error saving question:', error)
    return null
  }
}

// Delete a question
export async function deleteQuestion(questionId: string): Promise<boolean> {
  try {
    // Delete options and steps first (foreign key constraints)
    await Promise.all([
      db.delete(questionOptions).where(eq(questionOptions.questionId, questionId)),
      db.delete(steps).where(eq(steps.questionId, questionId)),
    ])

    // Delete question
    await db.delete(questions).where(eq(questions.id, questionId))

    return true
  } catch (error) {
    console.error('Error deleting question:', error)
    return false
  }
}

// Get topic tree for sidebar
export type TopicTreeItem = {
  id: string
  name: string
  slug: string
  subject: string
  grade: number
  questionCount: number
}

export async function getTopicTree(): Promise<{
  subjects: {
    name: string
    grades: {
      grade: number
      topics: TopicTreeItem[]
    }[]
  }[]
}> {
  try {
    const allTopics = await getAllTopicsWithCounts()

    // Group by subject then grade
    const subjectMap = new Map<string, Map<number, TopicTreeItem[]>>()

    for (const topic of allTopics) {
      if (!subjectMap.has(topic.subject)) {
        subjectMap.set(topic.subject, new Map())
      }
      const gradeMap = subjectMap.get(topic.subject)!
      if (!gradeMap.has(topic.grade)) {
        gradeMap.set(topic.grade, [])
      }
      gradeMap.get(topic.grade)!.push({
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        subject: topic.subject,
        grade: topic.grade,
        questionCount: topic.questionCount,
      })
    }

    const subjects = Array.from(subjectMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([subject, gradeMap]) => ({
        name: subject,
        grades: Array.from(gradeMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([grade, topics]) => ({
            grade,
            topics,
          })),
      }))

    return { subjects }
  } catch (error) {
    console.error('Error fetching topic tree:', error)
    return { subjects: [] }
  }
}
