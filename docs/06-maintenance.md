# Phase 6 — Maintenance & Roadmap

## Operations

- **Dependencies:** enable Dependabot / Renovate weekly; CI's `npm audit` gate blocks high-severity issues.
- **Bugs:** GitHub Issues with labels `bug`, `enhancement`, `security`. Every bug fix ships with a regression test.
- **Versioning:** SemVer. Record every release in `CHANGELOG.md`.
- **Monitoring:** there is no backend or analytics, by design (privacy). User feedback comes through Issues.

## Known Limitations / Tech Debt

| Item                               | Impact                                       | Plan                                                          |
| ---------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| CSP allows `'unsafe-eval'` (Ajv)   | Weaker XSS defence-in-depth                  | Evaluate `@cfworker/json-schema`                              |
| Processing runs on the main thread | UI may pause on files > 20 MB                | Move core into a Web Worker                                   |
| `jsonpath-plus` pinned to 10.3     | Misses v11 features                          | Upgrade when the Node 18 / Safari 16 support floor is dropped |
| Diff compares arrays by index      | An insertion at the start shows many changes | Add LCS / keyed array diff option                             |

## Backlog (prioritised)

1. Web Worker for large files, plus a virtualised tree view
2. JSON Patch (RFC 6902) generation / apply
3. More code generators: Zod, Java, Kotlin, Go, Python, C#
4. JSON Schema generation from a sample
5. JWT decoder, Base64 tools
6. JSON5 / JSONC / NDJSON input modes
7. Shareable links (URL-encoded, still client-only)
8. PWA / offline install
9. CLI (`npx json-toolkit fmt file.json`) reusing `src/core`
10. VS Code extension reusing `src/core`
