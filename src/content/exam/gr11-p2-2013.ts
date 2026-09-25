import type { ExamItem } from './types'

/**
 * DBE Grade 11 Mathematics Paper 2 Exemplar, 2013.
 *
 * Transcribed from docs/curriculum/past-papers/, question by question,
 * against the rendered pages rather than the PDF text layer - the text layer
 * scrambles every equation beyond recovery.
 */
export const gr11P2Exemplar2013: ExamItem[] = [
  // ---------------------------------------------------------- Question 6
  {
    id: 'gr11-p2-2013-6.1',
    paper: 'P2',
    grade: 11,
    year: 2013,
    source: 'DBE Grade 11 Exemplar 2013',
    language: 'en',
    question: '6.1',
    context:
      'In the diagram, the graphs of $f(x) = \\cos(x + p)$ and $g(x) = q\\sin x$ are shown for the interval $-180° \\le x \\le 180°$. The graphs intersect at $A(-22,5°\\,;\\,0,38)$ and $B$.',
    prompt: 'Determine the values of $p$ and $q$.',
    marks: 2,
    topicSlug: 'trig-gr11',
    diagram: '/exam/gr11-p2-2013/q6.png',
    solution: ['$p = -45°$', '$q = -1$'],
    markScheme: [
      { descriptor: 'value of p', kind: 'answer', value: 1 },
      { descriptor: 'value of q', kind: 'answer', value: 1 },
    ],
    commonError:
      'Reading the shift off the graph in the wrong direction and giving $p = 45°$. A shift to the left is $+p$ inside the bracket, so a graph moved right gives a negative $p$.',
  },
  {
    id: 'gr11-p2-2013-6.2',
    paper: 'P2',
    grade: 11,
    year: 2013,
    source: 'DBE Grade 11 Exemplar 2013',
    language: 'en',
    question: '6.2',
    prompt:
      'The graphs intersect at $A(-22,5°\\,;\\,0,38)$ and $B$. Determine the coordinates of $B$.',
    marks: 2,
    topicSlug: 'trig-gr11',
    diagram: '/exam/gr11-p2-2013/q6.png',
    solution: ['$B(157,5°\\,;\\,-0,38)$'],
    markScheme: [
      { descriptor: 'value of x', kind: 'answer', value: 1 },
      { descriptor: 'value of y', kind: 'answer', value: 1 },
    ],
    commonError:
      'Giving only the $x$-value. Both coordinates carry a mark, so a correct $x$ with no $y$ scores 1 of 2.',
  },
  {
    id: 'gr11-p2-2013-6.3',
    paper: 'P2',
    grade: 11,
    year: 2013,
    source: 'DBE Grade 11 Exemplar 2013',
    language: 'en',
    question: '6.3',
    prompt:
      'Determine the value(s) of $x$ in the interval $-180° \\le x \\le 180°$ for which $f(x) - g(x) < 0$.',
    marks: 2,
    topicSlug: 'trig-gr11',
    diagram: '/exam/gr11-p2-2013/q6.png',
    solution: [
      '$f(x) < g(x)$ when',
      '$-180° \\le x < -22,5°$ or $157,5° < x \\le 180°$',
    ],
    markScheme: [
      { descriptor: '-180° ≤ x < -22,5°', kind: 'answer', value: 1 },
      { descriptor: '157,5° < x ≤ 180°', kind: 'answer', value: 1 },
    ],
    commonError:
      'Reading $f(x) - g(x) < 0$ as "where the graphs are below the x-axis" instead of "where f is below g". The question is about the two curves relative to each other, not to the axis.',
  },
  {
    id: 'gr11-p2-2013-6.4.1',
    paper: 'P2',
    grade: 11,
    year: 2013,
    source: 'DBE Grade 11 Exemplar 2013',
    language: 'en',
    question: '6.4.1',
    context: 'The graph $f$ is shifted $30°$ to the left to obtain a new graph $h$.',
    prompt: 'Write down the equation of $h$ in its simplest form.',
    marks: 2,
    topicSlug: 'trig-gr11',
    solution: ['$h(x) = \\cos(x - 45° + 30°)$', '$= \\cos(x - 15°)$'],
    markScheme: [
      { descriptor: '+30°', kind: 'method', value: 1 },
      { descriptor: 'simplest form', kind: 'answer', value: 1 },
    ],
    commonError:
      'Subtracting the 30° instead of adding it. A shift to the LEFT adds inside the bracket. Note that writing $\\cos(x - 45° + 30°)$ and stopping still earns the method mark.',
  },
  {
    id: 'gr11-p2-2013-6.4.2',
    paper: 'P2',
    grade: 11,
    year: 2013,
    source: 'DBE Grade 11 Exemplar 2013',
    language: 'en',
    question: '6.4.2',
    context: 'The graph $f$ is shifted $30°$ to the left to obtain a new graph $h$.',
    prompt:
      'Write down the value of $x$ for which $h$ has a minimum in the interval $-180° \\le x \\le 180°$.',
    marks: 1,
    topicSlug: 'trig-gr11',
    solution: ['$x = -135° - 30° = -165°$'],
    markScheme: [{ descriptor: '-165°', kind: 'answer', value: 1 }],
    commonError:
      'Forgetting to apply the same 30° shift to the minimum, and answering $-135°$ - the minimum of the original graph $f$.',
  },
]

export default gr11P2Exemplar2013
