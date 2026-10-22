#!/usr/bin/env node
// Validate and publish Signal Brief data. Paths are relative to the repo root. See CONTRACT.md.
//   node pipeline/scripts/publish.mjs <brief.json>      Editor: validate a brief, then publish it to site/public/api/
//   node pipeline/scripts/publish.mjs --check <file>    validate one file (brief, candidates, sources or preferences)
//   node pipeline/scripts/publish.mjs --check-all       validate config/, pipeline/candidates/ and site/public/api/
// On any failure: exit 1 and nothing is written, so /api/latest.json keeps the last good brief.
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const API = path.join(ROOT, "site/public/api");
const BRIEFS = path.join(API, "briefs");
const CANDIDATES = path.join(ROOT, "pipeline/candidates");

const ajv = new Ajv({ allErrors: true }); addFormats(ajv);
const schema = (n) => JSON.parse(fs.readFileSync(path.join(ROOT, "contracts", `${n}.schema.json`), "utf8"));
const validators = Object.fromEntries(["brief", "candidates", "sources", "preferences"].map((n) => [n, ajv.compile(schema(n))]));

const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const writeAtomic = (f, obj) => { fs.writeFileSync(f + ".tmp", JSON.stringify(obj, null, 2) + "\n"); fs.renameSync(f + ".tmp", f); };

function kindOf(file, data) {
  const b = path.basename(file);
  if (b === "sources.json") return "sources";
  if (b === "preferences.json") return "preferences";
  if (data && "candidates" in data) return "candidates";
  return "brief";
}

// Returns a list of problems (empty = valid).
function problems(file) {
  let data;
  try { data = readJson(file); } catch (e) { return [`cannot read JSON: ${e.message}`]; }
  const kind = kindOf(file, data);
  const v = validators[kind];
  if (!v(data)) return v.errors.map((e) => `${kind} ${e.instancePath || "/"} ${e.message}`);
  const out = [];
  if (kind === "brief") {
    const ids = new Set();
    for (const it of data.items) {
      if (ids.has(it.id)) out.push(`duplicate item id ${it.id}`);
      ids.add(it.id);
      if (it.image && !fs.existsSync(path.join(ROOT, "site/public", it.image.src))) out.push(`missing image site/public${it.image.src} for ${it.id}`);
    }
    for (const t of data.top3) if (!ids.has(t.itemId)) out.push(`top3 points to unknown item ${t.itemId}`);
    if (!data.id.startsWith(data.date)) out.push(`id ${data.id} does not match date ${data.date}`);
  }
  if (kind === "candidates") {
    const ids = new Set();
    for (const c of data.candidates) { if (ids.has(c.id)) out.push(`duplicate candidate id ${c.id}`); ids.add(c.id); }
    const base = path.basename(file, ".json");
    if (path.dirname(path.resolve(file)) === CANDIDATES && base !== data.runId) out.push(`file name ${base} does not match runId ${data.runId}`);
  }
  return out;
}

function report(file) {
  const p = problems(file);
  const rel = path.relative(ROOT, path.resolve(file));
  if (p.length) console.error(`INVALID ${rel}\n  ${p.join("\n  ")}`); else console.log(`VALID   ${rel}`);
  return p.length === 0;
}

function buildIndex() {
  const briefs = fs.readdirSync(BRIEFS).filter((f) => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(f)).sort().reverse()
    .map((f) => { const b = readJson(path.join(BRIEFS, f));
      return { id: b.id, date: b.date, edition: b.edition, publishedAt: b.publishedAt, headline: b.top3[0].headline, url: `/api/briefs/${b.id}.json` }; });
  return { schemaVersion: "1.0", latest: briefs[0]?.id ?? null, count: briefs.length, briefs };
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === "--check-all") {
  const files = [path.join(ROOT, "config/sources.json"), path.join(ROOT, "config/preferences.json"), path.join(API, "latest.json"),
    ...fs.readdirSync(BRIEFS).filter((f) => f !== "index.json" && f.endsWith(".json")).map((f) => path.join(BRIEFS, f)),
    ...fs.readdirSync(CANDIDATES).filter((f) => f.endsWith(".json")).map((f) => path.join(CANDIDATES, f))];
  const ok = files.map(report).every(Boolean);
  process.exit(ok ? 0 : 1);
} else if (cmd === "--check") {
  if (!arg) { console.error("usage: publish.mjs --check <file.json>"); process.exit(2); }
  process.exit(report(arg) ? 0 : 1);
} else if (cmd && !cmd.startsWith("--")) {
  if (!report(cmd)) { console.error("Not published. /api/latest.json still holds the last good brief."); process.exit(1); }
  const brief = readJson(cmd);
  writeAtomic(path.join(BRIEFS, `${brief.id}.json`), brief);
  writeAtomic(path.join(BRIEFS, "index.json"), buildIndex());
  writeAtomic(path.join(API, "latest.json"), brief); // last: latest.json only changes once everything else is in place
  console.log(`PUBLISHED ${brief.id}: site/public/api/briefs/${brief.id}.json, briefs/index.json, latest.json. Commit and push to deploy.`);
} else {
  console.error("usage: publish.mjs <brief.json> | --check <file.json> | --check-all"); process.exit(2);
}
