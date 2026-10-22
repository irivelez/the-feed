import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

export function latest() {
  return JSON.parse(fs.readFileSync(path.join(DATA, "latest.json"), "utf8"));
}
export function archiveIds() {
  return fs.readdirSync(DATA).filter((f) => /^brief-\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(f))
    .map((f) => f.slice(6, -5)).sort().reverse();
}
export function brief(id) {
  return JSON.parse(fs.readFileSync(path.join(DATA, `brief-${id}.json`), "utf8"));
}
