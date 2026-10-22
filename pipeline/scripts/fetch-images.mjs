#!/usr/bin/env node
// Give every item in a brief a real image before publish. Never blocks: on any failure the item gets a fallback card.
//   node pipeline/scripts/fetch-images.mjs <brief.json>
// Writes site/public/img/<item-id>.jpg (1200x675) and sets item.image {src, alt} in <brief.json> in place.
// Order, first hit wins:
//   1. og:image / twitter:image of the item's linked pages (source.url, then related[] urls; non-X pages first)
//   2. media on the X post (photo, video poster, link-card image, quoted post media) or og:image of links in the post
//   3. the author's or organization's image: X profile banner/photo, or the og:image of the source site's home page
//   4. a generated typographic card in brand colors
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const IMG = path.join(ROOT, "site/public/img");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";
const W = 1200, H = 675;

const file = process.argv[2];
if (!file) { console.error("usage: fetch-images.mjs <brief.json>"); process.exit(2); }
const brief = JSON.parse(fs.readFileSync(file, "utf8"));

async function get(url, ms = 12000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "*/*" }, redirect: "follow", signal: ctl.signal });
    return r.ok ? r : null;
  } catch { return null; } finally { clearTimeout(t); }
}
const isX = (u) => /^https?:\/\/(www\.)?(x|twitter)\.com\//.test(u);
const tweetId = (u) => (u.match(/\/status\/(\d+)/) || [])[1];

async function ogImage(pageUrl) {
  const r = await get(pageUrl); if (!r || !/html/.test(r.headers.get("content-type") || "")) return null;
  const html = (await r.text()).slice(0, 400000);
  for (const key of ["og:image:secure_url", "og:image", "twitter:image", "twitter:image:src"]) {
    const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, "i"));
    const c = m && m[0].match(/content=["']([^"']+)["']/i);
    if (c) { try { return new URL(c[1].replace(/&amp;/g, "&"), r.url).href; } catch {} }
  }
  return null;
}

async function tweet(id) {
  const r = await get(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=a`);
  try { return r ? await r.json() : null; } catch { return null; }
}
function tweetMedia(t) {
  if (!t) return [];
  const out = [];
  for (const m of t.mediaDetails || []) out.push(m.media_url_https);
  if (t.video?.poster) out.push(t.video.poster);
  const bv = t.card?.binding_values || {};
  for (const k of ["photo_image_full_size_original", "thumbnail_image_original", "summary_photo_image_original", "player_image_original", "photo_image_full_size_large", "thumbnail_image_large", "summary_photo_image_large", "player_image_large"]) if (bv[k]?.image_value?.url) out.push(bv[k].image_value.url);
  if (t.quoted_tweet) out.push(...tweetMedia(t.quoted_tweet));
  return out;
}

// Download, check it is a real picture (not a tiny logo), crop to 1200x675 JPG.
async function save(url, out, minW = 400) {
  const r = await get(url, 15000); if (!r) return false;
  try {
    const buf = Buffer.from(await r.arrayBuffer());
    if (/logo|favicon|sprite|placeholder|default[-_]?(og|share|image)/i.test(url)) return false; // generic site art
    const meta = await sharp(buf).metadata();
    if (!meta.width || meta.width < minW || meta.height < minW * 0.4) return false;
    const { channels } = await sharp(buf).stats();
    if (channels.slice(0, 3).every((c) => c.stdev < 8)) return false; // nearly blank
    const { info } = await sharp(buf).trim({ threshold: 30 }).toBuffer({ resolveWithObject: true });
    if (info.width * info.height < 0.2 * meta.width * meta.height) return false; // small icon on a plain background
    // Near 16:9 photos fill the frame; anything else (logos, repo cards, square art) is shown whole, centered, never cropped.
    const ratio = meta.width / meta.height;
    if (Math.abs(ratio / (W / H) - 1) <= 0.12) {
      await sharp(buf).resize(W, H, { fit: "cover", position: "attention" }).flatten({ background: "#ffffff" }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    } else {
      const pad = Math.round(H * 0.08);
      const bg = (await sharp(buf).flatten({ background: "#ffffff" }).stats()).dominant;
      const inner = await sharp(buf).flatten({ background: bg }).resize(W - 2 * pad, H - 2 * pad, { fit: "contain", background: bg }).toBuffer();
      await sharp({ create: { width: W, height: H, channels: 3, background: bg } }).composite([{ input: inner, gravity: "center" }]).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    }
    return true;
  } catch { return false; }
}

const PALETTE = { practical: ["#0b3d2e", "#2fd18a"], broad: ["#2a1446", "#b98cff"], "frontier-capital": ["#3b2300", "#f0b45a"], design: ["#062a4a", "#7cc0f5"] };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function wrap(text, max) { const lines = []; let cur = ""; for (const w of text.split(/\s+/)) { if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); } if (cur) lines.push(cur); return lines; }
async function fallback(item, out) {
  const [bg, fg] = PALETTE[item.lens] || PALETTE.broad;
  let lines = wrap(item.title, 26); if (lines.length > 4) { lines = lines.slice(0, 4); lines[3] += "…"; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="100%" height="100%" fill="${bg}"/><rect x="80" y="96" width="96" height="10" fill="${fg}"/>
<text x="80" y="170" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" font-weight="700" fill="${fg}" letter-spacing="2">${esc(item.source.name.toUpperCase())}</text>
${lines.map((l, k) => `<text x="80" y="${280 + k * 82}" font-family="DejaVu Sans, Arial, sans-serif" font-size="66" font-weight="700" fill="#ffffff">${esc(l)}</text>`).join("\n")}
</svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toFile(out);
}

async function imageFor(item) {
  const out = path.join(IMG, `${item.id}.jpg`);
  const urls = [item.source.url, ...(item.related || []).map((r) => r.url)];
  const pages = urls.filter((u) => !isX(u)), posts = urls.filter((u) => isX(u) && tweetId(u));
  const name = item.source.name;
  // 1. linked pages
  for (const u of pages) { const og = await ogImage(u); if (og && await save(og, out)) return [`Image from ${name}`, "page"]; }
  // 2. X post media, then pages linked from the post
  const tweets = [];
  for (const u of posts) { const t = await tweet(tweetId(u)); if (t) tweets.push(t); for (const m of tweetMedia(t)) if (await save(m, out)) return [`Image from ${name}`, "x-media"]; }
  for (const t of tweets) for (const e of t.entities?.urls || []) {
    if (!e.expanded_url || isX(e.expanded_url)) continue;
    const og = await ogImage(e.expanded_url); if (og && await save(og, out)) return [`Image from ${new URL(e.expanded_url).hostname.replace(/^www\./, "")}`, "linked-page"];
  }
  // 3. author or organization
  for (const t of tweets) {
    if (t.user?.profile_banner_url && await save(t.user.profile_banner_url + "/1500x500", out)) return [`Banner of @${t.user.screen_name}`, "author"];
  }
  for (const u of pages) { const home = new URL(u).origin; const og = await ogImage(home); if (og && await save(og, out)) return [`Image from ${new URL(u).hostname.replace(/^www\./, "")}`, "org"]; }
  for (const t of tweets) {
    const p = t.user?.profile_image_url_https?.replace("_normal", "_400x400");
    if (p && await save(p, out, 300)) return [`Profile image of @${t.user.screen_name}`, "author"];
  }
  // Keep a real image an earlier run already saved (e.g. a site that now blocks us), rather than downgrade it.
  if (item.image && !/^Screenshot/i.test(item.image.alt) && !/^(Banner|Profile)/.test(item.image.alt) && fs.existsSync(out) && !item.image.alt.startsWith(`${name}: `)) return [item.image.alt, "kept"];
  // 4. fallback
  await fallback(item, out); return [`${name}: ${item.title}`, "fallback"];
}

fs.mkdirSync(IMG, { recursive: true });
const tally = {};
for (const item of brief.items) {
  let alt, kind;
  try { [alt, kind] = await imageFor(item); }
  catch (e) { try { await fallback(item, path.join(IMG, `${item.id}.jpg`)); alt = item.title; kind = "fallback"; } catch { kind = "none"; } }
  if (kind !== "none") item.image = { src: `/img/${item.id}.jpg`, alt: alt.slice(0, 200) };
  tally[kind] = (tally[kind] || 0) + 1;
  console.log(`${kind.padEnd(11)} ${item.id}`);
}
fs.writeFileSync(file, JSON.stringify(brief, null, 2) + "\n");
console.log("images:", JSON.stringify(tally));
process.exit(0);
