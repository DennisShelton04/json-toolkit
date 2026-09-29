# Phase 2 — Design

## 1. Architecture

Single-page static web app. No backend (NFR-01).

```
┌───────────────────────────── Browser ─────────────────────────────┐
│  UI layer (React, src/components)                                  │
│   App ── Toolbar (tool tabs, options)                              │
│       ├─ Editor (CodeMirror) × 1–2 inputs                          │
│       ├─ OutputPanel (text | tree | problems list)                 │
│       └─ StatusBar (stats, validity)                               │
│                │  calls pure functions                              │
│  Core layer (framework-free TypeScript, src/core)                  │
│   format · validate · repair · schema · diff · query ·             │
│   convert · typegen · stats · escape                               │
│                │                                                    │
│  Libraries: jsonc-parser, jsonrepair, ajv, jsonpath-plus,          │
│             js-yaml, papaparse                                      │
└────────────────────────────────────────────────────────────────────┘
```

**Why this split:** core modules are pure (input string → result object), so they are
unit-testable without a DOM and reusable later in a CLI or VS Code extension.

## 2. Module Design (traceability to requirements)

| Module        | Public API                                                                         | FR    |
| ------------- | ---------------------------------------------------------------------------------- | ----- |
| `format.ts`   | `beautify(text, indent, sortKeys?)`, `minify(text)`, `sortKeys(value)`             | 01–03 |
| `validate.ts` | `validate(text) → { valid, errors[], warnings[] }` (line/col)                      | 04–05 |
| `repair.ts`   | `repair(text) → string`                                                            | 06    |
| `schema.ts`   | `validateSchema(dataText, schemaText) → { valid, errors[] }`                       | 07    |
| `diff.ts`     | `diff(a, b) → Change[]` `{ kind: added\|removed\|changed, path, before?, after? }` | 08    |
| `query.ts`    | `query(text, jsonPath) → unknown[]`                                                | 09    |
| `convert.ts`  | `jsonToYaml`, `yamlToJson`, `jsonToCsv`, `csvToJson`                               | 10    |
| `typegen.ts`  | `toTypeScript(text, rootName) → string`                                            | 11    |
| `stats.ts`    | `stats(value) → { bytes, depth, keys, nodes }`                                     | 13    |
| `escape.ts`   | `escapeJson`, `unescapeJson`                                                       | 15    |

All modules throw `JsonToolError` (with optional `line`/`column`) on bad input, so the
UI shows a uniform error panel.

## 3. Key Algorithms

- **Error location:** `jsonc-parser` in strict mode returns error offsets → converted to
  1-based line/column via a line-start index.
- **Duplicate keys:** `jsonc-parser` visitor tracks a key set per object depth.
- **Semantic diff:** recursive walk; objects compared by key set, arrays by index;
  paths emitted in JSONPath form (`$.a[0].b`).
- **Type generation:** infer a type per node; arrays merge element types into a union;
  arrays of objects merge into one interface with optional fields for keys not present
  in every element; nested objects become named interfaces (PascalCase of key).

## 4. UI / UX

- Tabs: **Format · Validate · Repair · Schema · Diff · Query · Convert · Types**.
- Left: input editor; right: output. Diff and Schema show a second input.
- Output updates live as you type (deferred rendering keeps typing responsive).
- Inline error squiggles in the input editor; clicking an error jumps to its line.
- Theme follows `prefers-color-scheme`. Input and options persist in `localStorage` (local only).
- Output toolbar: Copy · Download · Use as input.

## 5. Technology Decisions

| Decision  | Choice                                                   | Rationale                                               |
| --------- | -------------------------------------------------------- | ------------------------------------------------------- |
| Framework | React 18 + TypeScript + Vite                             | Fast dev loop, strong typing, static build              |
| Editor    | CodeMirror 6                                             | Smaller than Monaco, bundles locally (no CDN → privacy) |
| Tests     | Vitest + Testing Library                                 | Native Vite integration                                 |
| Hosting   | Any static host (GitHub Pages / Netlify / S3+CloudFront) | No backend needed                                       |
| CI        | GitHub Actions                                           | typecheck → test → build                                |

## 6. Security Considerations

- No `eval`; JSONPath runs with `eval: false` (jsonpath-plus safe mode).
- No user data sent over the network. A Content-Security-Policy is injected into production
  builds (`vite.config.ts`) with `connect-src 'none'`, so the page _cannot_ send data anywhere.
- **Known trade-off:** the CSP allows `'unsafe-eval'` because Ajv compiles schemas to JS
  functions. Mitigation: no user-controlled code runs outside Ajv's generated validators.
  Backlog: evaluate an interpreter-based validator (e.g. `@cfworker/json-schema`) to drop it.
- Large input guarded (warning above 20 MB) to prevent tab freeze.
