#!/usr/bin/env node
// Validate a how-to batch and merge it into the library. See contracts/CONTRACT.md.
//   node pipeline/scripts/publish-howto.mjs <howto-batch.json>
//   node pipeline/scripts/publish-howto.mjs --remove <id> [<id>...]   (drop entries from library.json and latest.json)
// Every author handle must be an X source in config/sources.json, or the batch is rejected.
// Dedupe: one entry per dedupeKey. The higher quality wins; on a tie the newer one wins. The loser's source is kept in alsoFrom.
// Writes site/public/api/howto/library.json, then howto/latest.json (this batch). Atomic; on failure nothing is written.
import fs from "node:fs";
import path from "node:path";
import { HOWTO, readJson, writeAtomic, report, problems } from "./validate.mjs";

if (process.argv[2] === "--remove") {
  const ids = new Set(process.argv.slice(3));
  if (!ids.size) { console.error("usage: publish-howto.mjs --remove <id> [<id>...]"); process.exit(2); }
  const now = new Date().toISOString();
  const out = {};
  for (const name of ["library.json", "latest.json"]) {
    const f = path.join(HOWTO, name);
    if (!fs.existsSync(f)) continue;
    const d = readJson(f);
    out[f] = { ...d, updatedAt: now, howtos: d.howtos.filter((h) => !ids.has(h.id)) };
    const tmp = f + ".check"; fs.writeFileSync(tmp, JSON.stringify(out[f]));
    const p = problems(tmp, "howto"); fs.unlinkSync(tmp);
    if (p.length) { console.error(`INVALID ${name} after removal\n  ${p.join("\n  ")}\nNothing changed.`); process.exit(1); }
  }
  for (const [f, d] of Object.entries(out)) writeAtomic(f, d);
  console.log(`REMOVED ${[...ids].join(", ")}. Library: ${out[path.join(HOWTO, "library.json")]?.howtos.length ?? 0}.`);
  process.exit(0);
}
const file = process.argv[2];
if (!file) { console.error("usage: publish-howto.mjs <howto-batch.json>"); process.exit(2); }
if (!report(file, "howto")) { console.error("Not published. The how-to library is unchanged."); process.exit(1); }
const batch = readJson(file);
const libFile = path.join(HOWTO, "library.json");
const lib = fs.existsSync(libFile) ? readJson(libFile) : { schemaVersion: "1.0", updatedAt: batch.updatedAt, howtos: [] };

const byKey = new Map(lib.howtos.map((h) => [h.dedupeKey, h]));
let added = 0, replaced = 0, kept = 0;
for (const h of batch.howtos) {
  const old = byKey.get(h.dedupeKey) || lib.howtos.find((x) => x.id === h.id);
  if (!old) { byKey.set(h.dedupeKey, h); added++; continue; }
  const win = h.quality > old.quality || (h.quality === old.quality && h.addedAt >= old.addedAt) ? h : old;
  const lose = win === h ? old : h;
  const also = [...(win.alsoFrom || []), ...(lose.alsoFrom || []), lose.source].filter((s, k, a) => s.url !== win.source.url && a.findIndex((x) => x.url === s.url) === k);
  byKey.delete(old.dedupeKey);
  byKey.set(win.dedupeKey, { ...win, ...(also.length ? { alsoFrom: also } : {}) });
  win === h ? replaced++ : kept++;
}
const next = { schemaVersion: "1.0", updatedAt: batch.updatedAt, howtos: [...byKey.values()].sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.quality - a.quality) };

// Validate the merged library before it goes live.
const tmp = libFile + ".check";
fs.mkdirSync(HOWTO, { recursive: true });
fs.writeFileSync(tmp, JSON.stringify(next));
const p = problems(tmp, "howto"); fs.unlinkSync(tmp);
if (p.length) { console.error(`INVALID merged library\n  ${p.join("\n  ")}\nNot published.`); process.exit(1); }
writeAtomic(libFile, next);
writeAtomic(path.join(HOWTO, "latest.json"), batch);
console.log(`PUBLISHED how-tos: ${added} new, ${replaced} replaced a weaker version, ${kept} kept the existing better version. Library: ${next.howtos.length}.`);
