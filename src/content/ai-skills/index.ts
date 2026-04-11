import type { AIModule, PromptScenario, Badge, BadgeId } from '@/types'

// Re-export all modules
export { aiWhatIs } from './module-1-what-is'
export { aiPrompts } from './module-2-prompts'
export { aiStudy } from './module-3-study'
export { aiEthics } from './module-4-ethics'
export { aiCareers } from './module-5-careers'

// Import for registry
import { aiWhatIs } from './module-1-what-is'
import { aiPrompts } from './module-2-prompts'
import { aiStudy } from './module-3-study'
import { aiEthics } from './module-4-ethics'
import { aiCareers } from './module-5-careers'

// Module registry
export const aiModules: Record<string, AIModule> = {
  'ai-what-is': aiWhatIs,
  'ai-prompts': aiPrompts,
  'ai-study': aiStudy,
  'ai-ethics': aiEthics,
  'ai-careers': aiCareers,
}

// Module order for navigation
export const moduleOrder = [
  'ai-what-is',
  'ai-prompts',
  'ai-study',
  'ai-ethics',
  'ai-careers',
] as const

// Prompt Challenge Scenarios (20 total - Basic + Advanced)
export const promptScenarios: PromptScenario[] = [
  // BASIC SCENARIOS (1-10)
  {
    id: 'scenario-1',
    context: "You have a Maths test on Trigonometry tomorrow. You scored 40% last time. You have 2 hours to prepare.",
    task: "Write a prompt to get Angelo AI to help you study effectively. Remember: vague = useless.",
    idealElements: ['specifies subject+topic', 'mentions weak areas', 'asks for structured study plan', 'sets time constraint'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-2',
    context: "You got question 3 wrong in your Physical Science test. The question was about Newton's 3rd Law. You wrote F=ma when the question asked about action-reaction.",
    task: "Write a prompt to understand your specific mistake without just getting the answer.",
    idealElements: ['identifies specific wrong answer', 'asks for explanation of concept', 'requests understanding not answer'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-3',
    context: "You need to write a 300-word essay for English about the impact of social media on teenagers. You have opinions but don't know how to structure them.",
    task: "Write a prompt to help you structure your essay. You want your own ideas in it, not AI's ideas.",
    idealElements: ['asks for structure/framework', 'not content', 'specifies student will provide own opinions'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-4',
    context: "You have a job interview next week for a data capturing position at a local company. You've never had a job interview before.",
    task: "Write a prompt to prepare for the interview.",
    idealElements: ['specifies job type', 'mentions inexperience', 'asks for likely questions and practice', 'SA context'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-5',
    context: "Your teacher asked you to summarise Chapter 4 of your Economics textbook. It's 20 pages. You need a summary that helps you study, not just a short version.",
    task: "Write a prompt to create a useful study summary.",
    idealElements: ['specifies it is for studying', 'asks for key concepts', 'possible exam questions', 'not just summary'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-6',
    context: "You want to start a small business selling braai wood in your neighbourhood this weekend. You have R200 to start.",
    task: "Write a prompt to get a realistic, practical plan.",
    idealElements: ['specifies budget', 'local context', 'asks for steps not theory', 'mentions target customers'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-7',
    context: "You failed your maths test and your parent is upset. You need to explain what happened and what you're doing to fix it — in a letter/message.",
    task: "Write a prompt to help draft this message. It must sound like you, not like AI.",
    idealElements: ['asks AI to help structure not write', 'specifies personal tone', 'mentions the fix/action plan'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-8',
    context: "You're applying for a bursary at Sasol. The application asks why you deserve the bursary and what you want to study.",
    task: "Write a prompt to get help with your bursary application. You want it to reflect your real story.",
    idealElements: ['asks for structure + what to include', 'specifies authenticity', 'mentions Sasol specifically'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-9',
    context: "Your Grade 11 class is confused about the same thing — the difference between the Sine Rule and the Cosine Rule and when to use each one.",
    task: "Write a prompt to get a clear explanation that your whole class could use.",
    idealElements: ['specifies audience (multiple students)', 'asks for comparison not just definition', 'asks for when to use each'],
    difficulty: 'basic',
  },
  {
    id: 'scenario-10',
    context: "You want to learn to code but don't know where to start. You have a phone only, no laptop. You want to build something real within a month.",
    task: "Write a prompt to get a realistic learning plan.",
    idealElements: ['specifies constraints (phone only)', 'sets timeline', 'asks for realistic not idealistic plan', 'mentions goal'],
    difficulty: 'basic',
  },
  // ADVANCED SCENARIOS (11-20) - Testing specific techniques
  {
    id: 'scenario-11',
    context: "You're solving a word problem: 'A taxi leaves Johannesburg at 8am travelling at 100km/h. Another taxi leaves at 9am travelling at 120km/h. When will the second taxi catch up?'",
    task: "Write a prompt that uses CHAIN OF THOUGHT prompting to solve this step by step.",
    idealElements: ['asks AI to show working step by step', 'uses chain of thought', 'asks for verification'],
    difficulty: 'advanced',
    technique: 'chain-of-thought',
  },
  {
    id: 'scenario-12',
    context: "You're writing WhatsApp messages for your school fundraiser. You have one example that worked well: 'Hey! 🎉 Our matric dance needs YOUR help! Just R50 = memories for life. Can we count on you? Reply YES!'",
    task: "Write a prompt using ONE-SHOT or FEW-SHOT technique to get 5 more messages in the same style.",
    idealElements: ['provides the example clearly', 'asks AI to match the style', 'specifies number of outputs'],
    difficulty: 'advanced',
    technique: 'few-shot',
  },
  {
    id: 'scenario-13',
    context: "You want honest feedback on your business idea: selling second-hand textbooks at your school. Most people just tell you it's a good idea.",
    task: "Write a prompt using ROLE PROMPTING to get genuinely critical feedback.",
    idealElements: ['assigns critical/skeptical role', 'asks for honest problems', 'specifies you want real issues not encouragement'],
    difficulty: 'advanced',
    technique: 'role-prompting',
  },
  {
    id: 'scenario-14',
    context: "You need to compare three different study methods for your exams: active recall, spaced repetition, and mind mapping. You want a clear comparison to decide which to use.",
    task: "Write a prompt using STRUCTURED OUTPUT formatting to get an easy-to-read comparison.",
    idealElements: ['specifies table or comparison format', 'lists what to compare', 'asks for recommendation'],
    difficulty: 'advanced',
    technique: 'structured-output',
  },
  {
    id: 'scenario-15',
    context: "You're unsure whether to take Maths Literacy or Pure Maths next year. This is a big decision that affects university options.",
    task: "Write a prompt using TREE OF THOUGHTS to explore both options properly before deciding.",
    idealElements: ['asks for multiple scenarios/paths', 'asks for pros and cons of each', 'asks for recommendation based on factors'],
    difficulty: 'advanced',
    technique: 'tree-of-thoughts',
  },
  {
    id: 'scenario-16',
    context: "You need to research the causes of unemployment in South Africa for a presentation. You want to break this into manageable steps.",
    task: "Write a series of prompts using PROMPT CHAINING to research this topic properly.",
    idealElements: ['breaks task into steps', 'first prompt is research/gathering', 'later prompts analyse or organise'],
    difficulty: 'advanced',
    technique: 'prompt-chaining',
  },
  {
    id: 'scenario-17',
    context: "You want to ask AI to help you write a motivation letter, but you're not sure how to ask. The stakes are high — it's for a university application.",
    task: "Write a prompt using META PROMPTING — ask AI to help you write the best prompt for this task.",
    idealElements: ['asks AI to help formulate the prompt', 'describes the end goal', 'asks for optimal prompt structure'],
    difficulty: 'advanced',
    technique: 'meta-prompting',
  },
  {
    id: 'scenario-18',
    context: "You want AI to explain photosynthesis, but you've noticed AI explanations are often too long and use words you don't understand.",
    task: "Write a prompt using NEGATIVE CONSTRAINTS to get exactly what you need.",
    idealElements: ['specifies what NOT to include', 'sets length limits', 'asks for simple language'],
    difficulty: 'advanced',
    technique: 'negative-constraints',
  },
  {
    id: 'scenario-19',
    context: "You're preparing for your Life Orientation portfolio on career planning. You want AI to act as a career counsellor who knows the South African job market.",
    task: "Write a COMBINED prompt using at least 3 techniques: Role, Context, Format, and Constraints.",
    idealElements: ['assigns specific role', 'provides personal context', 'specifies output format', 'includes constraints', 'combines multiple techniques'],
    difficulty: 'advanced',
    technique: 'combined',
  },
  {
    id: 'scenario-20',
    context: "You got an AI response about the French Revolution, but it was too complicated. You want to improve it through conversation rather than starting over.",
    task: "Write 2-3 ITERATIVE REFINEMENT prompts that would transform a complex answer into something you can actually use.",
    idealElements: ['asks for simplification', 'asks for specific format', 'builds on previous response', 'shows iteration'],
    difficulty: 'advanced',
    technique: 'iterative-refinement',
  },
]

// Badge definitions
export const badges: Record<BadgeId, Badge> = {
  'ai-explorer': {
    id: 'ai-explorer',
    name: 'AI Explorer',
    description: 'Completed Module 1: What AI Actually Is',
    icon: 'Compass',
    xpReward: 50,
  },
  'prompt-pro': {
    id: 'prompt-pro',
    name: 'Prompt Pro',
    description: 'Completed Module 2 + first prompt challenge',
    icon: 'MessageSquare',
    xpReward: 75,
  },
  'study-hacker': {
    id: 'study-hacker',
    name: 'Study Hacker',
    description: 'Completed Module 3: Study Smarter with AI',
    icon: 'Brain',
    xpReward: 50,
  },
  'integrity-aware': {
    id: 'integrity-aware',
    name: 'Integrity Aware',
    description: 'Completed Module 4: AI Ethics',
    icon: 'Shield',
    xpReward: 50,
  },
  'career-ready': {
    id: 'career-ready',
    name: 'Career Ready',
    description: 'Completed Module 5: AI for Careers',
    icon: 'Briefcase',
    xpReward: 50,
  },
  'ai-literate': {
    id: 'ai-literate',
    name: 'AI Literate',
    description: 'Completed all 5 AI Literacy modules',
    icon: 'Award',
    xpReward: 100,
  },
  'certificate-holder': {
    id: 'certificate-holder',
    name: 'Certificate Holder',
    description: 'Earned the AI Literacy Certificate',
    icon: 'GraduationCap',
    xpReward: 200,
  },
  'prompt-master': {
    id: 'prompt-master',
    name: 'Prompt Master',
    description: 'Scored 5/5 on a prompt challenge',
    icon: 'Zap',
    xpReward: 50,
  },
}

// XP rewards
export const AI_MODULE_XP = 50 // Per module completed (first time only)
export const PROMPT_CHALLENGE_XP_PER_STAR = 5 // score × 5 = XP earned
export const ALL_MODULES_BONUS_XP = 100 // Bonus for completing all 5
export const CERTIFICATE_XP = 200 // Bonus for earning certificate
