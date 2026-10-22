#!/usr/bin/env node
// Validate and publish the weekly narrative. See contracts/CONTRACT.md.
//   node pipeline/scripts/publish-narrative.mjs <narrative.json>
// Writes site/public/api/narrative/<id>.json, narrative/index.json, then narrative/latest.json (atomic, last).
// On failure: exit 1, nothing written, the last good narrative stays live.
import path from "node:path";
import { NARRATIVE, readJson, writeAtomic, listJson, report } from "./validate.mjs";

const file = process.argv[2];
if (!file) { console.error("usage: publish-narrative.mjs <narrative.json>"); process.exit(2); }
if (!report(file, "narrative")) { console.error("Not published. /api/narrative/latest.json still holds the last good narrative."); process.exit(1); }
const n = readJson(file);
writeAtomic(path.join(NARRATIVE, `${n.id}.json`), n);
const all = listJson(NARRATIVE, /^\d{4}-\d{2}-\d{2}\.json$/).reverse().map(readJson);
writeAtomic(path.join(NARRATIVE, "index.json"), { schemaVersion: "1.0", latest: all[0].id, count: all.length,
  narratives: all.map((x) => ({ id: x.id, publishedAt: x.publishedAt, window: x.window, headline: x.headline, url: `/api/narrative/${x.id}.json` })) });
writeAtomic(path.join(NARRATIVE, "latest.json"), all[0]); // newest by date, not necessarily this file
console.log(`PUBLISHED narrative ${n.id}. Commit site/public/api/narrative and push.`);
