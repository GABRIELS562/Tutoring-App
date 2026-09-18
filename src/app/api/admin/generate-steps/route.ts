import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, authErrorResponse } from '@/lib/auth/require-user'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
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

    const apiKey = process.env.ANTHROPIC_API_KEY

    // If no API key, return mock steps for demo
    if (!apiKey) {
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

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Generate step-by-step solution steps for this maths question:\n\n${questionText}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate steps' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''

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
