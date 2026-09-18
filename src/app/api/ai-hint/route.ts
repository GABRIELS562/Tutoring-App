import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getApiSupabase } from '@/lib/supabase/api'
import { requireUser, authErrorResponse } from '@/lib/auth/require-user'

const FREE_HINT_LIMIT = 5
const FREE_CAMERA_LIMIT = 1
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// Zod schema for request validation
const HintRequestSchema = z.object({
  mode: z.enum(['step_hint', 'wrong_answer', 'camera_scan', 'prompt_evaluation', 'general_question', 'cv_help']).default('step_hint'),
  isPremium: z.boolean().optional(),
  locale: z.enum(['en', 'af']).optional().default('en'), // Language preference
  // For step_hint mode
  questionText: z.string().optional(),
  stepNumber: z.number().optional(),
  hint: z.string().optional(),
  // For wrong_answer mode
  selectedAnswer: z.string().optional(),
  correctAnswer: z.string().optional(),
  topicName: z.string().optional(),
  // For camera_scan mode
  imageBase64: z.string().optional(),
  // For prompt_evaluation mode
  scenarioContext: z.string().optional(),
  scenarioTask: z.string().optional(),
  studentPrompt: z.string().optional(),
  difficulty: z.enum(['basic', 'advanced']).optional(),
  technique: z.string().optional(),
  // For general_question mode
  userQuestion: z.string().optional(),
  // For cv_help mode
  cvDraft: z.string().optional(),
})

type HintRequest = z.infer<typeof HintRequestSchema>
type HintMode = HintRequest['mode']

// Angelo's personality prompt - exact 10 rules from spec (English)
const ANGELO_SYSTEM_PROMPT_EN = `You are Angelo, a supportive maths tutor for South African high schoolers.

RULES:
1. Never give the full answer
2. Reply in ≤80 words
3. Use simple English suitable for ESL learners
4. Reference SA curriculum (CAPS, NSC)
5. If the question is unclear, ask one clarifying question
6. Always end with an encouraging nudge or guiding question
7. If you detect a diagram is needed but none is provided, describe what the student should draw
8. Use Socratic questioning to lead them to the insight
9. Celebrate small wins ("Nice! You've got the right idea...")
10. Never say "Great question!" or other hollow affirmations`

// Angelo's personality prompt - Afrikaans version
const ANGELO_SYSTEM_PROMPT_AF = `Jy is Angelo, 'n ondersteunende wiskunde tutor vir Suid-Afrikaanse hoërskool leerlinge.

REËLS:
1. Moet nooit die volle antwoord gee nie
2. Antwoord in ≤80 woorde
3. Gebruik eenvoudige Afrikaans
4. Verwys na die SA kurrikulum (KABV, NSS)
5. As die vraag onduidelik is, vra een opklarende vraag
6. Eindig altyd met 'n bemoedigende stoot of leidende vraag
7. As 'n diagram nodig is maar nie verskaf is nie, beskryf wat die leerder moet teken
8. Gebruik Sokratiese bevraging om hulle na die insig te lei
9. Vier klein oorwinnings ("Mooi! Jy's op die regte spoor...")
10. Moet nooit "Goeie vraag!" of ander hol komplimente sê nie

BELANGRIK: Antwoord ALTYD in Afrikaans.`

// Keep for backwards compatibility
const ANGELO_SYSTEM_PROMPT = ANGELO_SYSTEM_PROMPT_EN

// System prompt for evaluating student prompts in the AI Skills course
const PROMPT_EVALUATION_SYSTEM = `You are an AI literacy coach helping South African students learn prompt engineering.

Your task: Evaluate how well the student's prompt would work to get a useful AI response.

Return a JSON object with exactly these fields:
{
  "score": <number 1-5>,
  "what_worked": "<1-2 sentences on what was good about their prompt>",
  "what_to_improve": "<1-2 sentences on what could be better>",
  "improved_prompt": "<your rewritten version of their prompt>",
  "encouragement": "<1 sentence of genuine encouragement, no hollow praise>"
}

Scoring guide:
1 = Vague or unusable prompt
2 = Missing most key elements
3 = Has basics but could be much clearer
4 = Good prompt with minor improvements possible
5 = Excellent prompt that would get great results

Be honest but kind. SA students respond well to direct feedback with encouragement.`

// Technique-specific evaluation criteria
const TECHNIQUE_CRITERIA: Record<string, string> = {
  'chain-of-thought': `This challenge tests CHAIN OF THOUGHT prompting. Look for:
- Asks AI to "think step by step" or "show working"
- Breaks down reasoning explicitly
- Requests verification of each step`,
  'few-shot': `This challenge tests FEW-SHOT prompting. Look for:
- Provides clear examples of desired output
- Shows input-output pattern
- Maintains consistency across examples`,
  'role-prompting': `This challenge tests ROLE PROMPTING. Look for:
- Assigns a specific persona/role to AI
- Role is relevant to the task
- Role adds expertise or perspective`,
  'structured-output': `This challenge tests STRUCTURED OUTPUT. Look for:
- Specifies exact format (table, list, JSON, etc.)
- Clear column headers or structure
- Appropriate format for the content`,
  'tree-of-thoughts': `This challenge tests TREE OF THOUGHTS. Look for:
- Asks for multiple approaches/options
- Requests comparison of alternatives
- Asks for recommendation based on criteria`,
  'prompt-chaining': `This challenge tests PROMPT CHAINING. Look for:
- Breaks complex task into steps
- Each step builds on previous
- Clear sequence of prompts`,
  'meta-prompting': `This challenge tests META PROMPTING. Look for:
- Asks AI to help formulate/improve the prompt
- Describes the end goal clearly
- Asks for optimal prompt structure`,
  'negative-constraints': `This challenge tests NEGATIVE CONSTRAINTS. Look for:
- Uses "don't", "avoid", "without", "no"
- Clear boundaries on what to exclude
- Constraints improve output quality`,
  'iterative-refinement': `This challenge tests ITERATIVE REFINEMENT. Look for:
- Multiple prompts that build on each other
- Specific improvement requests
- Refines rather than restarts`,
  'combined': `This is an ADVANCED COMBINED challenge. Look for:
- Uses multiple techniques together
- Includes role, context, format, AND constraints
- Well-structured and comprehensive`,
}

// System prompt for general AI questions in practicals (English)
const GENERAL_QUESTION_SYSTEM_EN = `You are Angelo AI, helping South African students learn about AI capabilities and limitations.

Keep responses under 150 words. Use simple English. Be direct and practical.
If the student is testing AI's limits, be honest about what you can and can't do.
Reference SA context where relevant.`

// System prompt for general AI questions in practicals (Afrikaans)
const GENERAL_QUESTION_SYSTEM_AF = `Jy is Angelo AI, en help Suid-Afrikaanse leerlinge om oor KI se vermoëns en beperkings te leer.

Hou antwoorde onder 150 woorde. Gebruik eenvoudige Afrikaans. Wees direk en prakties.
As die leerling KI se grense toets, wees eerlik oor wat jy kan en nie kan doen nie.
Verwys na SA konteks waar relevant.

BELANGRIK: Antwoord ALTYD in Afrikaans.`

// Keep for backwards compatibility
const GENERAL_QUESTION_SYSTEM = GENERAL_QUESTION_SYSTEM_EN

// System prompt for CV help (English)
const CV_HELP_SYSTEM_EN = `You are helping a South African student create a professional statement about their AI skills for their CV.

Guidelines:
- Keep it professional but accessible
- Focus on specific, demonstrable skills
- Make it relevant to SA job market
- Avoid buzzwords and hollow claims
- 2-3 sentences maximum
- Sound like a confident young person, not a robot`

// System prompt for CV help (Afrikaans)
const CV_HELP_SYSTEM_AF = `Jy help 'n Suid-Afrikaanse leerling om 'n professionele stelling oor hul KI-vaardighede vir hul CV te skep.

Riglyne:
- Hou dit professioneel maar toeganklik
- Fokus op spesifieke, demonstreerbare vaardighede
- Maak dit relevant vir die SA arbeidsmark
- Vermy modewoorde en hol aansprake
- Maksimum 2-3 sinne
- Klink soos 'n selfversekerde jong persoon, nie 'n robot nie

BELANGRIK: Antwoord ALTYD in Afrikaans.`

// Keep for backwards compatibility
const CV_HELP_SYSTEM = CV_HELP_SYSTEM_EN

function getModeSpecificPrompt(body: HintRequest): string {
  switch (body.mode) {
    case 'step_hint':
      return `The student is stuck on step ${body.stepNumber} of this problem: "${body.questionText}". ${body.hint ? `The hint is: ${body.hint}.` : ''} Give them a gentle nudge in the right direction.`

    case 'wrong_answer':
      return `The student got this question wrong: "${body.questionText}"
They selected answer "${body.selectedAnswer}" but the correct answer was "${body.correctAnswer}".
Topic: ${body.topicName || 'Mathematics'}

Explain why their answer was wrong and guide them to understand the correct approach. Don't just give the answer — help them see WHY.`

    case 'camera_scan':
      return `The student has photographed a maths problem they're stuck on. Analyze the image and:
1. Identify what type of problem it is
2. Give them a starting point or first step
3. Ask a guiding question to help them think through it

Remember: Guide, don't solve!`

    case 'prompt_evaluation': {
      const techniqueGuidance = body.technique && TECHNIQUE_CRITERIA[body.technique]
        ? `\n\nSPECIFIC TECHNIQUE BEING TESTED:\n${TECHNIQUE_CRITERIA[body.technique]}\n\nScore the prompt based on how well it demonstrates this technique.`
        : ''
      const difficultyNote = body.difficulty === 'advanced'
        ? '\n\nNOTE: This is an ADVANCED challenge. The student should demonstrate specific prompt engineering techniques, not just basic prompting.'
        : ''
      return `SCENARIO CONTEXT: ${body.scenarioContext}

TASK: ${body.scenarioTask}${techniqueGuidance}${difficultyNote}

STUDENT'S PROMPT: "${body.studentPrompt}"

Evaluate this prompt and return your assessment as a JSON object.`
    }

    case 'general_question':
      return body.userQuestion || 'Help me understand AI better.'

    case 'cv_help':
      return `The student wrote this draft for their CV's AI skills section:

"${body.cvDraft}"

Help them refine this into a professional 2-3 sentence statement they can use on job applications. Keep their voice but make it polished.`

    default:
      return `Help this student with their maths question: "${body.questionText}"`
  }
}

function getSystemPromptForMode(mode: HintMode, locale: 'en' | 'af' = 'en'): string {
  const isAfrikaans = locale === 'af'

  switch (mode) {
    case 'prompt_evaluation':
      // Prompt evaluation always in English (evaluating English prompts)
      return PROMPT_EVALUATION_SYSTEM
    case 'general_question':
      return isAfrikaans ? GENERAL_QUESTION_SYSTEM_AF : GENERAL_QUESTION_SYSTEM_EN
    case 'cv_help':
      return isAfrikaans ? CV_HELP_SYSTEM_AF : CV_HELP_SYSTEM_EN
    default:
      return isAfrikaans ? ANGELO_SYSTEM_PROMPT_AF : ANGELO_SYSTEM_PROMPT_EN
  }
}

// Get or create usage record for today
async function getUsageRecord(userId: string, today: string) {
  const supabase = getApiSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('ai_hint_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('usage_date', today)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is fine
    console.error('Error fetching usage:', error)
    return null
  }

  return data
}

// Create or update usage record
async function updateUsageRecord(
  userId: string,
  today: string,
  mode: HintMode,
  existingRecord: { id: string; hint_count: number; camera_count: number } | null
) {
  const supabase = getApiSupabase()
  if (!supabase) return // Demo mode - skip usage tracking

  if (existingRecord) {
    const updates = mode === 'camera_scan'
      ? { camera_count: existingRecord.camera_count + 1, updated_at: new Date().toISOString() }
      : { hint_count: existingRecord.hint_count + 1, updated_at: new Date().toISOString() }

    await supabase
      .from('ai_hint_usage')
      .update(updates)
      .eq('id', existingRecord.id)
  } else {
    const newRecord = {
      user_id: userId,
      usage_date: today,
      hint_count: mode === 'camera_scan' ? 0 : 1,
      camera_count: mode === 'camera_scan' ? 1 : 0,
    }

    await supabase.from('ai_hint_usage').insert(newRecord)
  }
}

export async function POST(request: NextRequest) {
  let user
  try {
    user = await requireUser()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const rawBody = await request.json()

    // Validate request with Zod
    const parseResult = HintRequestSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: parseResult.error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 }
      )
    }

    const body = parseResult.data
    const userId = user.id
    const { mode, isPremium, imageBase64, locale } = body

    const today = new Date().toISOString().split('T')[0]

    // Check rate limit for free tier users
    if (!isPremium) {
      const usageRecord = await getUsageRecord(userId, today)

      if (usageRecord) {
        if (mode === 'camera_scan') {
          if (usageRecord.camera_count >= FREE_CAMERA_LIMIT) {
            return NextResponse.json(
              {
                error: 'Daily camera scan limit reached',
                message: `You've used your free camera scan today! Come back tomorrow or upgrade to Premium for unlimited scans.`,
                remaining: 0,
                type: 'camera',
              },
              { status: 429 }
            )
          }
        } else {
          if (usageRecord.hint_count >= FREE_HINT_LIMIT) {
            return NextResponse.json(
              {
                error: 'Daily AI hint limit reached',
                message: `You've used your ${FREE_HINT_LIMIT} free hints today! Come back tomorrow or upgrade to Premium for unlimited AI help.`,
                remaining: 0,
                type: 'hint',
              },
              { status: 429 }
            )
          }
        }
      }

      // Update usage after rate limit check passes
      await updateUsageRecord(userId, today, mode, usageRecord)
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    // If no API key, return a helpful mock response (without hollow affirmations)
    if (!apiKey) {
      // Special handling for prompt_evaluation mode - return structured JSON
      if (mode === 'prompt_evaluation') {
        const mockEvaluation = {
          score: 3,
          what_worked: "You identified the general topic and asked for help.",
          what_to_improve: "Add more context about your situation, specify the format you want, and include any constraints.",
          improved_prompt: `I'm a Grade 11 student preparing for my ${body.scenarioContext?.includes('Maths') ? 'Maths' : 'upcoming'} exam. ${body.studentPrompt} Please give me a structured study plan with specific steps I can follow in the next 2 hours.`,
          encouragement: "You're thinking about how to ask — that alone puts you ahead of most students.",
        }

        return NextResponse.json({
          evaluation: mockEvaluation,
          isDemo: true,
        })
      }

      // Special handling for cv_help mode
      if (mode === 'cv_help') {
        return NextResponse.json({
          hint: "Proficient in AI-assisted research and problem-solving. Experienced in crafting effective prompts to extract useful information from AI tools. Committed to ethical AI use and continuous learning in this rapidly evolving field.",
          isDemo: true,
        })
      }

      // Special handling for general_question mode
      if (mode === 'general_question') {
        return NextResponse.json({
          hint: "AI works by predicting what comes next based on patterns it learned from text. It doesn't actually 'understand' — it matches patterns. That's why it can sound confident even when wrong. Your job is to verify anything important.",
          isDemo: true,
        })
      }

      const mockResponses: Record<string, string[]> = {
        step_hint: [
          `Let's think about this step by step. What do you already know about the problem? Sometimes writing out what we know helps us see the path forward.`,
          `You're on the right track! Remember, in maths we often need to identify what type of problem this is first. Is it a reduction formula? An identity? That'll tell us which tool to use.`,
          `This trips up many students! Try drawing a quick sketch or writing out the given information. What does the question actually want us to find?`,
        ],
        wrong_answer: [
          `I see what happened there — you made a common mistake. Let's think about why "${body.selectedAnswer}" doesn't work here. What happens if you plug that answer back into the original equation?`,
          `Close! The key thing you might have missed is checking which quadrant we're in. Remember CAST? That tells us the sign of our answer. Try again with that in mind!`,
          `Almost there! This looks like a straightforward calculation, but there's a subtlety. What if you tried working backwards from the correct answer to see the pattern?`,
        ],
        camera_scan: [
          `I can see you've got a maths problem there! This looks like algebraic manipulation. Start by identifying all the terms — what do you need to solve for?`,
          `Nice, that's a geometry problem! First step: label everything you know on the diagram. What relationships can you spot between the angles or sides?`,
          `I see this is a trig problem. Remember to check: is this asking for an angle or a ratio? That determines which approach we use. What do you think?`,
        ],
      }

      const responses = mockResponses[mode] || mockResponses.step_hint
      const randomHint = responses[Math.floor(Math.random() * responses.length)]

      // Calculate remaining for the response
      const usageRecord = await getUsageRecord(userId, today)
      let remaining: number | string = 'unlimited'
      if (!isPremium) {
        if (mode === 'camera_scan') {
          remaining = FREE_CAMERA_LIMIT - (usageRecord?.camera_count || 1)
        } else {
          remaining = FREE_HINT_LIMIT - (usageRecord?.hint_count || 1)
        }
      }

      return NextResponse.json({
        hint: randomHint,
        remaining,
        isDemo: true,
      })
    }

    // Build the messages array
    const messages: { role: 'user'; content: string | { type: string; source?: { type: string; media_type: string; data: string }; text?: string }[] }[] = []

    if (mode === 'camera_scan' && imageBase64) {
      // Vision request with image
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            },
          },
          {
            type: 'text',
            text: getModeSpecificPrompt(body),
          },
        ],
      })
    } else {
      // Text-only request
      messages.push({
        role: 'user',
        content: getModeSpecificPrompt(body),
      })
    }

    // Call Anthropic API with correct model and token limit
    const systemPrompt = getSystemPromptForMode(mode, locale)
    const maxTokens = mode === 'prompt_evaluation' ? 400 : 150

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json(
        { error: 'Failed to get AI hint' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const aiResponse = data.content?.[0]?.text || ''

    // Calculate remaining for response
    const usageRecord = await getUsageRecord(userId, today)
    let remaining: number | string = 'unlimited'
    if (!isPremium) {
      if (mode === 'camera_scan') {
        remaining = FREE_CAMERA_LIMIT - (usageRecord?.camera_count || 1)
      } else {
        remaining = FREE_HINT_LIMIT - (usageRecord?.hint_count || 1)
      }
    }

    // Handle prompt_evaluation mode - parse JSON response
    if (mode === 'prompt_evaluation') {
      try {
        // Extract JSON from response (in case it's wrapped in markdown code blocks)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          score: 3,
          what_worked: "Unable to parse evaluation",
          what_to_improve: "Please try again",
          improved_prompt: body.studentPrompt || '',
          encouragement: "Keep practising!",
        }

        return NextResponse.json({
          evaluation,
          remaining,
        })
      } catch {
        // Fallback if JSON parsing fails
        return NextResponse.json({
          evaluation: {
            score: 3,
            what_worked: "Your prompt shows effort",
            what_to_improve: "Try being more specific about context and format",
            improved_prompt: body.studentPrompt || '',
            encouragement: "Keep practising — prompt engineering is a skill that improves with use.",
          },
          remaining,
        })
      }
    }

    return NextResponse.json({
      hint: aiResponse || 'Sorry, I couldn\'t generate a response right now. Try again!',
      remaining,
    })
  } catch (error) {
    console.error('AI hint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
