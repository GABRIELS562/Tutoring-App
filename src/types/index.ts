export type Subject = 'maths' | 'science'

export type Grade = 10 | 11 | 12

export type Difficulty = 1 | 2 | 3

export type NoteContentType = 'theory' | 'formula' | 'example' | 'tip' | 'worked_example' | 'video' | 'ai_practical'

export type WorkedStep = {
  stepNumber: number
  instruction: string
  working: string
  answer?: string
}

// AI Practical block configuration
export type AIPracticalConfig = {
  instruction: string
  inputPlaceholder?: string
  mode: 'general_question' | 'prompt_rewrite' | 'cv_help' | 'prompt_evaluation'
  scenarios?: string[] // For multi-scenario practicals
  showComparison?: boolean // Side-by-side comparison
  saveToProfile?: boolean // Save result to user profile
  downloadable?: boolean // Generate downloadable card
}

export type NoteBlock = {
  type: NoteContentType
  title?: string
  titleAf?: string // Afrikaans title
  body?: string
  bodyAf?: string // Afrikaans body content
  formulas?: string[]
  steps?: WorkedStep[]
  videoId?: string // English video ID (YouTube)
  videoIdAf?: string // Afrikaans video ID (YouTube)
  // For ai_practical type
  aiConfig?: AIPracticalConfig
}

export type TopicSection = {
  id: string
  title: string
  blocks: NoteBlock[]
}

export type TopicContent = {
  id: string
  slug: string
  subject: Subject
  grade: Grade
  paper: 1 | 2 | null
  title: string
  capsWeight: number
  sections: TopicSection[]
}

// AI Skills Module types
export type AIModuleId = 'ai-what-is' | 'ai-prompts' | 'ai-study' | 'ai-ethics' | 'ai-careers'

export type AIModule = {
  id: AIModuleId
  title: string
  description: string
  timeEstimate: string // e.g. "5 min"
  unlockCondition?: AIModuleId // Module that must be completed first
  sections: TopicSection[]
}

// Prompt Challenge types
export type PromptTechnique =
  | 'chain-of-thought'
  | 'few-shot'
  | 'role-prompting'
  | 'structured-output'
  | 'tree-of-thoughts'
  | 'prompt-chaining'
  | 'meta-prompting'
  | 'negative-constraints'
  | 'iterative-refinement'
  | 'combined'

export type PromptScenario = {
  id: string
  context: string
  task: string
  idealElements: string[]
  difficulty?: 'basic' | 'advanced'
  technique?: PromptTechnique
}

export type PromptEvaluationResult = {
  score: number // 1-5
  what_worked: string
  what_to_improve: string
  improved_prompt: string
  encouragement: string
}

// Certificate types
export type AICertificate = {
  id: string
  certificateId: string
  studentName: string
  issuedAt: string
  avgPromptScore: number
  modulesCompleted: number
}

// Badge types
export type BadgeId =
  | 'ai-explorer'      // Complete Module 1
  | 'prompt-pro'       // Complete Module 2 + first prompt challenge
  | 'study-hacker'     // Complete Module 3
  | 'integrity-aware'  // Complete Module 4
  | 'career-ready'     // Complete Module 5
  | 'ai-literate'      // Complete all 5 modules
  | 'certificate-holder' // Earn the AI Literacy certificate
  | 'prompt-master'    // Score 5/5 on any prompt challenge

export type Badge = {
  id: BadgeId
  name: string
  description: string
  icon: string // Lucide icon name
  xpReward: number
}
