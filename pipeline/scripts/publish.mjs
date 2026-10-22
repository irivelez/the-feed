#!/usr/bin/env node
// Validate and publish a brief. Paths are relative to the repo root. See contracts/CONTRACT.md.
//   node pipeline/scripts/publish.mjs <brief.json>      Editor: validate a brief, then publish it to site/public/api/
//   node pipeline/scripts/publish.mjs --check <file>    validate one file (any kind: brief, candidates, config, narrative, how-to)
//   node pipeline/scripts/publish.mjs --check-all       validate config/, pipeline/candidates/ and everything in site/public/api/
// On any failure: exit 1 and nothing is written, so /api/latest.json keeps the last good brief.
import path from "node:path";
import { ROOT, API, BRIEFS, NARRATIVE, HOWTO, CANDIDATES, readJson, writeAtomic, listJson, report } from "./validate.mjs";

function buildIndex() {
  const briefs = listJson(BRIEFS, /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/).reverse().map((f) => { const b = readJson(f);
    return { id: b.id, date: b.date, edition: b.edition, publishedAt: b.publishedAt, headline: b.top3[0].headline, url: `/api/briefs/${b.id}.json` }; });
  return { schemaVersion: "1.0", latest: briefs[0]?.id ?? null, count: briefs.length, briefs };
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "--check-all") {
  const files = [path.join(ROOT, "config/sources.json"), path.join(ROOT, "config/preferences.json"), path.join(API, "latest.json"),
    ...listJson(BRIEFS).filter((f) => !f.endsWith("index.json")), ...listJson(CANDIDATES),
    ...listJson(NARRATIVE).filter((f) => !f.endsWith("index.json")), ...listJson(HOWTO)];
  process.exit(files.map((f) => report(f)).every(Boolean) ? 0 : 1);
} else if (cmd === "--check") {
  if (!arg) { console.error("usage: publish.mjs --check <file.json>"); process.exit(2); }
  process.exit(report(arg) ? 0 : 1);
} else if (cmd && !cmd.startsWith("--")) {
  if (!report(cmd, "brief")) { console.error("Not published. /api/latest.json still holds the last good brief."); process.exit(1); }
  const brief = readJson(cmd);
  writeAtomic(path.join(BRIEFS, `${brief.id}.json`), brief);
  writeAtomic(path.join(BRIEFS, "index.json"), buildIndex());
  writeAtomic(path.join(API, "latest.json"), brief); // last: latest.json only changes once everything else is in place
  console.log(`PUBLISHED ${brief.id}: site/public/api/briefs/${brief.id}.json, briefs/index.json, latest.json. Commit and push to deploy.`);
} else {
  console.error("usage: publish.mjs <brief.json> | --check <file.json> | --check-all"); process.exit(2);
}
