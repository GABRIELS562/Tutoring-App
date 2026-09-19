import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'
import { getClaudeClient, createTutorMessage, getClaudeModel, ClaudeError, type ClaudeErrorKind } from '@/lib/claude'
import { logClaudeUsage } from '@/lib/claude-usage-log'

// mode label for ai_usage_log rows from this route - there's no HintMode
// equivalent here (generate-steps isn't part of api/ai-hint), so this is
// its own literal.
const USAGE_LOG_MODE = 'generate_steps'

// See the identical comment in src/app/api/ai-hint/route.ts - this route
// also calls the Anthropic API and must outlive Vercel's default
// function timeout, comfortably longer than the SDK client's own 30s
// timeout + retries in src/lib/claude.ts.
export const maxDuration = 60

function claudeErrorStatus(kind: ClaudeErrorKind): number {
  switch (kind) {
    case 'rate_limit':
    case 'timeout':
    case 'server':
      return 503
    case 'auth':
    case 'unknown':
    default:
      return 500
  }
}

export async function POST(request: NextRequest) {
  let admin
  try {
    admin = await requireAdmin()
  } catch (err) {
    return authErrorResponse(err)
  }

  try {
    const body = await request.json()
    const { questionText } = body

    if (!questionText) {
      return NextResponse.json(
        { error: 'Missing questionText' },
        { status: 400 }
      )
    }

    const claudeClient = getClaudeClient()

    // If no API key, return mock steps for demo
    if (!claudeClient) {
      const mockSteps = [
        {
          instruction: 'Identify what the question is asking for',
          hint: 'Read the question carefully and note what needs to be found',
          correctAnswer: 'We need to simplify the given expression',
          explanation: 'Understanding the goal helps guide our approach',
        },
        {
          instruction: 'Apply the relevant formula or method',
          hint: 'Think about which mathematical concept applies here',
          correctAnswer: 'Use the appropriate reduction formula or identity',
          explanation: 'Selecting the right tool is key to solving the problem',
        },
        {
          instruction: 'Perform the calculation and simplify',
          hint: 'Work through each step carefully, showing your working',
          correctAnswer: 'Substitute values and compute the final answer',
          explanation: 'Careful calculation leads to the correct result',
        },
      ]

      return NextResponse.json({
        steps: mockSteps,
        isDemo: true,
      })
    }

    const systemPrompt = `You are an expert Maths teacher creating step-by-step solutions for Grade 10-12 South African students following the CAPS curriculum.

Given a maths question, generate 2-4 clear solution steps. Each step should have:
- instruction: What the student should do (imperative form, e.g., "Calculate...", "Simplify...")
- hint: A helpful hint if they're stuck (encouraging tone)
- correctAnswer: The expected result of this step (can include LaTeX)
- explanation: Brief explanation of why this works

Respond in JSON format only:
{
  "steps": [
    {
      "instruction": "...",
      "hint": "...",
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}

Focus on trigonometry, algebra, functions, and calculus common in NSC exams.`

    let content: string
    try {
      const result = await createTutorMessage({
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate step-by-step solution steps for this maths question:\n\n${questionText}`,
          },
        ],
        maxTokens: 1000,
      })
      content = result.text
      // Fire-and-forget: never awaited, never allowed to fail this
      // response - see logClaudeUsage()'s doc comment.
      logClaudeUsage({ userId: admin.id, mode: USAGE_LOG_MODE, model: getClaudeModel(), usage: result.usage })
    } catch (error) {
      console.error('Anthropic API error:', error)
      const status = error instanceof ClaudeError ? claudeErrorStatus(error.kind) : 500
      return NextResponse.json(
        { error: 'Failed to generate steps' },
        { status }
      )
    }

    // Parse JSON from response
    try {
      // Find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json({
          steps: parsed.steps || [],
        })
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
    }

    // Fallback to mock if parsing fails
    return NextResponse.json({
      steps: [
        {
          instruction: 'Analyze the question and identify the approach',
          hint: 'What formulas or methods apply here?',
          correctAnswer: 'Identify the relevant mathematical concept',
          explanation: 'Understanding the problem is the first step',
        },
        {
          instruction: 'Apply the method and calculate',
          hint: 'Work through each step carefully',
          correctAnswer: 'Show your working and arrive at the answer',
          explanation: 'Careful calculation ensures accuracy',
        },
      ],
      parseError: true,
    })
  } catch (error) {
    console.error('Generate steps error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
