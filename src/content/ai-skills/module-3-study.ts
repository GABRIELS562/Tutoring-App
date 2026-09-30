import type { AIModule } from '@/types'

export const aiStudy: AIModule = {
  id: 'ai-study',
  title: "Study smarter: AI techniques that actually work",
  titleAf: "Leer slimmer: KI-tegnieke wat werklik werk",
  description: "Practical, research-backed ways to use AI for studying that will improve your marks without crossing ethical lines.",
  descriptionAf: "Praktiese, navorsingsgesteunde maniere om KI vir studie te gebruik wat jou punte sal verbeter sonder om etiese grense te oorskry.",
  timeEstimate: "15 min",
  timeEstimateAf: "15 min",
  unlockCondition: 'ai-prompts',
  sections: [
    {
      id: 'intro',
      title: 'AI as Your Study Partner',
      blocks: [
        {
          type: 'theory',
          title: 'Using AI the right way',
          body: `Here's the difference between students who use AI well and students who get caught cheating: the good students use AI to learn faster, not to skip learning.

AI can explain concepts you don't understand. It can generate practice questions. It can test you on material. It can break down difficult topics into simple steps. These are all things that make you smarter.

AI cannot learn for you. When you copy AI's work, you pass the homework but fail the exam. Your teacher isn't stupid — they'll notice when your test scores don't match your assignment quality.

This module shows you:
• 10 specific study techniques that work
• The science behind why they work
• Exact prompts you can use
• A complete study system using AI

By the end, you'll have a study partner available 24/7 that adapts to your exact needs.`,
        },
      ],
    },
    {
      id: 'science',
      title: 'The Science: Why These Techniques Work',
      blocks: [
        {
          type: 'theory',
          title: 'Learning science basics',
          body: `Before the techniques, understand why they work:

ACTIVE RECALL
Your brain remembers things better when you actively retrieve them, not when you passively re-read. Testing yourself > reading your notes.

SPACED REPETITION
Reviewing material at increasing intervals builds long-term memory. Cramming the night before doesn't work long-term.

ELABORATION
Connecting new information to things you already know makes it stick. "Oh, this is like that other thing" is powerful.

INTERLEAVING
Mixing different topics during study sessions improves long-term learning (even though it feels harder).

DUAL CODING
Combining words and visuals helps memory. Diagrams + explanations > explanations alone.

All the techniques in this module are based on these principles. AI doesn't just give you answers — it helps you apply these principles effectively.`,
        },
        {
          type: 'tip',
          body: `The "I read it 5 times" method feels productive but doesn't work. Active techniques feel harder but produce better results.`,
        },
      ],
    },
    {
      id: 'technique-1',
      title: 'Technique 1: The Explain-Back Method',
      blocks: [
        {
          type: 'theory',
          title: 'Active recall through explanation',
          body: `After AI explains something, try to explain it back in your own words. Ask AI to check if you understood correctly.

Why it works:
This forces active recall and reveals gaps in your understanding.

The prompt pattern:
Step 1: "Explain [concept] simply"
Step 2: [You explain it back]: "So what you're saying is [your explanation]. Is that correct? What am I missing?"
Step 3: AI confirms or corrects

This technique alone can double your retention compared to just reading AI's explanation.`,
        },
        {
          type: 'worked_example',
          title: 'Explain-Back in action',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Ask AI to explain',
              working: '"Explain how photosynthesis works in simple terms"',
              answer: 'AI gives explanation about plants using sunlight, water, and CO2 to make glucose and oxygen.',
            },
            {
              stepNumber: 2,
              instruction: 'Explain it back',
              working: '"So basically, plants are like food factories that use sunlight as power, drink water through their roots, and breathe in CO2 to make sugar food for themselves, and they breathe out oxygen as a waste product. Did I understand that correctly?"',
              answer: 'AI confirms: "Yes, that\'s an excellent summary! The only addition..." — now you know what you got right and what to add.',
            },
          ],
        },
      ],
    },
    {
      id: 'technique-2',
      title: 'Technique 2: AI-Generated Practice Questions',
      blocks: [
        {
          type: 'theory',
          title: 'Testing yourself is better than re-reading',
          body: `Instead of asking AI for answers, ask it to create questions for you.

The prompt pattern:
"Give me [number] practice questions on [topic] at [your grade level]. Don't give me the answers yet — I want to try them first."

Then attempt them.
Then: "Here are my answers: [your answers]. Check each one and explain any mistakes."

Variations:
• "Give me exam-style questions worth [X] marks"
• "Create multiple choice questions with one correct and three plausible wrong answers"
• "Give me questions that start easy and get progressively harder"
• "Focus questions on the concepts students most commonly get wrong"`,
        },
        {
          type: 'tip',
          body: `Don't look at answers before trying. The struggle to remember is what builds memory. If you can't remember, make your best guess — then check.`,
        },
      ],
    },
    {
      id: 'technique-3',
      title: 'Technique 3: Find Your Weak Spots',
      blocks: [
        {
          type: 'theory',
          title: 'Diagnostic testing',
          body: `Use AI to identify what you don't understand before wasting time on what you already know.

The prompt pattern:
"I'm studying [topic] for my exam. Ask me questions to test my understanding. Start easy and get harder. Tell me when I get something wrong and identify which concepts I need to review."

This is like having a tutor who adapts to your level in real time.

Advanced version:
"Here's my upcoming [subject] exam syllabus: [paste syllabus]. I have [time available]. Ask me diagnostic questions on each topic area. Based on my answers, create a prioritised study plan focusing on my weakest areas."`,
        },
        {
          type: 'worked_example',
          title: 'Diagnostic session',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Start the diagnostic',
              working: '"I\'m studying for my Grade 11 Physical Science exam on electromagnetism. Test my understanding — start easy and get harder."',
              answer: '',
            },
            {
              stepNumber: 2,
              instruction: 'AI asks questions',
              working: 'AI: "Question 1: What is an electromagnet and how is it different from a permanent magnet?"',
              answer: 'You answer. AI asks follow-up based on your response.',
            },
            {
              stepNumber: 3,
              instruction: 'AI identifies gaps',
              working: 'After several questions, AI: "Based on your answers, you understand magnetic fields well but seem unclear on Lenz\'s Law and electromagnetic induction. I recommend focusing on..."',
              answer: 'Now you know exactly where to spend your study time.',
            },
          ],
        },
      ],
    },
    {
      id: 'technique-4',
      title: 'Technique 4: Progressive Complexity',
      blocks: [
        {
          type: 'theory',
          title: 'Build understanding layer by layer',
          body: `When something feels overwhelming, ask AI to explain it at multiple levels of complexity.

The prompt pattern:
"Explain [complex topic] in 3 versions:
1. Like I'm in Grade 8 — super simple
2. At Grade 11 level — my actual grade
3. At first-year university level — to show me what's coming next"

Why it works:
• The simple version gives you the core idea
• The grade-level version is what you need for exams
• The advanced version shows you how it connects to bigger concepts

Variations:
• "Explain like I'm 10, then like I'm 16, then like I'm a university student"
• "Start with an analogy, then the actual science, then the mathematical formula"`,
        },
      ],
    },
    {
      id: 'technique-5',
      title: 'Technique 5: Memory Aids and Mnemonics',
      blocks: [
        {
          type: 'theory',
          title: 'Make information stick',
          body: `AI is excellent at creating memorable ways to remember information.

Prompt patterns:
• "Give me a mnemonic to remember [list of things]"
• "Create an acronym for [concepts in order]"
• "Give me a story or visual that helps remember [facts]"
• "Make a memorable phrase for [formula or process]"
• "Create a memory palace technique for [topics]"

Add constraints:
• "Make it relevant to South African students"
• "Make it funny — I remember funny things"
• "Connect it to [something I already know]"

Example:
"Create a mnemonic to remember the order of operations in maths (Brackets, Orders, Division, Multiplication, Addition, Subtraction) using something a South African student would relate to."`,
        },
        {
          type: 'tip',
          body: `Mnemonics you create yourself are more memorable than ones AI gives you. Ask AI for inspiration, then modify it to be personal.`,
        },
      ],
    },
    {
      id: 'technique-6',
      title: 'Technique 6: Socratic Questioning',
      blocks: [
        {
          type: 'theory',
          title: 'Let AI guide you to the answer',
          body: `Instead of getting answers, ask AI to guide you to discover them yourself.

The prompt pattern:
"I'm trying to understand [concept]. Don't tell me the answer directly — ask me guiding questions that will help me figure it out myself. If I get stuck, give me a small hint, not the full answer."

Why it works:
• You remember things you figured out better than things you were told
• It reveals exactly where your understanding breaks down
• It builds problem-solving skills, not just knowledge

This is called Socratic questioning — it's how the best teachers teach.`,
        },
        {
          type: 'worked_example',
          title: 'Socratic questioning in action',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Set up Socratic mode',
              working: '"I\'m stuck on this problem: A ball is thrown upward at 20m/s. How long until it hits the ground? Don\'t give me the answer — guide me through it with questions."',
              answer: '',
            },
            {
              stepNumber: 2,
              instruction: 'AI guides with questions',
              working: 'AI: "Let\'s think about this. What happens to the ball\'s velocity as it goes up? What happens when it reaches the highest point? What do you know about the acceleration due to gravity?"',
              answer: '',
            },
            {
              stepNumber: 3,
              instruction: 'You work through it',
              working: 'You: "The velocity decreases going up... at the top it\'s zero... gravity is -9.8m/s²..."',
              answer: 'AI: "Excellent! So how long until it reaches the top? What equation relates velocity, acceleration, and time?"',
            },
          ],
        },
      ],
    },
    {
      id: 'technique-7',
      title: 'Technique 7: Elaborative Interrogation',
      blocks: [
        {
          type: 'theory',
          title: 'Ask "why" and "how" to deepen understanding',
          body: `After learning a fact, ask AI to explain WHY it's true or HOW it works.

The prompt pattern:
"I learned that [fact]. Why is this true? Explain the underlying reason."

Or:
"I know [fact A] and [fact B]. How are these connected? Why does one lead to the other?"

Example:
• You learned: "Hot air rises"
• Elaboration prompt: "Why does hot air rise? What's actually happening at the molecular level that causes this?"

This creates connections in your brain that make information easier to retrieve and harder to forget.`,
        },
        {
          type: 'tip',
          body: `In exams, questions often ask "why" or "explain". Students who understand the reasons score higher than those who just memorised facts.`,
        },
      ],
    },
    {
      id: 'technique-8',
      title: 'Technique 8: Interleaved Practice',
      blocks: [
        {
          type: 'theory',
          title: 'Mix topics for better learning',
          body: `Instead of studying one topic until "done," mix different topics.

The prompt pattern:
"Give me 10 practice problems that mix [topic A], [topic B], and [topic C]. Don't tell me which topic each problem is from — I should figure that out too."

Why it works:
• Switching between topics forces your brain to identify which approach to use
• This mirrors how exams actually work
• Improves transfer to new situations

It feels harder than focusing on one topic, but the learning is deeper.`,
        },
        {
          type: 'worked_example',
          title: 'Interleaved maths practice',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Request mixed practice',
              working: '"Give me 8 maths problems that mix factorising, completing the square, and the quadratic formula. Don\'t tell me which method to use — I should identify that myself."',
              answer: '',
            },
            {
              stepNumber: 2,
              instruction: 'Attempt the problems',
              working: 'You work through them, deciding which method fits each problem.',
              answer: '',
            },
            {
              stepNumber: 3,
              instruction: 'Check and reflect',
              working: '"Check my answers. For each problem, tell me: (1) was my answer correct? (2) did I use the best method? (3) what should have told me which method to use?"',
              answer: 'This teaches you to recognise problem types, not just solve them.',
            },
          ],
        },
      ],
    },
    {
      id: 'technique-9',
      title: 'Technique 9: Dual Coding with Visuals',
      blocks: [
        {
          type: 'theory',
          title: 'Combine words and visuals',
          body: `Ask AI to help you create visual representations of concepts.

Prompt patterns:
• "Describe a diagram I could draw to understand [concept]"
• "Create an ASCII art diagram showing [process]"
• "Give me a flowchart structure for [process] that I can draw"
• "Explain [concept] using a visual metaphor or analogy I can picture"
• "What would a timeline of [historical events] look like?"

Then actually draw it yourself. The act of creating the visual reinforces learning.

For concepts AI can't draw:
"Describe step by step how to create a diagram showing [concept]. Include what shapes to draw, what labels to add, and what arrows should connect."`,
        },
      ],
    },
    {
      id: 'technique-10',
      title: 'Technique 10: Pre-Exam Simulation',
      blocks: [
        {
          type: 'theory',
          title: 'Practice under exam conditions',
          body: `Ask AI to simulate your actual exam environment.

The prompt pattern:
"You are a CAPS matric examiner. Give me a [X]-mark question on [topic] that could appear on my [subject] Paper [X]. After I answer, mark it strictly according to the CAPS marking guidelines. Tell me exactly how many marks I would get and why."

Advanced version:
"Generate a complete 30-minute mini-test on [topic] worth [X] marks. Include different question types: multiple choice, short answer, and extended response. I'll answer all questions, then you'll mark them and identify patterns in my mistakes."

This is the closest you can get to the real exam without sitting the real exam.`,
        },
        {
          type: 'tip',
          body: `Time yourself during these practice exams. Many students know the content but run out of time. Exam technique matters.`,
        },
      ],
    },
    {
      id: 'study-session',
      title: 'Putting It Together: A Complete Study Session',
      blocks: [
        {
          type: 'worked_example',
          title: 'A 45-minute AI-enhanced study session',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Minutes 0-5: Diagnostic',
              working: '"I\'m studying [topic]. Ask me 3 quick questions to see what I already know and what I need to focus on."',
              answer: 'Identifies your starting point.',
            },
            {
              stepNumber: 2,
              instruction: 'Minutes 5-15: Learn weak areas',
              working: '"Explain [weak concept] using progressive complexity: simple version, grade-level version, and how it connects to the bigger picture."',
              answer: 'Fill knowledge gaps.',
            },
            {
              stepNumber: 3,
              instruction: 'Minutes 15-20: Explain-Back',
              working: '"Let me explain this back to you: [your explanation]. What did I get right? What did I miss?"',
              answer: 'Active recall and verification.',
            },
            {
              stepNumber: 4,
              instruction: 'Minutes 20-35: Practice',
              working: '"Give me 5 practice problems on [topic], starting easy and getting harder. Don\'t show answers yet."',
              answer: 'Active practice with increasing difficulty.',
            },
            {
              stepNumber: 5,
              instruction: 'Minutes 35-40: Check and correct',
              working: '"Here are my answers: [answers]. Mark each one and explain any mistakes I made."',
              answer: 'Immediate feedback on performance.',
            },
            {
              stepNumber: 6,
              instruction: 'Minutes 40-45: Memory aids',
              working: '"Give me 3 memorable ways to remember the key concepts from this session. Make them relevant to a South African student."',
              answer: 'Create hooks for long-term memory.',
            },
          ],
        },
        {
          type: 'tip',
          body: `Notice what's missing from this study session? You never asked AI to do your homework. You used it to understand, practice, and remember — that's the difference between using AI well and cheating.`,
        },
      ],
    },
    {
      id: 'exam-week',
      title: 'AI Strategy: The Week Before Exams',
      blocks: [
        {
          type: 'theory',
          title: 'A day-by-day plan',
          body: `Day 1-2: DIAGNOSTIC AND PRIORITISE
"Here are the topics on my [subject] exam: [list]. Ask me a question on each one. Tell me which topics I need to study more based on my answers. Then prioritise them by both my weakness AND how much they're worth in the exam."

Day 3-4: DEEP DIVE ON PRIORITIES
For each weak area:
"Explain [topic] thoroughly. Then give me 5 practice questions at exam level. Check my answers and explain what I'm still getting wrong."

Day 5: INTEGRATION AND CONNECTIONS
"How do these topics connect: [topic A], [topic B], [topic C]? Examiners often ask questions that combine topics. Give me an example question that combines them."

Day 6: EXAM SIMULATION
"Give me an exam-style paper on [subject] that covers my weak topics. Include [X] marks of questions with the same mix of difficulty as the real exam. Mark it strictly."

Day 7: QUICK REVIEW
"Give me the 10 most important facts I need to remember for [subject] tomorrow. Focus on things that are commonly tested and that I showed weakness on earlier this week."

This is more effective than rereading your notes for the 50th time.`,
        },
        {
          type: 'tip',
          body: `AI is available at 2am when you're stressed about tomorrow's exam. Your teacher isn't. Use that advantage wisely.`,
        },
      ],
    },
    {
      id: 'practical',
      title: 'Try It: Your First AI Study Session',
      blocks: [
        {
          type: 'ai_practical',
          title: 'Apply what you learned',
          aiConfig: {
            instruction: "Pick a topic you're currently struggling with. Start with the Explain-Back method: (1) Ask AI to explain it, (2) Explain it back in your own words, (3) Ask AI to confirm and correct your understanding.",
            inputPlaceholder: "Start by asking about a topic you find confusing...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'summary',
      title: 'Your AI Study Toolkit',
      blocks: [
        {
          type: 'theory',
          title: '10 techniques to use',
          body: `You now have 10 research-backed techniques:

1. EXPLAIN-BACK: Force active recall by teaching AI
2. PRACTICE QUESTIONS: Test yourself before seeing answers
3. DIAGNOSTIC TESTING: Find your weak spots first
4. PROGRESSIVE COMPLEXITY: Build understanding layer by layer
5. MEMORY AIDS: Create mnemonics and memorable hooks
6. SOCRATIC QUESTIONING: Let AI guide you to answers
7. ELABORATIVE INTERROGATION: Ask "why" and "how"
8. INTERLEAVED PRACTICE: Mix topics for deeper learning
9. DUAL CODING: Combine words and visuals
10. EXAM SIMULATION: Practice under real conditions

Each of these is backed by learning science research. The students who use these techniques consistently outperform those who just re-read notes.

The best part? You have a tutor available 24/7 that adapts to exactly what you need, explains things until you understand, never gets impatient, and costs you nothing.

Use it wisely.`,
        },
      ],
    },
  ],
}
