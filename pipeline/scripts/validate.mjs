// Shared validation for every published JSON file. Used by publish.mjs, publish-narrative.mjs, publish-howto.mjs.
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
export const API = path.join(ROOT, "site/public/api");
export const BRIEFS = path.join(API, "briefs");
export const NARRATIVE = path.join(API, "narrative");
export const HOWTO = path.join(API, "howto");
export const CANDIDATES = path.join(ROOT, "pipeline/candidates");

const ajv = new Ajv({ allErrors: true }); addFormats(ajv);
const KINDS = ["brief", "candidates", "sources", "preferences", "narrative", "howto"];
const validators = Object.fromEntries(KINDS.map((n) => [n, ajv.compile(JSON.parse(fs.readFileSync(path.join(ROOT, "contracts", `${n}.schema.json`), "utf8")))]));

export const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const writeAtomic = (f, obj) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f + ".tmp", JSON.stringify(obj, null, 2) + "\n"); fs.renameSync(f + ".tmp", f); };
export const listJson = (dir, re = /\.json$/) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => re.test(f)).sort().map((f) => path.join(dir, f)) : []);

export function kindOf(file, data) {
  const b = path.basename(file);
  if (b === "sources.json") return "sources";
  if (b === "preferences.json") return "preferences";
  if (data && "candidates" in data) return "candidates";
  if (data && "threads" in data) return "narrative";
  if (data && "howtos" in data) return "howto";
  return "brief";
}

const briefCache = {};
// X handles currently in config/sources.json (every x lane). How-to authors must be one of them.
export function sourceHandles() {
  const x = readJson(path.join(ROOT, "config/sources.json")).x || {};
  return new Set(Object.values(x).filter(Array.isArray).flat().filter((h) => typeof h === "string").map((h) => h.toLowerCase()));
}

export function briefItem(briefId, itemId) {
  const f = path.join(BRIEFS, `${briefId}.json`);
  if (!(briefId in briefCache)) briefCache[briefId] = fs.existsSync(f) ? readJson(f) : null;
  return briefCache[briefId]?.items.find((i) => i.id === itemId) || null;
}
const sentences = (s) => s.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/).filter(Boolean).length;

// Returns a list of problems (empty = valid).
export function problems(file, forceKind) {
  let data;
  try { data = readJson(file); } catch (e) { return [`cannot read JSON: ${e.message}`]; }
  const kind = forceKind || kindOf(file, data);
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
  if (kind === "narrative") {
    const n = sentences(data.summary);
    if (n < 4 || n > 6) out.push(`summary has ${n} sentences; must be 4-6`);
    if (data.window.from > data.window.to) out.push("window.from is after window.to");
    for (const t of data.threads) for (const e of t.evidence) if (!briefItem(e.briefId, e.itemId)) out.push(`thread "${t.title}": evidence ${e.briefId}/${e.itemId} is not a published brief item`);
  }
  if (kind === "howto") {
    const ids = new Set(), keys = new Set(), handles = sourceHandles();
    for (const h of data.howtos) {
      if (ids.has(h.id)) out.push(`duplicate how-to id ${h.id}`); ids.add(h.id);
      if (keys.has(h.dedupeKey)) out.push(`duplicate dedupeKey ${h.dedupeKey}`); keys.add(h.dedupeKey);
      if (!h.author.handle || !handles.has(h.author.handle.replace(/^@/, "").toLowerCase())) out.push(`${h.id}: author ${h.author.handle ? "@" + h.author.handle : h.author.name} is not an X source in config/sources.json`);
      if (h.kind === "prompt" && h.copy.length !== 1) out.push(`${h.id}: a prompt has exactly one copy element`);
      if (h.briefItem && !briefItem(h.briefItem.briefId, h.briefItem.itemId)) out.push(`${h.id}: briefItem ${h.briefItem.briefId}/${h.briefItem.itemId} not found`);
    }
  }
  return out;
}

export function report(file, forceKind) {
  const p = problems(file, forceKind);
  const rel = path.relative(ROOT, path.resolve(file));
  if (p.length) console.error(`INVALID ${rel}\n  ${p.join("\n  ")}`); else console.log(`VALID   ${rel}`);
  return p.length === 0;
}
