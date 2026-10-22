# Signal Brief: site

Public AI brief for leaders: practical agentic AI and the broad picture. Live at https://signal-brief-rho-silk.vercel.app

This folder is presentation only. It reads the published JSON in `public/api/` and nothing else. The full contract (inputs, schemas, who writes what) is in [`../contracts/CONTRACT.md`](../contracts/CONTRACT.md).

## Run

```bash
cd site
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to out/
```

## Publish a new brief (from the repo root)

```bash
cd pipeline && npm install && cd ..
node pipeline/scripts/publish.mjs /tmp/brief-<id>.json   # validate + write site/public/api/*
git add site/public/api site/public/img && git commit -m "Brief <id>" && git push   # Vercel deploys
```

Narrative: `node pipeline/scripts/publish-narrative.mjs <file>`. How-tos: `node pipeline/scripts/publish-howto.mjs <file>`. Pages: `/` (Top 3, This week, sections), `/howto/`, `/archive/`.

A brief that fails validation is not published; `/api/latest.json` keeps the last good one.
Vercel: project root is `site/`, auto-deploys on push to `main`. Refresh: 07:00, 13:00, 19:00 Bogotá (COT).
