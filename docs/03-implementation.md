# Phase 3 — Implementation

## Project Structure

```
src/
├── core/                 # Pure TypeScript logic — no React, no DOM (NFR-07)
│   ├── errors.ts         # JsonToolError, offset → line/column
│   ├── parse.ts          # strict parse with located errors
│   ├── format.ts         # FR-01..03 beautify / minify / sort keys
│   ├── validate.ts       # FR-04..05 syntax errors + duplicate-key warnings
│   ├── repair.ts         # FR-06 auto-repair
│   ├── schema.ts         # FR-07 JSON Schema (draft-07 / 2019-09 / 2020-12)
│   ├── diff.ts           # FR-08 semantic diff
│   ├── query.ts          # FR-09 JSONPath (safe eval)
│   ├── convert.ts        # FR-10 YAML / CSV
│   ├── typegen.ts        # FR-11 TypeScript interfaces
│   ├── stats.ts          # FR-13 size / depth / keys
│   ├── escape.ts         # FR-15 escape / unescape
│   └── __tests__/        # unit tests, one file per module
├── tools.ts              # tool registry: maps UI tabs → core functions → Output model
├── components/           # Editor (CodeMirror + live lint), TreeView, OutputPanel
├── App.tsx               # layout, state, persistence, file I/O
└── styles.css            # design tokens, light/dark themes
```

## Conventions

- **Core functions** take strings and return values or throw `JsonToolError(message, line?, column?)`.
  The UI never parses JSON itself; it goes through `runTool()`.
- **Adding a tool:** add a core module + tests → add an entry to `TOOLS` and a `case` in
  `runTool()` → add options UI in `App.tsx` if needed → add a row to the requirements table.
- **Formatting:** Prettier (`npm run format`). **Typing:** `strict` TypeScript, no `any`.
- **Branching:** trunk-based. `feature/<id>-short-name` → PR → CI green + 1 review → squash merge.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).

## Dependency Choices

| Package                 | Purpose                              | Note                                                                                         |
| ----------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `jsonc-parser`          | error offsets, duplicate-key visitor | Microsoft, used by VS Code                                                                   |
| `jsonrepair`            | repair                               |                                                                                              |
| `ajv`                   | JSON Schema                          | needs `'unsafe-eval'` in CSP                                                                 |
| `jsonpath-plus`         | JSONPath                             | pinned to `~10.3` (v11 needs Node 20+/Safari 17+ regex `v` flag); ≥10.3 fixes CVE-2024-21534 |
| `js-yaml`, `papaparse`  | YAML / CSV                           |                                                                                              |
| `@uiw/react-codemirror` | editor                               | bundled locally, no CDN                                                                      |
