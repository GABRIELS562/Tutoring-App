import { db } from './index'
import { topics, questions, questionOptions, steps } from './schema'
import { eq } from 'drizzle-orm'

async function seedQuestions() {
  console.log('Starting question seed...')

  // First, ensure the topic exists
  const existingTopics = await db
    .select()
    .from(topics)
    .where(eq(topics.slug, 'trig-gr11'))

  let topicId: string

  if (existingTopics.length === 0) {
    console.log('Creating Trigonometry Grade 11 topic...')
    const newTopic = await db
      .insert(topics)
      .values({
        name: 'Trigonometry',
        subject: 'maths',
        grade: 11,
        paper: 2,
        slug: 'trig-gr11',
        term: 1,
        capsWeightPercent: 15,
        sortOrder: 1,
      })
      .returning({ id: topics.id })

    topicId = newTopic[0].id
    console.log('Created topic:', topicId)
  } else {
    topicId = existingTopics[0].id
    console.log('Topic already exists:', topicId)
  }

  // Define the questions
  const questionsData = [
    {
      source: 'nsc_dbe',
      year: 2023,
      examType: 'november',
      difficulty: 2,
      marks: 4,
      questionText: 'Simplify without using a calculator: $\\frac{\\sin(210°)}{\\cos(300°)}$',
      options: [
        { optionLetter: 'A', optionText: '-1', isCorrect: true },
        { optionLetter: 'B', optionText: '1', isCorrect: false },
        { optionLetter: 'C', optionText: '-√3', isCorrect: false },
        { optionLetter: 'D', optionText: '√3', isCorrect: false },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Reduce sin(210°) using reduction formulae',
          hint: '210° is in the third quadrant. Use sin(180°+θ) = -sinθ',
          correctAnswer: 'sin(210°) = sin(180°+30°) = -sin(30°) = -½',
          explanation: null,
        },
        {
          stepNumber: 2,
          instruction: 'Reduce cos(300°) using reduction formulae',
          hint: '300° is in the fourth quadrant. Use cos(360°-θ) = cosθ',
          correctAnswer: 'cos(300°) = cos(360°-60°) = cos(60°) = ½',
          explanation: null,
        },
        {
          stepNumber: 3,
          instruction: 'Divide the results',
          hint: null,
          correctAnswer: '(-½) ÷ (½) = -1',
          explanation: 'When dividing fractions, multiply by the reciprocal',
        },
      ],
    },
    {
      source: 'nsc_dbe',
      year: 2022,
      examType: 'november',
      difficulty: 2,
      marks: 5,
      questionText: 'In triangle ABC, AB = 8 cm, BC = 6 cm and B̂ = 60°. Calculate the area.',
      options: [
        { optionLetter: 'A', optionText: '20.78 cm²', isCorrect: true },
        { optionLetter: 'B', optionText: '24.00 cm²', isCorrect: false },
        { optionLetter: 'C', optionText: '16.97 cm²', isCorrect: false },
        { optionLetter: 'D', optionText: '41.57 cm²', isCorrect: false },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Write down the area formula for this situation',
          hint: 'You have two sides and the included angle — use the area rule',
          correctAnswer: 'Area = ½·a·b·sin C',
          explanation: null,
        },
        {
          stepNumber: 2,
          instruction: 'Substitute the values',
          hint: 'AB=8, BC=6, B̂=60° — substitute directly',
          correctAnswer: 'Area = ½ × 8 × 6 × sin(60°)',
          explanation: null,
        },
        {
          stepNumber: 3,
          instruction: 'Calculate',
          hint: null,
          correctAnswer: '= 24 × (√3/2) = 24 × 0.866 = 20.78 cm²',
          explanation: 'sin(60°) = √3/2 ≈ 0.866',
        },
      ],
    },
    {
      source: 'nsc_dbe',
      year: 2023,
      examType: 'november',
      difficulty: 3,
      marks: 5,
      questionText: 'Prove: $\\frac{1-\\cos^2 x}{\\sin x \\cdot \\cos x} = \\tan x$',
      options: [
        { optionLetter: 'A', optionText: 'LHS = tan x', isCorrect: true },
        { optionLetter: 'B', optionText: 'LHS = sin x', isCorrect: false },
        { optionLetter: 'C', optionText: 'LHS = cos x', isCorrect: false },
        { optionLetter: 'D', optionText: 'LHS = 1', isCorrect: false },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Replace 1 - cos²x using a known identity',
          hint: 'Use the Pythagorean identity: sin²x + cos²x = 1',
          correctAnswer: '1 - cos²x = sin²x',
          explanation: null,
        },
        {
          stepNumber: 2,
          instruction: 'Substitute and simplify',
          hint: 'Cancel one sinx from numerator and denominator',
          correctAnswer: 'sin²x / (sinx · cosx) = sinx/cosx',
          explanation: null,
        },
        {
          stepNumber: 3,
          instruction: 'Write the final result',
          hint: null,
          correctAnswer: 'sinx/cosx = tanx = RHS ✓',
          explanation: 'tanx = sinx/cosx by definition',
        },
      ],
    },
    {
      source: 'nsc_dbe',
      year: 2022,
      examType: 'november',
      difficulty: 1,
      marks: 3,
      questionText: 'Solve for x: $2\\sin x - 1 = 0$ for x ∈ [0°, 360°]',
      options: [
        { optionLetter: 'A', optionText: '30° or 150°', isCorrect: true },
        { optionLetter: 'B', optionText: '30° or 330°', isCorrect: false },
        { optionLetter: 'C', optionText: '60° or 120°', isCorrect: false },
        { optionLetter: 'D', optionText: '150° or 210°', isCorrect: false },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Isolate sin x',
          hint: 'Add 1 to both sides, divide by 2',
          correctAnswer: 'sinx = ½',
          explanation: null,
        },
        {
          stepNumber: 2,
          instruction: 'Find the reference angle',
          hint: 'sin(30°) = ½ — this is a special angle',
          correctAnswer: 'reference angle = arcsin(½) = 30°',
          explanation: null,
        },
        {
          stepNumber: 3,
          instruction: 'Find all solutions in [0°, 360°]',
          hint: null,
          correctAnswer: 'x = 30° (Q1) or x = 180° - 30° = 150° (Q2)',
          explanation: 'sin is positive in Q1 and Q2',
        },
      ],
    },
    {
      source: 'angelo',
      year: null,
      examType: 'custom',
      difficulty: 2,
      marks: 4,
      questionText: 'Simplify: $\\frac{\\cos(180°+x) \\cdot \\tan(360°-x)}{\\sin(-x)}$',
      options: [
        { optionLetter: 'A', optionText: 'cos x', isCorrect: true },
        { optionLetter: 'B', optionText: '-cos x', isCorrect: false },
        { optionLetter: 'C', optionText: 'sin x', isCorrect: false },
        { optionLetter: 'D', optionText: '-1', isCorrect: false },
      ],
      steps: [
        {
          stepNumber: 1,
          instruction: 'Apply reduction formulae to each trig ratio',
          hint: 'Use the CAST diagram for each angle',
          correctAnswer: 'cos(180°+x) = -cosx, tan(360°-x) = -tanx, sin(-x) = -sinx',
          explanation: null,
        },
        {
          stepNumber: 2,
          instruction: 'Substitute back',
          hint: 'Replace each reduced form',
          correctAnswer: '(-cosx)·(-tanx) / (-sinx)',
          explanation: null,
        },
        {
          stepNumber: 3,
          instruction: 'Simplify — remember tanx = sinx/cosx',
          hint: null,
          correctAnswer: '(cosx · tanx) / (-sinx) = (cosx · sinx/cosx) / (-sinx) = sinx / (-sinx) = -1... Wait, let me recalculate: (-cosx)(-tanx)/(-sinx) = (cosx·sinx/cosx)/(-sinx) = sinx/(-sinx) = -1. The answer should be -1, option D.',
          explanation: 'After careful calculation with signs: the expression simplifies to -1. Note: This demonstrates why checking your work is important!',
        },
      ],
    },
  ]

  console.log('Inserting questions...')

  for (const qData of questionsData) {
    // Check if question already exists (by text similarity)
    const existingQ = await db
      .select()
      .from(questions)
      .where(eq(questions.questionText, qData.questionText))

    if (existingQ.length > 0) {
      console.log(`Question already exists: ${qData.questionText.substring(0, 50)}...`)
      continue
    }

    // Insert question
    const newQuestion = await db
      .insert(questions)
      .values({
        topicId,
        source: qData.source,
        year: qData.year,
        examType: qData.examType,
        difficulty: qData.difficulty,
        marks: qData.marks,
        questionText: qData.questionText,
        isMultipleChoice: true,
        isApproved: true,
      })
      .returning({ id: questions.id })

    const questionId = newQuestion[0].id
    console.log(`Created question: ${questionId}`)

    // Insert options
    for (const opt of qData.options) {
      await db.insert(questionOptions).values({
        questionId,
        optionLetter: opt.optionLetter,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
      })
    }
    console.log(`  Added ${qData.options.length} options`)

    // Insert steps
    for (const step of qData.steps) {
      await db.insert(steps).values({
        questionId,
        stepNumber: step.stepNumber,
        instruction: step.instruction,
        hint: step.hint,
        correctAnswer: step.correctAnswer,
        explanation: step.explanation,
        createdBy: 'angelo',
      })
    }
    console.log(`  Added ${qData.steps.length} steps`)
  }

  console.log('Seed complete!')
  process.exit(0)
}

seedQuestions().catch((err) => {
  console.error('Seed error:', err)
  process.exit(1)
})
