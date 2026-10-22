# Signal Brief

A public, English-only intelligence brief on AI for leaders with little time: practical agentic AI plus the broad picture. Curated by Irina Vélez from trusted sources (her X list first, then vetted feeds). No auth, no database.

## How it works
The site lives in `site/` of the `irivelez/the-feed` repo (Vercel root directory: `site`). Never touch the feed job's files at the repo root (`daily/`, `deep/`, `digests/`, `latest.md`). All paths below are relative to `site/`.

- `data/brief-YYYY-MM-DD-HHmm.json`: one file per edition (the archive). `data/latest.json`: the edition on the home page.
- `schema/brief.schema.json`: the contract between the bots and the site. An invalid brief never ships.
- `public/img/<item-id>.jpg`: card images (X post screenshots, paper figures or OG images).
- Next.js static export (`app/`). Every push to `main` auto-deploys on Vercel.

## Page
Top 3 (headline + "Why it matters for leaders") → momentum chips (🆕 New today · 📈 Building this week · 🧭 Shift this month) → brief cards (image, takeaway, So what, lens: Practical / Broad picture, source link, time) → Voices strip with best reply → date archive.

## Editor run (07:00, 13:00, 19:00 America/Bogota)
1. Take Signal's candidates for the run window. Keep only items with a real source link; never invent facts, numbers or quotes.
2. Dedupe and rank. Assign momentum against the last 7 and 30 days of `data/brief-*.json`:
   `new` = first seen today, `building` = seen earlier this week and still moving, `shift` = a trend across the month.
3. Write in Smart Brevity, English only: title ≤140 chars, takeaway ≤280, soWhat ≤220. Pick the Top 3.
4. Images: save to `public/img/<item-id>.jpg` (≤1200px wide). For X posts, screenshot `https://platform.twitter.com/embed/Tweet.html?id=<id>`; otherwise use the page's `og:image`.
5. Write the candidate to a temp file outside the repo, then:
   ```
   cd site
   npm ci
   node scripts/publish.mjs /tmp/candidate.json
   ```
   On failure it exits 1 and leaves `data/latest.json` untouched (the site keeps the last good brief). Fix and rerun; do not commit a failed run.
6. `npx next build` must pass. Then `git add site/data site/public/img && git commit -m "Brief <id>" && git push`.
7. Check the live URL returns 200 and every image loads. Remove images no brief references.

Validate only: `cd site && npm run validate`.

## Weekly health check
Report dead feeds, sources with no items for 7 days, and broken images; propose list changes to Irina (she can veto any source).
