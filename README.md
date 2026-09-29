# JSON Toolkit

A fast, **privacy-first** JSON workbench that runs entirely in your browser: beautify, validate,
repair, schema-check, diff, query, convert and generate types. No data ever leaves your device.

| Tool                  | What it does                                                                         |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Beautify / Minify** | Pretty-print (2, 4, tab) or compact output; optional recursive key sort              |
| **Validate**          | Every syntax error with line and column, duplicate-key warnings, live squiggles      |
| **Repair**            | Fixes trailing commas, single quotes, comments, unquoted keys, missing brackets      |
| **Schema**            | Validates against JSON Schema draft-07 / 2019-09 / 2020-12 and lists every violation |
| **Diff**              | Semantic comparison that ignores key order and whitespace                            |
| **Query**             | JSONPath, e.g. `$.store.books[?(@.price > 10)].title`                                |
| **Convert**           | JSON ⇄ YAML, JSON ⇄ CSV (nested objects flattened to `a.b` columns)                  |
| **Types**             | Generates TypeScript interfaces from a sample                                        |
| **Escape**            | Converts JSON to and from a string literal                                           |

Also: a tree view (click a key to copy its JSONPath), document stats, file open and drag & drop,
copy and download, and a dark mode.

## Quick start

```bash
nvm use          # Node 18+
npm install
npm run dev      # http://localhost:5173
```

| Script                              | Purpose                              |
| ----------------------------------- | ------------------------------------ |
| `npm run dev`                       | Dev server with hot reload           |
| `npm test` / `npm run coverage`     | Tests (with the ≥80 % coverage gate) |
| `npm run typecheck`                 | TypeScript strict check              |
| `npm run build` / `npm run preview` | Production build / serve it locally  |
| `npm run format`                    | Prettier                             |

## SDLC documentation

| Phase             | Document                                               |
| ----------------- | ------------------------------------------------------ |
| 1. Requirements   | [docs/01-requirements.md](docs/01-requirements.md)     |
| 2. Design         | [docs/02-design.md](docs/02-design.md)                 |
| 3. Implementation | [docs/03-implementation.md](docs/03-implementation.md) |
| 4. Testing        | [docs/04-test-plan.md](docs/04-test-plan.md)           |
| 5. Deployment     | [docs/05-deployment.md](docs/05-deployment.md)         |
| 6. Maintenance    | [docs/06-maintenance.md](docs/06-maintenance.md)       |

See also [CONTRIBUTING.md](CONTRIBUTING.md) and [CHANGELOG.md](CHANGELOG.md).
