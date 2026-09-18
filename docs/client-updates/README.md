# Client updates

| Date | File | What |
|---|---|---|
| 2026-09-17 | `2026-09-17-status-and-video-shortlist.html` | Build status, progress by area, 31 prioritised client questions, and the verified English + Afrikaans YouTube shortlist for all 28 topics. Open in a browser. Published copy: https://claude.ai/artifact/V2o9LjujVyjrXheG2a4TFg |

`video-candidates/english.json` and `afrikaans.json` are the raw search results behind the shortlist: per topic, the YouTube video IDs with channel, view count, duration and an `embeddable` flag from YouTube's oEmbed check. Once the client picks, these IDs drop straight into the `videoId` / `videoIdAf` fields of the topic content files in `src/content/`.
