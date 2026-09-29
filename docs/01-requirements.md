# Phase 1 — Requirements (SRS)

**Product:** JSON Toolkit · **Version:** 0.1.0 (MVP) · **Status:** Approved for design

## 1. Purpose

A fast, privacy-first, browser-based tool for working with JSON: beautify, validate,
repair, compare, query, convert and generate types — without data leaving the device.

## 2. Stakeholders & Users

| Persona                 | Need                                                     |
| ----------------------- | -------------------------------------------------------- |
| Backend / API developer | Pretty-print & validate API payloads, diff responses     |
| Frontend developer      | Generate TypeScript types from sample responses          |
| QA engineer             | Validate against JSON Schema, compare expected vs actual |
| Data / support analyst  | Convert JSON ↔ CSV/YAML, query nested data               |

## 3. Functional Requirements (MVP)

| ID    | Requirement                                                                                              | Priority |
| ----- | -------------------------------------------------------------------------------------------------------- | -------- |
| FR-01 | Beautify JSON with configurable indent (2, 4 spaces, tab)                                                | Must     |
| FR-02 | Minify JSON                                                                                              | Must     |
| FR-03 | Sort object keys recursively                                                                             | Should   |
| FR-04 | Validate syntax; report **line, column** and message for every error                                     | Must     |
| FR-05 | Warn on duplicate keys                                                                                   | Should   |
| FR-06 | Auto-repair invalid JSON (trailing commas, single quotes, comments, unquoted keys, missing brackets)     | Must     |
| FR-07 | Validate JSON against a JSON Schema (draft-07 / 2019-09 / 2020-12) and list all violations with paths    | Must     |
| FR-08 | Semantic diff of two documents (ignores key order & whitespace), listing added / removed / changed paths | Must     |
| FR-09 | Query with JSONPath and show the result                                                                  | Must     |
| FR-10 | Convert JSON → YAML, YAML → JSON, JSON array → CSV, CSV → JSON                                           | Must     |
| FR-11 | Generate TypeScript interfaces from a JSON sample                                                        | Must     |
| FR-12 | Tree view with collapsible nodes and item counts                                                         | Should   |
| FR-13 | Show document stats (size, depth, key count)                                                             | Could    |
| FR-14 | Copy output to clipboard, download output, load a local file                                             | Must     |
| FR-15 | Escape / unescape JSON as a string literal                                                               | Could    |

## 4. Non-Functional Requirements

| ID                         | Requirement                                                           |
| -------------------------- | --------------------------------------------------------------------- |
| NFR-01 **Privacy**         | All processing is client-side. No network calls with user data.       |
| NFR-02 **Performance**     | Format/validate a 5 MB document in < 1 s on a modern laptop.          |
| NFR-03 **Usability**       | Dark/light theme following OS; output updates live as the user types. |
| NFR-04 **Accessibility**   | WCAG 2.1 AA contrast; all controls keyboard-reachable and labelled.   |
| NFR-05 **Compatibility**   | Latest 2 versions of Chrome, Firefox, Safari, Edge.                   |
| NFR-06 **Quality**         | Core logic ≥ 80 % unit-test line coverage; CI must pass before merge. |
| NFR-07 **Maintainability** | Core logic is pure TypeScript, independent of the UI.                 |

## 5. Out of Scope (MVP) — see backlog

Server storage / share links, accounts, CLI, VS Code extension, JWT decoder,
JSON Patch generation, code generation for languages other than TypeScript, >100 MB files.

## 6. Acceptance Criteria (samples)

- **FR-04:** Given `{"a":1,}` → error reported at line 1, column 8.
- **FR-06:** Given `{a:'x',}` → repaired output `{"a":"x"}`.
- **FR-08:** `{"a":1,"b":2}` vs `{"b":2,"a":1}` → "No differences".
- **FR-11:** `{"id":1,"tags":["x"]}` → `interface Root { id: number; tags: string[]; }`.

## 7. Traceability

Each FR maps to a module in `src/core/` (see [02-design.md](02-design.md)) and to tests
in `src/core/__tests__/` (see [04-test-plan.md](04-test-plan.md)).
