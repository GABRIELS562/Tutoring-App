# Exam Game — design

**Status:** design, not built. 25 September 2026.

The product this app is selling is not "videos of the syllabus". It is:

> Practise the real NSC papers, marked the way the examiner marks them, and
> find out what you would actually score — and which marks you are losing
> without knowing it.

Everything below serves that sentence.

## 1. What the source material actually gives us

The client supplied DBE papers with matched memoranda. Two of them parse to
text: the Grade 11 2013 exemplars, P1 (Afrikaans) and P2 (English).

| Paper | Questions | Sub-parts | Marks |
|---|---:|---:|---:|
| Gr 11 P2 English | 11 | 57 | 150 |
| Gr 11 P1 Afrikaans | 12 | 62 | 150 |

That is ~120 examinable items against the 6 practice questions in the app
today.

The memo is the valuable half, and the reason this design is possible at
all. South African memoranda do not just give the answer — they name every
mark:

```
1.1  Mean = Σx/n = 408/19 = 21,47        ✓ 408/19        ✓ answer      (2)
1.4  Q1 = 18, Q3 = 26, IQR = 8           ✓ Q1  ✓ Q3  ✓ IQR            (3)
1.6  "5 is an outlier" + justification   ✓ reason  ✓ 5 is an outlier  (2)
```

Each tick is a mark with a **descriptor**. That single fact is what lets the
app mark like an examiner instead of like a quiz: partial credit, method
marks, and a precise account of where a mark went.

## 2. The core loop

### 2.1 The familiarity gate

Before the question, one question about the question:

> **How familiar are you with this?**
> - 🔵 **New to me** — I have not covered this
> - 🟡 **Seen it, shaky** — I have covered it but I am not confident
> - 🟢 **I've got this** — I can do this

What follows adapts:

| Choice | Before the attempt | After the attempt |
|---|---|---|
| New to me | Full worked method on a similar item first | Full memo, every step explained |
| Seen it, shaky | The formula and the first step only | The memo, with the step you missed expanded |
| I've got this | Nothing — straight in | Summary: the mark descriptors, ticked or not |

This is the mechanic the client asked for, and it is good pedagogy on its
own: it respects what the student already knows instead of teaching everyone
the same thing at the same depth.

### 2.2 The calibration gap — the part that matters

The choice above is not only a setting. Compared against what the student
then **does**, it is the most valuable signal in the system.

|  | Got it right | Got it wrong |
|---|---|---|
| **"I've got this"** | **Mastered** — stop teaching it, raise difficulty | **Blind spot** ⚠ |
| **"New to me"** | **Underconfident** — show them they knew it | **Honest gap** — teach it properly |

The top-right cell is the product. A student who is *confident and wrong*
does not check their work, does not ask for help, and loses those marks in
the real exam without ever knowing why. Nothing else in the app can find
those. This can, because it asked first.

**Blind spots get their own list**, and they are what the app drills.

### 2.3 Anti-gaming

If "New to me" always unlocks the full worked solution, students will farm
it. So familiarity is scored, not free:

- Claiming **"I've got this"** and being right is worth more marks-XP than
  claiming "New to me" and being right.
- Claiming **"New to me"** and being right costs nothing but is noted — the
  app starts nudging: "you have said 'new to me' on the last four and got
  three right; try 'seen it'."
- Being wrong is never punished. Only *miscalibration* is surfaced, and only
  as information.

Honesty is the winning strategy, which is the point.

## 3. Marking like the examiner

The single biggest lever on a real matric mark is exam technique, not
knowledge. SA memos award **method marks**: correct working with a wrong
final answer still scores. Students throw marks away by writing only an
answer.

So the reveal is a mark-by-mark checklist, in the memo's own words:

```
Question 1.4                                        You scored 2 of 3

  ✓  Q1 = 18          earned
  ✓  Q3 = 26          earned
  ✗  IQR = 8          lost — you wrote 6; check the subtraction

  In the real exam you would still get 2 of these 3 marks. The method
  marks are yours even though the final answer is wrong.
```

That last line is the thing no worksheet tells a student.

## 4. Modes

Each earns its place; none is decoration.

**Drill** — one sub-part at a time, familiarity gate on, full adaptive
teaching. The default way in.

**Paper Siege** — a whole 150-mark paper against the clock, no help, marked
at the end like the real thing:

> You scored 87/150 — 58%. That is a Level 4.
> You lost 14 marks in Analytical Geometry and 9 in Statistics.
> 11 of the marks you lost were method marks you could have had for
> showing working.

This is the screen that sells the app to a parent.

**Blind Spot Hunt** — built only from items where the student was confident
and wrong. Short, targeted, and the highest-value minutes in the app.

**Method Mark Hunter** — deliberately hard items where finishing is
unlikely, scored *only* on method marks earned. Trains the habit of always
writing the working.

**Boss battles (existing)** — a repeated blind spot on one concept becomes a
named boss, which is what the existing Boss Battle prototype is for. The
misconception is the enemy, which is a better fight than a generic topic.

## 5. What the student accumulates

Not points for their own sake:

- **Marks** — real ones, out of the real paper total.
- **Predicted %** — what they would score on a real paper today, with the
  papers they have attempted named so it is honest.
- **Calibration** — how well they know what they know. Improves with
  honesty, not with correctness.
- **Method rate** — what share of available method marks they capture. This
  is the number a tutor would actually push on.

## 6. Two languages, one paper

The client's P1 is Afrikaans and P2 is English, and the same exemplar exists
in both. An Afrikaans learner sitting an English paper (or the reverse) can
flip a single question's language without losing their place. No competitor
does this, and it is nearly free here because the app is already bilingual.

## 7. Data model sketch

```ts
interface ExamItem {
  paper: 'P1' | 'P2'
  grade: 10 | 11 | 12
  year: number
  source: string          // 'DBE Grade 11 Exemplar 2013'
  question: string        // '1.4'
  context?: string        // shared stem for 1.1-1.6
  prompt: string
  marks: number
  topicSlug: string       // links to the curriculum and its videos
  markScheme: MarkPoint[]
  answer: string
}

interface MarkPoint {
  descriptor: string      // the memo's own words: 'Q1 = 18'
  kind: 'method' | 'answer' | 'reason'
  value: number           // usually 1
}
```

`topicSlug` is the hinge: a lost mark points at the CAPS sub-topic, which
already has a curated video behind it. Lose a mark on the interquartile
range and the app can offer the Grade 11 statistics video for exactly that
sub-topic.

## 8. Build order

1. **Extract** the two readable papers into `ExamItem[]`, by hand-checked
   script. ~120 items. The extraction is the bulk of the work and must be
   verified against the PDFs, not trusted.
2. **Familiarity gate + mark-by-mark reveal** on a single item. This is the
   whole product in miniature; get it right before anything else.
3. **Calibration tracking** and the blind-spot list.
4. **Paper Siege** and the predicted-% screen.
5. Method Mark Hunter, boss integration.

## 9. Open questions for the client

- The two 2024/2025 papers are scanned images with no text layer. OCR, or
  leave them as downloads only?
- P1 English and P2 Afrikaans of the same exemplar exist but were not
  supplied. Worth getting — it would complete both languages.
- Is a predicted % something Angelo wants shown to students, or only to him?
  It is motivating when it rises and discouraging when it does not.
