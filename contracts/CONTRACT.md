# Signal Brief contract

Three layers. Each layer only touches its own paths. Paths are relative to the repo root.

```
config/       INPUTS        edited only by Irina or Chief of Staff
contracts/    the schemas (brief, candidates, sources, preferences, narrative, howto)   every JSON file below is validated against one of these
pipeline/     DATA          Signal writes candidates; publish script validates and publishes
site/         PRESENTATION  Next.js; reads only /api JSON
```

## 1. Inputs: `config/`

| File | Schema | What |
|---|---|---|
| `config/sources.json` | `contracts/sources.schema.json` | X lanes (`x.howTo`, `x.bigPicture`, `x.frontierCapital`, `x.design`), X queries, RSS feeds (incl. The Atlantic; optional `lane`), `web` pages without a feed, arXiv, Hacker News, retired sources |
| `config/preferences.json` | `contracts/preferences.schema.json` | lenses, weights and section titles, per-lens item counts (`counts.perLens`), topics to boost or mute, momentum windows, item counts, refresh times |

- This is the only place inputs change. Irina or Chief of Staff edits the file directly; no approval workflow.
- Bots read config and never write it. If a source is dead, Signal reports it in `sourceNotes`; a human removes it.
- Each file has `version` (semver). Bump it on every edit. Signal copies both versions into its output.

## 2. Data

### Signal (collects)
- Reads: `config/sources.json`, `config/preferences.json`
- Writes: `pipeline/candidates/YYYY-MM-DD-HHmm.json` (run time in Bogotá; file name = `runId`)
- Schema: `contracts/candidates.schema.json` (`schemaVersion: "1.0"`)
- Check: `node pipeline/scripts/publish.mjs --check pipeline/candidates/<runId>.json`
- Rules: English, raw facts only, every candidate has a real `source.url`, reply quotes are verbatim. No invented facts, numbers or quotes.

### Editor (writes the brief)
- Reads: `pipeline/candidates/<latest runId>.json`, `config/preferences.json`, and `site/public/api/briefs/index.json` (for momentum against past briefs)
- Writes images: `site/public/img/<item-id>.jpg` (JPG, max 1200 px wide), referenced as `/img/<item-id>.jpg`
- Writes its brief to a temp file, then publishes: `node pipeline/scripts/publish.mjs /tmp/brief-<id>.json`
- Schema: `contracts/brief.schema.json` (`schemaVersion: "1.0"`)
- Then commits `site/public/api` and `site/public/img` and pushes; Vercel deploys.

### Publish script (`pipeline/scripts/publish.mjs`)
Validates the brief (schema, unique ids, top3 ids exist, images exist, id matches date). If valid it writes, in this order:
1. `site/public/api/briefs/<id>.json`
2. `site/public/api/briefs/index.json` (rebuilt from all briefs)
3. `site/public/api/latest.json` (atomic rename, written last)

If invalid: exit 1, nothing is written, `/api/latest.json` keeps the last good brief.
`--check-all` validates config, all candidates, all briefs, narratives and how-tos (`node pipeline/scripts/publish.mjs --check-all`). Shared rules live in `pipeline/scripts/validate.mjs`.

## Lanes and lenses

| Source lane (config) | Brief `lens` | Where it shows |
|---|---|---|
| `howTo` | `practical` | main news grid |
| `bigPicture` | `broad` | main news grid |
| `frontierCapital` | `frontier-capital` | own section "Frontier capital: views from the world's quiet investors", apart from daily AI news |
| `design` | `design` | own section "Design" |

Editor picks per-lens counts from `preferences.counts.perLens` (frontier-capital and design: 0–5; a section with no items is hidden). Frontier-capital items are views and ideas, not market tips; link the person's own post or page.

### Editor: how-tos (every brief run)
- Reads: the run's candidates (practical lens) and `site/public/api/howto/library.json` (to avoid repeats)
- Writes a batch to a temp file, then: `node pipeline/scripts/publish-howto.mjs /tmp/howto-<runId>.json`
- Schema: `contracts/howto.schema.json`. `copy` is the exact prompt (kind `prompt`, one element) or the steps (kind `steps`). `verbatim: true` only when quoted from the source; otherwise condensed, with nothing added.
- Authors: `author.handle` must be an X handle in `config/sources.json` (any `x` lane); otherwise the batch is rejected, and `--check-all` flags it. When a source is removed, drop its cards with `node pipeline/scripts/publish-howto.mjs --remove <id>` (validated, atomic).
- Dedupe: same technique = same `dedupeKey`, whoever posted it. The library keeps the higher `quality` (tie: newer); the other source moves to `alsoFrom`.
- Output: `site/public/api/howto/library.json` (all, deduped), then `howto/latest.json` (this batch). A run with no real tips publishes nothing.

### Editor: weekly narrative (Monday ~08:00 Bogotá; mid-week only on a major shift)
- Reads: the last 7 days of `site/public/api/briefs/*.json` and `pipeline/candidates/*.json`
- Writes to a temp file, then: `node pipeline/scripts/publish-narrative.mjs /tmp/narrative-<YYYY-MM-DD>.json`
- Schema: `contracts/narrative.schema.json`. `headline` <= 12 words; `summary` 4-6 sentences (what is shifting, why, what it means); 3-5 `threads`, each with `evidence` = published brief items `{briefId, itemId}`. Every fact in the summary must be in an evidence item.
- Output: `site/public/api/narrative/<id>.json`, `narrative/index.json`, then `narrative/latest.json` (newest id). On failure nothing is written; the last good narrative stays.

## 3. Presentation: `site/`

The site's only data source is the public API:

| URL | Content |
|---|---|
| `/api/latest.json` | the current brief (brief schema) |
| `/api/briefs/index.json` | `{schemaVersion, latest, count, briefs: [{id, date, edition, publishedAt, headline, url}]}`, newest first |
| `/api/briefs/<id>.json` | one brief, `id` = `YYYY-MM-DD-HHmm` |
| `/api/narrative/latest.json` | the current weekly narrative (narrative schema) |
| `/api/narrative/index.json` | `{schemaVersion, latest, count, narratives: [{id, publishedAt, window, headline, url}]}` |
| `/api/narrative/<id>.json` | one narrative, `id` = `YYYY-MM-DD` |
| `/api/howto/library.json` | all how-tos, deduplicated, newest first (how-to schema) |
| `/api/howto/latest.json` | the latest batch |
| `/img/<item-id>.jpg` | card images |

Narrative and how-to feeds are optional for the site: if a file is missing, its section or tab is empty.

The current site reads these files at build time from `site/public/api/` (`site/lib/api.js`) and pre-renders every page. A redesign may replace everything in `site/` except `site/public/api/` and `site/public/img/`, as long as it reads only those URLs. It must not import from `pipeline/`, `contracts/` or `config/`.

## Versioning
- Brief and candidates `schemaVersion`: `"1.1"` adds lens values `frontier-capital` and `design`. `"1.0"` files stay valid (same shape, two lenses). Editor writes `"1.1"` from now on.
- `schemaVersion` changes when a data shape changes. Additive optional fields: no bump. Anything that breaks a reader: bump, update the schema, and update the reader in the same commit.
- `version` in config files tracks edits to inputs.
