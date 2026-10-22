#!/usr/bin/env node
// Validate a brief and publish it as data/brief-<id>.json + data/latest.json.
// Run from the repo root or from site/; paths resolve relative to site/.
// Usage:
//   node scripts/publish.mjs <candidate.json>     validate, then publish (exit 1 and keep last good latest.json on failure)
//   node scripts/publish.mjs --check <file.json>  validate only
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const args = process.argv.slice(2);
const checkOnly = args[0] === "--check";
const file = checkOnly ? args[1] : args[0];
if (!file) { console.error("usage: publish.mjs [--check] <brief.json>"); process.exit(2); }

function fail(msg) {
  console.error(`INVALID: ${msg}`);
  if (!checkOnly) console.error("Not published. data/latest.json still holds the last good brief.");
  process.exit(1);
}

let brief;
try { brief = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { fail(`cannot read JSON: ${e.message}`); }

const schema = JSON.parse(fs.readFileSync(path.join(root, "schema/brief.schema.json"), "utf8"));
const ajv = new Ajv({ allErrors: true }); addFormats(ajv);
if (!ajv.validate(schema, brief)) fail(ajv.errorsText(ajv.errors, { separator: "\n  " }));

// Checks the schema cannot express.
const ids = new Set();
for (const it of brief.items) {
  if (ids.has(it.id)) fail(`duplicate item id ${it.id}`);
  ids.add(it.id);
  if (it.image && !fs.existsSync(path.join(root, "public", it.image.src))) fail(`missing image ${it.image.src} for ${it.id}`);
}
for (const t of brief.top3) if (!ids.has(t.itemId)) fail(`top3 points to unknown item ${t.itemId}`);
if (!brief.id.startsWith(brief.date)) fail(`id ${brief.id} does not match date ${brief.date}`);

console.log(`VALID: ${brief.id} (${brief.items.length} items, ${brief.voices.length} voices)`);
if (checkOnly) process.exit(0);

const json = JSON.stringify(brief, null, 2) + "\n";
const dated = path.join(root, "data", `brief-${brief.id}.json`);
const latest = path.join(root, "data", "latest.json");
fs.writeFileSync(dated, json);
fs.writeFileSync(latest + ".tmp", json);
fs.renameSync(latest + ".tmp", latest); // atomic swap: latest.json is never half-written
console.log(`PUBLISHED: ${path.relative(root, dated)} and data/latest.json. Commit and push to deploy.`);
