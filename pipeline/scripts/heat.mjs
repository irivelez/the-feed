#!/usr/bin/env node
// Adds item.heat (attention signal, NOT quality) to a brief from candidate engagement.
// Never changes selection or order. Always exits 0 so publish is never blocked.
// Usage: node pipeline/scripts/heat.mjs <brief.json> [candidates.json]  (defaults to newest pipeline/candidates/*.json)
import fs from "node:fs"; import path from "node:path";
const [briefPath, candArg] = process.argv.slice(2);
const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(n));
try {
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8"));
  let cp = candArg;
  if (!cp) { const d = "pipeline/candidates"; const f = fs.existsSync(d) ? fs.readdirSync(d).filter((x) => x.endsWith(".json")).sort() : []; cp = f.length ? path.join(d, f.at(-1)) : null; }
  const raw = cp ? JSON.parse(fs.readFileSync(cp, "utf8")) : {};
  const cands = raw.candidates || raw.items || [];
  const byId = new Map(cands.map((c) => [c.id, c])); const byUrl = new Map(cands.map((c) => [c.url || c.source?.url, c]));
  const voicesByTopic = {};
  for (const c of cands) if (c.topic) (voicesByTopic[c.topic] ||= new Set()).add(c.handle || c.author?.handle || c.source?.name);
  let n = 0;
  for (const it of brief.items) {
    const c = byId.get(it.id) || byUrl.get(it.source?.url); const m = c?.metrics;
    if (!m || m.likes == null) continue;
    const eng = (m.likes || 0) + 2 * (m.reposts || 0) + (m.replies || 0);
    // Raw reach counts too: a huge account's post is still viral (absolute), and a small account's breakout counts (relative). Take the higher.
    const absolute = Math.min(80, Math.max(0, 16 * (Math.log10(1 + eng) - 2))); // ~1k eng = 16, 10k = 32, 100k = 48, 1M = 64
    const relative = m.authorBaseline ? Math.min(80, 25 * Math.log2(1 + eng / (1.5 * m.authorBaseline))) : 0;
    let score = Math.max(absolute, relative);
    const voices = c.topic ? voicesByTopic[c.topic]?.size || 1 : 1;
    score = Math.round(Math.min(100, score + Math.min(30, 10 * (voices - 1))));
    const level = score >= 70 ? "hot" : score >= 40 ? "warm" : "none";
    const metric = m.views ? `${fmt(m.views)} views` : `${fmt(m.likes)} likes`;
    it.heat = { score, level, metric, ...(voices > 1 ? { voices } : {}) }; n++;
  }
  fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2));
  console.log(`heat: ${n}/${brief.items.length} items scored from ${cp || "no candidates"}`);
} catch (e) { console.log("heat: skipped (" + e.message + ")"); }
process.exit(0);
