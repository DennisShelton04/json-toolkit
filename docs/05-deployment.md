# Phase 5 — Deployment

The app is a static bundle (`dist/`), so it can be hosted anywhere that serves files.

## Environments

| Env        | Trigger                            | Target                                            |
| ---------- | ---------------------------------- | ------------------------------------------------- |
| Local      | `npm run dev`                      | http://localhost:5173                             |
| Preview    | `npm run build && npm run preview` | http://localhost:4173 (production build + CSP)    |
| CI         | every PR / push to `main`          | `.github/workflows/ci.yml` — Node 18/20/22 matrix |
| Production | git tag `vX.Y.Z`                   | `.github/workflows/deploy.yml` → GitHub Pages     |

## Pipeline

```
PR ─▶ CI: format ▸ typecheck ▸ tests + coverage gate ▸ build ▸ npm audit ─▶ review ─▶ merge
tag vX.Y.Z ─▶ Deploy: test ▸ build ▸ upload ▸ GitHub Pages
```

## Release Procedure

1. Update `CHANGELOG.md` and bump the version: `npm version minor` (creates tag `vX.Y.Z`).
2. `git push --follow-tags` → deploy workflow publishes.
3. Run the E2E checklist in [04-test-plan.md](04-test-plan.md) against the live URL.
4. **Rollback:** re-run the deploy workflow on the previous tag (`workflow_dispatch`).

## Self-hosting (Docker / nginx)

```bash
docker build -t json-toolkit .
docker run -p 8080:8080 json-toolkit
```

`deploy/nginx.conf` adds security headers, SPA fallback, immutable caching for hashed
assets and `no-cache` for `index.html`.

## Other static hosts

- **Netlify / Vercel / Cloudflare Pages:** build `npm run build`, publish dir `dist`.
- **S3 + CloudFront:** upload `dist/`; set `index.html` `Cache-Control: no-cache`.

`base: './'` in `vite.config.ts` makes the build work from any sub-path.
