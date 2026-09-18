import type { TopicContent } from '@/types'

export const trigonometryGr11: TopicContent = {
  id: 'trig-gr11',
  slug: 'trig-gr11',
  subject: 'maths',
  grade: 11,
  paper: 2,
  title: 'Trigonometry',
  capsWeight: 40,
  sections: [
    // ============================================
    // SECTION 1: Revision - Basic Trig Ratios
    // ============================================
    {
      id: 'basic-ratios',
      title: 'Revision: Basic Trig Ratios',
      blocks: [
        {
          type: 'theory',
          title: 'The Three Primary Trigonometric Ratios',
          body: `Here's the foundation you need to nail before anything else. Right-angled triangles give us three key ratios using the sides relative to an acute angle $\\theta$:

• Your **opposite** side sits across from angle $\\theta$
• Your **adjacent** side is next to angle $\\theta$ (not the hypotenuse!)
• Your **hypotenuse** is always the longest side — opposite the right angle

Remember **SOH CAH TOA** — examiners expect you to use this without hesitation:
- **S**ine = **O**pposite / **H**ypotenuse
- **C**osine = **A**djacent / **H**ypotenuse
- **T**angent = **O**pposite / **A**djacent

Now, for the unit circle (radius = 1) centred at the origin — for any point $P(x, y)$ at angle $\\theta$ from the positive $x$-axis:
- $\\cos\\theta = x$ (your $x$-coordinate)
- $\\sin\\theta = y$ (your $y$-coordinate)
- $\\tan\\theta = \\frac{y}{x}$ (provided $x \\neq 0$)`
        },
        {
          type: 'formula',
          title: 'Primary Trigonometric Ratios',
          formulas: [
            '\\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}}',
            '\\cos\\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}}',
            '\\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{\\sin\\theta}{\\cos\\theta}'
          ]
        },
        {
          type: 'formula',
          title: 'Special Angles (Exact Values)',
          formulas: [
            '\\begin{array}{|c|c|c|c|} \\hline \\theta & 30° & 45° & 60° \\\\ \\hline \\sin\\theta & \\frac{1}{2} & \\frac{\\sqrt{2}}{2} & \\frac{\\sqrt{3}}{2} \\\\ \\hline \\cos\\theta & \\frac{\\sqrt{3}}{2} & \\frac{\\sqrt{2}}{2} & \\frac{1}{2} \\\\ \\hline \\tan\\theta & \\frac{1}{\\sqrt{3}} & 1 & \\sqrt{3} \\\\ \\hline \\end{array}'
          ]
        },
        {
          type: 'tip',
          body: `Memorise $\\sin^2\\theta + \\cos^2\\theta = 1$ right now. You'll lose marks in nearly every Grade 11 and 12 trig exam if you don't know this identity cold!`
        }
      ]
    },

    // ============================================
    // SECTION 2: Reduction Formulae
    // ============================================
    {
      id: 'reduction-formulae',
      title: 'Reduction Formulae',
      blocks: [
        {
          type: 'theory',
          title: 'The Four Quadrants and CAST Diagram',
          body: `You need to know which quadrant you're in — this determines the sign of your answer, and getting it wrong costs you full marks.

Here's how signs work in each quadrant:

**Quadrant I (0° to 90°):** All ratios are positive
**Quadrant II (90° to 180°):** Only Sine is positive
**Quadrant III (180° to 270°):** Only Tangent is positive
**Quadrant IV (270° to 360°):** Only Cosine is positive

Remember **CAST** (read anti-clockwise from Quadrant IV):
- **C**osine positive in Q4
- **A**ll positive in Q1
- **S**ine positive in Q2
- **T**angent positive in Q3

Reduction formulae let you express any angle as an acute angle (0° to 90°) using these quadrant relationships. Master this — it's worth 8-12 marks on every Paper 2!`
        },
        {
          type: 'formula',
          title: 'Reduction Formulae',
          formulas: [
            '\\sin(180° - \\theta) = \\sin\\theta',
            '\\cos(180° - \\theta) = -\\cos\\theta',
            '\\sin(180° + \\theta) = -\\sin\\theta',
            '\\cos(180° + \\theta) = -\\cos\\theta',
            '\\sin(360° - \\theta) = -\\sin\\theta',
            '\\cos(360° - \\theta) = \\cos\\theta',
            '\\tan(360° + \\theta) = \\tan\\theta',
            '\\sin(-\\theta) = -\\sin\\theta',
            '\\cos(-\\theta) = \\cos\\theta'
          ]
        },
        {
          type: 'worked_example',
          title: 'Simplify sin(210°)/cos(300°)',
          body: 'Simplify $\\frac{\\sin 210°}{\\cos 300°}$ without using a calculator.',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Express 210° using reduction formula (180° + 30°)',
              working: '\\sin 210° = \\sin(180° + 30°) = -\\sin 30° = -\\frac{1}{2}',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Express 300° using reduction formula (360° - 60°)',
              working: '\\cos 300° = \\cos(360° - 60°) = \\cos 60° = \\frac{1}{2}',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Divide the results',
              working: '\\frac{\\sin 210°}{\\cos 300°} = \\frac{-\\frac{1}{2}}{\\frac{1}{2}} = -1',
              answer: '$-1$'
            }
          ]
        },
        {
          type: 'worked_example',
          title: 'Simplify a compound expression',
          body: 'Simplify $\\frac{\\cos(180° + x) \\cdot \\tan(360° - x)}{\\sin(-x)}$',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Apply reduction formula to cos(180° + x)',
              working: '\\cos(180° + x) = -\\cos x',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Apply reduction formula to tan(360° - x)',
              working: '\\tan(360° - x) = -\\tan x',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Apply negative angle formula to sin(-x)',
              working: '\\sin(-x) = -\\sin x',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Substitute and simplify',
              working: '\\frac{(-\\cos x)(-\\tan x)}{-\\sin x} = \\frac{\\cos x \\cdot \\frac{\\sin x}{\\cos x}}{-\\sin x} = \\frac{\\sin x}{-\\sin x} = -1',
              answer: '$-1$'
            }
          ]
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Trig Functions Grade 11 Exam Questions — Kevinmathscience',
          videoId: 'cZoEfccMapk'
        }
      ]
    },

    // ============================================
    // SECTION 3: Trigonometric Identities
    // ============================================
    {
      id: 'trig-identities',
      title: 'Trigonometric Identities',
      blocks: [
        {
          type: 'theory',
          title: 'What is a Trigonometric Identity?',
          body: `Think of identities as equations that are always true — for every valid angle you can plug in.

Here are your must-know identities:

1. **Quotient Identity:** $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ (when $\\cos\\theta \\neq 0$)

2. **Square Identity:** $\\sin^2\\theta + \\cos^2\\theta = 1$

From the square identity, you can rearrange to get:
- $\\sin^2\\theta = 1 - \\cos^2\\theta$
- $\\cos^2\\theta = 1 - \\sin^2\\theta$

**How to prove an identity (follow this exactly or lose marks):**
1. Start with the more complicated side (usually LHS)
2. Transform it step by step using known identities
3. Arrive at the simpler side (usually RHS)
4. Never work on both sides at once — examiners will penalise this!`
        },
        {
          type: 'formula',
          title: 'Fundamental Identities',
          formulas: [
            '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
            '\\sin^2\\theta + \\cos^2\\theta = 1',
            '1 + \\tan^2\\theta = \\sec^2\\theta',
            '1 + \\cot^2\\theta = \\csc^2\\theta'
          ]
        },
        {
          type: 'worked_example',
          title: 'Prove an identity',
          body: 'Prove that $\\frac{1 - \\cos^2 x}{\\sin x \\cdot \\cos x} = \\tan x$',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Start with the LHS (more complicated side)',
              working: '\\text{LHS} = \\frac{1 - \\cos^2 x}{\\sin x \\cdot \\cos x}',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Use the identity sin²x + cos²x = 1, so 1 - cos²x = sin²x',
              working: '= \\frac{\\sin^2 x}{\\sin x \\cdot \\cos x}',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Cancel sin x from numerator and denominator',
              working: '= \\frac{\\sin x}{\\cos x}',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Use the quotient identity',
              working: '= \\tan x = \\text{RHS}',
              answer: '$\\therefore \\text{LHS} = \\text{RHS}$ (Proven)'
            }
          ]
        },
        {
          type: 'tip',
          body: `Start with the messier side — always. Look for $1 - \\cos^2\\theta$ (that's $\\sin^2\\theta$!) or chances to factor. See a sum of squares? Try the square identity. This pattern appears in 90% of identity proofs.`
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Trigonometry Grade 11 Exam Questions — Kevinmathscience',
          videoId: 'IhXnVk8PuJY',
          videoIdAf: 'Jiz_6sQY418',
          titleAf: 'Watch: Graad 11 Trig identiteite (bewys) — Mathfanatics'
        }
      ]
    },

    // ============================================
    // SECTION 4: Solving Trig Equations
    // ============================================
    {
      id: 'solving-equations',
      title: 'Solving Trig Equations',
      blocks: [
        {
          type: 'theory',
          title: 'General Solutions',
          body: `Solving trig equations is tricky because trig functions repeat — so there are infinitely many solutions. You need to find ALL of them.

**Reference Angle:** Your acute angle measured from the x-axis.

**General Solution:** Captures every possible solution using $n \\in \\mathbb{Z}$ (any integer).

Here's your approach for each function:

**For $\\sin x = k$:**
- Find reference angle $\\alpha = \\arcsin|k|$
- Solutions in Q1 and Q2 (if $k > 0$) or Q3 and Q4 (if $k < 0$)
- General solution: $x = \\alpha + 360°n$ or $x = (180° - \\alpha) + 360°n$

**For $\\cos x = k$:**
- Find reference angle $\\alpha = \\arccos|k|$
- Solutions in Q1 and Q4 (if $k > 0$) or Q2 and Q3 (if $k < 0$)
- General solution: $x = \\pm\\alpha + 360°n$

**For $\\tan x = k$:**
- Find reference angle $\\alpha = \\arctan|k|$
- Tangent repeats every 180° (not 360°!)
- General solution: $x = \\alpha + 180°n$`
        },
        {
          type: 'formula',
          title: 'General Solution for sin x = k',
          formulas: [
            'x = \\arcsin(k) + 360°n \\quad \\text{or} \\quad x = 180° - \\arcsin(k) + 360°n, \\quad n \\in \\mathbb{Z}'
          ]
        },
        {
          type: 'formula',
          title: 'General Solution for cos x = k',
          formulas: [
            'x = \\pm\\arccos(k) + 360°n, \\quad n \\in \\mathbb{Z}'
          ]
        },
        {
          type: 'formula',
          title: 'General Solution for tan x = k',
          formulas: [
            'x = \\arctan(k) + 180°n, \\quad n \\in \\mathbb{Z}'
          ]
        },
        {
          type: 'worked_example',
          title: 'Solve 2sin(x) - 1 = 0',
          body: 'Solve $2\\sin x - 1 = 0$ for $x \\in [0°, 360°]$',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Isolate sin x',
              working: '2\\sin x = 1 \\implies \\sin x = \\frac{1}{2}',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Find the reference angle where sin = 1/2',
              working: '\\alpha = \\arcsin\\left(\\frac{1}{2}\\right) = 30°',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Since sin x > 0, x is in Q1 or Q2',
              working: 'x = 30° \\quad \\text{(Q1)} \\quad \\text{or} \\quad x = 180° - 30° = 150° \\quad \\text{(Q2)}',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Check both solutions lie in [0°, 360°]',
              working: 'x = 30° \\text{ and } x = 150° \\text{ both lie in the interval}',
              answer: '$x = 30°$ or $x = 150°$'
            }
          ]
        },
        {
          type: 'worked_example',
          title: 'Solve cos(2x) = -0.5',
          body: 'Solve $\\cos(2x) = -0.5$ for $x \\in [-180°, 180°]$',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Find the reference angle for cos = 0.5',
              working: '\\alpha = \\arccos(0.5) = 60°',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Since cos(2x) < 0, 2x is in Q2 or Q3. Write general solution for 2x.',
              working: '2x = 180° - 60° + 360°n = 120° + 360°n \\quad \\text{or} \\quad 2x = 180° + 60° + 360°n = 240° + 360°n',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Divide by 2 to solve for x',
              working: 'x = 60° + 180°n \\quad \\text{or} \\quad x = 120° + 180°n',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Substitute n = -1, 0, 1 and keep solutions in [-180°, 180°]',
              working: 'n = 0: x = 60°, 120° \\quad n = -1: x = -120°, -60°',
              answer: '$x \\in \\{-120°, -60°, 60°, 120°\\}$'
            }
          ]
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: General Solutions Grade 11 Trigonometry PART 1 — Miss Martins Maths and Science',
          videoId: 'rEFv51neoUc'
        }
      ]
    },

    // ============================================
    // SECTION 5: Area Rule
    // ============================================
    {
      id: 'area-rule',
      title: 'Area Rule',
      blocks: [
        {
          type: 'theory',
          title: 'When to Use the Area Rule',
          body: `Use this when you have **two sides and the included angle** (SAS — Side-Angle-Side) and need to find area. You can't use $\\frac{1}{2} \\times \\text{base} \\times \\text{height}$ because you don't have the height!

Here's your formula — memorise it:

$$\\text{Area} = \\frac{1}{2}ab\\sin C$$

Where $a$ and $b$ are your two known sides, and $C$ is the angle **between** them.

Watch out: Using an angle that isn't between the two sides is a common mistake — and it'll cost you full marks.`
        },
        {
          type: 'formula',
          title: 'Area Rule Formula',
          formulas: [
            '\\text{Area} = \\frac{1}{2}ab\\sin C',
            '\\text{Area} = \\frac{1}{2}bc\\sin A',
            '\\text{Area} = \\frac{1}{2}ac\\sin B'
          ]
        },
        {
          type: 'worked_example',
          title: 'Calculate area using Area Rule',
          body: 'In $\\triangle ABC$, $AB = 8$ cm, $BC = 6$ cm, and $\\hat{B} = 60°$. Calculate the area of the triangle.',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Identify the known values: two sides and the included angle',
              working: 'AB = c = 8 \\text{ cm}, \\quad BC = a = 6 \\text{ cm}, \\quad \\hat{B} = 60°',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Apply the area rule with the included angle B',
              working: '\\text{Area} = \\frac{1}{2} \\cdot AB \\cdot BC \\cdot \\sin\\hat{B}',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Substitute the values',
              working: '\\text{Area} = \\frac{1}{2} \\times 8 \\times 6 \\times \\sin 60°',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Calculate using sin 60° = √3/2',
              working: '\\text{Area} = \\frac{1}{2} \\times 8 \\times 6 \\times \\frac{\\sqrt{3}}{2} = 24 \\times \\frac{\\sqrt{3}}{2} = 12\\sqrt{3} \\approx 20.78 \\text{ cm}^2',
              answer: '$\\text{Area} = 12\\sqrt{3} \\approx 20.78 \\text{ cm}^2$'
            }
          ]
        },
        {
          type: 'tip',
          body: `Got **SAS**? Use **Area Rule**. Check twice that your angle is actually between the two sides you're using — examiners see this mistake constantly and give zero marks for it.`
        }
      ]
    },

    // ============================================
    // SECTION 6: Sine Rule
    // ============================================
    {
      id: 'sine-rule',
      title: 'Sine Rule',
      blocks: [
        {
          type: 'theory',
          title: 'When to Use the Sine Rule',
          body: `Use the sine rule to connect sides with their opposite angles. You need it when you have:

• **AAS** (Angle-Angle-Side): Two angles and any side
• **ASA** (Angle-Side-Angle): Two angles and the included side
• **SSA** (Side-Side-Angle): Two sides and a non-included angle — careful, this has an ambiguous case!

Two forms of the rule:

$$\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$$

Or flipped:

$$\\frac{\\sin A}{a} = \\frac{\\sin B}{b} = \\frac{\\sin C}{c}$$

Pro tip: Use the first form when finding a **side**. Use the second when finding an **angle**.`
        },
        {
          type: 'formula',
          title: 'Sine Rule',
          formulas: [
            '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}',
            '\\frac{\\sin A}{a} = \\frac{\\sin B}{b} = \\frac{\\sin C}{c}'
          ]
        },
        {
          type: 'worked_example',
          title: 'Find a missing side using Sine Rule',
          body: 'In $\\triangle PQR$, $\\hat{P} = 40°$, $\\hat{Q} = 70°$, and $p = 12$ cm. Find the length of side $q$.',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Identify what we have: two angles and a side (AAS)',
              working: '\\hat{P} = 40°, \\quad \\hat{Q} = 70°, \\quad p = 12 \\text{ cm}',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Set up the sine rule equation',
              working: '\\frac{p}{\\sin P} = \\frac{q}{\\sin Q}',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Substitute known values',
              working: '\\frac{12}{\\sin 40°} = \\frac{q}{\\sin 70°}',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Solve for q',
              working: 'q = \\frac{12 \\times \\sin 70°}{\\sin 40°} = \\frac{12 \\times 0.9397}{0.6428} \\approx 17.54 \\text{ cm}',
              answer: '$q \\approx 17.54$ cm'
            }
          ]
        },
        {
          type: 'tip',
          body: `**SSA = Ambiguous case warning!** When you have two sides and a non-included angle, you might get **two triangles**, **one**, or **none**. If your calculator gives $\\sin A > 1$, no triangle exists — state this clearly in your answer.`
        }
      ]
    },

    // ============================================
    // SECTION 7: Cosine Rule
    // ============================================
    {
      id: 'cosine-rule',
      title: 'Cosine Rule',
      blocks: [
        {
          type: 'theory',
          title: 'When to Use the Cosine Rule',
          body: `Think of this as Pythagoras upgraded — it works for any triangle, not just right-angled ones. Use it when you have:

• **SAS** (Side-Angle-Side): Two sides and the included angle — to find the third side
• **SSS** (Side-Side-Side): All three sides — to find any angle

**Finding a side:**
$$a^2 = b^2 + c^2 - 2bc\\cos A$$

**Finding an angle (rearranged):**
$$\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$$

Notice: When $A = 90°$, you get $\\cos 90° = 0$, so it simplifies to $a^2 = b^2 + c^2$ — that's Pythagoras! Cosine rule is the general version.`
        },
        {
          type: 'formula',
          title: 'Cosine Rule',
          formulas: [
            'a^2 = b^2 + c^2 - 2bc\\cos A',
            'b^2 = a^2 + c^2 - 2ac\\cos B',
            'c^2 = a^2 + b^2 - 2ab\\cos C',
            '\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}'
          ]
        },
        {
          type: 'worked_example',
          title: 'Find a side using Cosine Rule',
          body: 'In $\\triangle ABC$, $a = 7$ cm, $b = 5$ cm, and $\\hat{C} = 120°$. Find the length of side $c$.',
          steps: [
            {
              stepNumber: 1,
              instruction: 'Identify what we have: SAS configuration (two sides and included angle)',
              working: 'a = 7, \\quad b = 5, \\quad \\hat{C} = 120°',
              answer: ''
            },
            {
              stepNumber: 2,
              instruction: 'Write the cosine rule for side c',
              working: 'c^2 = a^2 + b^2 - 2ab\\cos C',
              answer: ''
            },
            {
              stepNumber: 3,
              instruction: 'Substitute values (note: cos 120° = -1/2)',
              working: 'c^2 = 7^2 + 5^2 - 2(7)(5)\\cos 120° = 49 + 25 - 70 \\times (-\\frac{1}{2})',
              answer: ''
            },
            {
              stepNumber: 4,
              instruction: 'Simplify',
              working: 'c^2 = 49 + 25 + 35 = 109',
              answer: ''
            },
            {
              stepNumber: 5,
              instruction: 'Take the square root (c must be positive)',
              working: 'c = \\sqrt{109} \\approx 10.44 \\text{ cm}',
              answer: '$c = \\sqrt{109} \\approx 10.44$ cm'
            }
          ]
        },
        // PROVISIONAL video picks — auto-filled 2026-09-18 from docs/client-updates/video-candidates; client to confirm.
        {
          type: 'video',
          title: 'Watch: Trig functions grade 11 and 12: Determine Equation — Kevinmathscience',
          videoId: 'Optfjw6HGZw'
        }
      ]
    }
  ]
}

export default trigonometryGr11
