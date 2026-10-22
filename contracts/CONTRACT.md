# Signal Brief contract

Three layers. Each layer only touches its own paths. Paths are relative to the repo root.

```
config/       INPUTS        edited only by Irina or Chief of Staff
contracts/    the schemas   every JSON file below is validated against one of these
pipeline/     DATA          Signal writes candidates; publish script validates and publishes
site/         PRESENTATION  Next.js; reads only /api JSON
```

## 1. Inputs: `config/`

| File | Schema | What |
|---|---|---|
| `config/sources.json` | `contracts/sources.schema.json` | X lists (`x.howTo`, `x.bigPicture`), X queries, RSS feeds (incl. The Atlantic), arXiv, Hacker News, retired sources |
| `config/preferences.json` | `contracts/preferences.schema.json` | lenses and weights, topics to boost or mute, momentum windows, item counts, refresh times |

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
`--check-all` validates config, all candidates and all published briefs.

## 3. Presentation: `site/`

The site's only data source is the public API:

| URL | Content |
|---|---|
| `/api/latest.json` | the current brief (brief schema) |
| `/api/briefs/index.json` | `{schemaVersion, latest, count, briefs: [{id, date, edition, publishedAt, headline, url}]}`, newest first |
| `/api/briefs/<id>.json` | one brief, `id` = `YYYY-MM-DD-HHmm` |
| `/img/<item-id>.jpg` | card images |

The current site reads these files at build time from `site/public/api/` (`site/lib/api.js`) and pre-renders every page. A redesign may replace everything in `site/` except `site/public/api/` and `site/public/img/`, as long as it reads only those URLs. It must not import from `pipeline/`, `contracts/` or `config/`.

## Versioning
- `schemaVersion` changes when a data shape changes. Additive optional fields: no bump. Anything that breaks a reader: bump, update the schema, and update the reader in the same commit.
- `version` in config files tracks edits to inputs.
