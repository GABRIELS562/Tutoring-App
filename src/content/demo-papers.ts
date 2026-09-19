import type { PastPaperRecord } from '@/db/queries/topics'

// Official Department of Basic Education (DBE) Papers
// Source: https://www.education.gov.za - Free public domain government documents
const DBE_BASE = 'https://www.education.gov.za/LinkClick.aspx?fileticket='

/**
 * Demo-mode fallback list, shown only when the database isn't
 * configured (isDemoMode). A real, configured database reads from
 * getAllPastPapers() instead - see papers/page.tsx.
 */
export const demoPapers: PastPaperRecord[] = [
  // ============================================
  // GRADE 12 MATHEMATICS - NSC November Exams
  // Source: education.gov.za (Official DBE)
  // ============================================
  // 2024
  { id: 'maths-12-2024-p1', grade: 12, subject: 'maths', year: 2024, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}8W2dAxBUTQA%3d&tabid=5193&portalid=0&mid=13724`,
    memoUrl: `${DBE_BASE}D_T4clPBpkk%3d&tabid=5193&portalid=0&mid=13724`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2024-p2', grade: 12, subject: 'maths', year: 2024, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}ycHWvBVvV2M%3d&tabid=5193&portalid=0&mid=13724`,
    memoUrl: `${DBE_BASE}0DIM92_2Vu8%3d&tabid=5193&portalid=0&mid=13724`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2023
  { id: 'maths-12-2023-p1', grade: 12, subject: 'maths', year: 2023, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}M_7mZq2zE5o%3d&tabid=4682&portalid=0&mid=12681`,
    memoUrl: `${DBE_BASE}ViEtlf4659c%3d&tabid=4682&portalid=0&mid=12681`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2023-p2', grade: 12, subject: 'maths', year: 2023, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}Zoios-rCurI%3d&tabid=4682&portalid=0&mid=12681`,
    memoUrl: `${DBE_BASE}0RJSBcYBmhA%3d&tabid=4682&portalid=0&mid=12681`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2022
  { id: 'maths-12-2022-p1', grade: 12, subject: 'maths', year: 2022, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}Juy5nA5N3fM%3d&tabid=3294&portalid=0&mid=10986`,
    memoUrl: `${DBE_BASE}gytAGGPYSc8%3d&tabid=3294&portalid=0&mid=10986`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2022-p2', grade: 12, subject: 'maths', year: 2022, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}DqfP-i10rEE%3d&tabid=3294&portalid=0&mid=10986`,
    memoUrl: `${DBE_BASE}var8F7VpOmU%3d&tabid=3294&portalid=0&mid=10986`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2021
  { id: 'maths-12-2021-p1', grade: 12, subject: 'maths', year: 2021, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}sGgq9FNv0lQ%3d&tabid=2922&portalid=0&mid=10138`,
    memoUrl: `${DBE_BASE}LJo4MZ4DRZM%3d&tabid=2922&portalid=0&mid=10138`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2021-p2', grade: 12, subject: 'maths', year: 2021, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}jgMJbW3Aa0o%3d&tabid=2922&portalid=0&mid=10138`,
    memoUrl: `${DBE_BASE}s7hK0H8bqPM%3d&tabid=2922&portalid=0&mid=10138`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  // 2020
  { id: 'maths-12-2020-p1', grade: 12, subject: 'maths', year: 2020, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}FU-0n3tYUzs%3d&tabid=2702&portalid=0&mid=9635`,
    memoUrl: `${DBE_BASE}P7kQcnNxRHY%3d&tabid=2702&portalid=0&mid=9635`,
    topicsCovered: ['Algebra', 'Functions', 'Calculus', 'Probability'] },
  { id: 'maths-12-2020-p2', grade: 12, subject: 'maths', year: 2020, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}f-OMZa2HZ5U%3d&tabid=2702&portalid=0&mid=9635`,
    memoUrl: `${DBE_BASE}R9cpC35sw60%3d&tabid=2702&portalid=0&mid=9635`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },

  // ============================================
  // GRADE 12 PHYSICAL SCIENCES - NSC November Exams
  // ============================================
  // 2024
  { id: 'science-12-2024-p1', grade: 12, subject: 'science', year: 2024, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}jKqWYBbucS4%3d&tabid=5193&portalid=0&mid=13728`,
    memoUrl: `${DBE_BASE}4GvIWeAkK8U%3d&tabid=5193&portalid=0&mid=13728`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2024-p2', grade: 12, subject: 'science', year: 2024, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}ZxN41kEGHhI%3d&tabid=5193&portalid=0&mid=13728`,
    memoUrl: `${DBE_BASE}8rVrLl89rfM%3d&tabid=5193&portalid=0&mid=13728`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2023
  { id: 'science-12-2023-p1', grade: 12, subject: 'science', year: 2023, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}oTJzzXEU6Ng%3d&tabid=4682&portalid=0&mid=12685`,
    memoUrl: `${DBE_BASE}6g6X4xphO7I%3d&tabid=4682&portalid=0&mid=12685`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2023-p2', grade: 12, subject: 'science', year: 2023, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}Gs2cDJBpRR0%3d&tabid=4682&portalid=0&mid=12685`,
    memoUrl: `${DBE_BASE}1JdWi95UKbY%3d&tabid=4682&portalid=0&mid=12685`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2022
  { id: 'science-12-2022-p1', grade: 12, subject: 'science', year: 2022, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}5l5vQTQBaU4%3d&tabid=3294&portalid=0&mid=10990`,
    memoUrl: `${DBE_BASE}1GNWZdT8oLQ%3d&tabid=3294&portalid=0&mid=10990`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2022-p2', grade: 12, subject: 'science', year: 2022, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}_7CRVUkWGMA%3d&tabid=3294&portalid=0&mid=10990`,
    memoUrl: `${DBE_BASE}DFAi1wMTvCg%3d&tabid=3294&portalid=0&mid=10990`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2021
  { id: 'science-12-2021-p1', grade: 12, subject: 'science', year: 2021, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}unBWzCuezsM%3d&tabid=2922&portalid=0&mid=10142`,
    memoUrl: `${DBE_BASE}VCtYr0giXYw%3d&tabid=2922&portalid=0&mid=10142`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2021-p2', grade: 12, subject: 'science', year: 2021, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}oI4BAzXUMNA%3d&tabid=2922&portalid=0&mid=10142`,
    memoUrl: `${DBE_BASE}gmvfHOKfxws%3d&tabid=2922&portalid=0&mid=10142`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },
  // 2020
  { id: 'science-12-2020-p1', grade: 12, subject: 'science', year: 2020, examType: 'NSC', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}65cL9MczvtQ%3d&tabid=2702&portalid=0&mid=9639`,
    memoUrl: `${DBE_BASE}1MOdP9_gqm4%3d&tabid=2702&portalid=0&mid=9639`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity', 'Magnetism'] },
  { id: 'science-12-2020-p2', grade: 12, subject: 'science', year: 2020, examType: 'NSC', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}xUQ6Zo6wIpI%3d&tabid=2702&portalid=0&mid=9639`,
    memoUrl: `${DBE_BASE}l5Q6JxAbkZ0%3d&tabid=2702&portalid=0&mid=9639`,
    topicsCovered: ['Chemistry', 'Organic Chemistry', 'Reactions'] },

  // ============================================
  // GRADE 11 MATHEMATICS - Common Examination Papers
  // ============================================
  { id: 'maths-11-2018-p1', grade: 11, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}1KiiLnULnVY%3d&tabid=1869&portalid=0&mid=6584`,
    memoUrl: `${DBE_BASE}_uRPiTTn5y4%3d&tabid=1869&portalid=0&mid=6584`,
    topicsCovered: ['Algebra', 'Functions', 'Finance'] },
  { id: 'maths-11-2018-p2', grade: 11, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}4iD1QjMiShw%3d&tabid=1869&portalid=0&mid=6584`,
    memoUrl: `${DBE_BASE}AkQO3dMar_0%3d&tabid=1869&portalid=0&mid=6584`,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },

  // ============================================
  // GRADE 11 PHYSICAL SCIENCES - Common Examination Papers
  // ============================================
  { id: 'science-11-2018-p1', grade: 11, subject: 'science', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}_BnHGkPLTbs%3d&tabid=1869&portalid=0&mid=6588`,
    memoUrl: `${DBE_BASE}ip1nUg1Suw0%3d&tabid=1869&portalid=0&mid=6588`,
    topicsCovered: ['Mechanics', 'Waves', 'Electricity'] },
  { id: 'science-11-2018-p2', grade: 11, subject: 'science', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}oMu2OQls9CQ%3d&tabid=1869&portalid=0&mid=6588`,
    memoUrl: `${DBE_BASE}tl2K0ihMDrw%3d&tabid=1869&portalid=0&mid=6588`,
    topicsCovered: ['Chemistry', 'Reactions'] },

  // ============================================
  // GRADE 10 MATHEMATICS - Common Examination Papers
  // ============================================
  { id: 'maths-10-2018-p1', grade: 10, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}xB_6NSmf6m8%3d&tabid=1871&portalid=0&mid=6598`,
    memoUrl: null,
    topicsCovered: ['Algebra', 'Functions', 'Finance'] },
  { id: 'maths-10-2018-p2', grade: 10, subject: 'maths', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}RZ22JJ5tljc%3d&tabid=1871&portalid=0&mid=6598`,
    memoUrl: null,
    topicsCovered: ['Trigonometry', 'Geometry', 'Statistics'] },
  { id: 'maths-10-2017-p1', grade: 10, subject: 'maths', year: 2017, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}qtQcof03_Ek%3d&tabid=1871&portalid=0&mid=6598`,
    memoUrl: null,
    topicsCovered: ['Algebra', 'Functions', 'Finance'] },

  // ============================================
  // GRADE 10 PHYSICAL SCIENCES - Common Examination Papers
  // ============================================
  { id: 'science-10-2018-p1', grade: 10, subject: 'science', year: 2018, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}NbdCRLTzv7E%3d&tabid=1871&portalid=0&mid=6602`,
    memoUrl: null,
    topicsCovered: ['Mechanics', 'Waves'] },
  { id: 'science-10-2018-p2', grade: 10, subject: 'science', year: 2018, examType: 'Common', paperNumber: 2, language: 'English',
    pdfUrl: `${DBE_BASE}e-67gT6qA1I%3d&tabid=1871&portalid=0&mid=6602`,
    memoUrl: null,
    topicsCovered: ['Chemistry', 'Matter'] },
  { id: 'science-10-2017-p1', grade: 10, subject: 'science', year: 2017, examType: 'Common', paperNumber: 1, language: 'English',
    pdfUrl: `${DBE_BASE}JjwNryhHSd4%3d&tabid=1871&portalid=0&mid=6602`,
    memoUrl: null,
    topicsCovered: ['Mechanics', 'Waves'] },
]
