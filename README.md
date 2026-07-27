# the-feed — raw data store for the content engine

Store of record for [content-engine](https://github.com/irivelez/content-engine)'s gathering stage. Two folders, two cadences, one contract:

| Folder | What | Cadence · Producer | Local mirror (content-engine) |
|---|---|---|---|
| `daily/{YYYY-MM-DD}.json` | The **daily sweep** — X + Hacker News + RSS, ~450 items/day, rule-filtered (no AI) | 8:00 AM daily · `scripts/fetch-sources.js` (launchd) | `pipeline/daily/` — 14-day cache, prunes only after verified push |
| `deep/{YYYY-Wnn}.md` | The **weekly deep research** — one `/last30days` multi-source run (Reddit · X · YouTube · HN · GitHub), raw evidence with engagement | Sundays · the `/brief` skill | `pipeline/deep/` — 12-week cache, prunes only if verified here |

`daily/latest.json` always mirrors the most recent day.

**Item schema (`daily/*.json → items[]`):** `title · content · author · url · likes · comments · retweets · engagementScore (likes + 3·rt + 2·replies) · source (x|hackernews|rss) · tier (trusted|creator|rss|hackernews|broad) · publishedAt · age · hot`

**Downstream:** raw data here is curated weekly into `content-engine/pipeline/briefs/{YYYY-Wnn}.md` — topics → grounded angles with verbatim hooks, each carrying `ACTION: draft | discard | regenerate` for any content-creation agent.

**Coverage:** complete since 2026-04-13, gap 2026-05-31 → 2026-07-25 (fetcher down).

**Legacy — frozen, do not consume:** `digests/`, `latest.md` (deprecated server pipeline, kept for history).
