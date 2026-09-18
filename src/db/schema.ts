import { pgTable, uuid, text, integer, boolean, timestamp, date, decimal, index, unique } from 'drizzle-orm/pg-core'

// Table 1: users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  grade: integer('grade'), // 10, 11, or 12
  school: text('school'),
  xp: integer('xp').default(0),
  streakCount: integer('streak_count').default(0),
  lastActiveDate: date('last_active_date'),
  hearts: integer('hearts').default(5),
  isPremium: boolean('is_premium').default(false),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  // AI Literacy fields
  aiModulesCompleted: text('ai_modules_completed').array().default([]),
  promptChallengesCompleted: integer('prompt_challenges_completed').default(0),
  cvStatement: text('cv_statement'),
  badges: text('badges').array().default([]),
})

// Table 2: topics
export const topics = pgTable('topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  subject: text('subject').notNull(), // 'maths' or 'science'
  grade: integer('grade').notNull(),
  paper: integer('paper'), // 1 or 2, nullable for science
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  term: integer('term'),
  capsWeightPercent: integer('caps_weight_percent'),
  sortOrder: integer('sort_order'),
}, (table) => [
  index('topics_subject_idx').on(table.subject),
  index('topics_grade_idx').on(table.grade),
  index('topics_subject_grade_idx').on(table.subject, table.grade),
])

// Table 3: notes
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').references(() => topics.id),
  contentType: text('content_type'), // 'theory'|'formula'|'example'|'tip'|'worked_example'|'video'
  title: text('title'),
  body: text('body'),
  sortOrder: integer('sort_order').default(0),
}, (table) => [
  index('notes_topic_id_idx').on(table.topicId),
])

// Table 4: questions
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').references(() => topics.id),
  source: text('source'), // 'nsc_dbe'|'kzn'|'wced'|'angelo'
  year: integer('year'),
  examType: text('exam_type'), // 'november'|'june'|'march'|'trial'|'custom'
  questionText: text('question_text').notNull(),
  marks: integer('marks'),
  difficulty: integer('difficulty'), // 1 easy, 2 medium, 3 hard
  hasDiagram: boolean('has_diagram').default(false),
  diagramUrl: text('diagram_url'),
  isMultipleChoice: boolean('is_multiple_choice').default(true),
  isApproved: boolean('is_approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('questions_topic_id_idx').on(table.topicId),
  index('questions_difficulty_idx').on(table.difficulty),
  index('questions_topic_difficulty_idx').on(table.topicId, table.difficulty),
])

// Table 5: question_options
export const questionOptions = pgTable('question_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id),
  optionLetter: text('option_letter'), // 'A'|'B'|'C'|'D'
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false),
}, (table) => [
  index('question_options_question_id_idx').on(table.questionId),
])

// Table 6: steps
export const steps = pgTable('steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id),
  stepNumber: integer('step_number').notNull(),
  instruction: text('instruction').notNull(),
  hint: text('hint'),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation'),
  createdBy: text('created_by').default('angelo'), // 'angelo'|'claude_ai'
}, (table) => [
  index('steps_question_id_idx').on(table.questionId),
])

// Table 7: student_progress
export const studentProgress = pgTable('student_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  questionId: uuid('question_id').references(() => questions.id),
  status: text('status').default('unanswered'), // 'unanswered'|'attempted'|'correct'|'incorrect'
  attempts: integer('attempts').default(0),
  lastAttemptedAt: timestamp('last_attempted_at'),
  xpEarned: integer('xp_earned').default(0),
}, (table) => [
  index('student_progress_user_id_idx').on(table.userId),
  index('student_progress_question_id_idx').on(table.questionId),
  index('student_progress_user_question_idx').on(table.userId, table.questionId),
])

// Table 8: past_papers
export const pastPapers = pgTable('past_papers', {
  id: uuid('id').primaryKey().defaultRandom(),
  grade: integer('grade').notNull(),
  subject: text('subject').notNull(),
  year: integer('year').notNull(),
  examType: text('exam_type').notNull(),
  paperNumber: integer('paper_number').notNull(),
  language: text('language').default('english'),
  pdfUrl: text('pdf_url').notNull(),
  memoUrl: text('memo_url'),
  topicsCovered: text('topics_covered').array(),
})

// Table 9: ai_hint_usage (for rate limiting)
export const aiHintUsage = pgTable('ai_hint_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  usageDate: date('usage_date').notNull(),
  hintCount: integer('hint_count').default(0),
  cameraCount: integer('camera_count').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
  index('ai_hint_usage_user_id_idx').on(table.userId),
  index('ai_hint_usage_user_date_idx').on(table.userId, table.usageDate),
])

// Table 10: ai_certificates
export const aiCertificates = pgTable('ai_certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  certificateId: text('certificate_id').unique().notNull(), // Short unique ID for QR, e.g. AT-2026-X7K9
  studentName: text('student_name').notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
  avgPromptScore: decimal('avg_prompt_score'),
  modulesCompleted: integer('modules_completed').default(5),
}, (table) => [
  index('ai_certificates_user_id_idx').on(table.userId),
])

// Table 11: prompt_challenge_attempts
export const promptChallengeAttempts = pgTable('prompt_challenge_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  challengeId: text('challenge_id').notNull(), // Which challenge scenario
  studentPrompt: text('student_prompt').notNull(),
  aiScore: integer('ai_score'), // 1-5
  aiFeedback: text('ai_feedback'),
  improvedPrompt: text('improved_prompt'), // Claude's better version
  xpEarned: integer('xp_earned').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('prompt_challenge_attempts_user_id_idx').on(table.userId),
  index('prompt_challenge_attempts_challenge_id_idx').on(table.challengeId),
  // One attempt row per (user, challenge): persistPromptChallengeAttempt()
  // in api/ai-hint/route.ts depends on this to stay idempotent - a repeat
  // attempt updates the existing row instead of inserting a duplicate.
  unique('prompt_challenge_attempts_user_challenge_unique').on(table.userId, table.challengeId),
])
