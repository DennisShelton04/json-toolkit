# Phase 4 — Test Plan

## 1. Strategy

| Level                      | Tool                                   | Scope                                                    | Where                         |
| -------------------------- | -------------------------------------- | -------------------------------------------------------- | ----------------------------- |
| Unit                       | Vitest                                 | every `src/core` module, incl. SRS acceptance criteria   | `src/core/__tests__/`         |
| Integration                | Vitest                                 | tool registry: every tool × sample data, option handling | `src/__tests__/tools.test.ts` |
| UI / component             | Vitest + Testing Library (jsdom)       | tabs, reports, tree view, empty state                    | `src/__tests__/App.test.tsx`  |
| E2E (manual / pre-release) | Real browser against `npm run preview` | checklist below                                          | —                             |

**Exit criteria:** all tests green; core line coverage ≥ 80 % (enforced by `vitest --coverage` thresholds); no high/critical `npm audit` findings in production deps; E2E checklist passed.

## 2. Requirement → Test Traceability

| FR           | Test file                  |
| ------------ | -------------------------- |
| FR-01..03    | `format.test.ts`           |
| FR-04..05    | `validate.test.ts`         |
| FR-06        | `repair.test.ts`           |
| FR-07        | `schema.test.ts`           |
| FR-08        | `diff.test.ts`             |
| FR-09        | `query.test.ts`            |
| FR-10        | `convert.test.ts`          |
| FR-11        | `typegen.test.ts`          |
| FR-12        | `App.test.tsx` (tree view) |
| FR-13, FR-15 | `misc.test.ts`             |
| FR-14        | E2E checklist              |

## 3. E2E / Release Checklist

- [ ] Every tab produces output for the sample, no console errors (production build, CSP active)
- [ ] Invalid input shows line/column; clicking it moves the cursor there
- [ ] Squiggle + gutter marker on the error in the input editor
- [ ] Open file, drag & drop file, Copy, Download, Use as input
- [ ] Tree view: expand/collapse, click key copies JSONPath
- [ ] Dark mode (OS setting) — editor and panels switch
- [ ] 390 px wide viewport: panes stack, no horizontal scroll
- [ ] 5 MB file formats in < 1 s (NFR-02)
- [ ] DevTools → Network: no requests after initial load (NFR-01)

## 4. Commands

```bash
npm test            # all tests once
npm run test:watch  # watch mode
npm run coverage    # with coverage report + threshold gate
```

## 5. Latest Results (v0.1.0)

- 66 tests, all passing. Core coverage: 98.8 % lines, 93.6 % branches.
- E2E in headless Chrome against the production build: all 10 tools OK, no console errors,
  no horizontal overflow at 390 px.
