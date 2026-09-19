import { db } from './index'
import { pastPapers } from './schema'
import { pastPaperExists } from './queries/topics'

// Past paper records with real URLs from stanmorephysics.com and education.gov.za
const papers = [
  // ============================================
  // Grade 12 Mathematics - November
  // ============================================
  // 2024
  {
    grade: 12,
    subject: 'maths',
    year: 2024,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Mathematics-P1-Nov-2024-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Mathematics-P1-Nov-2024-Memo-Eng.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2024,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Mathematics-P2-Nov-2024-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Mathematics-P2-Nov-2024-Memo-Eng.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },
  // 2023
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Mathematics-P1-Nov-2023-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Mathematics-P1-Nov-2023-Memo-Eng.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Mathematics-P2-Nov-2023-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Mathematics-P2-Nov-2023-Memo-Eng.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },
  // 2022
  {
    grade: 12,
    subject: 'maths',
    year: 2022,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Mathematics-P1-Nov-2022-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Mathematics-P1-Nov-2022-Memo-Eng.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2022,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Mathematics-P2-Nov-2022-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Mathematics-P2-Nov-2022-Memo-Eng.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },
  // 2021
  {
    grade: 12,
    subject: 'maths',
    year: 2021,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Mathematics-P1-Nov-2021-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Mathematics-P1-Nov-2021-Memo-Eng.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2021,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Mathematics-P2-Nov-2021-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Mathematics-P2-Nov-2021-Memo-Eng.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },
  // 2020
  {
    grade: 12,
    subject: 'maths',
    year: 2020,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Mathematics-P1-Nov-2020-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Mathematics-P1-Nov-2020-Memo-Eng.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2020,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Mathematics-P2-Nov-2020-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Mathematics-P2-Nov-2020-Memo-Eng.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },
  // 2019
  {
    grade: 12,
    subject: 'maths',
    year: 2019,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2019/11/Mathematics-P1-Nov-2019-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2019/11/Mathematics-P1-Nov-2019-Memo-Eng.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2019,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2019/11/Mathematics-P2-Nov-2019-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2019/11/Mathematics-P2-Nov-2019-Memo-Eng.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },

  // ============================================
  // Grade 11 Mathematics - November
  // ============================================
  // 2023
  {
    grade: 11,
    subject: 'maths',
    year: 2023,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-11-P1-Nov-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-11-P1-Nov-2023-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance', 'sequences'],
  },
  {
    grade: 11,
    subject: 'maths',
    year: 2023,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-11-P2-Nov-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-11-P2-Nov-2023-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },
  // 2022
  {
    grade: 11,
    subject: 'maths',
    year: 2022,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-11-P1-Nov-2022.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-11-P1-Nov-2022-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance', 'sequences'],
  },
  {
    grade: 11,
    subject: 'maths',
    year: 2022,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-11-P2-Nov-2022.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-11-P2-Nov-2022-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },
  // 2021
  {
    grade: 11,
    subject: 'maths',
    year: 2021,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-11-P1-Nov-2021.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-11-P1-Nov-2021-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance', 'sequences'],
  },
  {
    grade: 11,
    subject: 'maths',
    year: 2021,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-11-P2-Nov-2021.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-11-P2-Nov-2021-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },
  // 2020
  {
    grade: 11,
    subject: 'maths',
    year: 2020,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Maths-Grade-11-P1-Nov-2020.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Maths-Grade-11-P1-Nov-2020-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance', 'sequences'],
  },
  {
    grade: 11,
    subject: 'maths',
    year: 2020,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Maths-Grade-11-P2-Nov-2020.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Maths-Grade-11-P2-Nov-2020-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },

  // ============================================
  // Grade 10 Mathematics - November
  // ============================================
  // 2023
  {
    grade: 10,
    subject: 'maths',
    year: 2023,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-10-P1-Nov-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-10-P1-Nov-2023-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance'],
  },
  {
    grade: 10,
    subject: 'maths',
    year: 2023,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-10-P2-Nov-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Maths-Grade-10-P2-Nov-2023-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },
  // 2022
  {
    grade: 10,
    subject: 'maths',
    year: 2022,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-10-P1-Nov-2022.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-10-P1-Nov-2022-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance'],
  },
  {
    grade: 10,
    subject: 'maths',
    year: 2022,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-10-P2-Nov-2022.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Maths-Grade-10-P2-Nov-2022-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },
  // 2021
  {
    grade: 10,
    subject: 'maths',
    year: 2021,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-10-P1-Nov-2021.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-10-P1-Nov-2021-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'finance'],
  },
  {
    grade: 10,
    subject: 'maths',
    year: 2021,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-10-P2-Nov-2021.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Maths-Grade-10-P2-Nov-2021-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },

  // ============================================
  // Grade 12 Physical Science - November
  // ============================================
  // 2024
  {
    grade: 12,
    subject: 'science',
    year: 2024,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Physical-Sciences-P1-Nov-2024-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Physical-Sciences-P1-Nov-2024-Memo-Eng.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity', 'magnetism'],
  },
  {
    grade: 12,
    subject: 'science',
    year: 2024,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Physical-Sciences-P2-Nov-2024-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/11/Physical-Sciences-P2-Nov-2024-Memo-Eng.pdf',
    topicsCovered: ['organic chemistry', 'acids and bases', 'electrochemistry', 'reactions'],
  },
  // 2023
  {
    grade: 12,
    subject: 'science',
    year: 2023,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-P1-Nov-2023-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-P1-Nov-2023-Memo-Eng.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity', 'magnetism'],
  },
  {
    grade: 12,
    subject: 'science',
    year: 2023,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-P2-Nov-2023-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-P2-Nov-2023-Memo-Eng.pdf',
    topicsCovered: ['organic chemistry', 'acids and bases', 'electrochemistry', 'reactions'],
  },
  // 2022
  {
    grade: 12,
    subject: 'science',
    year: 2022,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-P1-Nov-2022-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-P1-Nov-2022-Memo-Eng.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity', 'magnetism'],
  },
  {
    grade: 12,
    subject: 'science',
    year: 2022,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-P2-Nov-2022-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-P2-Nov-2022-Memo-Eng.pdf',
    topicsCovered: ['organic chemistry', 'acids and bases', 'electrochemistry', 'reactions'],
  },
  // 2021
  {
    grade: 12,
    subject: 'science',
    year: 2021,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-P1-Nov-2021-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-P1-Nov-2021-Memo-Eng.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity', 'magnetism'],
  },
  {
    grade: 12,
    subject: 'science',
    year: 2021,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-P2-Nov-2021-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-P2-Nov-2021-Memo-Eng.pdf',
    topicsCovered: ['organic chemistry', 'acids and bases', 'electrochemistry', 'reactions'],
  },
  // 2020
  {
    grade: 12,
    subject: 'science',
    year: 2020,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Physical-Sciences-P1-Nov-2020-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Physical-Sciences-P1-Nov-2020-Memo-Eng.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity', 'magnetism'],
  },
  {
    grade: 12,
    subject: 'science',
    year: 2020,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Physical-Sciences-P2-Nov-2020-Eng.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2020/12/Physical-Sciences-P2-Nov-2020-Memo-Eng.pdf',
    topicsCovered: ['organic chemistry', 'acids and bases', 'electrochemistry', 'reactions'],
  },

  // ============================================
  // Grade 11 Physical Science - November
  // ============================================
  // 2023
  {
    grade: 11,
    subject: 'science',
    year: 2023,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-Grade-11-P1-Nov-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-Grade-11-P1-Nov-2023-Memo.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity'],
  },
  {
    grade: 11,
    subject: 'science',
    year: 2023,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-Grade-11-P2-Nov-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/11/Physical-Sciences-Grade-11-P2-Nov-2023-Memo.pdf',
    topicsCovered: ['stoichiometry', 'acids and bases', 'reactions'],
  },
  // 2022
  {
    grade: 11,
    subject: 'science',
    year: 2022,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-Grade-11-P1-Nov-2022.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-Grade-11-P1-Nov-2022-Memo.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity'],
  },
  {
    grade: 11,
    subject: 'science',
    year: 2022,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-Grade-11-P2-Nov-2022.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2022/11/Physical-Sciences-Grade-11-P2-Nov-2022-Memo.pdf',
    topicsCovered: ['stoichiometry', 'acids and bases', 'reactions'],
  },
  // 2021
  {
    grade: 11,
    subject: 'science',
    year: 2021,
    examType: 'november',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-Grade-11-P1-Nov-2021.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-Grade-11-P1-Nov-2021-Memo.pdf',
    topicsCovered: ['mechanics', 'waves', 'electricity'],
  },
  {
    grade: 11,
    subject: 'science',
    year: 2021,
    examType: 'november',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-Grade-11-P2-Nov-2021.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2021/11/Physical-Sciences-Grade-11-P2-Nov-2021-Memo.pdf',
    topicsCovered: ['stoichiometry', 'acids and bases', 'reactions'],
  },

  // ============================================
  // Grade 12 Mathematics - June Exams
  // ============================================
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'june',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/06/Mathematics-P1-June-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/06/Mathematics-P1-June-2023-Memo.pdf',
    topicsCovered: ['algebra', 'functions', 'calculus', 'finance'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'june',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/06/Mathematics-P2-June-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/06/Mathematics-P2-June-2023-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics'],
  },

  // ============================================
  // Grade 12 Mathematics - March Tests
  // ============================================
  {
    grade: 12,
    subject: 'maths',
    year: 2024,
    examType: 'march',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/03/Mathematics-P1-March-2024.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2024/03/Mathematics-P1-March-2024-Memo.pdf',
    topicsCovered: ['algebra', 'sequences', 'functions'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'march',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/03/Mathematics-P1-March-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/03/Mathematics-P1-March-2023-Memo.pdf',
    topicsCovered: ['algebra', 'sequences', 'functions'],
  },

  // ============================================
  // Grade 12 Mathematics - Prelim Exams
  // ============================================
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'prelim',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/08/Mathematics-P1-Prelim-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/08/Mathematics-P1-Prelim-2023-Memo.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance', 'sequences'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2023,
    examType: 'prelim',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/08/Mathematics-P2-Prelim-2023.pdf',
    memoUrl: 'https://stanmorephysics.com/wp-content/uploads/2023/08/Mathematics-P2-Prelim-2023-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'probability'],
  },

  // ============================================
  // Grade 12 Mathematics - Exemplar Papers (DBE)
  // ============================================
  {
    grade: 12,
    subject: 'maths',
    year: 2024,
    examType: 'exemplar',
    paperNumber: 1,
    language: 'english',
    pdfUrl: 'https://www.education.gov.za/Portals/0/Documents/NSC%20Exemplars/2024/Mathematics-P1-Exemplar-2024.pdf',
    memoUrl: 'https://www.education.gov.za/Portals/0/Documents/NSC%20Exemplars/2024/Mathematics-P1-Exemplar-2024-Memo.pdf',
    topicsCovered: ['algebra', 'calculus', 'functions', 'finance', 'sequences', 'probability'],
  },
  {
    grade: 12,
    subject: 'maths',
    year: 2024,
    examType: 'exemplar',
    paperNumber: 2,
    language: 'english',
    pdfUrl: 'https://www.education.gov.za/Portals/0/Documents/NSC%20Exemplars/2024/Mathematics-P2-Exemplar-2024.pdf',
    memoUrl: 'https://www.education.gov.za/Portals/0/Documents/NSC%20Exemplars/2024/Mathematics-P2-Exemplar-2024-Memo.pdf',
    topicsCovered: ['trigonometry', 'geometry', 'statistics', 'analytical geometry'],
  },
]

async function seedPapers() {
  console.log('Seeding past papers...')

  let inserted = 0
  let skipped = 0

  try {
    for (const paper of papers) {
      if (await pastPaperExists(paper)) {
        console.log(`Skipped (already exists): Grade ${paper.grade} ${paper.subject} ${paper.year} Paper ${paper.paperNumber}`)
        skipped += 1
        continue
      }

      await db.insert(pastPapers).values(paper)
      console.log(`Inserted: Grade ${paper.grade} ${paper.subject} ${paper.year} Paper ${paper.paperNumber}`)
      inserted += 1
    }

    console.log(`\nDone - inserted ${inserted}, skipped ${skipped} already-seeded papers (${papers.length} total).`)
  } catch (error) {
    console.error('Error seeding papers:', error)
    process.exit(1)
  }

  process.exit(0)
}

seedPapers()
