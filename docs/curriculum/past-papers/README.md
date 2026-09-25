# Past papers and exemplars

Client-supplied DBE papers, saved here so the repo does not depend on a
third-party site staying up. The app's own papers page currently hot-links
every paper to stanmorephysics.com (`src/db/seed-papers.ts`), which means a
link going dead takes the page down with it - these are the local copies.

| File | Paper | Grade | Language | Text layer |
|---|---|---|---|---|
| `Maths-P1-Gr11-Exemplar-2013-Afr-QP.pdf` | P1 exemplar | 11 | Afrikaans | yes |
| `Maths-P1-Gr11-Exemplar-2013-Afr-Memo.pdf` | P1 exemplar memo | 11 | Afrikaans | yes |
| `Maths-P2-Gr11-Exemplar-2013-Eng-QP.pdf` | P2 exemplar | 11 | English | yes |
| `Maths-P2-Gr11-Exemplar-2013-Eng-Memo.pdf` | P2 exemplar memo | 11 | English | yes |
| `Maths-P1-Gr12-Nov-2024-Eng-QP.pdf` | NSC November | 12 | English | **no - scanned** |
| `Maths-Gr12-KZN-March-2025-QP-and-Memo.pdf` | KZN March, QP + memo | 12 | English | **no - scanned** |

"Text layer" matters for anything that reads these automatically. The four
exemplars parse straight to text; the two 2024/2025 papers are page images
with no text behind them, so they can be read visually or by OCR but not by
a text extractor.

The Grade 11 set is a matched pair - question paper and memorandum - for both
papers, which is what makes it usable for generating practice questions with
worked solutions rather than only questions.

`../CAPS-FET-Mathematics-Gr10-12.pdf` is the official DBE Mathematics
curriculum, the counterpart of the Physical Sciences one already there. The
maths curriculum in `src/content/caps-curriculum.ts` was transcribed from the
client's own summary handbook rather than this document - worth checking one
against the other before treating either as final.
