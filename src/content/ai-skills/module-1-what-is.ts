import type { AIModule } from '@/types'

export const aiWhatIs: AIModule = {
  id: 'ai-what-is',
  title: "What AI actually is — and what it isn't",
  description: "Understand how AI really works under the hood, why it makes mistakes, and how to use this knowledge to get better results.",
  timeEstimate: "12 min",
  sections: [
    {
      id: 'intro',
      title: 'How AI Actually Works',
      blocks: [
        {
          type: 'theory',
          title: 'What happens when you ask AI a question',
          body: `Right now, every time you ask Angelo AI a question, you're using something called a Large Language Model (LLM). Here's what that actually means — and why you should care.

AI learned by reading billions of pages of text — books, websites, conversations, Wikipedia, academic papers, code repositories. When you ask it something, it doesn't "think" like you do. It predicts what word comes next based on patterns it saw in all that data. Then it predicts the next word. Then the next. That's the whole trick.

This single fact explains almost everything about AI:
• Why it sounds so confident
• Why it sometimes makes things up
• Why it's great at some things and terrible at others
• Why the way you ask matters so much`,
        },
        {
          type: 'tip',
          body: `Students who do best with AI are not the ones who trust it blindly. They're the ones who use it as a starting point and then verify. That's the skill your future employer is looking for.`,
        },
      ],
    },
    {
      id: 'under-the-hood',
      title: 'Under the Hood: How LLMs Work',
      blocks: [
        {
          type: 'theory',
          title: 'Pattern matching at massive scale',
          body: `Imagine you've read every book ever written, every website ever made, every conversation ever recorded. You'd start to notice patterns:
• "Once upon a time" is usually followed by a story
• "2 + 2 =" is usually followed by "4"
• "The capital of South Africa is" is usually followed by information about Pretoria, Cape Town, or Bloemfontein

LLMs are basically very sophisticated pattern matchers. They've "read" more text than any human could in thousands of lifetimes, and they've built an incredibly complex map of "what words tend to follow other words."

When you ask: "What's the capital of France?"
AI thinks: "In all the text I've seen, when these words appear, the next word is usually 'Paris'"

It doesn't "know" Paris is the capital. It knows that's the most likely next word based on patterns.`,
        },
        {
          type: 'theory',
          title: 'Why this matters for you',
          body: `Understanding pattern matching explains AI's behaviour:

1. WHY AI SOUNDS CONFIDENT WHEN WRONG
If AI saw incorrect patterns often enough, it learned them. There's no "fact-checking system" built in.

2. WHY AI IS BETTER AT COMMON TOPICS
More training data = better patterns. AI is great at maths because it saw millions of maths problems. It might struggle with niche topics.

3. WHY ASKING DIFFERENTLY GETS DIFFERENT ANSWERS
Different wording triggers different patterns. "Explain simply" vs "Explain technically" connects to different types of text AI learned from.

4. WHY AI CAN'T DO CURRENT EVENTS
AI's training data has a cutoff date. It literally hasn't "read" anything after that date.

5. WHY EXAMPLES HELP SO MUCH
When you give examples, you're telling AI "match THIS pattern, not all the patterns you know."`,
        },
      ],
    },
    {
      id: 'hallucinations',
      title: 'Hallucinations: When AI Makes Things Up',
      blocks: [
        {
          type: 'theory',
          title: 'The confidence problem',
          body: `AI "hallucinations" happen when AI generates information that sounds true but isn't. This is one of AI's biggest problems, and you need to understand it.

Why hallucinations happen:
• AI doesn't know what it doesn't know
• It will always produce SOME output (it can't say "I don't have enough information")
• Confident-sounding text is what it learned to produce
• It has no way to verify facts against the real world

Common hallucination types:
• Fake citations: "According to a 2023 study by Smith et al..."
• Invented facts: Completely made-up statistics
• Wrong but plausible: Mixing up similar concepts
• Confident errors: Mathematical mistakes stated with certainty`,
        },
        {
          type: 'worked_example',
          title: 'Hallucination in action',
          steps: [
            {
              stepNumber: 1,
              instruction: 'User asks',
              working: '"What research has been done on the effects of social media on South African teenagers?"',
              answer: '',
            },
            {
              stepNumber: 2,
              instruction: 'AI might hallucinate',
              working: 'AI: "A 2022 study by researchers at Stellenbosch University found that 73% of South African teenagers..."',
              answer: 'This study might not exist. The statistic might be made up. The researchers might be fictional.',
            },
            {
              stepNumber: 3,
              instruction: 'What to do',
              working: 'Always verify: Search for the study. Check if the researchers exist. Don\'t cite AI\'s citations without checking.',
              answer: 'Rule: Never cite something AI told you without verifying it exists.',
            },
          ],
        },
        {
          type: 'tip',
          body: `Ask AI: "How confident are you in this information? What should I verify?" AI will often tell you what to double-check.`,
        },
      ],
    },
    {
      id: 'strengths-weaknesses',
      title: 'What AI Is Good At (And What It Fails At)',
      blocks: [
        {
          type: 'theory',
          title: 'Know these lists — they\'ll save you time',
          body: `What AI is extremely good at:
✓ Explaining concepts in plain language
✓ Summarising long pieces of text
✓ Generating examples and variations
✓ Brainstorming and ideation
✓ Helping you think through a problem step by step
✓ Translating between languages
✓ Writing first drafts
✓ Suggesting improvements to your work
✓ Pattern-based tasks (grammar, formatting, structure)
✓ Coding help and debugging

What AI is bad at:
✗ Knowing what happened recently (after training cutoff)
✗ Doing precise maths without a calculator tool
✗ Knowing things about you personally
✗ Giving legal, medical, or financial advice
✗ Guaranteeing that anything it says is true
✗ Citing sources accurately
✗ Counting letters, words, or items reliably
✗ Tasks requiring real-world interaction
✗ Truly creative or original ideas (it remixes what it's seen)`,
        },
        {
          type: 'theory',
          title: 'The "Blank Page" Superpower',
          body: `Here's one thing AI is incredibly good at that most people underuse:

AI eliminates the blank page problem.

Can't start your essay? Ask AI for 3 possible opening sentences. Pick one or use them as inspiration.

Don't know how to structure your presentation? Ask AI for an outline.

Stuck on how to phrase something? Ask AI for 5 ways to say it.

You're not copying AI's work — you're using it to overcome the paralysis of starting. This is legitimate, useful, and exactly how professionals use AI.`,
        },
        {
          type: 'tip',
          body: `Here's a rule that will save you marks: Never copy an AI answer into a test or assignment without checking it first. AI is confident, not correct. There's a difference.`,
        },
      ],
    },
    {
      id: 'types-of-ai',
      title: 'Types of AI You\'ll Encounter',
      blocks: [
        {
          type: 'theory',
          title: 'Not all AI is the same',
          body: `Different AI systems work differently and are good at different things:

LANGUAGE MODELS (GPT, Claude, Gemini)
What they do: Generate and understand text
Use for: Explanations, writing help, brainstorming, code
Examples: ChatGPT, Claude, Google Gemini, Angelo AI

IMAGE GENERATORS (DALL-E, Midjourney, Stable Diffusion)
What they do: Create images from text descriptions
Use for: Visual concepts, illustrations, design ideas
Limitations: Can't reliably include text, weird fingers

CODE ASSISTANTS (GitHub Copilot, Cursor)
What they do: Help write and debug code
Use for: Programming, automation, debugging
Specialised for: Developers and programmers

SEARCH AI (Perplexity, Google AI Overview)
What they do: Search the web and summarise results
Use for: Research with sources
Advantage: Can access current information

VOICE ASSISTANTS (Siri, Alexa, Google Assistant)
What they do: Voice commands and simple tasks
Use for: Quick questions, reminders, smart home
Limitation: Less capable than text-based AI`,
        },
        {
          type: 'tip',
          body: `For school work, language models (like Angelo AI) are usually the most useful. They're designed for explaining, teaching, and helping you think.`,
        },
      ],
    },
    {
      id: 'context-window',
      title: 'Understanding Context and Memory',
      blocks: [
        {
          type: 'theory',
          title: 'AI has a "memory limit"',
          body: `AI can only "remember" a certain amount of your conversation at once. This is called the context window.

Think of it like a whiteboard: AI can see everything on the whiteboard, but when the board fills up, old information gets erased to make room for new information.

This means:
• Very long conversations may "forget" earlier parts
• If you give AI a very long document, it might miss details
• Breaking big tasks into smaller conversations often works better
• You may need to remind AI of important details

Practical tips:
• For long projects, summarise key points periodically
• If AI seems to forget something, remind it
• Start fresh conversations for new topics
• Keep important context in your prompts, don't rely on memory`,
        },
        {
          type: 'worked_example',
          title: 'Working with context limits',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Problem',
              working: 'You\'ve had a long conversation about your History essay. Now AI seems to have forgotten your thesis.',
              answer: '',
            },
            {
              stepNumber: 2,
              instruction: 'Solution',
              working: '"Just to remind you, my thesis is [your thesis]. Based on this, can you help me with paragraph 3?"',
              answer: 'AI now has the context it needs to help effectively.',
            },
          ],
        },
      ],
    },
    {
      id: 'practical',
      title: 'Try It Yourself',
      blocks: [
        {
          type: 'ai_practical',
          title: 'Test AI\'s limits',
          aiConfig: {
            instruction: "Ask Angelo AI a question you think it might get wrong. This could be: a very recent event, a specific local detail, precise maths, or something obscure. Then Google the real answer. What did you notice?",
            inputPlaceholder: "Type any question you want to test...",
            mode: 'general_question',
            showComparison: false,
          },
        },
        {
          type: 'theory',
          body: `If you found an error — good catch. This is exactly the skill employers want. Always verify.

If the answer was correct — that's fine too. But notice: you checked. That checking habit is what separates someone who uses AI well from someone who gets burned by it.`,
        },
      ],
    },
    {
      id: 'verification',
      title: 'The Verification Mindset',
      blocks: [
        {
          type: 'theory',
          title: 'Trust but verify',
          body: `Here's the mindset you need to develop:

AI is like a very smart, very well-read friend who:
• Has studied everything but might misremember details
• Is eager to help (sometimes too eager — will guess if unsure)
• Can explain things brilliantly but might get facts wrong
• Doesn't know what happened yesterday
• Will never say "I don't know" — always gives an answer

Would you cite your friend as a source in an essay? No. Would you use their explanation to help you understand something? Yes.

That's exactly how to use AI.

Verification checklist:
□ Facts: Can you confirm this with a reliable source?
□ Citations: Does this study/quote/statistic actually exist?
□ Maths: Did you double-check the calculations?
□ Current info: Is this recent enough to still be accurate?
□ Makes sense: Does this align with what you know?`,
        },
        {
          type: 'tip',
          body: `The best AI users aren't the ones who trust AI the most — they're the ones who know when to trust it and when to verify.`,
        },
      ],
    },
    {
      id: 'summary',
      title: 'Key Takeaways',
      blocks: [
        {
          type: 'theory',
          title: 'What you now understand',
          body: `You now know more about AI than most adults. Here's what matters:

1. AI PREDICTS, IT DOESN'T THINK
It's pattern matching at massive scale. No understanding, no reasoning in the human sense.

2. CONFIDENCE ≠ CORRECTNESS
AI sounds sure even when wrong. Your job is to verify.

3. GARBAGE IN, GARBAGE OUT
The quality of your question determines the quality of your answer. (Next module: how to ask better questions)

4. KNOW THE LIMITATIONS
Current events, precise maths, personal knowledge, verifiable citations — these are weak spots.

5. USE THE STRENGTHS
Explanations, brainstorming, first drafts, examples, step-by-step breakdowns — AI excels here.

6. ALWAYS VERIFY IMPORTANT FACTS
If you're going to submit it, cite it, or rely on it — check it.

You're ready for Module 2, where you'll learn the specific techniques to get better results from AI. These skills are worth real money in the job market.`,
        },
      ],
    },
  ],
}
