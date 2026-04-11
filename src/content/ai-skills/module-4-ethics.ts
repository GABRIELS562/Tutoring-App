import type { AIModule } from '@/types'

export const aiEthics: AIModule = {
  id: 'ai-ethics',
  title: "AI ethics: The line between smart and cheating",
  description: "Know exactly where the line is — and how to stay on the right side of it.",
  timeEstimate: "15 min",
  unlockCondition: 'ai-study',
  sections: [
    {
      id: 'intro',
      title: 'Why This Matters',
      blocks: [
        {
          type: 'theory',
          title: 'The stakes are real',
          body: `Let's be direct: using AI wrong can get you expelled. Universities are cancelling degrees. Companies are firing employees. Schools are failing students. This isn't a hypothetical — it's happening right now.

But here's the other side: using AI correctly is a valuable skill that employers actively want. The students who learn to use it responsibly have an advantage.

This module teaches you exactly where the line is. Not vague "use your judgment" advice — specific guidelines you can follow.`,
        },
        {
          type: 'tip',
          body: `When in doubt, ask your teacher. "Can I use AI for this, and if so, how?" shows maturity. Getting caught cheating does not.`,
        },
        {
          type: 'worked_example',
          title: 'Real consequences in SA',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Case 1: University of Cape Town (2024)',
              working: 'A final-year engineering student submitted an AI-generated thesis chapter without disclosure.',
              answer: 'Result: Degree revoked after graduation. Student had to repay bursary funds.',
            },
            {
              stepNumber: 2,
              instruction: 'Case 2: High School in Gauteng (2023)',
              working: 'Multiple matric students used ChatGPT for their Life Orientation portfolios.',
              answer: 'Result: All received zero marks. Some lost university admissions as a result.',
            },
            {
              stepNumber: 3,
              instruction: 'Case 3: The Right Way',
              working: 'A student used AI to explain concepts, then wrote the assignment herself. She disclosed her AI use.',
              answer: 'Result: Teacher praised her approach. She got 85% and actually understood the material.',
            },
          ],
        },
      ],
    },
    {
      id: 'line',
      title: 'Where the Line Is',
      blocks: [
        {
          type: 'theory',
          title: 'Always okay (unless your teacher says otherwise):',
          body: `✓ Using AI to explain concepts you don't understand
✓ Asking AI to generate practice questions
✓ Getting AI to check your understanding
✓ Creating study aids and memory tricks
✓ Researching and gathering information (which you then verify)
✓ Getting feedback on your own work
✓ Brainstorming ideas (which you then develop yourself)

These all have one thing in common: YOU still do the learning and the work. AI helps you do it better.`,
        },
        {
          type: 'theory',
          title: 'Never okay (unless explicitly permitted):',
          body: `✗ Copying AI's work and submitting it as your own
✗ Using AI during tests or exams
✗ Having AI write essays, assignments, or reports for you
✗ Using AI to generate answers you submit without understanding
✗ Not disclosing AI use when required
✗ Using AI to bypass learning you're supposed to do

These all have one thing in common: you're pretending AI's work is your work. That's fraud.`,
        },
        {
          type: 'theory',
          title: 'The grey area (ask your teacher):',
          body: `? Using AI to help structure your essay (some teachers allow this)
? Using AI to improve your grammar and writing (some call this cheating)
? Using AI to generate ideas you then write about (depends on the assignment)
? Using AI to debug code you wrote (usually okay in the real world, varies at school)

Different teachers have different rules. The mature thing is to ask, not assume.`,
        },
      ],
    },
    {
      id: 'detection',
      title: 'Yes, They Can Tell',
      blocks: [
        {
          type: 'theory',
          title: 'How teachers spot AI-generated work',
          body: `Students think they're clever. Teachers are not stupid. Here's how they catch AI:

1. Inconsistent ability
Your test scores don't match your assignment quality. Huge red flag.

2. AI patterns
AI writes in certain ways — perfect grammar, certain phrase patterns, unnaturally smooth flow. Teachers learn to spot this.

3. Detection tools
Software like Turnitin now has AI detection built in. It's not perfect, but it's getting better.

4. Follow-up questions
"Can you explain paragraph 3 of your essay?" If you can't, that's suspicious.

5. Statistical analysis
Your writing has patterns. AI's writing has different patterns. This can be measured.

The point isn't that you'll definitely get caught. The point is that you're risking your education for shortcuts that don't help you learn anyway.`,
        },
        {
          type: 'tip',
          body: `Here's the real question: If you wouldn't learn the material anyway, why are you in school? Use AI to learn better, not to learn less.`,
        },
      ],
    },
    {
      id: 'practical',
      title: 'Decision Practice',
      blocks: [
        {
          type: 'theory',
          title: 'What would you do?',
          body: `Scenario 1: You don't understand a maths concept. You ask AI to explain it three different ways until you get it. Then you do the homework yourself.
→ Perfectly fine. This is using AI to learn.

Scenario 2: You're tired and have a lot of homework. You paste the questions into AI and copy the answers.
→ Cheating. And you'll fail the test on this material.

Scenario 3: You've written an essay. You ask AI to check for grammar errors and suggest improvements. You decide what changes to make.
→ Ask your teacher, but probably fine. You wrote it; AI just proofread.

Scenario 4: You ask AI to write an essay. You then change some words to make it "your own."
→ Still cheating. AI wrote it; you just edited.

Scenario 5: You're working on a coding project. You ask AI to explain why your code isn't working, then fix it yourself.
→ Fine. This is how professional programmers use AI.`,
        },
        {
          type: 'ai_practical',
          title: 'Test your judgment',
          aiConfig: {
            instruction: "Describe a situation where you're unsure if using AI would be okay. Ask Angelo AI for guidance on whether it's appropriate and why.",
            inputPlaceholder: "Describe the situation here...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'scenarios',
      title: 'Grey Area Scenarios',
      blocks: [
        {
          type: 'theory',
          title: 'Test yourself on these tricky situations',
          body: `These scenarios don't have obvious answers. Think about each one before revealing the guidance.`,
        },
        {
          type: 'worked_example',
          title: 'Scenario Analysis',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Group project dilemma',
              working: 'Your group is behind on a project. One member suggests using AI to write a section, then having everyone review and edit it.',
              answer: 'TRICKY: If everyone understands and contributes to editing, and you disclose AI use, this might be acceptable. But if one person just pastes AI output while others did real work, that\'s unfair to the group. Discuss with your teacher first.',
            },
            {
              stepNumber: 2,
              instruction: 'Translation help',
              working: 'You need to write a short piece in Afrikaans for class. You\'re not fluent. You write it in English first, use AI to translate, then ask a fluent friend to check it.',
              answer: 'GENERALLY OKAY: You created the content, AI just translated. This is similar to using a dictionary. But disclose it: "Original content translated with AI assistance, reviewed by [friend\'s name]."',
            },
            {
              stepNumber: 3,
              instruction: 'Research assistance',
              working: 'You ask AI to find sources for your History essay. It gives you book titles and article names. You then read those sources yourself and write the essay.',
              answer: 'OKAY: AI helped you find sources (like a librarian), but you did the reading and thinking. Just verify the sources exist — AI sometimes invents fake citations.',
            },
            {
              stepNumber: 4,
              instruction: 'Code debugging',
              working: 'You wrote a Python program for CAT class. It has a bug you can\'t find. You paste your code into AI and ask "What\'s wrong with this code?"',
              answer: 'GENERALLY OKAY: You wrote the code. Using AI to find bugs is standard practice in the real world. Professional programmers do this daily. But understand the fix — don\'t just copy it.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Analyse a real scenario',
          aiConfig: {
            instruction: 'Describe a realistic school or study scenario involving AI use. Ask Angelo AI to analyse whether it\'s ethical, considering: (1) Who did the thinking? (2) Who learns from this? (3) What would the teacher say? (4) Would you be comfortable explaining this to your principal?',
            inputPlaceholder: "Scenario: [describe the situation]\n\nPlease analyse whether this use of AI is ethical...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'self-test',
      title: 'The 4-Question Ethics Test',
      blocks: [
        {
          type: 'theory',
          title: 'A quick test for any situation',
          body: `Before using AI for schoolwork, ask yourself these four questions:

1. WHO DID THE LEARNING?
If AI did the thinking and you're just copying, you're cheating yourself out of education — even if you don't get caught.

2. COULD I EXPLAIN THIS TO MY TEACHER?
If you'd be embarrassed or need to lie about how you did something, that's a red flag.

3. COULD I DO THIS WITHOUT AI NOW?
If AI is a crutch you can't put down, you're not learning. If it's a tool that helps you learn faster, that's different.

4. WOULD I PUT THIS ON MY CV?
"Used AI to cheat on homework" vs "Used AI to understand difficult concepts" — which one represents you?`,
        },
        {
          type: 'worked_example',
          title: 'Applying the 4-question test',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Situation: Copying AI essay',
              working: 'You copy an AI-written essay and submit it.',
              answer: '1. AI did the learning ❌\n2. You\'d have to lie ❌\n3. You couldn\'t write it yourself ❌\n4. Not CV-worthy ❌\nVerdict: Definitely cheating.',
            },
            {
              stepNumber: 2,
              instruction: 'Situation: Using AI to practice',
              working: 'You ask AI to generate 10 practice problems, then solve them yourself.',
              answer: '1. You did the learning ✓\n2. You could explain this proudly ✓\n3. You\'re building your skills ✓\n4. Shows initiative ✓\nVerdict: Great use of AI.',
            },
            {
              stepNumber: 3,
              instruction: 'Situation: AI grammar check',
              working: 'You write an essay, then ask AI to check grammar and suggest improvements.',
              answer: '1. You did the thinking, AI polished ✓\n2. Depends on teacher\'s policy ?\n3. You wrote the content ✓\n4. Reasonable skill ✓\nVerdict: Usually okay, but ask teacher.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Apply the ethics test',
          aiConfig: {
            instruction: 'Think of a recent time you used (or considered using) AI for schoolwork. Apply the 4-question test to that situation. Ask Angelo AI to help you evaluate whether your approach was ethical.',
            inputPlaceholder: "The situation was: [describe]\n\n1. Who did the learning?\n2. Could I explain this to my teacher?\n3. Could I do this without AI now?\n4. Would I put this on my CV?\n\nHelp me evaluate...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'bias-and-limits',
      title: 'AI Bias and Limitations',
      blocks: [
        {
          type: 'theory',
          title: 'AI is not neutral or always correct',
          body: `AI has biases and limitations you need to know about:

CULTURAL BIAS
AI is trained mostly on English content from the USA and Europe. It may:
• Not understand South African context
• Give advice that doesn't work here
• Miss local references and cultural nuances
• Default to American examples

HISTORICAL BIAS
AI learned from the internet, which reflects historical inequalities:
• May perpetuate stereotypes
• Can have biased views about certain groups
• May give different advice based on names or contexts

CONFIDENCE WITHOUT ACCURACY
AI sounds certain even when wrong:
• Will confidently cite fake statistics
• May invent sources that don't exist
• Can give outdated information
• Doesn't know what it doesn't know`,
        },
        {
          type: 'worked_example',
          title: 'Spotting AI bias in action',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Ask for entrepreneur examples',
              working: 'Prompt: "Name 5 successful entrepreneurs"',
              answer: 'AI often defaults to American tech billionaires. It might miss African entrepreneurs like Strive Masiyiwa, Patrice Motsepe, or Taddy Blecher unless you ask specifically.',
            },
            {
              stepNumber: 2,
              instruction: 'Ask for historical figures',
              working: 'Prompt: "Who are important figures in the struggle for human rights?"',
              answer: 'AI may overweight Western figures. You might need to specifically ask about African leaders like Nelson Mandela, Steve Biko, or Miriam Makeba.',
            },
            {
              stepNumber: 3,
              instruction: 'The fix: Add context',
              working: 'Better prompt: "Name 5 successful South African entrepreneurs who built businesses in the last 20 years"',
              answer: 'Adding local context forces AI to give relevant answers instead of defaulting to global/Western examples.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Test AI for bias',
          aiConfig: {
            instruction: 'Ask Angelo AI a question about South African history, culture, or current events. Then evaluate: Did it give locally relevant information? Did it make any assumptions that don\'t fit SA context? Report what you found.',
            inputPlaceholder: "My question: [ask about SA]\n\nWhat I noticed about the response:\n- Was it locally relevant?\n- Any incorrect assumptions?\n- Any bias I spotted?",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'misinformation',
      title: 'AI and Misinformation',
      blocks: [
        {
          type: 'theory',
          title: 'AI can spread false information',
          body: `AI can generate convincing misinformation. Here's what to watch for:

HALLUCINATIONS
AI sometimes makes things up entirely:
• Fake quotes attributed to real people
• Citations to papers that don't exist
• Historical events that never happened
• Statistics with no source

OUTDATED INFORMATION
AI's knowledge has a cutoff date:
• May not know about recent events
• Could give outdated statistics
• Might miss recent discoveries or changes

PLAUSIBLE BUT WRONG
The most dangerous outputs sound correct:
• Logical-sounding explanations that are factually wrong
• Medical or legal advice that could be harmful
• Technical information with subtle errors`,
        },
        {
          type: 'worked_example',
          title: 'Verification techniques',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Verify statistics',
              working: 'AI says: "South Africa\'s unemployment rate is 25%"',
              answer: 'Check: Go to Stats SA website (statssa.gov.za) for current figures. The actual rate fluctuates and is often higher than AI might state.',
            },
            {
              stepNumber: 2,
              instruction: 'Verify quotes',
              working: 'AI attributes a quote to Nelson Mandela',
              answer: 'Check: Search the exact quote. Many "Mandela quotes" circulating online were never said by him. The Nelson Mandela Foundation has a verified quotes database.',
            },
            {
              stepNumber: 3,
              instruction: 'Verify citations',
              working: 'AI cites: "Journal of African Economics, Smith et al., 2020"',
              answer: 'Check: Search for this paper. AI often invents plausible-sounding but fake citations. Use Google Scholar or your school library to verify.',
            },
          ],
        },
        {
          type: 'tip',
          body: `Rule of thumb: If a fact is important enough to include in your work, it's important enough to verify independently. AI is a starting point for research, not the final source.`,
        },
        {
          type: 'ai_practical',
          title: 'Fact-check an AI response',
          aiConfig: {
            instruction: 'Ask Angelo AI for a specific fact or statistic about South Africa (economy, history, sports, anything). Then tell it you want to verify this information — ask where you could check this fact independently.',
            inputPlaceholder: "Please tell me [specific fact about SA].\n\nNow, where can I verify this information independently?",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'disclosure',
      title: 'When and How to Disclose',
      blocks: [
        {
          type: 'theory',
          title: 'Be honest about AI use',
          body: `Many schools and universities now require you to disclose when you've used AI. Here's how to do it right:

What to disclose:
— That you used AI assistance
— What tool you used (ChatGPT, Claude, Angelo AI, etc.)
— How you used it (research, explanation, feedback, etc.)

Example disclosure:
"I used Angelo AI to help me understand the concept of photosynthesis before writing this essay. The ideas and writing are my own."

Another example:
"AI was used to check grammar and suggest improvements. All content was written by me."

When in doubt, disclose. Teachers respect honesty. They don't respect deception.`,
        },
        {
          type: 'tip',
          body: `Pro tip: Keep a brief log of how you used AI for assignments. "Used Claude to explain quadratic formula" takes 5 seconds to write and can save you if questions arise.`,
        },
        {
          type: 'worked_example',
          title: 'Good disclosure statements',
          steps: [
            {
              stepNumber: 1,
              instruction: 'For research help',
              working: 'You used AI to find sources and understand background information',
              answer: '"AI was used to identify relevant sources and explain key concepts during research. All analysis and writing is my own work. Sources were independently verified."',
            },
            {
              stepNumber: 2,
              instruction: 'For study preparation',
              working: 'You used AI to create practice questions before a test',
              answer: '"I used AI to generate practice questions to prepare for this assessment. The test answers are entirely my own work."',
            },
            {
              stepNumber: 3,
              instruction: 'For writing feedback',
              working: 'You wrote the essay, then asked AI to review it',
              answer: '"This essay was written by me. AI was used to check grammar and suggest clarity improvements. I made final decisions on all changes."',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Write your own disclosure template',
          aiConfig: {
            instruction: 'Think about how you typically use AI for schoolwork. Ask Angelo AI to help you create a disclosure statement template you can adapt for different assignments. Make it honest and specific to your actual AI use.',
            inputPlaceholder: "I typically use AI for: [describe your use]\n\nHelp me create a disclosure statement template I can adapt for my assignments...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'final-ethics',
      title: 'Your Ethical AI Commitment',
      blocks: [
        {
          type: 'theory',
          title: 'The bottom line',
          body: `You now understand AI ethics better than most adults. Here's what to remember:

THE LINE IS CLEAR:
✓ Using AI to learn → Always okay
✗ Using AI to avoid learning → Never okay

WHEN UNSURE:
Ask your teacher. "Can I use AI for this, and how?" takes 10 seconds and protects you.

THE REAL POINT:
You're in school to learn, not to get marks. If AI does your learning, you cheat yourself out of skills you'll need for life.

YOUR COMPETITIVE ADVANTAGE:
Students who use AI ethically develop TWO valuable skills: subject knowledge AND AI proficiency. Students who cheat with AI develop neither.`,
        },
        {
          type: 'ai_practical',
          title: 'Create your AI ethics statement',
          aiConfig: {
            instruction: 'Based on what you learned in this module, write a personal statement about how you will use AI ethically in your studies. Ask Angelo AI to help you make it specific and meaningful — not just generic promises.',
            inputPlaceholder: "Help me write a personal AI ethics statement for my studies. I want to commit to...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
  ],
}
