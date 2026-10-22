// The site's ONLY data source: the published static JSON under public/api/ (served at /api/...).
// Read at build time so every page is pre-rendered. See ../../CONTRACT.md.
import fs from "node:fs";
import path from "node:path";

const API = path.join(process.cwd(), "public", "api");
const read = (p) => JSON.parse(fs.readFileSync(path.join(API, p), "utf8"));

export const latest = () => read("latest.json");             // /api/latest.json
export const index = () => read("briefs/index.json");        // /api/briefs/index.json
export const brief = (id) => read(`briefs/${id}.json`);      // /api/briefs/<id>.json
export const archiveIds = () => index().briefs.map((b) => b.id);
