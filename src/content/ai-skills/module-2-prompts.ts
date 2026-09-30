import type { AIModule } from '@/types'

export const aiPrompts: AIModule = {
  id: 'ai-prompts',
  title: "The skill that gets you hired: prompt engineering",
  titleAf: "Die vaardigheid wat jou werk gee: instruksie-ingenieurswese",
  description: "Master the art and science of communicating with AI — from basic techniques to advanced strategies used by professionals.",
  descriptionAf: "Bemeester die kuns en wetenskap van kommunikasie met KI — van basiese tegnieke tot gevorderde strategieë wat professionele mense gebruik.",
  timeEstimate: "25 min",
  timeEstimateAf: "25 min",
  unlockCondition: 'ai-what-is',
  sections: [
    {
      id: 'intro',
      title: 'Why Prompts Matter',
      blocks: [
        {
          type: 'theory',
          title: 'Bad prompts = bad answers. Every time.',
          body: `Here's a truth nobody tells you: AI is only as useful as the question you ask it.

Ask "help me with maths" and you'll get a vague, useless response. Ask "explain how to solve quadratic equations by factoring, with 3 examples I can practice" and suddenly AI becomes your personal tutor.

This isn't magic. It's a skill called prompt engineering — and companies are paying people R50,000+ per month just to write good prompts. Not code. Prompts.

In this comprehensive module, you'll learn:
• Core prompting frameworks that work for any AI
• 10+ specific techniques professionals use
• How to combine techniques for complex tasks
• When to use which technique
• How to iterate and refine your prompts

You're about to learn skills that most adults don't have.`,
        },
        {
          type: 'tip',
          body: `Every time you use Angelo AI from now on, you're practicing a skill employers will pay for. Treat it like training.`,
        },
      ],
    },
    {
      id: 'framework',
      title: 'The Foundation: 4-Part Prompt Framework',
      blocks: [
        {
          type: 'theory',
          title: 'Context → Task → Format → Constraints',
          body: `Great prompts have four parts. Miss one and your answer gets worse.

1. CONTEXT: Who you are, what situation you're in
"I'm a Grade 11 student preparing for my Physical Science exam"

2. TASK: What you actually want AI to do
"Explain Newton's Laws in simple terms"

3. FORMAT: How you want the answer structured
"Give me bullet points I can memorise"

4. CONSTRAINTS: Limits or requirements
"Keep it under 200 words, focus on what's most likely to be tested"

Put them together:
"I'm a Grade 11 student preparing for my Physical Science exam. Explain Newton's Laws in simple terms. Give me bullet points I can memorise. Keep it under 200 words and focus on what's most likely to be tested."

That prompt will get you a useful answer. Every time.`,
        },
        {
          type: 'worked_example',
          title: 'Bad prompt vs Good prompt',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Bad prompt',
              working: '"Help me with my essay"',
              answer: 'AI has no idea what essay, what subject, what you want help with, or how to format it.',
            },
            {
              stepNumber: 2,
              instruction: 'Good prompt',
              working: '"I\'m writing a 300-word English essay about social media\'s impact on teenagers. I have my own opinions but need help structuring them. Give me an essay outline with intro, 3 body paragraphs, and conclusion. Don\'t write the essay — just the structure."',
              answer: 'AI knows exactly what you need and will give you a useful framework.',
            },
          ],
        },
      ],
    },
    {
      id: 'zero-shot',
      title: 'Technique 1: Zero-Shot Prompting',
      blocks: [
        {
          type: 'theory',
          title: 'When you just ask directly',
          body: `Zero-shot prompting is when you ask AI to do something without providing any examples. You're relying purely on AI's training to understand what you want.

This is what most people do:
"Translate 'Good morning' to French"
"What's the capital of South Africa?"
"Summarise the plot of Macbeth"

Zero-shot works well for:
• Simple, clear tasks
• Common questions AI has seen before
• Tasks with obvious expected outputs

Zero-shot works badly for:
• Specific formats you have in mind
• Unusual or creative tasks
• When AI might misunderstand what you want

Most students stop here. But there are much more powerful techniques.`,
        },
        {
          type: 'worked_example',
          title: 'Zero-shot in action',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Simple zero-shot prompt',
              working: '"What are the causes of World War 1?"',
              answer: 'AI gives a standard answer based on its training. Works fine for common topics.',
            },
            {
              stepNumber: 2,
              instruction: 'When zero-shot fails',
              working: '"Write a good Instagram caption"',
              answer: 'AI doesn\'t know your style, audience, or context. Result will be generic.',
            },
          ],
        },
      ],
    },
    {
      id: 'one-shot',
      title: 'Technique 2: One-Shot Prompting',
      blocks: [
        {
          type: 'theory',
          title: 'Show AI what you want with ONE example',
          body: `One-shot prompting gives AI a single example of what you want. This dramatically improves results for tasks where the format or style matters.

Structure:
"Here's an example of what I want: [example]. Now do the same for [your request]."

Why it works:
AI is extremely good at pattern matching. When you show it an example, it understands:
• The format you expect
• The tone and style
• The level of detail
• What to include and what to leave out

One-shot is perfect for:
• Writing in a specific style
• Filling out templates
• Formatting information a certain way`,
        },
        {
          type: 'worked_example',
          title: 'One-shot transforms your results',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Zero-shot (mediocre result)',
              working: '"Write a product description for my honey business"',
              answer: 'Generic, may not match your brand voice at all.',
            },
            {
              stepNumber: 2,
              instruction: 'One-shot (much better)',
              working: '"Here\'s an example product description I like: \'Handcrafted in the Lowveld, our raw honey captures the essence of South African wildflowers. No additives. No processing. Just pure golden goodness.\' Now write a similar one for my biltong business."',
              answer: 'AI matches your style: local, natural, short punchy sentences.',
            },
          ],
        },
        {
          type: 'tip',
          body: `The example you give matters more than how much you explain. One good example beats 100 words of description.`,
        },
      ],
    },
    {
      id: 'few-shot',
      title: 'Technique 3: Few-Shot Prompting',
      blocks: [
        {
          type: 'theory',
          title: 'Multiple examples = better pattern matching',
          body: `Few-shot prompting uses 2-5 examples to show AI exactly what you want. This is one of the most powerful techniques for getting consistent, high-quality results.

Structure:
"Here are some examples:
Input: [example 1 input] → Output: [example 1 output]
Input: [example 2 input] → Output: [example 2 output]
Input: [example 3 input] → Output: [example 3 output]

Now do the same for:
Input: [your actual request]"

Why 3+ examples matter:
• AI spots patterns across examples
• Reduces randomness in outputs
• Makes AI understand edge cases
• Results become more predictable

The magic number is usually 3-5 examples. More than 5 rarely helps and wastes context space.`,
        },
        {
          type: 'worked_example',
          title: 'Few-shot for consistent results',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Setup: Provide examples',
              working: '"Convert these formal sentences to casual:\n\nFormal: I would be grateful if you could assist me.\nCasual: Can you help me out?\n\nFormal: Please find the document attached.\nCasual: Here\'s the doc!\n\nFormal: I hope this message finds you well.\nCasual: Hey, how\'s it going?"',
              answer: 'AI now understands exactly what "casual" means to you.',
            },
            {
              stepNumber: 2,
              instruction: 'Your actual request',
              working: '"Now convert: We regret to inform you that your application was unsuccessful."',
              answer: 'AI outputs: "Sorry, you didn\'t get it this time." - matches your style perfectly.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Practice few-shot prompting',
          aiConfig: {
            instruction: "Create a few-shot prompt to teach AI your personal writing style. Provide 3 examples of how you'd say something, then ask it to write something new in that style.",
            inputPlaceholder: "Example 1: ...\nExample 2: ...\nExample 3: ...\n\nNow write a [your request] in this same style.",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'chain-of-thought',
      title: 'Technique 4: Chain of Thought (CoT)',
      blocks: [
        {
          type: 'theory',
          title: 'Make AI show its working',
          body: `Chain of Thought prompting asks AI to think through a problem step by step before giving the final answer. This dramatically improves accuracy on complex tasks.

The magic phrase:
"Think through this step by step."
OR
"Let's work through this logically."
OR
"Show your reasoning at each step."

Why it works:
When AI rushes to an answer, it often makes mistakes. When forced to reason step by step, it:
• Catches logical errors
• Considers all parts of the problem
• Produces more accurate answers
• Shows working you can verify

Chain of Thought is essential for:
• Maths problems
• Logic puzzles
• Complex analysis
• Debugging code
• Any task where steps build on each other`,
        },
        {
          type: 'worked_example',
          title: 'CoT makes a massive difference',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Without CoT (often wrong)',
              working: '"A shop has 15 apples. It receives a delivery of 3 boxes with 8 apples each. If 12 apples are sold, how many remain?"',
              answer: 'AI might give wrong answer by rushing.',
            },
            {
              stepNumber: 2,
              instruction: 'With CoT (reliable)',
              working: '"A shop has 15 apples. It receives a delivery of 3 boxes with 8 apples each. If 12 apples are sold, how many remain? Think through this step by step."',
              answer: 'AI reasons: "Start: 15 apples. Delivery: 3 × 8 = 24 apples. Total: 15 + 24 = 39. Sold: 12. Remaining: 39 - 12 = 27 apples."',
            },
          ],
        },
        {
          type: 'tip',
          body: `Use CoT for EVERY maths problem. It doesn't slow things down much, but it prevents so many mistakes.`,
        },
      ],
    },
    {
      id: 'role-prompting',
      title: 'Technique 5: Role/Persona Prompting',
      blocks: [
        {
          type: 'theory',
          title: 'Tell AI who to be',
          body: `Role prompting assigns AI a specific identity, expertise, or perspective. This changes how it responds to your questions.

Structure:
"You are a [role]. [Your question or task]"
OR
"Act as a [role]. [Your question or task]"
OR
"As an expert [role], [your question or task]"

Powerful roles to try:
• "You are an experienced matric examiner" — get exam-focused insights
• "Act as a patient Maths tutor for Grade 11 students" — get simpler explanations
• "You are a career counsellor in South Africa" — get local job advice
• "Act as a critical reviewer who finds flaws" — get honest feedback
• "You are a study coach who motivates students" — get encouraging study plans

Role prompting works because AI learned from text written by different types of people. When you assign a role, you're filtering for that perspective.`,
        },
        {
          type: 'worked_example',
          title: 'Same question, different roles',
          steps: [
            {
              stepNumber: 1,
              instruction: 'No role (generic answer)',
              working: '"How should I prepare for a job interview?"',
              answer: 'Generic advice that applies to anyone anywhere.',
            },
            {
              stepNumber: 2,
              instruction: 'With role (specific, useful answer)',
              working: '"You are an HR manager at a South African company who has interviewed hundreds of entry-level candidates. How should I, a Grade 12 student with no experience, prepare for my first job interview at a retail store?"',
              answer: 'Specific tips for SA, entry-level, retail context.',
            },
          ],
        },
        {
          type: 'tip',
          body: `Combine role prompting with other techniques. "You are an expert Maths teacher. Think through this problem step by step and explain it simply."`,
        },
      ],
    },
    {
      id: 'structured-output',
      title: 'Technique 6: Structured Output Formatting',
      blocks: [
        {
          type: 'theory',
          title: 'Tell AI exactly how to format the answer',
          body: `Structured output prompting tells AI the exact format you want. This makes outputs immediately usable without editing.

Common formats:
• "Give me a numbered list"
• "Format as a table with columns: [X], [Y], [Z]"
• "Use bullet points"
• "Give me headings and subheadings"
• "Format as: Question: [question] Answer: [answer]"
• "Present as: Term: [term] | Definition: [definition]"
• "Structure as: Pros: [...] Cons: [...]"

Why formatting matters:
• Easier to read and remember
• Can copy directly into your notes
• Makes studying more efficient
• Shows you understand what you need`,
        },
        {
          type: 'worked_example',
          title: 'Formatting transforms usefulness',
          steps: [
            {
              stepNumber: 1,
              instruction: 'No format specified',
              working: '"Explain the differences between mitosis and meiosis"',
              answer: 'Wall of text that\'s hard to study from.',
            },
            {
              stepNumber: 2,
              instruction: 'With format specified',
              working: '"Explain the differences between mitosis and meiosis. Format as a comparison table with these columns: Feature | Mitosis | Meiosis"',
              answer: 'Clean table you can screenshot and study.',
            },
          ],
        },
        {
          type: 'theory',
          title: 'Advanced: JSON and data formats',
          body: `For more technical uses, you can ask AI to output in specific data formats:

"Return your answer as JSON with this structure:
{
  \"topic\": \"...\",
  \"key_points\": [\"...\", \"...\"],
  \"difficulty\": 1-5,
  \"study_time_minutes\": ...
}"

This is useful when:
• Building apps that use AI
• Creating structured study materials
• Organising information for databases
• When you need very precise formatting`,
        },
      ],
    },
    {
      id: 'negative-prompting',
      title: 'Technique 7: Negative Constraints',
      blocks: [
        {
          type: 'theory',
          title: 'Tell AI what NOT to do',
          body: `Sometimes the best way to get what you want is to tell AI what to avoid. Negative constraints prevent common problems.

Examples:
• "Don't give me the answer directly — help me figure it out myself"
• "Avoid technical jargon — explain like I'm 12"
• "Don't use examples from the USA — South African examples only"
• "Don't write more than 100 words"
• "Don't include information I can easily Google"
• "Skip the introduction — get straight to the point"
• "Don't be overly positive — give me honest feedback"

Negative prompting is powerful because:
• AI defaults to certain patterns (like long introductions)
• Sometimes you know what you don't want but can't describe what you do want
• It prevents AI from doing things that waste your time`,
        },
        {
          type: 'worked_example',
          title: 'Negative constraints in action',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Without negative constraints',
              working: '"Explain photosynthesis"',
              answer: 'Long explanation with technical terms, probably too detailed.',
            },
            {
              stepNumber: 2,
              instruction: 'With negative constraints',
              working: '"Explain photosynthesis. Don\'t use any scientific terms. Don\'t write more than 50 words. Don\'t include the chemical equation."',
              answer: '"Plants use sunlight, water, and air to make their own food. Think of leaves as tiny food factories that run on sunshine."',
            },
          ],
        },
      ],
    },
    {
      id: 'iterative-refinement',
      title: 'Technique 8: Iterative Refinement',
      blocks: [
        {
          type: 'theory',
          title: 'Your first prompt is rarely your last',
          body: `Iterative refinement means having a conversation with AI to improve the output step by step. This is how professionals get great results.

The process:
1. Start with a reasonable prompt
2. Review the output
3. Ask for specific changes
4. Repeat until satisfied

Common refinement requests:
• "Make it simpler"
• "Add more detail to point 2"
• "Give me a different example"
• "Make it more formal/casual"
• "Shorten this to half the length"
• "Focus more on [specific aspect]"
• "What about [thing you didn't mention]?"

Don't start over — build on what AI gave you. This saves time and often produces better results than trying to write the "perfect" first prompt.`,
        },
        {
          type: 'worked_example',
          title: 'Refinement conversation',
          steps: [
            {
              stepNumber: 1,
              instruction: 'First attempt',
              working: 'You: "Explain inflation"\nAI: [Detailed explanation about economics...]',
              answer: 'Good start, but too complex.',
            },
            {
              stepNumber: 2,
              instruction: 'First refinement',
              working: 'You: "That\'s too complicated. Explain it using grocery shopping as an example."',
              answer: 'AI adjusts: uses bread prices as example.',
            },
            {
              stepNumber: 3,
              instruction: 'Second refinement',
              working: 'You: "Perfect. Now give me 3 bullet points I can remember for my test."',
              answer: 'AI condenses to 3 key points.',
            },
          ],
        },
        {
          type: 'tip',
          body: `AI doesn't judge you for asking follow-up questions. The best results come from 3-5 exchanges, not one perfect prompt.`,
        },
      ],
    },
    {
      id: 'prompt-chaining',
      title: 'Technique 9: Prompt Chaining',
      blocks: [
        {
          type: 'theory',
          title: 'Break complex tasks into steps',
          body: `Prompt chaining breaks a complex task into multiple simpler prompts, using the output of one as input for the next.

Example: Writing an essay
Instead of: "Write me an essay about climate change"

Chain:
1. "List 5 possible angles for an essay about climate change's impact on South Africa"
2. "For angle #3, give me an outline with intro, 3 body paragraphs, and conclusion"
3. "Write just the introduction, keeping it under 80 words"
4. "Now write body paragraph 1 based on the outline"
...and so on

Why chaining works:
• Each step is simpler and clearer
• You can review and adjust at each stage
• Less likely to get completely wrong outputs
• You stay in control of the direction
• Easier to fix problems (just redo one step)`,
        },
        {
          type: 'worked_example',
          title: 'Chaining for research',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Step 1: Gather information',
              working: '"What are the 5 most important events leading to apartheid in South Africa?"',
              answer: 'AI lists key events.',
            },
            {
              stepNumber: 2,
              instruction: 'Step 2: Analyse one event',
              working: '"Explain event #2 (the Natives Land Act of 1913) in more detail. Include who was affected and the long-term consequences."',
              answer: 'Deep dive on specific event.',
            },
            {
              stepNumber: 3,
              instruction: 'Step 3: Create study material',
              working: '"Create 3 exam-style questions about the Natives Land Act that might appear on a Grade 11 History test."',
              answer: 'Targeted practice questions.',
            },
          ],
        },
      ],
    },
    {
      id: 'meta-prompting',
      title: 'Technique 10: Meta Prompting',
      blocks: [
        {
          type: 'theory',
          title: 'Use AI to improve your prompts',
          body: `Meta prompting is when you ask AI to help you write better prompts. This is surprisingly effective and is used by professionals.

How to do it:
"I want to ask AI about [topic]. What's the best way to phrase my prompt to get [desired result]?"

Or after getting a bad response:
"I asked AI [your prompt] but got [problem with response]. How should I rephrase my prompt?"

Or for complex tasks:
"I need to get AI to help me [complex task]. Can you help me write a detailed prompt that will get the best results?"

Meta prompting is powerful because:
• AI knows what works well for AI
• It helps you learn prompt patterns
• You improve at prompting over time
• It often catches things you missed`,
        },
        {
          type: 'ai_practical',
          title: 'Try meta prompting',
          aiConfig: {
            instruction: "Think of something you want to ask AI about. Instead of asking directly, first ask: 'Help me write the best prompt to ask about [your topic] for [your specific needs].' Then use that improved prompt.",
            inputPlaceholder: "Help me write the best prompt to ask about...",
            mode: 'general_question',
            showComparison: true,
          },
        },
      ],
    },
    {
      id: 'tree-of-thoughts',
      title: 'Technique 11: Tree of Thoughts',
      blocks: [
        {
          type: 'theory',
          title: 'Explore multiple paths before deciding',
          body: `Tree of Thoughts (ToT) prompting asks AI to consider multiple different approaches before picking the best one. This is excellent for complex problems with no obvious solution.

Structure:
"Consider 3 different approaches to [problem]. For each approach, explain the pros and cons. Then recommend which approach would work best for [your specific situation]."

When to use ToT:
• Career decisions
• Solving complex problems
• Writing strategies
• Study planning
• When you're stuck and need options

Why it works:
• Forces AI to think more deeply
• You see alternatives you might not have considered
• Makes it clear there's often no "one right answer"
• Helps with decision-making`,
        },
        {
          type: 'worked_example',
          title: 'Tree of Thoughts for study planning',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Ask for multiple approaches',
              working: '"I have 5 days to prepare for my Maths exam. I\'m weak on trigonometry and algebra but okay on geometry. Consider 3 different study approaches. For each, explain the strategy and potential risks. Then recommend which approach would work best."',
              answer: '',
            },
            {
              stepNumber: 2,
              instruction: 'AI explores options',
              working: 'AI provides:\nApproach 1: Focus only on weak areas (high risk/high reward)\nApproach 2: Balanced review of everything (safer but might not fix weaknesses)\nApproach 3: Strategic coverage based on exam weighting (efficient but needs info)',
              answer: 'You now have a clear decision to make with full information.',
            },
          ],
        },
      ],
    },
    {
      id: 'combining-techniques',
      title: 'Putting It All Together',
      blocks: [
        {
          type: 'theory',
          title: 'Combine techniques for powerful results',
          body: `The real power comes from combining multiple techniques in one prompt. Here's a formula that works:

Role + Context + Task + Format + CoT + Constraints

Example:
"You are an experienced Grade 12 Maths teacher [ROLE]. I'm a student who keeps making careless errors in calculus [CONTEXT]. Give me a checklist I can use to check my work before submitting [TASK]. Format as a numbered list with max 8 items [FORMAT]. Think about the most common errors students make [COT]. Focus on things I can check in under 30 seconds each [CONSTRAINT]."

This single prompt uses 6 techniques and will produce excellent results.`,
        },
        {
          type: 'worked_example',
          title: 'Professional-level prompt',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Amateur prompt',
              working: '"Help me prepare for my interview"',
              answer: 'Vague response with generic tips.',
            },
            {
              stepNumber: 2,
              instruction: 'Professional prompt (combining techniques)',
              working: '"You are an HR manager who has conducted 500+ interviews for retail positions [ROLE]. I\'m a Grade 12 student with no formal work experience applying for a part-time cashier position at Checkers [CONTEXT]. Help me prepare for common interview questions [TASK].\n\nFirst, list the 5 questions I\'m most likely to be asked [STRUCTURE]. For each question, think step by step about what the interviewer actually wants to know [COT], then give me a framework for answering (not a script — I want to use my own words) [CONSTRAINT].\n\nFormat as:\nQuestion: [question]\nWhat they\'re really asking: [insight]\nHow to structure your answer: [framework]"',
              answer: 'Highly specific, actionable advice tailored to your exact situation.',
            },
          ],
        },
        {
          type: 'tip',
          body: `You don't need to use every technique every time. Start simple, then add techniques when you need better results.`,
        },
      ],
    },
    {
      id: 'common-mistakes',
      title: 'Mistakes That Waste Your Time',
      blocks: [
        {
          type: 'theory',
          title: 'Stop making these errors',
          body: `Mistake 1: Too vague
"Help me study" → AI doesn't know what subject, what level, what specifically you struggle with

Mistake 2: Too much at once
"Explain all of physics" → You'll get shallow answers on everything instead of deep answers on what matters

Mistake 3: Not telling AI your level
"Explain quantum mechanics" without saying you're in Grade 11 → You'll get university-level explanations you can't use

Mistake 4: Not asking for what you actually need
"Give me the answer" when you need to understand → You pass the homework, fail the test

Mistake 5: Not iterating
Your first prompt rarely gets the perfect answer. Say "make it simpler" or "give me another example" — AI doesn't mind.

Mistake 6: Copying AI's first draft
AI gives you a starting point. You should always review, edit, and make it your own.

Mistake 7: Not verifying
AI sounds confident even when wrong. Always check important facts.`,
        },
        {
          type: 'tip',
          body: `Treat AI like a very smart friend who knows nothing about your specific situation. You have to tell them everything relevant.`,
        },
      ],
    },
    {
      id: 'when-to-use-what',
      title: 'Quick Reference: When to Use What',
      blocks: [
        {
          type: 'theory',
          title: 'Technique selection guide',
          body: `ZERO-SHOT: Simple questions, common topics, quick lookups
→ "What's the formula for the area of a circle?"

ONE-SHOT: When you want a specific style or format
→ "Write like this example: [example]"

FEW-SHOT: Consistent outputs, classification, pattern matching
→ "Here are 3 examples of what I want..."

CHAIN OF THOUGHT: Maths, logic, complex reasoning, debugging
→ "Think through this step by step"

ROLE PROMPTING: Expertise, different perspectives, specific advice
→ "You are a [expert role]"

STRUCTURED OUTPUT: Study notes, comparisons, organised information
→ "Format as a table/list/outline"

NEGATIVE CONSTRAINTS: Avoiding common problems, length limits
→ "Don't include/use/write..."

ITERATIVE REFINEMENT: Complex tasks, creative work, when unsatisfied
→ "Make it shorter/simpler/more detailed"

PROMPT CHAINING: Research, essays, multi-step projects
→ Break into separate prompts

META PROMPTING: When you're stuck, complex requests
→ "Help me write a prompt for..."

TREE OF THOUGHTS: Decisions, complex problems, multiple paths
→ "Consider 3 approaches and compare"`,
        },
      ],
    },
    {
      id: 'final-practical',
      title: 'Final Practice: Build a Power Prompt',
      blocks: [
        {
          type: 'ai_practical',
          title: 'Combine everything you learned',
          aiConfig: {
            instruction: "Create a prompt for something you actually need help with. Use at least 3 techniques from this module. Include: a role, context about yourself, a specific task, your desired format, and at least one constraint. See how much better the response is compared to a simple prompt.",
            inputPlaceholder: "Write your power prompt here, combining multiple techniques...",
            mode: 'prompt_evaluation',
            showComparison: true,
          },
        },
        {
          type: 'theory',
          title: 'You now have skills most people lack',
          body: `You've just learned 11 prompt engineering techniques:

1. Zero-shot — Direct questions
2. One-shot — Single example
3. Few-shot — Multiple examples
4. Chain of Thought — Step-by-step reasoning
5. Role Prompting — Assigning expertise
6. Structured Output — Formatting answers
7. Negative Constraints — What to avoid
8. Iterative Refinement — Improve through conversation
9. Prompt Chaining — Breaking down complex tasks
10. Meta Prompting — AI helps write prompts
11. Tree of Thoughts — Exploring multiple paths

These are the same techniques used by professional prompt engineers being paid R50,000+ per month.

The difference between you and most AI users? You now know that the quality of your prompt determines the quality of your answer. And you have specific techniques to make your prompts better.

Practice these. Use them daily. They'll become second nature.`,
        },
      ],
    },
  ],
}
