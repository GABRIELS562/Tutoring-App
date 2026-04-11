import type { AIModule } from '@/types'

export const aiCareers: AIModule = {
  id: 'ai-careers',
  title: "AI in your career: What employers actually want",
  description: "The AI skills that will get you hired — and the ones that won't.",
  timeEstimate: "18 min",
  unlockCondition: 'ai-ethics',
  sections: [
    {
      id: 'intro',
      title: 'The Job Market Has Changed',
      blocks: [
        {
          type: 'theory',
          title: 'What this means for you',
          body: `Here's what's happening in the job market right now:

Companies aren't asking "can you use AI?" anymore. They're asking "how well can you use AI to get better results?"

Jobs that required 5 people now require 2 people with AI skills. That sounds scary, but it means those 2 people get paid more. The question is: are you one of the 2, or one of the 3 who got replaced?

AI won't take your job. Someone who's better at using AI than you will take your job.

The skills you're learning in this course — writing good prompts, using AI to learn faster, knowing the ethics — these are exactly what employers want. And most people don't have them.`,
        },
        {
          type: 'tip',
          body: `The fact that you're doing this module puts you ahead of most job applicants your age. Keep going.`,
        },
        {
          type: 'worked_example',
          title: 'Real job postings mentioning AI (SA, 2025)',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Marketing Coordinator - Cape Town',
              working: 'Job posting requirement: "Experience with AI content tools and ability to use ChatGPT or similar for content ideation"',
              answer: 'This is a junior marketing role, not a tech job. AI skills are now expected across industries.',
            },
            {
              stepNumber: 2,
              instruction: 'Administrative Assistant - Johannesburg',
              working: 'Job posting requirement: "Proficiency in using AI assistants for scheduling, document drafting, and data organisation"',
              answer: 'Even traditional admin roles now want AI skills. This changes everything.',
            },
            {
              stepNumber: 3,
              instruction: 'Graduate Trainee - Major SA Bank',
              working: 'Job posting requirement: "Demonstrated ability to leverage AI tools responsibly and ethically"',
              answer: 'Notice "responsibly and ethically" — your ethics training matters too.',
            },
          ],
        },
      ],
    },
    {
      id: 'skills',
      title: 'Skills Employers Actually Want',
      blocks: [
        {
          type: 'theory',
          title: 'The AI skills that matter',
          body: `1. Prompt Engineering
Writing prompts that get useful results. You learned this in Module 2. Companies pay people R50,000/month+ just for this skill.

2. AI-Assisted Problem Solving
Using AI to work through complex problems faster. Not having AI do the work — using it as a thinking partner.

3. Verification Skills
Knowing when AI is wrong and being able to check its work. This is more valuable than just accepting AI output blindly.

4. Ethical AI Use
Understanding when AI use is appropriate and when it isn't. Companies don't want employees who cheat or create liability.

5. Continuous Learning
AI changes fast. Employers want people who can learn new tools quickly. You're demonstrating this skill right now.

6. Human + AI Collaboration
Knowing what humans do better (creativity, judgment, relationships) and what AI does better (speed, pattern matching, consistency). The best results come from combining both.`,
        },
        {
          type: 'worked_example',
          title: 'Human vs AI strengths',
          steps: [
            {
              stepNumber: 1,
              instruction: 'AI does this better',
              working: 'Processing large amounts of data, finding patterns, generating options quickly, working 24/7, consistent output',
              answer: 'These are "scale" tasks — AI wins on speed and volume.',
            },
            {
              stepNumber: 2,
              instruction: 'Humans do this better',
              working: 'Understanding emotions, building relationships, making ethical judgments, creative leaps, handling ambiguity',
              answer: 'These require emotional intelligence and real-world understanding AI lacks.',
            },
            {
              stepNumber: 3,
              instruction: 'The winning combination',
              working: 'Human sets strategy and makes decisions. AI does research, drafts, and processes. Human reviews and refines.',
              answer: 'The best professionals use AI to amplify their human skills, not replace them.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Identify your AI-enhanced skills',
          aiConfig: {
            instruction: 'List 3 skills or subjects you\'re good at. Ask Angelo AI to help you think about how AI could amplify each of these skills in a future job — not replace them, but make them more valuable.',
            inputPlaceholder: "My skills/strengths:\n1. [skill 1]\n2. [skill 2]\n3. [skill 3]\n\nHow could AI amplify these skills in a future career?",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'jobs',
      title: 'Jobs That Didn\'t Exist 3 Years Ago',
      blocks: [
        {
          type: 'theory',
          title: 'New careers emerging in SA',
          body: `AI Prompt Engineer
Writes and optimises prompts for businesses. Entry level: R25,000-45,000/month.

AI Trainer / Data Annotator
Helps train AI systems by providing feedback and corrections. Entry level: R15,000-30,000/month. Many positions are remote.

AI Ethics Officer
Ensures companies use AI responsibly. Requires understanding of both tech and ethics. R40,000-80,000/month.

AI Integration Specialist
Helps businesses add AI tools to their existing systems. Technical but doesn't require a computer science degree. R35,000-60,000/month.

Content Creator with AI Skills
Writers, designers, marketers who use AI to create content faster. In demand across industries. R20,000-50,000/month.

These jobs exist right now. In South Africa. For people with the skills you're learning.`,
        },
        {
          type: 'tip',
          body: `You don't need a degree in AI to get these jobs. You need to prove you can use AI effectively. This certificate helps you do that.`,
        },
        {
          type: 'worked_example',
          title: 'Traditional jobs transformed by AI',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Accountant → AI-Enhanced Accountant',
              working: 'Traditional: Manual data entry, reconciliation, basic bookkeeping',
              answer: 'AI-Enhanced: AI handles routine tasks. Accountant focuses on analysis, strategy, and client relationships. Higher value, higher pay.',
            },
            {
              stepNumber: 2,
              instruction: 'Teacher → AI-Augmented Educator',
              working: 'Traditional: Same lesson for every student, manual marking',
              answer: 'AI-Augmented: AI personalises learning paths and handles grading. Teacher focuses on mentoring, motivation, and complex explanations.',
            },
            {
              stepNumber: 3,
              instruction: 'Customer Service → AI-Supported Agent',
              working: 'Traditional: Answer same questions repeatedly',
              answer: 'AI-Supported: AI handles common queries. Human agents handle complex issues requiring empathy and problem-solving. More interesting work.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Explore your future career + AI',
          aiConfig: {
            instruction: 'What career are you interested in? Ask Angelo AI how AI is changing that industry and what AI skills would make you more valuable in that career.',
            inputPlaceholder: "I'm interested in becoming a [career/field].\n\nHow is AI changing this industry?\nWhat AI skills would help me succeed?",
            mode: 'cv_help',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'side-hustles',
      title: 'AI-Powered Side Hustles for Students',
      blocks: [
        {
          type: 'theory',
          title: 'Start earning with AI skills now',
          body: `You don't have to wait for a formal job. Here are side hustles you can start while still in school:

CONTENT CREATION SERVICES
Use AI to help local businesses with social media posts, product descriptions, or email newsletters. R200-500 per piece.

TUTORING WITH AI
Offer tutoring services where you teach younger students how to use AI effectively for studying. R100-200/hour.

DATA ENTRY + AI
Offer to organise data for small businesses, using AI to speed up the process. R50-100/hour.

TRANSLATION ASSISTANCE
If you speak multiple SA languages, use AI to help with translations (then verify them yourself). R200-400 per document.

RESUME/CV WRITING
Help others write better CVs using AI assistance. R100-300 per CV.

The key: You're not just using AI. You're offering a service that combines your skills with AI capabilities. That's valuable.`,
        },
        {
          type: 'worked_example',
          title: 'Building a side hustle step by step',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Pick your service',
              working: 'Example: Help local businesses write better product descriptions',
              answer: 'Start with something you can do well. Product descriptions are straightforward and every business needs them.',
            },
            {
              stepNumber: 2,
              instruction: 'Create samples',
              working: 'Write 3-5 sample product descriptions for imaginary or local products',
              answer: 'Use AI to help you draft, but make sure the final product sounds natural and matches SA context.',
            },
            {
              stepNumber: 3,
              instruction: 'Find clients',
              working: 'Message local businesses on Facebook/Instagram: "I noticed your products don\'t have descriptions. I can help — here\'s a sample I made for you."',
              answer: 'Give value first. If they like the sample, offer to do more for a small fee.',
            },
            {
              stepNumber: 4,
              instruction: 'Deliver and grow',
              working: 'Do great work, ask for referrals, raise prices as you improve',
              answer: 'R200/description × 5/week = R4,000/month while still in school.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Plan your AI side hustle',
          aiConfig: {
            instruction: 'Based on your skills and interests, brainstorm a realistic AI-powered side hustle you could start while still in school. Ask Angelo AI to help you create a simple plan to get started.',
            inputPlaceholder: "My skills: [list 2-3 things you're good at]\nMy interests: [what do you enjoy?]\nTime available: [hours per week]\n\nHelp me plan a realistic AI-powered side hustle...",
            mode: 'cv_help',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'cv',
      title: 'Putting AI Skills on Your CV',
      blocks: [
        {
          type: 'theory',
          title: 'How to describe these skills',
          body: `On your CV, don't just write "I know AI". That means nothing. Be specific:

Instead of: "Familiar with AI tools"
Write: "Proficient in using AI for research, content creation, and problem-solving (ChatGPT, Claude, Bard)"

Instead of: "Good at technology"
Write: "Skilled at prompt engineering — getting precise, useful outputs from AI systems"

Instead of: "Completed AI course"
Write: "Certified in AI Literacy — demonstrates understanding of AI capabilities, limitations, and ethical use"

Include specific examples:
"Used AI tools to reduce research time by 50% while maintaining accuracy"
"Created AI-assisted study materials that improved test scores"

The certificate you earn from this course? Put it on your CV. It shows you've actually trained in this.`,
        },
        {
          type: 'worked_example',
          title: 'CV section examples',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Skills Section',
              working: 'Where to list AI skills on your CV',
              answer: 'SKILLS\n• AI & Digital Tools: Prompt engineering, AI-assisted research, content creation with AI tools (ChatGPT, Claude)\n• Ethical AI Use: Trained in responsible AI usage, verification, and disclosure practices',
            },
            {
              stepNumber: 2,
              instruction: 'Certifications Section',
              working: 'How to list this certificate',
              answer: 'CERTIFICATIONS\n• AI Literacy Certificate — Angelo Tutoring (2025)\n  Demonstrates proficiency in prompt engineering, AI-assisted learning, and ethical AI use',
            },
            {
              stepNumber: 3,
              instruction: 'Experience/Projects Section',
              working: 'Showing AI skills in action',
              answer: 'RELEVANT EXPERIENCE\n• Developed AI-enhanced study system that improved personal test scores by 15%\n• Created structured prompts to generate practice exams for study group',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Create your AI skills statement',
          aiConfig: {
            instruction: "Write a 2-3 sentence statement about your AI skills that you could use on a CV or job application. Ask Angelo AI to help you make it specific and professional. Save this to use later.",
            inputPlaceholder: "Write your first draft here, then ask for feedback...",
            mode: 'cv_help',
            saveToProfile: true,
          },
        },
        {
          type: 'ai_practical',
          title: 'Draft your CV skills section',
          aiConfig: {
            instruction: "Based on your current skills and this AI literacy training, ask Angelo AI to help you write a complete Skills section for your CV. Include both AI-related and non-AI skills.",
            inputPlaceholder: "My non-AI skills include: [list some]\n\nHelp me write a complete Skills section for my CV that includes both my existing skills and my new AI literacy skills...",
            mode: 'cv_help',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'interviews',
      title: 'AI in Job Interviews',
      blocks: [
        {
          type: 'theory',
          title: 'Questions you might be asked',
          body: `More and more interviewers are asking about AI. Here's how to answer:

"How do you use AI in your work/studies?"
Bad: "I use ChatGPT for answers."
Good: "I use AI to explain complex concepts, generate practice problems, and check my understanding. I always verify important information."

"What are the limitations of AI?"
Bad: "I don't know, it seems to know everything."
Good: "AI can be confident but wrong, it doesn't have current information, and it can't replace human judgment on important decisions."

"How do you make sure AI isn't doing your work for you?"
Bad: Awkward silence.
Good: "I use AI as a tool, not a replacement. I understand the material myself and use AI to learn faster and catch mistakes."

"Give an example of when you used AI effectively."
Have a specific example ready. The study techniques from Module 3 are good options.`,
        },
        {
          type: 'tip',
          body: `Practice these answers out loud. Seriously. The interview isn't the time to think of what to say.`,
        },
        {
          type: 'worked_example',
          title: 'More interview scenarios',
          steps: [
            {
              stepNumber: 1,
              instruction: '"Describe a time AI helped you solve a problem"',
              working: 'Use the STAR method: Situation, Task, Action, Result',
              answer: '"I was struggling with trigonometry (Situation). I needed to improve before my exam (Task). I used AI to explain concepts in multiple ways until I understood, then generated practice problems (Action). My score improved from 45% to 72% (Result)."',
            },
            {
              stepNumber: 2,
              instruction: '"What would you do if AI gave you wrong information?"',
              working: 'Show you understand verification is essential',
              answer: '"I never trust AI output blindly, especially for facts and figures. I cross-check important information with reliable sources. If something seems off, I ask AI to show its reasoning or cite sources — which often reveals when it\'s uncertain."',
            },
            {
              stepNumber: 3,
              instruction: '"Are you worried AI will take your job?"',
              working: 'Show you see AI as an opportunity, not a threat',
              answer: '"I see AI as a tool that makes me more valuable, not a threat. People who use AI effectively will have an advantage. That\'s why I\'ve invested in learning how to use it well — it\'s becoming a core skill like Excel or email."',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Practice interview answers',
          aiConfig: {
            instruction: 'Role-play a job interview. Ask Angelo AI to play the interviewer and ask you 3 questions about your AI skills. After each of your answers, ask for feedback on how to improve.',
            inputPlaceholder: "You are an interviewer for [type of job]. Ask me questions about how I use AI. After I answer each question, give me feedback on my response.\n\nLet's start with the first question...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'preparation',
      title: 'Interview Preparation with AI',
      blocks: [
        {
          type: 'theory',
          title: 'Using AI to prepare (ethically)',
          body: `Here's how to use AI to prepare for interviews — without cheating:

RESEARCH THE COMPANY
"Tell me about [company name] and what would be important to mention in an interview with them"

PRACTICE QUESTIONS
"Generate 10 likely interview questions for a [position] role at [company type]"

GET FEEDBACK ON ANSWERS
"I'm going to answer this interview question. Give me honest feedback on how to improve: [your answer]"

PREPARE YOUR QUESTIONS
"What are good questions to ask at the end of an interview for a [position] at a [company type]?"

UNDERSTAND THE ROLE
"Explain what a [job title] actually does day-to-day in South Africa"

This is exactly how professionals prepare. You're not cheating — you're being thorough.`,
        },
        {
          type: 'ai_practical',
          title: 'Prepare for a specific interview',
          aiConfig: {
            instruction: 'Think of a job you might apply for (even if not right now). Use Angelo AI to help you prepare: research the role, generate practice questions, and develop your answers.',
            inputPlaceholder: "I want to prepare for an interview for [job type] at [type of company].\n\n1. What should I know about this role?\n2. What questions will they likely ask?\n3. What should I ask them?",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'future',
      title: 'Staying Ahead',
      blocks: [
        {
          type: 'theory',
          title: 'AI is changing fast. Here\'s how to keep up.',
          body: `The AI you're using today will be outdated in 2 years. That's not a problem — it's an opportunity. Here's how to stay current:

1. Use AI regularly
The best way to learn is by doing. Use AI tools weekly, not just when you have to.

2. Try new tools when they come out
When a new AI tool launches, spend 30 minutes exploring it. Most aren't useful. Some will change your life.

3. Follow AI news (but don't obsess)
One good newsletter or YouTube channel is enough. You don't need to read everything.

4. Focus on principles, not specific tools
The techniques you learned — good prompts, verification, ethical use — apply to any AI tool. That's why we taught principles, not buttons.

5. Keep learning
The fact that you finished this course shows you're the kind of person who learns. Don't stop.

You're not trying to become an AI expert. You're trying to be better at using AI than other people applying for the same opportunities. That's a much lower bar — and you've already cleared it.`,
        },
        {
          type: 'tip',
          body: `Your AI Literacy certificate doesn't expire, but your skills can. Keep practising.`,
        },
        {
          type: 'worked_example',
          title: 'Your 90-day AI skill maintenance plan',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Weekly: Use AI for real tasks',
              working: 'Find at least one school or personal task to use AI for each week',
              answer: 'Consistent practice keeps skills sharp. Even 15 minutes/week maintains proficiency.',
            },
            {
              stepNumber: 2,
              instruction: 'Monthly: Try something new',
              working: 'Once a month, try a prompting technique you don\'t usually use, or test a new AI tool',
              answer: 'This prevents you from getting stuck in patterns and keeps you discovering better methods.',
            },
            {
              stepNumber: 3,
              instruction: 'Quarterly: Reflect and upgrade',
              working: 'Every 3 months, ask yourself: "How has my AI use improved? What could I do better?"',
              answer: 'Regular reflection turns experience into growth. You\'ll notice how much you\'ve improved.',
            },
          ],
        },
        {
          type: 'ai_practical',
          title: 'Create your learning plan',
          aiConfig: {
            instruction: 'Create a simple plan to keep developing your AI skills over the next 3 months. Ask Angelo AI to help you make it specific and realistic for your schedule.',
            inputPlaceholder: "My schedule: [describe roughly how busy you are]\nMy goals: [what do you want to achieve?]\n\nHelp me create a realistic 3-month plan to keep developing my AI skills...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'networking',
      title: 'Building Your AI Network',
      blocks: [
        {
          type: 'theory',
          title: 'Connect with others in AI',
          body: `Your network matters. Here's how to build one around AI skills:

ONLINE COMMUNITIES
• LinkedIn: Follow AI thought leaders and companies
• Discord/Telegram: Join SA tech communities
• Reddit: r/MachineLearning, r/ChatGPT for tips and news

LOCAL CONNECTIONS
• School: Start or join a tech/AI club
• Community: Look for free coding/tech meetups in your area
• University visits: Attend open days and ask about AI programs

PROFESSIONAL DEVELOPMENT
• Free courses: Google, Microsoft, and others offer free AI certificates
• Hackathons: Join student hackathons — many now include AI challenges
• Internships: Look for tech companies offering learner programs

Building a network isn't just about getting a job. It's about learning from others and finding opportunities you'd never find alone.`,
        },
        {
          type: 'ai_practical',
          title: 'Find your AI community',
          aiConfig: {
            instruction: 'Based on your location and interests, ask Angelo AI to help you find specific communities, groups, or resources where you can continue developing your AI skills and meet others interested in AI.',
            inputPlaceholder: "I'm based in [your area/city].\nI'm interested in [your interests].\nI'm currently [student level].\n\nHelp me find AI communities and resources I can join...",
            mode: 'general_question',
            showComparison: false,
          },
        },
      ],
    },
    {
      id: 'final-career',
      title: 'Your AI Career Starts Now',
      blocks: [
        {
          type: 'theory',
          title: 'You\'re ready',
          body: `You've completed the AI Literacy curriculum. Here's what you now have:

KNOWLEDGE
• How AI actually works (and doesn't)
• 11 professional prompting techniques
• Effective study strategies using AI
• Clear understanding of AI ethics
• How AI is changing careers

SKILLS
• Writing prompts that get useful results
• Verifying AI outputs
• Using AI to learn faster
• Explaining AI use professionally
• Ethical decision-making with AI

PROOF
• AI Literacy Certificate (coming up)
• Prompt challenge scores
• Portfolio of work you've created

The job market is changing. You're changing with it. Most people your age don't have these skills. You do.

Now go use them.`,
        },
        {
          type: 'ai_practical',
          title: 'Your career vision with AI',
          aiConfig: {
            instruction: 'As a final exercise, write a brief vision of where you see yourself in 5 years, including how AI skills will be part of your career. Ask Angelo AI to help you make it specific and achievable.',
            inputPlaceholder: "In 5 years, I want to be...\n\nHelp me create a vision that's specific, realistic, and incorporates the AI skills I've developed...",
            mode: 'cv_help',
            saveToProfile: true,
          },
        },
      ],
    },
  ],
}
