# CAPS video coverage

Status as at 24 September 2026. Maths only; science is not yet curated.

Regenerate the numbers with `npx tsx scripts/curate-videos.ts --grade <N>`
(add `--lang af` for Afrikaans) and apply them with
`scripts/apply-curated-videos.ts`. Every embed is checked by
`npm run check:videos`, which also runs weekly in CI.

## Where we are

| Grade | Sub-topics | English | Afrikaans |
|-------|-----------:|--------:|----------:|
| 10    | 35         | 31      | 25        |
| 11    | 38         | 28      | 19        |
| 12    | 37         | 31      | 16        |
| **Total** | **110** | **90**  | **60**    |

173 of 173 embeds verified playable.

A sub-topic with no video shows a short note instead of a guess. That is
deliberate: the brief is that a blank beats a video teaching the wrong thing.
Where there is no Afrikaans pick the section keeps the English video for both
locales, which beats an empty player.

## The gaps

Afrikaans coverage falls away as the grade rises - 71%, 50%, 43% - so the
matric year, the highest-stakes content, is the thinnest. Three topics have no
Afrikaans video at all:

- Grade 12 Finance & Growth (3 sub-topics): annuities, loan repayments
- Grade 12 Trigonometry (4): compound and double angle, 3D problems
- Grade 11 Number Patterns (2)

English gaps are concentrated in Grade 11 statistics and finance: sinking
funds, present value annuities, co-functions, grouped data, variance and
standard deviation, symmetric and skewed data.

## Filling them - deferred, not rejected

Parked on 24 September 2026. Not blocking launch.

1. **Email HouNetOpSukkel.** Cheapest and highest leverage. 27,700 subscribers
   and the best Afrikaans CAPS teacher, but 14 of its 16 videos disable in-app
   playback - re-verified live against the oEmbed endpoint on 24 September.
   That is a per-video setting the owner controls and cannot be overridden
   from our side. A yes would improve Grade 12 Afrikaans immediately at no
   cost.
2. **Have Kevin record the English gaps.** He is already the content person
   and the gaps cluster in two topics.
3. **Accept partial Afrikaans** and rely on the English fallback, revisiting
   after launch based on what Afrikaans students actually hit.

Afrikaans parity is not achievable from public content alone: four English
channels carry 90 videos, where Afrikaans needs 38 channels for 60, most
contributing one to three each, at 1.4k-25k views against 200k-1M.

## Why the scorer is as fussy as it is

Every rule in `scripts/curate-videos.ts` was added because a hand review caught
a wrong pick, and each is pinned by a case in
`scripts/__tests__/curate-videos.test.ts` - tightening a rule has twice
silently broken an earlier grade. The recurring failure is a video sharing
words with the sub-topic but teaching something else: "term" matching inside
"Determine", a Physical Sciences video matching a maths sub-topic, "Equation of
Tangent Calculus" standing in for tangents to circles.

Afrikaans needs more guarding than English, not less, because Maths Literacy
and Accounting share vocabulary with Maths far more visibly there -
*waardevermindering* is both the accounting and the maths word for
depreciation, and *Wisk Gelet* is Wiskundige Geletterdheid abbreviated.
